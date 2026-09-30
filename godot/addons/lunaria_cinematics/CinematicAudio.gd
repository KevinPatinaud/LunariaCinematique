extends RefCounted
## Film music survives shot boundaries. Cues use the player's deterministic clock.
var owner: Node
var assets: RefCounted
var document: Dictionary = {}
var voices: Dictionary = {}
var completed: Dictionary = {}
var opened: Dictionary = {}
var shot_id: String = ""
var error: String = ""

func configure(node: Node, resolver: RefCounted, doc: Dictionary) -> void:
	stop()
	owner = node
	assets = resolver
	document = doc
	error = ""

static func exit_duration(doc: Dictionary, index: int, elapsed: float = -1.0, bubbles: Dictionary = {}) -> float:
	var shot: Dictionary = doc.shots[index]
	var result: float = 0.0
	var transition: Dictionary = shot.get("exitTransition", {})
	if transition.get("type", "cut") == "fade": result = float(transition.duration)
	for cue: Dictionary in shot.get("sounds", []):
		var at: float = target_time(shot, cue, bubbles)
		if elapsed >= 0.0 and (at < 0.0 or at >= elapsed or (float(cue.duration) > 0.0 and at + float(cue.duration) <= elapsed)): continue
		result = maxf(result, float(cue.fadeOut))
	for track: Dictionary in doc.get("musicTracks", []):
		if track.endShotId == shot.id: result = maxf(result, float(track.fadeOut))
	return result

static func gain(settings: Dictionary, age: float, remaining: float = INF) -> float:
	var up: float = minf(1.0, maxf(0.0, age) / float(settings.get("fadeIn", 0.0))) if float(settings.get("fadeIn", 0.0)) > 0.0 else 1.0
	var down: float = minf(1.0, maxf(0.0, remaining) / float(settings.get("fadeOut", 0.0))) if float(settings.get("fadeOut", 0.0)) > 0.0 else 1.0
	return float(settings.volume) * minf(up, down)

static func target_time(shot: Dictionary, cue: Dictionary, bubbles: Dictionary) -> float:
	if cue.event == "shot_start": return float(cue.delay)
	if cue.event == "bubble_open": return float(bubbles[cue.targetId]) + float(cue.delay) if bubbles.has(cue.targetId) else -1.0
	for actor: Dictionary in shot.actors:
		if actor.id != cue.targetId: continue
		var entrance: float = 0.0 if actor.entry.preset == "none" else float(actor.entry.delay) + float(actor.entry.duration)
		var time: float = -1.0
		match str(cue.event):
			"actor_entry":
				if actor.entry.preset != "none": time = float(actor.entry.delay)
			"actor_movement":
				if actor.get("movement", {}).get("enabled", false): time = entrance + float(actor.movement.delay)
			"actor_motion":
				if actor.get("motion", {}).get("preset", "none") != "none": time = entrance + float(actor.motion.delay)
			"actor_exit":
				if actor.get("exit", {}).get("preset", "none") != "none": time = float(actor.exit.start)
			"actor_animation":
				if actor.has("animation"): time = float(actor.entry.delay)
		return time + float(cue.delay) if time >= 0.0 else -1.0
	return -1.0

func _add(id: String, settings: Dictionary, music: bool, origin: float, end_id: String, duration: float = 0.0) -> void:
	if voices.has(id) or completed.has(id): return
	var stream: AudioStream = assets.audio(str(settings.asset))
	if stream == null:
		error = assets.error
		completed[id] = true
		return
	# Imports must not override the author's loop setting.
	if stream is AudioStreamWAV: stream.loop_mode = AudioStreamWAV.LOOP_DISABLED
	elif stream is AudioStreamOggVorbis or stream is AudioStreamMP3: stream.loop = false
	var player: AudioStreamPlayer = AudioStreamPlayer.new()
	player.process_mode = Node.PROCESS_MODE_ALWAYS
	player.stream = stream
	player.volume_db = -80.0
	owner.add_child(player)
	voices[id] = {"player":player, "settings":settings, "music":music, "origin":origin, "end":end_id, "duration":duration, "started":false}
	player.finished.connect(func() -> void:
		if not voices.has(id): return
		if bool(settings.loop):
			player.play()
			player.stream_paused = bool(voices[id].get("paused", false))
		else: _remove(id)
	)

func _remove(id: String) -> void:
	if voices.has(id):
		var player: AudioStreamPlayer = voices[id].player
		player.stop()
		player.stream = null
		player.queue_free()
		voices.erase(id)
	completed[id] = true

func update(index: int, elapsed: float, dialogue_index: int, dialogue_elapsed: float, exit_elapsed: float, clock: float, music_volume: float, sound_volume: float, paused: bool = false) -> void:
	var shot: Dictionary = document.shots[index]
	if shot_id != str(shot.id):
		for id: String in voices.keys():
			if not voices[id].music: _remove(id)
		opened.clear()
		shot_id = str(shot.id)
	var active_music: Dictionary = {}
	for track: Dictionary in document.get("musicTracks", []):
		var start: int = -1
		var end: int = -1
		for i: int in range(document.shots.size()):
			if document.shots[i].id == track.startShotId: start = i
			if document.shots[i].id == track.endShotId: end = i
		if start < 0 or index < start or index > end: continue
		active_music[track.id] = true
		_add(str(track.id), track, true, clock - elapsed, str(track.endShotId))
	for id: String in voices.keys():
		if voices[id].music and not active_music.has(id): _remove(id)
	if shot.audio != null: _add("legacy:" + shot_id, shot.audio, false, 0.0, shot_id)
	if dialogue_index < shot.bubbles.size() and elapsed + 0.000000001 >= float(shot.dialogueStart):
		var bubble_id: String = str(shot.bubbles[dialogue_index].id)
		if not opened.has(bubble_id): opened[bubble_id] = elapsed - dialogue_elapsed
	for cue: Dictionary in shot.get("sounds", []):
		var at: float = target_time(shot, cue, opened)
		if at >= 0.0 and elapsed >= at and (exit_elapsed < 0.0 or at < elapsed - exit_elapsed):
			_add(str(cue.id), cue, false, at, shot_id, float(cue.duration))
	for id: String in voices.keys():
		var voice: Dictionary = voices[id]
		var player: AudioStreamPlayer = voice.player
		var settings: Dictionary = voice.settings
		var age: float = maxf(0.0, (clock if voice.music else elapsed) - float(voice.origin))
		var remaining: float = float(voice.duration) - age if float(voice.duration) > 0.0 else INF
		var length: float = player.stream.get_length()
		if not bool(settings.loop) and length > 0.0: remaining = minf(remaining, length - age)
		if exit_elapsed >= 0.0 and voice.end == shot_id: remaining = minf(remaining, float(settings.get("fadeOut", 0.0)) - exit_elapsed)
		if remaining <= 0.0:
			_remove(id)
			continue
		var level: float = gain(settings, age, remaining) * (music_volume if voice.music or id.begins_with("legacy:") else sound_volume)
		player.volume_db = linear_to_db(level) if level > 0.0001 else -80.0
		if not voice.started:
			player.play(fmod(age, length) if bool(settings.loop) and length > 0.0 else age)
			voice.started = true
		player.stream_paused = paused
		voice["paused"] = paused

func set_paused(value: bool) -> void:
	for voice: Dictionary in voices.values():
		voice.player.stream_paused = value
		voice["paused"] = value

func stop() -> void:
	for id: String in voices.keys(): _remove(id)
	completed.clear()
	opened.clear()
	shot_id = ""
