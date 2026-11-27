extends SceneTree
const Audio = preload("res://addons/lunaria_cinematics/CinematicAudio.gd")
const Player = preload("res://addons/lunaria_cinematics/CinematicPlayer.gd")
const Validator = preload("res://addons/lunaria_cinematics/CinematicValidator.gd")
var failures: int = 0
var checks: int = 0

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("FAIL: " + label)

func shot(id: String) -> Dictionary:
	return {"id":id,"name":id,"duration":2.0,"dialogueStart":0.0,"audio":null,"background":{"asset":null,"fit":"cover"},"camera":{"preset":"fixed","intensity":0.0},"transition":{"type":"cut","duration":0.0},"actors":[],"bubbles":[]}

func _initialize() -> void:
	call_deferred("run")

func run() -> void:
	var stream: AudioStreamWAV = AudioStreamWAV.new()
	stream.mix_rate = 8000
	stream.format = AudioStreamWAV.FORMAT_8_BITS
	var bytes: PackedByteArray = PackedByteArray()
	bytes.resize(80000)
	bytes.fill(128)
	stream.data = bytes
	DirAccess.make_dir_recursive_absolute("user://audio-test")
	check(stream.save_to_wav("user://audio-test/tone.wav") == OK, "create isolated audio fixture")
	var settings: Dictionary = {"asset":"library://tone.wav","volume":0.8,"loop":true,"fadeIn":2.0,"fadeOut":1.0}
	var track: Dictionary = settings.duplicate(true)
	track.merge({"id":"music","startShotId":"one","endShotId":"two"})
	var doc: Dictionary = {"schemaVersion":1,"id":"audio-test","title":"Audio test","stage":{"width":1600,"height":900},"shots":[shot("one"),shot("two"),shot("three")],"musicTracks":[track]}
	var player = Player.new()
	player.library_root = "user://audio-test"
	root.add_child(player)
	check(player.play_data(doc), "player accepts music ranges")
	player.set_process(false)
	var voice: AudioStreamPlayer = player._film_audio.voices.music.player
	player.advance_time(1.0)
	check(absf(db_to_linear(voice.volume_db) - 0.4) < 0.001, "fade in samples")
	player.advance_time(1.0)
	check(player._shot_index == 1 and player._film_audio.voices.music.player == voice, "same player across slides")
	player.pause()
	check(voice.stream_paused, "pause audio")
	player.advance_time(3.0)
	check(player._elapsed == 0.0, "pause freezes timeline")
	player.resume()
	check(not voice.stream_paused, "resume audio")
	player.advance_time(2.5)
	check(player._shot_index == 1 and absf(player._exit_elapsed - 0.5) < 0.001, "inclusive final slide waits for fade")
	check(absf(db_to_linear(voice.volume_db) - 0.4) < 0.001, "fade out samples")
	player.advance_time(0.5)
	check(player._shot_index == 2 and player._film_audio.voices.is_empty(), "music stops at selected boundary")
	check(player.seek_shot(1) and player._film_audio.voices.has("music"), "seek recreates active range")
	player.stop()
	doc.shots[1].endAdvance = "click"
	check(player.play_data(doc), "manual slide starts")
	player.set_process(false)
	player.advance_time(9.0)
	check(player._shot_index == 1 and player._elapsed == 7.0 and player._audio_clock == 9.0, "manual wait keeps audio clock running")
	check(player._exit_elapsed < 0.0, "no fade before user click")
	player.advance()
	check(player._exit_elapsed == 0.0, "click starts final fade")
	player.stop()
	var cue: Dictionary = {"id":"cue","asset":"library://tone.wav","volume":0.7,"loop":false,"fadeIn":0.0,"fadeOut":0.0,"event":"bubble_open","targetId":"bubble","delay":0.25,"duration":0.0}
	doc.shots[0].duration = 20.0
	doc.shots[0].bubbles = [{"id":"bubble","kind":"narration","style":"plain","frameAsset":null,"speakerId":null,"text":"Bonjour","fontSize":28,"autoHeight":true,"x":0.1,"y":0.1,"width":0.5,"height":0.2,"tail":{"mode":"none","x":0.5,"y":0.5},"advance":{"mode":"click","seconds":2.0}}]
	doc.shots[0].sounds = [cue]
	check(player.play_data(doc), "bubble cue accepted")
	player.set_process(false)
	player.advance_time(0.1)
	player.advance()
	player.advance_time(0.2)
	check(player._film_audio.voices.has("cue"), "delayed cue survives bubble closure")
	var sound: AudioStreamPlayer = player._film_audio.voices.cue.player
	player.advance_time(0.1)
	check(player._film_audio.voices.cue.player == sound, "cue fires once")
	player.stop()
	var schema: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://addons/lunaria_cinematics/cinematic.schema.json"))
	doc.shots[0].sounds[0].targetId = "missing"
	check(not Validator.validate(doc, schema).is_empty(), "reject missing sound target")
	doc.shots[0].sounds = []
	doc.musicTracks[0].endShotId = "missing"
	check(not Validator.validate(doc, schema).is_empty(), "reject missing music endpoint")
	check(absf(Audio.gain(settings, 1.0) - 0.4) < 0.001, "shared envelope formula")

	# Synchronized enemy/actor music trigger + mid-shot handoff parity.
	var img := Image.create(4, 4, false, Image.FORMAT_RGBA8)
	img.fill(Color(0.5, 0.2, 0.2, 1.0))
	check(img.save_png("user://audio-test/enemy.png") == OK, "create isolated enemy fixture")
	var enemy_a: Dictionary = {"id":"enemy_a","name":"Enemy A","role":"enemy","asset":"library://enemy.png","x":0.5,"y":0.5,"width":0.2,"height":0.2,"flipX":false,"opacity":1.0,"entry":{"preset":"pop","duration":0.8,"delay":4.2}}
	var enemy_b: Dictionary = {"id":"enemy_b","name":"Enemy B","role":"enemy","asset":"library://enemy.png","x":0.6,"y":0.5,"width":0.2,"height":0.2,"flipX":false,"opacity":1.0,"entry":{"preset":"pop","duration":0.8,"delay":3.9}}
	var sync_shot_0: Dictionary = shot("intro")
	var sync_shot_1: Dictionary = shot("ambush")
	sync_shot_1.duration = 7.0
	sync_shot_1.actors = [enemy_a, enemy_b]
	var sync_shot_2: Dictionary = shot("outro")
	var calm_track: Dictionary = {"id":"calm","asset":"library://tone.wav","volume":0.8,"loop":true,"fadeIn":0.0,"fadeOut":1.0,"startShotId":"intro","endShotId":"ambush"}
	var enemy_track: Dictionary = {"id":"danger","asset":"library://tone.wav","volume":0.8,"loop":true,"fadeIn":0.5,"fadeOut":0.8,"startShotId":"ambush","endShotId":"outro","startTrigger":"first_enemy","replacePrevious":true}
	var sync_doc: Dictionary = {"schemaVersion":3,"id":"audio-sync-test","title":"Audio sync test","stage":{"width":1600,"height":900},"shots":[sync_shot_0, sync_shot_1, sync_shot_2],"musicTracks":[calm_track, enemy_track]}
	check(is_equal_approx(Audio.music_start_time(sync_shot_1, enemy_track), 3.9), "first_enemy resolves earliest enemy delay")
	check(is_equal_approx(Audio.music_handoff_time(sync_doc, 1, calm_track, 0), 3.9), "handoff time matches enemy arrival")
	check(player.play_data(sync_doc), "player accepts triggered music tracks")
	player.set_process(false)
	player.advance_time(2.0) # enters ambush at elapsed=0
	check(player._shot_index == 1 and player._film_audio.voices.has("calm") and not player._film_audio.voices.has("danger"), "enemy music waits until enemies appear")
	player.advance_time(3.5) # elapsed=3.5 < 3.9
	check(not player._film_audio.voices.has("danger") and absf(db_to_linear(player._film_audio.voices.calm.player.volume_db) - 0.8) < 0.001, "calm stays full before enemy entry")
	player.advance_time(0.65) # elapsed=4.15 -> 0.25s after trigger
	check(player._film_audio.voices.has("danger"), "enemy music starts right at first enemy appearance")
	check(absf(db_to_linear(player._film_audio.voices.calm.player.volume_db) - 0.6) < 0.005, "calm track fades out smoothly during handoff")
	check(absf(db_to_linear(player._film_audio.voices.danger.player.volume_db) - 0.4) < 0.005, "enemy track fades in from exact appearance time")
	player.advance_time(0.85) # elapsed=5.0 -> calm finished fading at 4.9s
	check(not player._film_audio.voices.has("calm") and player._film_audio.voices.has("danger"), "previous track retires once handoff fade finishes")
	check(is_equal_approx(Audio.exit_duration(sync_doc, 1, 7.0, {}), 0.0), "already-handed-off track does not stall shot exit")
	player.stop()
	var actor_track: Dictionary = enemy_track.duplicate(true)
	actor_track.startTrigger = "actor_entry"
	actor_track.startTargetId = "missing_actor"
	sync_doc.musicTracks = [calm_track, actor_track]
	check(not Validator.validate(sync_doc, schema).is_empty(), "reject missing music trigger actor")
	actor_track.startTargetId = "enemy_a"
	check(is_equal_approx(Audio.music_start_time(sync_shot_1, actor_track), 4.2), "actor_entry resolves specific actor delay")
	enemy_a.entry.preset = "none"
	check(is_equal_approx(Audio.music_start_time(sync_shot_1, actor_track), 0.0), "actor_entry supports already-present actor at 0s")
	player.queue_free()
	await process_frame
	await create_timer(1.5).timeout # Let the audio mixing thread release stopped streams.
	DirAccess.remove_absolute("user://audio-test/enemy.png")
	DirAccess.remove_absolute("user://audio-test/tone.wav")
	DirAccess.remove_absolute("user://audio-test")
	print("CINEMATIC_AUDIO checks=", checks, " failures=", failures)
	quit(0 if failures == 0 else 1)
