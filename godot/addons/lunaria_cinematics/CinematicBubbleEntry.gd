class_name LunariaCinematicBubbleEntry
extends RefCounted
## Mirrors bubbleEntry.ts. A dialogue's own clock drives the complete bubble.

static func duration(bubble: Dictionary) -> float:
	var entry: Dictionary = _entry(bubble)
	return 0.0 if entry["preset"] == "none" else float(entry["duration"])

static func pose(bubble: Dictionary, elapsed: float, completed: bool = false) -> Dictionary:
	var result: Dictionary = {"dx":0.0, "dy":0.0, "scale":1.0, "rotation":0.0, "burst":0.0}
	var entry: Dictionary = _entry(bubble)
	if entry["preset"] == "none" or completed:
		return result
	var t: float = clampf(maxf(0.0, elapsed) / float(entry["duration"]), 0.0, 1.0)
	if t >= 1.0:
		return result
	if entry["preset"] == "pop":
		result["scale"] = 0.82 + 0.23 * _smooth(t / 0.7) if t < 0.7 else 1.05 - 0.05 * _smooth((t - 0.7) / 0.3)
	elif entry["preset"] in ["left", "right"]:
		result["dx"] = (-36.0 if entry["preset"] == "left" else 36.0) * (1.0 - _smooth(t))
	elif entry["preset"] == "burst":
		if t < 0.24:
			result["scale"] = 0.62 + 0.56 * _smooth(t / 0.24)
		elif t < 0.55:
			result["scale"] = 1.18 - 0.24 * _smooth((t - 0.24) / 0.31)
		else:
			result["scale"] = 0.94 + 0.06 * _smooth((t - 0.55) / 0.45)
		result["rotation"] = 3.0 * sin(4.0 * PI * t) * (1.0 - t / 0.55) if t < 0.55 else 0.0
		result["burst"] = sin(PI * t / 0.6) if t < 0.6 else 0.0
	elif entry["preset"] == "shake":
		var fade: float = 1.0 - _smooth(t)
		result["dx"] = 14.0 * sin(12.0 * PI * t) * fade
		result["dy"] = 6.0 * sin(16.0 * PI * t) * fade
		result["rotation"] = 3.5 * sin(10.0 * PI * t) * fade
		result["scale"] = 1.0 + 0.06 * sin(6.0 * PI * t) * fade
	elif t < 0.6:
		result["dy"] = -50.0 * (1.0 - _smooth(t / 0.6))
		result["scale"] = 0.88 + 0.12 * _smooth(t / 0.6)
	else:
		var landing: float = sin(PI * (t - 0.6) / 0.4)
		result["dy"] = 12.0 * landing
		result["scale"] = 1.0 - 0.06 * landing
	return result

static func _entry(bubble: Dictionary) -> Dictionary:
	if bubble.has("bubbleEntry"):
		return bubble["bubbleEntry"]
	if bubble.has("textAnimation") and bubble["textAnimation"]["effect"] == "shout":
		return {"preset":"burst", "duration":0.65}
	return {"preset":"pop", "duration":0.3}

static func _smooth(value: float) -> float:
	var t: float = clampf(value, 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)
