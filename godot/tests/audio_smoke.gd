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
	player.queue_free()
	await process_frame
	await create_timer(1.5).timeout # Let the audio mixing thread release stopped streams.
	DirAccess.remove_absolute("user://audio-test/tone.wav")
	DirAccess.remove_absolute("user://audio-test")
	print("CINEMATIC_AUDIO checks=", checks, " failures=", failures)
	quit(0 if failures == 0 else 1)
