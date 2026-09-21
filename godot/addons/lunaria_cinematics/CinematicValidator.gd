class_name LunariaCinematicValidator
extends RefCounted
## Runtime validation of the same JSON Schema subset used by the editor.
## No commands, scripts or arbitrary URLs are executed from cinematic.json.

static func safe_asset_ref(value: Variant) -> bool:
	if not value is String or not value.begins_with("library://") or value.length() > 1024:
		return false
	var relative: String = value.substr(10)
	if relative.is_empty():
		return false
	for forbidden: String in ["\\", ":", "?", "#"]:
		if forbidden in relative:
			return false
	for index: int in range(relative.length()):
		if relative.unicode_at(index) < 32:
			return false
	for segment: String in relative.split("/", true):
		if segment.is_empty() or segment == "." or segment == "..":
			return false
	return true

static func _kind(value: Variant) -> String:
	match typeof(value):
		TYPE_NIL: return "null"
		TYPE_BOOL: return "boolean"
		TYPE_INT, TYPE_FLOAT: return "number"
		TYPE_STRING: return "string"
		TYPE_ARRAY: return "array"
		TYPE_DICTIONARY: return "object"
	return "unsupported"

static func _same_value(left: Variant, right: Variant) -> bool:
	if typeof(left) in [TYPE_INT, TYPE_FLOAT] and typeof(right) in [TYPE_INT, TYPE_FLOAT]:
		return float(left) == float(right)
	return left == right

static func _enum_contains(options: Array, value: Variant) -> bool:
	for option: Variant in options:
		if _same_value(option, value): return true
	return false

static func _walk(rule: Dictionary, value: Variant, at: String, errors: Array[String]) -> void:
	if errors.size() > 30:
		return
	if rule.has("const") and not _same_value(value, rule["const"]):
		errors.append("%s: unexpected constant." % at)
		return
	var kind: String = _kind(value)
	if rule.has("type"):
		var expected: Variant = rule["type"]
		var types: Array = expected if expected is Array else [expected]
		if not kind in types:
			errors.append("%s: invalid type (%s)." % [at, kind])
			return
	if value == null:
		return
	if rule.has("enum") and not _enum_contains(rule["enum"], value):
		errors.append("%s: unknown value." % at)
	if kind == "number":
		var number: float = float(value)
		if not is_finite(number) or number < float(rule.get("minimum", -INF)) or number > float(rule.get("maximum", INF)):
			errors.append("%s: number out of bounds." % at)
	elif kind == "string":
		var text: String = str(value)
		if text.length() < int(rule.get("minLength", 0)) or text.length() > int(rule.get("maxLength", 10000000)):
			errors.append("%s: invalid string length." % at)
		if rule.has("pattern"):
			# JSON Schema patterns use ECMAScript Unicode escapes; Godot embeds PCRE2.
			var source: String = str(rule.pattern).replace("\\u0000", "\\x{0000}").replace("\\u001f", "\\x{001f}")
			var pattern := RegEx.new()
			if pattern.compile(source) != OK or pattern.search(text) == null: errors.append("%s: invalid format." % at)
		if text.begins_with("library://") and not safe_asset_ref(text): errors.append("%s: forbidden library path." % at)
	elif kind == "array":
		var values: Array = value
		if values.size() < int(rule.get("minItems", 0)) or values.size() > int(rule.get("maxItems", 10000000)):
			errors.append("%s: invalid array size." % at)
		if rule.has("items"):
			for index: int in range(values.size()):
				_walk(rule["items"], values[index], "%s[%d]" % [at, index], errors)
	elif kind == "object" and rule.has("properties"):
		var record: Dictionary = value
		var properties: Dictionary = rule["properties"]
		for key: String in rule.get("required", []):
			if not record.has(key):
				errors.append("%s.%s: required field." % [at, key])
		for key: Variant in record:
			if properties.has(key):
				_walk(properties[key], record[key], "%s.%s" % [at, key], errors)
			elif rule.get("additionalProperties", true) == false:
				errors.append("%s.%s: unknown field." % [at, key])

static func validate(value: Variant, schema: Dictionary) -> Array[String]:
	var errors: Array[String] = []
	_walk(schema, value, "cinematic", errors)
	if not errors.is_empty():
		return errors
	var ids: Dictionary = {}
	for shot: Dictionary in value["shots"]:
		var images: Array = []
		if shot["background"]["asset"] != null:
			images.append(shot["background"]["asset"])
		for actor: Dictionary in shot["actors"]:
			images.append(actor["asset"])
			if actor.has("animation") and (int(value.schemaVersion) < 4 or not value.has("presentationCatalog")): errors.append("Un acteur animé requiert le catalogue explicite et schemaVersion 4.")
			if value["schemaVersion"] < 3 and (actor.has("exit") or actor["entry"]["preset"] in ["top", "pop", "zoom"] or str(actor.get("motion", {}).get("preset", "none")) in ["nod", "recoil", "heartbeat", "flutter"]):
				errors.append("New actor animations require schemaVersion: 3.")
			if value["schemaVersion"] == 1:
				for field: String in ["role", "rotation", "pivot", "motion", "movement"]:
					if actor.has(field):
						errors.append("Actor roles (enemy/prop) and motions require schemaVersion: 2.")
						break
		for bubble: Dictionary in shot["bubbles"]:
			if value["schemaVersion"] < 3 and bubble.has("textAnimation"):
				errors.append("Animated text requires schemaVersion: 3.")
			if bubble["frameAsset"] != null:
				images.append(bubble["frameAsset"])
		for ref: String in images:
			if not ref.get_extension().to_lower() in ["png", "jpg", "jpeg", "webp"]:
				errors.append("Invalid image format: " + ref)
		if shot["audio"] != null and not str(shot["audio"]["asset"]).get_extension().to_lower() in ["wav", "ogg", "mp3"]:
			errors.append("Invalid audio format.")
		var objects: Array = [shot]
		objects.append_array(shot["actors"])
		objects.append_array(shot["bubbles"])
		for object: Dictionary in objects:
			if ids.has(object["id"]):
				errors.append("Repeated ID: " + str(object["id"]))
			ids[object["id"]] = true
		if float(shot["dialogueStart"]) > float(shot["duration"]):
			errors.append("Dialogue start is after shot duration.")
		if float(shot["transition"]["duration"]) > float(shot["duration"]):
			errors.append("Transition is longer than shot duration.")
		for bubble: Dictionary in shot["bubbles"]:
			var speaker: Variant = bubble["speakerId"]
			var found: bool = speaker == null
			for actor: Dictionary in shot["actors"]:
				if actor["id"] == speaker:
					found = true
			if not found:
				errors.append("Bubble speaker is not in this shot.")
			if bubble["tail"]["mode"] == "auto" and speaker == null:
				errors.append("Automatic tail requires a speaker.")
			if bubble["style"] in ["simple", "ornate"] and bubble["frameAsset"] == null:
				errors.append("Textured frame requires a library asset.")
	return errors
