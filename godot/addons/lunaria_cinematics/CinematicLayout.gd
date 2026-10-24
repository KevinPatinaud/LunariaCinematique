class_name LunariaCinematicLayout
extends RefCounted
## Deterministic authoring layout, matching src/shared/geometry.ts.
## Derived lines/height are regenerated so hand-authored or stale exports stay consistent.
static func _char_width(character: String, font_size: float) -> float:
	if character.strip_edges().is_empty():
		return font_size * 0.28
	if character in "ilI1.,'’!:;|":
		return font_size * 0.28
	if character in "MW@%&":
		return font_size * 0.90
	var code: int = character.unicode_at(0)
	return font_size * (1.0 if code > 0x2fff else (0.68 if code >= 65 and code <= 90 else 0.56))

static func _measure(text: String, font_size: float, font: Font = null) -> float:
	if font != null:
		return font.get_string_size(text, HORIZONTAL_ALIGNMENT_LEFT, -1.0, int(font_size)).x
	var width: float = 0.0
	for index: int in range(text.length()):
		width += _char_width(text.substr(index, 1), font_size)
	return width

static func wrap_text(text: String, max_width: float, font_size: float, font: Font = null) -> Array[String]:
	var lines: Array[String] = []
	var whitespace: RegEx = RegEx.new()
	whitespace.compile("\\s+")
	# Ignore outer blank paragraphs when fitting/centring, without changing the
	# authored text. Internal paragraph breaks still reserve their own lines.
	for paragraph: String in text.replace("\r", "").strip_edges().split("\n", true):
		var line: String = ""
		for word: String in whitespace.sub(paragraph.strip_edges(), " ", true).split(" ", false):
			if not line.is_empty() and _measure(line + " " + word, font_size, font) <= max_width:
				line += " " + word
				continue
			if not line.is_empty():
				lines.append(line)
				line = ""
			if _measure(word, font_size, font) <= max_width:
				line = word
				continue
			var previous: int = 0
			for end: int in TextServerManager.get_primary_interface().string_get_character_breaks(word):
				var character: String = word.substr(previous, end - previous)
				previous = end
				if not line.is_empty() and _measure(line + character, font_size, font) > max_width:
					lines.append(line)
					line = ""
				line += character
		lines.append(line)
	return lines

static func bubble_layout(bubble: Dictionary) -> Dictionary:
	var textured: bool = bubble["style"] in ["simple", "ornate"]
	var padding_x: float = 58.0 if textured else 28.0
	var padding_y: float = 48.0 if textured else 22.0
	var width: float = float(bubble["width"]) * 1600.0
	var font_size: float = float(bubble["fontSize"])
	var lines: Array[String] = wrap_text(str(bubble["text"]), maxf(20.0, width - padding_x * 2.0), font_size)
	var required: float = lines.size() * font_size * 1.32 + padding_y * 2.0
	var height: float = minf(1800.0, maxf(156.0 if textured else 98.0, required)) if bool(bubble["autoHeight"]) else float(bubble["height"]) * 900.0
	var available_width: float = maxf(1.0, width - padding_x * 2.0)
	var available_height: float = height - padding_y * 2.0
	# Fit the complete dialogue, not the currently revealed letters. Never grow
	# beyond the authored size, or alter the source fontSize to store this result.
	while true:
		lines = wrap_text(str(bubble["text"]), available_width, font_size)
		var fits: bool = lines.size() * font_size * 1.32 <= available_height + 0.0000001
		for line: String in lines:
			if _measure(line, font_size) > width - padding_x * 2.0 + 0.0000001:
				fits = false
		if fits or font_size <= 1.0:
			return {"width":width, "height":height, "lines":lines, "paddingX":padding_x, "paddingY":padding_y,
				"lineHeight":font_size * 1.32, "fontSize":font_size, "overflow":not fits}
		font_size = maxf(1.0, ceilf(font_size) - 1.0)
	return {}

static func prepare(document: Dictionary) -> void:
	for shot: Dictionary in document["shots"]:
		for bubble: Dictionary in shot["bubbles"]:
			var layout: Dictionary = bubble_layout(bubble)
			bubble["lines"] = layout["lines"]
			bubble["height"] = float(layout["height"]) / 900.0
			bubble["_font_size"] = layout["fontSize"]
