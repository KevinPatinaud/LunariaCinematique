class_name LunariaCinematicPlayer
extends Control
## Small Godot 4.x reader for Lunaria cinematic.schemaVersion in [1, 2, 3].
## Add this Control above gameplay (typically under a CanvasLayer).
## Connect finished/failed/stopped to YOUR game's state machine.
## V1.4.2 accepts role=enemy. Actors remain cinematic images, not gameplay AI.

signal started(cinematic_id: String)
signal skipped(cinematic_id: String)
signal paused_changed(value: bool)
signal finished(cinematic_id: String)
signal stopped(cinematic_id: String)
signal failed(message: String)
signal shot_started(shot_id: String)

@export_dir var library_root: String = "res://LunariaArtLibrary"
@export var dialogue_font: Font
@export var pause_gameplay: bool = false
@export var allow_external_library: bool = false
@export var input_enabled: bool = true
@export var reduced_motion: bool = false
@export_range(0.0, 1.0) var volume: float = 1.0
var auto_advance: bool = false
var last_error: String = ""
const SharedPresentation = preload("CinematicPresentation.gd")
var _shared = SharedPresentation.new()
@export_range(0.0,1.0) var sound_volume: float = 1.0
const Assets = preload("CinematicAssets.gd")
var _assets = Assets.new()
var _visual_actors: Dictionary = {}

const LOGICAL: Vector2 = Vector2(1600, 900)
const Validator = preload("CinematicValidator.gd")
const Layout = preload("CinematicLayout.gd")
const Motion = preload("CinematicMotion.gd")
const TextAnimation = preload("CinematicText.gd")
const EPS: float = 0.000000001
const FRAME_SPECS: Dictionary = {
	"simple": {"x":58.0,"y":170.0,"width":1420.0,"height":600.0,"left":190.0,"right":190.0,"top":120.0,"bottom":180.0,"bottomX":320.0,"bottomWidth":260.0},
	"ornate": {"x":36.0,"y":131.0,"width":1482.0,"height":605.0,"left":235.0,"right":245.0,"top":155.0,"bottom":155.0,"bottomX":340.0,"bottomWidth":260.0}
}
var _document: Dictionary = {}
var _schema: Dictionary = {}
var _shot_index: int = 0
var _elapsed: float = 0.0
var _dialogue_index: int = 0
var _dialogue_elapsed: float = 0.0
var _text_completed_at: float = -1.0
var _playing: bool = false
var _paused: bool = false
var _previous_tree_pause: bool = false
var _owns_pause: bool = false
var _textures: Dictionary = {}
# Draw commands are deferred: these Resources must survive the _draw call.
var _style_boxes: Dictionary = {}
var _audio: AudioStreamPlayer
var _last_tick_usec: int = 0

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	mouse_filter = Control.MOUSE_FILTER_STOP
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	clip_contents = true
	_audio = AudioStreamPlayer.new()
	_audio.process_mode = Node.PROCESS_MODE_ALWAYS
	add_child(_audio)
	_audio.finished.connect(_on_audio_finished)
	var schema_path: String = get_script().resource_path.get_base_dir().path_join("cinematic.schema.json")
	if FileAccess.file_exists(schema_path):
		var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(schema_path))
		if parsed is Dictionary:
			_schema = parsed
	hide()
	set_process(false)

func play_file(json_path: String, start_shot: int = 0) -> bool:
	var file: FileAccess = FileAccess.open(json_path, FileAccess.READ)
	if file == null:
		return _failure("Impossible d’ouvrir la cinématique : " + json_path)
	if file.get_length() > 5 * 1024 * 1024:
		file.close()
		return _failure("Cinématique trop volumineuse (5 Mio maximum).")
	var parser: JSON = JSON.new()
	var text: String = file.get_as_text().trim_prefix("\ufeff")
	if parser.parse(text) != OK:
		file.close()
		return _failure("JSON invalide, ligne %d : %s" % [parser.get_error_line(), parser.get_error_message()])
	file.close()
	return play_data(parser.data, start_shot)

func play_data(value: Variant, start_shot: int = 0) -> bool:
	if not is_node_ready():
		return _failure("Add CinematicPlayer to the scene before calling play_data().")
	if _schema.is_empty():
		return _failure("cinematic.schema.json is missing. Include *.json in Godot export filters.")
	var errors: Array[String] = Validator.validate(value, _schema)
	if not errors.is_empty():
		return _failure("Cinématique invalide :\n" + "\n".join(errors))
	if start_shot < 0 or start_shot >= value["shots"].size():
		return _failure("Le plan de départ n'existe pas.")
	if not _assets.configure(library_root, allow_external_library):
		return _failure(_assets.error)
	last_error = ""
	_visual_actors.clear()
	# Stop any previous sequence before replacing its data.
	if _playing:
		stop()
	_document = value.duplicate(true)
	if not _shared.configure(self,_document,library_root): return _failure(_shared.error)
	_shared.set_volumes(volume,sound_volume)
	Layout.prepare(_document)
	if reduced_motion:
		for quiet_shot: Dictionary in _document["shots"]:
			for quiet_bubble: Dictionary in quiet_shot["bubbles"]:
				if quiet_bubble.has("textAnimation"): quiet_bubble["textAnimation"]["effect"] = "none"
	for text_shot: Dictionary in _document["shots"]:
		for bubble: Dictionary in text_shot["bubbles"]:
			bubble["_text_units"] = TextAnimation.units_for_lines(bubble["lines"])
	for shot: Dictionary in _document["shots"]:
		for ref: String in _shot_refs(shot):
			if not _assets.exists(ref):
				return _failure("Ressource introuvable : " + ref)
	_previous_tree_pause = get_tree().paused
	_owns_pause = pause_gameplay
	if _owns_pause:
		get_tree().paused = true
	_playing = true
	_paused = false
	show()
	set_process(true)
	if not _enter_shot(start_shot): return false
	started.emit(str(_document["id"]))
	return _playing

func resolve_asset(ref: String) -> String:
	# This convenience method also works before play_data().
	if not _assets.configure(library_root, allow_external_library): return ""
	return _assets.resolve(ref)

func is_paused() -> bool:
	return _paused

func state() -> Dictionary:
	if not _playing: return {"playing":false, "error":last_error}
	var shot: Dictionary = _current_shot()
	return {"playing":true, "id":_document["id"], "title":_document["title"],
		"paused":_paused, "shot_index":_shot_index, "shot_count":_document["shots"].size(),
		"shot_name":shot["name"], "shot_id":shot["id"], "elapsed":_elapsed,
		"duration":shot["duration"], "dialogue_index":_dialogue_index,
		"dialogue_count":shot["bubbles"].size(), "dialogue_elapsed":_dialogue_elapsed,
		"dialogue_active":_elapsed + EPS >= float(shot["dialogueStart"]) and _dialogue_index < shot["bubbles"].size()}

func plans() -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	for shot: Dictionary in _document.get("shots", []):
		result.append({"id":shot["id"], "name":shot["name"], "duration":shot["duration"]})
	return result

func seek_shot(index: int) -> bool:
	if not _playing or index < 0 or index >= _document["shots"].size(): return false
	return _enter_shot(index)

func skip() -> void:
	if not _playing: return
	var cinematic_id: String = str(_document["id"])
	_shutdown()
	skipped.emit(cinematic_id)

func set_volume(value: float) -> void:
	volume = clampf(value, 0.0, 1.0)
	_shared.set_volumes(volume,sound_volume)
	if _playing and _current_shot()["audio"] != null and is_instance_valid(_audio):
		_audio.volume_db = linear_to_db(maxf(0.0001, float(_current_shot()["audio"]["volume"]) * volume)) if volume > 0.0 else -80.0

func _automatic(bubble: Dictionary) -> bool:
	return auto_advance or bubble["advance"]["mode"] == "auto"

func _motion_actor(actor: Dictionary) -> Dictionary:
	if not reduced_motion: return actor
	if not _visual_actors.has(actor["id"]):
		var quiet: Dictionary = actor.duplicate(true)
		quiet["motion"] = {"preset":"none"}
		if quiet["entry"]["preset"] in ["pop", "zoom"]: quiet["entry"]["preset"] = "fade"
		_visual_actors[actor["id"]] = quiet
	return _visual_actors[actor["id"]]

func stop() -> void:
	if not _playing: return
	var cinematic_id: String = str(_document.get("id", ""))
	_shutdown()
	stopped.emit(cinematic_id)

func pause() -> void:
	if not _playing or _paused: return
	_paused = true
	_shared.set_paused(true)
	paused_changed.emit(true)
	if is_instance_valid(_audio):
		_audio.stream_paused = true

func resume() -> void:
	if not _playing or not _paused: return
	_paused = false
	_shared.set_paused(false)
	_last_tick_usec = Time.get_ticks_usec()
	paused_changed.emit(false)
	if is_instance_valid(_audio):
		_audio.stream_paused = false

func is_playing() -> bool:
	return _playing

func advance() -> void:
	if not _playing or _paused:
		return
	var shot: Dictionary = _current_shot()
	if _elapsed + EPS < float(shot["dialogueStart"]) or _dialogue_index >= shot["bubbles"].size():
		return
	var bubble: Dictionary = shot["bubbles"][_dialogue_index]
	if TextAnimation.needs_completion(bubble, _dialogue_elapsed, _text_completed_at):
		_text_completed_at = _dialogue_elapsed
		queue_redraw()
		return
	_dialogue_index += 1
	_dialogue_elapsed = 0.0
	_text_completed_at = -1.0
	_settle()
	queue_redraw()

func _failure(message: String) -> bool:
	last_error = message
	_shutdown()
	push_error(message)
	failed.emit(message)
	return false

func _shutdown() -> void:
	_shared.shutdown()
	_playing = false
	_paused = false
	set_process(false)
	hide()
	if is_instance_valid(_audio):
		_audio.stream_paused = false
		_audio.stop()
		_audio.stream = null
	_textures.clear()
	_visual_actors.clear()
	queue_redraw()
	if _owns_pause and is_inside_tree():
		get_tree().paused = _previous_tree_pause
	_owns_pause = false

func _exit_tree() -> void:
	_shared.shutdown()
	if _owns_pause and is_inside_tree():
		get_tree().paused = _previous_tree_pause

func _current_shot() -> Dictionary:
	return _document["shots"][_shot_index]

func _shot_refs(shot: Dictionary) -> Array[String]:
	var refs: Array[String] = []
	if shot["background"]["asset"] != null:
		refs.append(shot["background"]["asset"])
	for actor: Dictionary in shot["actors"]:
		refs.append(actor["asset"])
	for bubble: Dictionary in shot["bubbles"]:
		if bubble["frameAsset"] != null:
			refs.append(bubble["frameAsset"])
	if shot["audio"] != null:
		refs.append(shot["audio"]["asset"])
	for ref: String in _shared.references(shot):
		if not refs.has(ref): refs.append(ref)
	return refs

func _enter_shot(index: int) -> bool:
	_shot_index = index
	_elapsed = 0.0
	_dialogue_index = 0
	_dialogue_elapsed = 0.0
	_text_completed_at = -1.0
	var old_textures: Dictionary = _textures
	_textures = {}
	var shot: Dictionary = _current_shot()
	_shared.enter_shot(str(shot.id))
	# Current and next shot only: do not keep every PNG of the film in memory.
	for next_index: int in range(index, mini(index + 2, _document["shots"].size())):
		var upcoming: Dictionary = _document["shots"][next_index]
		for ref: String in _shot_refs(upcoming):
			if ref.get_extension().to_lower() in ["wav","ogg","mp3"]:
				continue
			if _textures.has(ref):
				continue
			if old_textures.has(ref):
				_textures[ref] = old_textures[ref]
				continue
			var texture: Texture2D = _assets.texture(ref)
			if texture == null:
				return _failure(_assets.error)
			_textures[ref] = texture
	_audio.stop()
	_audio.stream = null
	_audio.stream_paused = false
	if shot["audio"] != null:
		var stream: AudioStream = _assets.audio(str(shot["audio"]["asset"]))
		if stream == null: return _failure(_assets.error)
		# Disable import-level looping; shot.audio.loop controls replay uniformly.
		if stream is AudioStreamWAV:
			(stream as AudioStreamWAV).loop_mode = AudioStreamWAV.LOOP_DISABLED
		elif stream is AudioStreamOggVorbis:
			(stream as AudioStreamOggVorbis).loop = false
		elif stream is AudioStreamMP3:
			(stream as AudioStreamMP3).loop = false
		_audio.stream = stream
		_audio.volume_db = linear_to_db(maxf(0.0001, float(shot["audio"]["volume"]) * volume)) if volume > 0.0 else -80.0
		_audio.play()
		_audio.stream_paused = _paused
	_last_tick_usec = Time.get_ticks_usec() # Asset decoding is not cinematic time.
	shot_started.emit(str(shot["id"]))
	queue_redraw()
	return true

func _on_audio_finished() -> void:
	if _playing and _current_shot()["audio"] != null and bool(_current_shot()["audio"]["loop"]):
		_audio.play()
		_audio.stream_paused = _paused

func _process(_delta: float) -> void:
	var now: int = Time.get_ticks_usec()
	var seconds: float = float(now - _last_tick_usec) / 1000000.0 if _last_tick_usec > 0 else 0.0
	_last_tick_usec = now
	advance_time(seconds)

func advance_time(delta: float) -> void:
	# One deterministic clock for camera, sprites and dialogues. Also usable by tests.
	if not _playing or _paused or not is_finite(delta) or delta <= 0.0:
		return
	var remaining: float = delta
	var guard: int = 0
	while _playing and not _paused and remaining > EPS and guard < 52000:
		guard += 1
		var shot: Dictionary = _current_shot()
		var bubble: Dictionary = shot["bubbles"][_dialogue_index] if _dialogue_index < shot["bubbles"].size() else {}
		var step: float = remaining
		if not bubble.is_empty() and _elapsed < float(shot["dialogueStart"]) - EPS:
			step = minf(step, float(shot["dialogueStart"]) - _elapsed)
		elif not bubble.is_empty() and _automatic(bubble):
			step = minf(step, maxf(0.0, TextAnimation.auto_duration(bubble, _text_completed_at) - _dialogue_elapsed))
		if bubble.is_empty():
			step = minf(step, maxf(0.0, float(shot["duration"]) - _elapsed))
		var active_before: bool = _elapsed + EPS >= float(shot["dialogueStart"])
		_elapsed += step
		_shared.advance(shot,_elapsed-step,_elapsed,reduced_motion)
		if not bubble.is_empty() and active_before:
			_dialogue_elapsed += step
		remaining -= step
		var event: bool = false
		if not bubble.is_empty() and _automatic(bubble) and _elapsed + EPS >= float(shot["dialogueStart"]) and _dialogue_elapsed + EPS >= TextAnimation.auto_duration(bubble, _text_completed_at):
			_dialogue_index += 1
			_dialogue_elapsed = 0.0
			_text_completed_at = -1.0
			event = true
		var previous_shot: int = _shot_index
		_settle()
		if previous_shot != _shot_index or not _playing:
			event = true
		if step < EPS and not event:
			break
	queue_redraw()

func _settle() -> void:
	var shot: Dictionary = _current_shot()
	if _elapsed + EPS < float(shot["duration"]) or _dialogue_index < shot["bubbles"].size():
		return
	if _shot_index + 1 < _document["shots"].size():
		_enter_shot(_shot_index + 1)
	else:
		var cinematic_id: String = str(_document["id"])
		_shutdown()
		finished.emit(cinematic_id)

func _gui_input(event: InputEvent) -> void:
	# Do not advance twice when Godot synthesizes a mouse click from a touch.
	if event.device == InputEvent.DEVICE_ID_EMULATION:
		return
	if not _playing or not input_enabled:
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		advance()
		accept_event()
	elif event is InputEventScreenTouch and event.index == 0 and event.pressed and not event.canceled:
		advance()
		accept_event()

func _unhandled_key_input(event: InputEvent) -> void:
	if input_enabled and _playing and event.is_action_pressed("ui_accept") and not event.is_echo():
		advance()
		get_viewport().set_input_as_handled()

static func _smooth(value: float) -> float:
	var t: float = clampf(value, 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)

func _camera(shot: Dictionary) -> Dictionary:
	if reduced_motion: return {"zoom":1.0, "offset":Vector2.ZERO}
	var t: float = _smooth(_elapsed / float(shot["duration"]))
	var amount: float = float(shot["camera"]["intensity"]) * 0.18
	var zoom: float = 1.0
	var offset: Vector2 = Vector2.ZERO
	match str(shot["camera"]["preset"]):
		"zoom_in": zoom += amount * t
		"zoom_out": zoom += amount * (1.0 - t)
		"pan_left":
			zoom += amount
			offset.x = (1.0 - 2.0 * t) * amount * 800.0
		"pan_right":
			zoom += amount
			offset.x = (2.0 * t - 1.0) * amount * 800.0
		"pan_up":
			zoom += amount
			offset.y = (1.0 - 2.0 * t) * amount * 450.0
		"pan_down":
			zoom += amount
			offset.y = (2.0 * t - 1.0) * amount * 450.0
	return {"zoom": zoom, "offset": LOGICAL * (1.0 - zoom) / 2.0 + offset}

func _actor_pose(actor: Dictionary) -> Dictionary:
	return Motion.pose(_motion_actor(actor), _elapsed)

func _draw_background(shot: Dictionary) -> void:
	var ref: Variant = shot["background"]["asset"]
	if ref == null or not _textures.has(ref):
		return
	var texture: Texture2D = _textures[ref]
	var dimensions: Vector2 = texture.get_size()
	if shot["background"]["fit"] == "contain":
		var ratio: float = minf(1600.0 / dimensions.x, 900.0 / dimensions.y)
		var target: Vector2 = dimensions * ratio
		draw_texture_rect(texture, Rect2((LOGICAL - target) / 2.0, target), false)
	else:
		var ratio: float = maxf(1600.0 / dimensions.x, 900.0 / dimensions.y)
		var visible_size: Vector2 = LOGICAL / ratio
		draw_texture_rect_region(texture, Rect2(Vector2.ZERO, LOGICAL), Rect2((dimensions - visible_size) / 2.0, visible_size))

func _draw_frame(style: String, texture: Texture2D, rect: Rect2) -> void:
	var s: Dictionary = FRAME_SPECS[style]
	var factor: float = minf(0.35, minf(rect.size.x / (s["left"] + s["right"] + 100.0), rect.size.y / (s["top"] + s["bottom"] + 100.0)))
	var dx: Array = [0.0, s["left"] * factor, rect.size.x - s["right"] * factor, rect.size.x]
	var dy: Array = [0.0, s["top"] * factor, rect.size.y - s["bottom"] * factor, rect.size.y]
	var sx: Array = [s["x"], s["x"] + s["left"], s["x"] + s["width"] - s["right"], s["x"] + s["width"]]
	var sy: Array = [s["y"], s["y"] + s["top"], s["y"] + s["height"] - s["bottom"], s["y"] + s["height"]]
	for row: int in range(3):
		for col: int in range(3):
			var source_x: float = float(s["bottomX"]) if row == 2 and col == 1 else float(sx[col])
			var source_width: float = float(s["bottomWidth"]) if row == 2 and col == 1 else float(sx[col + 1] - sx[col])
			var target: Rect2 = Rect2(rect.position + Vector2(dx[col], dy[row]), Vector2(dx[col + 1] - dx[col] + 0.35, dy[row + 1] - dy[row] + 0.35))
			var source: Rect2 = Rect2(source_x, sy[row], source_width, sy[row + 1] - sy[row])
			draw_texture_rect_region(texture, target, source)

func _bubble_target(bubble: Dictionary, shot: Dictionary, camera: Dictionary) -> Vector2:
	if bubble["tail"]["mode"] == "auto":
		for actor: Dictionary in shot["actors"]:
			if actor["id"] == bubble["speakerId"]:
				var head: Vector2 = Motion.anchor(_motion_actor(actor), _elapsed)
				if actor.has("animation") and _shared.enabled: head = Motion.transform(_motion_actor(actor),_elapsed)*_shared.point(actor,_elapsed,"head",reduced_motion)
				return head * float(camera["zoom"]) + camera["offset"]
	return Vector2(float(bubble["tail"]["x"]), float(bubble["tail"]["y"])) * LOGICAL

func _draw_tail(rect: Rect2, target: Vector2, fill: Color, border: Color) -> void:
	if rect.has_point(target):
		return
	var delta: Vector2 = target - rect.get_center()
	var points: PackedVector2Array
	if absf(delta.x / rect.size.x) > absf(delta.y / rect.size.y):
		var bx: float = rect.end.x - 3.0 if delta.x > 0 else rect.position.x + 3.0
		var by: float = clampf(rect.get_center().y + delta.y * absf(rect.size.x * 0.5 / delta.x), rect.position.y + 28.0, rect.end.y - 28.0)
		points = PackedVector2Array([Vector2(bx, by - 14.0), target, Vector2(bx, by + 14.0)])
	else:
		var by: float = rect.end.y - 3.0 if delta.y > 0 else rect.position.y + 3.0
		var bx: float = clampf(rect.get_center().x + delta.x * absf(rect.size.y * 0.5 / delta.y), rect.position.x + 34.0, rect.end.x - 34.0)
		points = PackedVector2Array([Vector2(bx - 17.0, by), target, Vector2(bx + 17.0, by)])
	draw_colored_polygon(points, fill)
	points.append(points[0])
	draw_polyline(points, border, 4.0, true)

func _draw_bubble(bubble: Dictionary, shot: Dictionary, camera: Dictionary) -> void:
	var rect: Rect2 = Rect2(Vector2(float(bubble["x"]), float(bubble["y"])) * LOGICAL, Vector2(float(bubble["width"]), float(bubble["height"])) * LOGICAL)
	var plain: bool = bubble["style"] == "plain"
	var fill: Color = Color("fffdf6") if plain else Color("f0e1bf")
	var border: Color = Color("353b33") if plain else Color("ad8b4b")
	var textured: bool = bubble["style"] in ["simple", "ornate"] and _textures.has(bubble["frameAsset"])
	if bubble["kind"] == "speech" and bubble["tail"]["mode"] != "none":
		_draw_tail(rect, _bubble_target(bubble, shot, camera), fill, border)
	if textured:
		_draw_frame(str(bubble["style"]), _textures[bubble["frameAsset"]], rect)
	else:
		var box_key: String = str(bubble["style"]) + ":" + str(bubble["kind"])
		if not _style_boxes.has(box_key):
			_style_boxes[box_key] = StyleBoxFlat.new()
		var box: StyleBoxFlat = _style_boxes[box_key]
		box.bg_color = fill
		box.border_color = border
		box.set_border_width_all(3)
		box.set_corner_radius_all(10 if bubble["kind"] == "narration" else 26)
		draw_style_box(box, rect)
		if not plain:
			var inner_key: String = box_key + ":inner"
			if not _style_boxes.has(inner_key):
				_style_boxes[inner_key] = StyleBoxFlat.new()
			var inner: StyleBoxFlat = _style_boxes[inner_key]
			inner.bg_color = Color.TRANSPARENT
			inner.border_color = Color("bba677")
			inner.set_border_width_all(1)
			inner.set_corner_radius_all(6 if bubble["kind"] == "narration" else 20)
			draw_style_box(inner, rect.grow(-7.0))
	var font: Font = dialogue_font if dialogue_font != null else ThemeDB.fallback_font
	var font_size: int = int(bubble["fontSize"])
	var padding: Vector2 = Vector2(58, 48) if textured else Vector2(28, 22)
	var line_height: float = float(font_size) * 1.32
	var lines: Array = bubble.get("lines", [])
	if lines.is_empty():
		# Save from the editor to include deterministic, shared line breaks.
		lines = Array(str(bubble["text"]).split("\n"))
	if bubble.has("textAnimation"):
		_draw_animated_text(bubble, rect, font, font_size, padding, line_height)
		return
	for index: int in range(lines.size()):
		var baseline: float = padding.y - 2.0 + float(font_size) + float(index) * line_height
		if baseline > rect.size.y - padding.y + 7.0:
			break
		draw_string(font, rect.position + Vector2(padding.x, baseline), str(lines[index]), HORIZONTAL_ALIGNMENT_LEFT, rect.size.x - padding.x * 2.0, font_size, Color("342e24"))

func _draw_animated_text(bubble: Dictionary, rect: Rect2, font: Font, font_size: int, padding: Vector2, line_height: float) -> void:
	var text_units: Array = TextAnimation.units(bubble)
	var factor: float = minf(size.x / LOGICAL.x, size.y / LOGICAL.y)
	var origin: Vector2 = (size - LOGICAL * factor) / 2.0
	var dimensions: Vector2 = Vector2(maxf(1.0, rect.size.x - padding.x * 2.0), bubble["lines"].size() * line_height)
	var metrics: Array = bubble.get("_text_metrics", [])
	var font_key: String = str(font.get_instance_id()) + ":" + str(font_size)
	if metrics.size() != text_units.size() or bubble.get("_font_key", "") != font_key:
		metrics = []
		var prefix: String = ""
		var row: int = -1
		for unit: Dictionary in text_units:
			if int(unit["line"]) != row:
				row = int(unit["line"])
				prefix = ""
			var width: float = font.get_string_size(str(unit["text"]), HORIZONTAL_ALIGNMENT_LEFT, -1.0, font_size).x
			var end: float = font.get_string_size(prefix + str(unit["text"]), HORIZONTAL_ALIGNMENT_LEFT, -1.0, font_size).x
			metrics.append({"x":end - width, "width":width, "y":float(font_size) + float(row) * line_height})
			prefix += str(unit["text"])
		bubble["_text_metrics"] = metrics
		bubble["_font_key"] = font_key
	for index: int in range(text_units.size()):
		var unit: Dictionary = text_units[index]
		if str(unit["text"]).strip_edges().is_empty():
			continue
		var m: Dictionary = metrics[index]
		var center: Vector2 = Vector2(float(m["x"]) + float(m["width"]) / 2.0, float(m["y"]) - float(font_size) * 0.35)
		var pose: Dictionary = TextAnimation.glyph_pose(bubble, unit, _dialogue_elapsed, center, dimensions, _text_completed_at >= 0.0)
		if float(pose["opacity"]) <= 0.0:
			continue
		pose = TextAnimation.fit_glyph_pose(pose, center, float(m["width"]), float(font_size), Vector2(dimensions.x, maxf(1.0, rect.size.y - padding.y * 2.0 + 7.0)))
		var point: Vector2 = center + Vector2(float(pose["dx"]), float(pose["dy"]))
		if float(m["y"]) > rect.size.y - padding.y * 2.0 + 9.0 or point.x < 0.0 or point.x > dimensions.x:
			continue
		var glyph_origin: Vector2 = rect.position + padding + Vector2(0.0, -2.0) + point
		draw_set_transform(origin + glyph_origin * factor, deg_to_rad(float(pose["rotation"])), Vector2.ONE * factor * float(pose["scale"]))
		draw_string(font, Vector2(-float(m["width"]) / 2.0, float(font_size) * 0.35), str(unit["text"]), HORIZONTAL_ALIGNMENT_LEFT, -1.0, font_size, Color(0.204, 0.18, 0.141, float(pose["opacity"])))
	draw_set_transform(origin, 0.0, Vector2.ONE * factor)

func _draw() -> void:
	if not _playing or _document.is_empty():
		return
	var factor: float = minf(size.x / LOGICAL.x, size.y / LOGICAL.y)
	var origin: Vector2 = (size - LOGICAL * factor) / 2.0
	var shot: Dictionary = _current_shot()
	var camera: Dictionary = _camera(shot)
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	draw_rect(Rect2(Vector2.ZERO, size), Color.BLACK)
	draw_set_transform(origin + camera["offset"] * factor, 0.0, Vector2.ONE * factor * float(camera["zoom"]))
	draw_rect(Rect2(Vector2.ZERO, LOGICAL), Color("121a18"))
	_draw_background(shot)
	for actor: Dictionary in shot["actors"]:
		if not _textures.has(actor["asset"]):
			continue
		var pose: Dictionary = _actor_pose(actor)
		var dimensions: Vector2 = Vector2(float(actor["width"]), float(actor["height"])) * LOGICAL
		var camera_scale: float = factor * float(camera["zoom"])
		var camera_transform: Transform2D = Transform2D(Vector2(camera_scale, 0.0), Vector2(0.0, camera_scale), origin + Vector2(camera["offset"]) * factor)
		var root: Transform2D = camera_transform * Motion.transform(_motion_actor(actor), _elapsed)
		if actor.has("animation"):
			_shared.draw_actor(self,actor,_elapsed,root,float(pose.opacity),reduced_motion)
		else:
			draw_set_transform_matrix(root)
			draw_texture_rect(_textures[actor["asset"]], Rect2(Vector2.ZERO, dimensions), false, Color(1.0, 1.0, 1.0, float(pose["opacity"])))
	var effects_scale: float = factor*float(camera.zoom)
	_shared.draw_effects(self,Transform2D(Vector2(effects_scale,0),Vector2(0,effects_scale),origin+Vector2(camera.offset)*factor),reduced_motion)
	draw_set_transform(origin, 0.0, Vector2.ONE * factor)
	if _elapsed >= float(shot["dialogueStart"]) and _dialogue_index < shot["bubbles"].size():
		_draw_bubble(shot["bubbles"][_dialogue_index], shot, camera)
	if shot["transition"]["type"] == "fade" and _elapsed < float(shot["transition"]["duration"]):
		var opacity: float = 1.0 - _elapsed / maxf(0.01, float(shot["transition"]["duration"]))
		draw_rect(Rect2(Vector2.ZERO, LOGICAL), Color(0, 0, 0, opacity))
	# Mask everything outside the logical frame on other screen ratios.
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	if origin.x > 0.0:
		draw_rect(Rect2(0.0, 0.0, origin.x, size.y), Color.BLACK)
		draw_rect(Rect2(size.x - origin.x, 0.0, origin.x, size.y), Color.BLACK)
	if origin.y > 0.0:
		draw_rect(Rect2(0.0, 0.0, size.x, origin.y), Color.BLACK)
		draw_rect(Rect2(0.0, size.y - origin.y, size.x, origin.y), Color.BLACK)
