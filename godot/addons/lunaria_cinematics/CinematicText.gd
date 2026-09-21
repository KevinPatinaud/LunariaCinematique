class_name LunariaCinematicText
extends RefCounted
## Mirrors textSegments.ts / textAnimation.ts. No random or independent animation clock.
const EPS: float = 0.000000001

static func _smooth(value: float) -> float:
	var t: float = clampf(value, 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)

static func units_for_lines(lines: Array) -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	var word: int = -1
	var in_word: bool = false
	var ts: TextServer = TextServerManager.get_primary_interface()
	for row: int in range(lines.size()):
		var line: String = str(lines[row])
		var previous: int = 0
		var column: int = 0
		for end: int in ts.string_get_character_breaks(line, "fr"):
			var text: String = line.substr(previous, end - previous)
			previous = end
			var space: bool = text.strip_edges().is_empty()
			if not space and not in_word:
				word += 1
			in_word = not space
			result.append({"text":text, "line":row, "column":column, "index":result.size(), "word":maxi(0, word)})
			column += 1
		if row < lines.size() - 1:
			result.append({"text":"\n", "line":row, "column":column, "index":result.size(), "word":maxi(0, word)})
			in_word = false
	return result

static func units(bubble: Dictionary) -> Array:
	if bubble.has("_text_units"):
		return bubble["_text_units"]
	return units_for_lines(bubble.get("lines", Array(str(bubble["text"]).split("\n"))))

static func _reveal_length(animation: Dictionary, text_units: Array) -> float:
	var count: int = 0
	var content: bool = false
	for unit: Dictionary in text_units:
		count = maxi(count, int(unit["word"]) + 1)
		content = content or not str(unit["text"]).strip_edges().is_empty()
	if not content:
		return 0.0
	match str(animation["reveal"]):
		"typewriter": return float(text_units.size()) / float(animation["speed"])
		"words": return float(count) / float(animation["speed"])
		"fade": return float(animation["duration"])
	return 0.0

static func intro_duration(bubble: Dictionary) -> float:
	if not bubble.has("textAnimation") or str(bubble["text"]).strip_edges().is_empty():
		return 0.0
	var a: Dictionary = bubble["textAnimation"]
	return float(a["delay"]) + maxf(_reveal_length(a, units(bubble)), 0.0 if a["effect"] == "none" else float(a["duration"]))

static func needs_completion(bubble: Dictionary, elapsed: float, completed_at: float = -1.0) -> bool:
	if not bubble.has("textAnimation") or completed_at >= 0.0 or str(bubble["text"]).strip_edges().is_empty():
		return false
	var a: Dictionary = bubble["textAnimation"]
	var once: bool = a["effect"] != "none" and (a["effect"] == "shout" or not bool(a["loop"]))
	var duration: float = float(a["delay"]) + maxf(_reveal_length(a, units(bubble)), float(a["duration"]) if once else 0.0)
	return elapsed + EPS < duration

static func auto_duration(bubble: Dictionary, completed_at: float = -1.0) -> float:
	return minf(intro_duration(bubble), completed_at if completed_at >= 0.0 else INF) + float(bubble["advance"]["seconds"])

static func glyph_pose(bubble: Dictionary, unit: Dictionary, elapsed: float, center: Vector2, dimensions: Vector2, completed: bool = false) -> Dictionary:
	var result: Dictionary = {"opacity":1.0, "dx":0.0, "dy":0.0, "rotation":0.0, "scale":1.0}
	if not bubble.has("textAnimation"):
		return result
	var a: Dictionary = bubble["textAnimation"]
	var time: float = (maxf(0.0, elapsed) if is_finite(elapsed) else 0.0) - float(a["delay"])
	var index: int = int(unit["index"])
	if not completed:
		if time < 0.0:
			result["opacity"] = 0.0
		elif a["reveal"] == "typewriter":
			result["opacity"] = 1.0 if index < floori(time * float(a["speed"]) + EPS) else 0.0
		elif a["reveal"] == "words":
			result["opacity"] = 1.0 if int(unit["word"]) < floori(time * float(a["speed"]) + EPS) else 0.0
		elif a["reveal"] == "fade":
			result["opacity"] = _smooth(time / float(a["duration"]))
	if time < 0.0 or a["effect"] == "none" or (completed and (a["effect"] == "shout" or not bool(a["loop"]))):
		return result
	var cycles: float = time / float(a["duration"])
	if (a["effect"] == "shout" or not bool(a["loop"])) and cycles >= 1.0:
		return result
	var t: float = fmod(cycles, 1.0)
	var phase: float = t * TAU
	var strength: float = clampf(float(a["intensity"]), 0.0, 1.0)
	var envelope: float = minf(1.0, time / minf(0.12, float(a["duration"]) * 0.2)) if bool(a["loop"]) else pow(sin(PI * t), 2.0)
	match str(a["effect"]):
		"shout":
			var burst: float = _smooth(t / 0.24) if t < 0.24 else 1.0 - _smooth((t - 0.24) / 0.76)
			var direction: float = float((index * 37) % 11 - 5) / 5.0
			result["dx"] = (center.x - dimensions.x / 2.0) * 0.12 * strength * burst
			result["dy"] = ((center.y - dimensions.y / 2.0) * 0.1 + direction * 9.0) * strength * burst
			result["rotation"] = direction * 16.0 * strength * burst
			result["scale"] = 1.0 + 0.7 * strength * burst - 0.45 * strength * (1.0 - _smooth(t / 0.12))
		"wave": result["dy"] = sin(phase - float(index) * 0.55) * 10.0 * strength * envelope
		"shake":
			result["dx"] = (0.65 * sin(phase * 5.0 + float(index) * 1.7) + 0.35 * sin(phase * 11.0 + float(index))) * 6.0 * strength * envelope
			result["dy"] = sin(phase * 7.0 + float(index) * 2.3) * 4.0 * strength * envelope
			result["rotation"] = sin(phase * 3.0 + float(index)) * 7.0 * strength * envelope
		"bounce": result["dy"] = -16.0 * strength * pow(sin((phase - float(index) * 0.5) / 2.0), 2.0) * envelope
	return result


static func fit_glyph_pose(pose: Dictionary, center: Vector2, glyph_width: float, font_size: float, bounds: Vector2) -> Dictionary:
	if float(pose["dx"]) == 0.0 and float(pose["dy"]) == 0.0 and float(pose["rotation"]) == 0.0 and float(pose["scale"]) == 1.0:
		return pose
	var result: Dictionary = pose.duplicate()
	var angle: float = deg_to_rad(float(result["rotation"]))
	var half_x: float = (absf(cos(angle)) * glyph_width + absf(sin(angle)) * font_size) / 2.0
	var half_y: float = (absf(sin(angle)) * glyph_width + absf(cos(angle)) * font_size) / 2.0
	result["scale"] = minf(float(result["scale"]), minf(bounds.x / maxf(1.0, half_x * 2.0), bounds.y / maxf(1.0, half_y * 2.0)))
	var hx: float = half_x * float(result["scale"])
	var hy: float = half_y * float(result["scale"])
	result["dx"] = clampf(center.x + float(result["dx"]), hx, bounds.x - hx) - center.x
	result["dy"] = clampf(center.y + float(result["dy"]), hy, bounds.y - hy) - center.y
	return result
