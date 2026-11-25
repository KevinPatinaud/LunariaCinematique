extends SceneTree
## godot --headless --path godot --script res://tests/animations_parity.gd
## Reference vectors generated from TypeScript; must be run in native Godot to validate parity.
const Text = preload("res://addons/lunaria_cinematics/CinematicText.gd")
const Motion = preload("res://addons/lunaria_cinematics/CinematicMotion.gd")
const BubbleEntry = preload("res://addons/lunaria_cinematics/CinematicBubbleEntry.gd")
const Player = preload("res://addons/lunaria_cinematics/CinematicPlayer.gd")
const Presentation = preload("res://addons/lunaria_cinematics/CinematicPresentation.gd")
var failures: int = 0
var comparisons: int = 0
func compare(actual: float, expected: float, label: String) -> void:
	comparisons += 1
	if not is_finite(actual) or absf(actual - expected) > 0.003:
		failures += 1
		printerr(label + ": " + str(actual) + " != " + str(expected))
func compare_dictionary(actual: Dictionary, expected: Dictionary, label: String) -> void:
	for key: String in expected:
		compare(float(actual[key]), float(expected[key]), label + "/" + key)
func same_units(actual: Array, expected: Array) -> bool:
	if actual.size() != expected.size(): return false
	for index: int in range(actual.size()):
		var left: Dictionary = actual[index]
		var right: Dictionary = expected[index]
		if str(left.get("text", "")) != str(right.get("text", "")): return false
		for key: String in ["line", "column", "index", "word"]:
			if int(left.get(key, -1)) != int(right.get(key, -1)): return false
	return true

func _initialize() -> void:
	var content: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://tests/animations_vectors.json"))
	if not content is Dictionary or not content.has("text") or not content.has("motion"):
		printerr("Animation vectors missing or invalid.")
		quit(1)
		return
	for index: int in range(content["text"].size()):
		var row: Dictionary = content["text"][index]
		var bubble: Dictionary = row["bubble"]
		var units: Array = Text.units_for_lines(bubble["lines"])
		comparisons += 1
		if not same_units(units, row["units"]):
			failures += 1
			printerr("Text segmentation differs at vector " + str(index))
		bubble["_text_units"] = units
		var center: Vector2 = Vector2(float(row["center"]["x"]), float(row["center"]["y"]))
		var dimensions: Vector2 = Vector2(float(row["dimensions"]["x"]), float(row["dimensions"]["y"]))
		var pose: Dictionary = Text.glyph_pose(bubble, row["unit"], float(row["elapsed"]), center, dimensions, bool(row["completed"]))
		compare_dictionary(pose, row["expected"], "text/" + str(index))
		compare_dictionary(Text.fit_glyph_pose(pose, center, 24.0, 28.0, dimensions), row["fitted"], "fit/" + str(index))
		compare(Text.intro_duration(bubble), float(row["intro"]), "intro/" + str(index))
		compare(Text.auto_duration(bubble, float(row["elapsed"]) if bool(row["completed"]) else -1.0), float(row["auto"]), "auto/" + str(index))
	for index: int in range(content["motion"].size()):
		var row: Dictionary = content["motion"][index]
		var pose: Dictionary = Motion.pose(row["actor"], float(row["elapsed"]))
		var position: Vector2 = pose["position"]
		var pivot: Vector2 = pose["pivot"]
		var anchor: Vector2 = Motion.anchor(row["actor"], float(row["elapsed"]), 0.3, 0.22)
		compare_dictionary({"x":position.x,"y":position.y,"pivotX":pivot.x,"pivotY":pivot.y,"rotation":pose["rotation"],"opacity":pose["opacity"],"scale":pose["scale"],"anchorX":anchor.x,"anchorY":anchor.y}, row["expected"], "actor/" + str(index))
	for index: int in range(content.get("bubble", []).size()):
		var row: Dictionary = content["bubble"][index]
		compare_dictionary(BubbleEntry.pose(row["bubble"], float(row["elapsed"]), bool(row["completed"])), row["expected"], "bubble/" + str(index))
	var crop := {"width": 80, "height": 100}
	var walk := {"scope": "cinematic", "kind": "frames", "loop": true, "frames": [{"region": crop}, {"region": crop}]}
	var visual := {"width": 100.0, "height": 100.0}
	var timing := {"traveled_px": 24.0, "travel_elapsed": 1.5}
	compare(Presentation._movement_clip_time(walk, visual, "move", 1.2, timing, 1.0, 8.0 / 12.0), (24.0 / 76.8) * (8.0 / 12.0), "cinematic walk distance")
	compare(Presentation._movement_clip_time(walk, visual, "move", 1.2, timing, 2.0, 8.0 / 12.0), (24.0 / 76.8) * (8.0 / 12.0) * 2.0, "cinematic walk speed")
	compare(Presentation._movement_clip_time(walk, visual, "talk", 1.2, timing, 1.0, 8.0 / 12.0), 1.5, "cinematic dialogue time")
	print("Lunaria animations parity: ", comparisons, " comparisons; ", failures, " failure(s).")
	quit(0 if failures == 0 else 1)
