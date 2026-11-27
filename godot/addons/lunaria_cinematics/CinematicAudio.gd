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

const DEFAULT_HANDOFF_FADE_SECONDS: float = 0.35

static func actor_appearance_time(actor: Dictionary) -> float:
	var entry: Dictionary = actor.get("entry", {})
	return 0.0 if str(entry.get("preset", "none")) == "none" else float(entry.get("delay", 0.0))

static func music_start_time(shot: Dictionary, track: Dictionary) -> float:
	var trigger: String = str(track.get("startTrigger", "shot_start"))
	var delay: float = float(track.get("startDelay", 0.0))
	if trigger == "shot_start":
		return delay
	if trigger == "actor_entry":
		var target_id: String = str(track.get("startTargetId", ""))
		for actor: Dictionary in shot.get("actors", []):
			if str(actor.get("id", "")) == target_id:
				return actor_appearance_time(actor) + delay
		return -1.0
	if trigger == "first_enemy":
		var earliest: float = -1.0
		for actor: Dictionary in shot.get("actors", []):
			if str(actor.get("role", "character")) != "enemy":
				continue
			var at: float = actor_appearance_time(actor)
			if earliest < 0.0 or at < earliest:
				earliest = at
		return earliest + delay if earliest >= 0.0 else -1.0
	return delay

static func music_handoff_fade(settings: Dictionary) -> float:
	var fade_out: float = float(settings.get("fadeOut", 0.0))
	return fade_out if fade_out > 0.0 else DEFAULT_HANDOFF_FADE_SECONDS

static func music_handoff_time(doc: Dictionary, index: int, track: Dictionary, track_index: int = -1) -> float:
	var shots: Array = doc.get("shots", [])
	if index < 0 or index >= shots.size():
		return -1.0
	var shot: Dictionary = shots[index]
	var tracks: Array = doc.get("musicTracks", [])
	if track_index < 0:
		for i: int in range(tracks.size()):
			if tracks[i].id == track.id:
				track_index = i
				break
	var track_start: int = -1
	for i: int in range(shots.size()):
		if shots[i].id == track.startShotId:
			track_start = i
			break
	var track_at: float = music_start_time(shot, track) if track_start == index else 0.0
	var earliest: float = -1.0
	for other_index: int in range(tracks.size()):
		var other: Dictionary = tracks[other_index]
		if other.id == track.id or not bool(other.get("replacePrevious", false)) or other.startShotId != shot.id:
			continue
		var other_at: float = music_start_time(shot, other)
		if other_at < 0.0:
			continue
		var earlier: bool = track_start < index or (track_start == index and track_at >= 0.0 and (track_at < other_at or (is_equal_approx(track_at, other_at) and track_index < other_index)))
		if not earlier:
			continue
		if earliest < 0.0 or other_at < earliest:
			earliest = other_at
	return earliest

static func exit_duration(doc: Dictionary, index: int, elapsed: float = -1.0, bubbles: Dictionary = {}) -> float:
	var shot: Dictionary = doc.shots[index]
	var result: float = 0.0
	var transition: Dictionary = shot.get("exitTransition", {})
	if transition.get("type", "cut") == "fade": result = float(transition.duration)
	for cue: Dictionary in shot.get("sounds", []):
		var at: float = target_time(shot, cue, bubbles)
		if elapsed >= 0.0 and (at < 0.0 or at >= elapsed or (float(cue.duration) > 0.0 and at + float(cue.duration) <= elapsed)): continue
		result = maxf(result, float(cue.fadeOut))
	var tracks: Array = doc.get("musicTracks", [])
	for track_index: int in range(tracks.size()):
		var track: Dictionary = tracks[track_index]
		if track.endShotId != shot.id: continue
		if elapsed >= 0.0 and track.startShotId == shot.id:
			var start_at: float = music_start_time(shot, track)
			if start_at < 0.0 or start_at >= elapsed: continue
		var handoff_at: float = music_handoff_time(doc, index, track, track_index)
		if handoff_at >= 0.0 and (elapsed < 0.0 or handoff_at <= elapsed):
			var fade: float = music_handoff_fade(track)
			var remaining: float = maxf(0.0, fade - (elapsed - handoff_at)) if elapsed >= 0.0 else fade
			result = maxf(result, remaining)
			continue
		result = maxf(result, float(track.fadeOut))
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
	var tracks: Array = document.get("musicTracks", [])
	for track_index: int in range(tracks.size()):
		var track: Dictionary = tracks[track_index]
		var start: int = -1
		var end: int = -1
		for i: int in range(document.shots.size()):
			if document.shots[i].id == track.startShotId: start = i
			if document.shots[i].id == track.endShotId: end = i
		if start < 0 or index < start or index > end: continue
		var origin: float = clock - elapsed
		if index == start:
			var start_at: float = music_start_time(shot, track)
			if start_at < 0.0 or elapsed < start_at or (exit_elapsed >= 0.0 and start_at >= elapsed - exit_elapsed):
				continue
			origin = clock - (elapsed - start_at)
		active_music[track.id] = track_index
		_add(str(track.id), track, true, origin, str(track.endShotId))
	for id: String in voices.keys():
		if not voices[id].music: continue
		if not active_music.has(id):
			_remove(id)
			continue
		var voice: Dictionary = voices[id]
		if not voice.has("handoff_clock"):
			var track_idx: int = int(active_music[id])
			var track: Dictionary = tracks[track_idx]
			var handoff_at: float = music_handoff_time(document, index, track, track_idx)
			if handoff_at >= 0.0 and elapsed >= handoff_at:
				voice["handoff_clock"] = clock - (elapsed - handoff_at)
				voice["handoff_fade"] = music_handoff_fade(track)
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
		var active_fade_out: float = float(settings.get("fadeOut", 0.0))
		if voice.has("handoff_clock"):
			var handoff_fade: float = float(voice.get("handoff_fade", music_handoff_fade(settings)))
			var handoff_remaining: float = handoff_fade - (clock - float(voice["handoff_clock"]))
			if handoff_remaining < remaining:
				remaining = handoff_remaining
				active_fade_out = handoff_fade
		if exit_elapsed >= 0.0 and voice.end == shot_id:
			var exit_remaining: float = float(settings.get("fadeOut", 0.0)) - exit_elapsed
			if exit_remaining < remaining:
				remaining = exit_remaining
				active_fade_out = float(settings.get("fadeOut", 0.0))
		if remaining <= 0.0:
			_remove(id)
			continue
		var envelope_settings: Dictionary = settings if is_equal_approx(active_fade_out, float(settings.get("fadeOut", 0.0))) else {"volume": settings.volume, "fadeIn": settings.get("fadeIn", 0.0), "fadeOut": active_fade_out}
		var level: float = gain(envelope_settings, age, remaining) * (music_volume if voice.music or id.begins_with("legacy:") else sound_volume)
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
