extends SceneTree
## Run: godot --headless --path godot --script res://tests/motion_parity.gd
const Motion = preload("res://addons/lunaria_cinematics/CinematicMotion.gd")
# Preload the complete player too, so parser errors in integration are reported.
const Player = preload("res://addons/lunaria_cinematics/CinematicPlayer.gd")
const Validator = preload("res://addons/lunaria_cinematics/CinematicValidator.gd")
var failures: int = 0
var comparisons: int = 0
func check_value(actual: float, expected: float, label: String) -> void:
	comparisons += 1
	if not is_finite(actual) or absf(actual-expected) > 0.003:
		failures += 1
		printerr(label + ": " + str(actual) + " != " + str(expected))
func _initialize() -> void:
	var content: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://tests/motion_vectors.json"))
	if not content is Array or content.is_empty():
		printerr("Motion vectors missing or invalid.")
		quit(1)
		return
	for index: int in range(content.size()):
		var row: Dictionary = content[index]
		var value: Dictionary = Motion.pose(row["actor"], float(row["elapsed"]))
		var expected: Dictionary = row["expected"]
		var position: Vector2 = value["position"]
		var pivot: Vector2 = value["pivot"]
		var anchor: Vector2 = Motion.anchor(row["actor"], float(row["elapsed"]), 0.3, 0.22)
		var actual: Dictionary = {"x":position.x,"y":position.y,"pivotX":pivot.x,"pivotY":pivot.y,"opacity":value["opacity"],"rotation":value["rotation"],"scale":value["scale"],"anchorX":anchor.x,"anchorY":anchor.y}
		for key: String in expected:
			check_value(float(actual[key]), float(expected[key]), str(index) + "/" + key)
	print("Lunaria motion parity: ", comparisons, " comparisons; ", failures, " failure(s).")
	quit(0 if failures == 0 else 1)
