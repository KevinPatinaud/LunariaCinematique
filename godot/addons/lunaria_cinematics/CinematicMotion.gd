class_name LunariaCinematicMotion
extends RefCounted
## Deterministic motion; mirrors src/shared/motion.ts. No Tween state or randomness.
const LOGICAL: Vector2 = Vector2(1600.0, 900.0)

static func _smooth(value: float) -> float:
	var t: float = clampf(value, 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)

static func entry_end(actor: Dictionary) -> float:
	var entry: Dictionary = actor["entry"]
	return 0.0 if entry["preset"] == "none" else float(entry["delay"]) + float(entry["duration"])

static func travel_offset(actor: Dictionary, elapsed: float) -> Vector2:
	var movement: Dictionary = actor.get("movement", {})
	if not bool(movement.get("enabled", false)):
		return Vector2.ZERO
	var time: float = elapsed - entry_end(actor) - float(movement["delay"])
	if time <= 0.0:
		return Vector2.ZERO
	var cycles: float = time / maxf(0.1, float(movement["duration"]))
	var linear: float = 1.0 - absf(fmod(cycles, 2.0) - 1.0) if movement["repeat"] == "pingpong" else clampf(cycles, 0.0, 1.0)
	var t: float = linear if movement["easing"] == "linear" else _smooth(linear)
	return Vector2(float(movement["dx"]), float(movement["dy"])) * LOGICAL * t

static func pose(actor: Dictionary, elapsed: float, animated: bool = true) -> Dictionary:
	var time: float = maxf(0.0, elapsed) if is_finite(elapsed) else 0.0
	var leaving: Dictionary = actor.get("exit", {})
	var started: bool = animated and str(leaving.get("preset", "none")) != "none" and time >= float(leaving["start"])
	var result: Dictionary = _active_pose(actor, float(leaving["start"]) if started else time, animated)
	if not started:
		return result
	var t: float = _smooth((time - float(leaving["start"])) / maxf(0.1, float(leaving["duration"])))
	var position: Vector2 = result["position"]
	match str(leaving["preset"]):
		"fade": result["opacity"] = float(result["opacity"]) * (1.0 - t)
		"left": position.x = lerpf(position.x, -float(actor["width"]) * LOGICAL.x, t)
		"right": position.x = lerpf(position.x, LOGICAL.x, t)
		"top": position.y = lerpf(position.y, -float(actor["height"]) * LOGICAL.y, t)
		"bottom": position.y = lerpf(position.y, LOGICAL.y, t)
		"shrink":
			result["scale"] = float(result["scale"]) * (1.0 - t)
			result["opacity"] = float(result["opacity"]) * (1.0 - t)
	result["position"] = position
	if t >= 1.0:
		result["opacity"] = 0.0
	return result

static func _active_pose(actor: Dictionary, elapsed: float, animated: bool = true) -> Dictionary:
	var pivot_y: float = 0.0 if actor.get("pivot", "center") == "top" else (1.0 if actor.get("pivot", "center") == "bottom" else 0.5)
	var result: Dictionary = {
		"position": Vector2(float(actor["x"]), float(actor["y"])) * LOGICAL,
		"opacity": float(actor["opacity"]), "rotation": float(actor.get("rotation", 0.0)), "scale": 1.0,
		"pivot": Vector2(float(actor["width"]) * LOGICAL.x * 0.5, float(actor["height"]) * LOGICAL.y * pivot_y)
	}
	if not animated:
		return result
	var time: float = maxf(0.0, elapsed) if is_finite(elapsed) else 0.0
	var entry: Dictionary = actor["entry"]
	var raw: float = clampf((time - float(entry["delay"])) / maxf(0.01, float(entry["duration"])), 0.0, 1.0)
	var p: float = _smooth(raw)
	var position: Vector2 = result["position"]
	if entry["preset"] != "none" and time < float(entry["delay"]):
		result["opacity"] = 0.0
	match str(entry["preset"]):
		"fade": result["opacity"] = float(result["opacity"]) * p
		"left": position.x = lerpf(-float(actor["width"]) * LOGICAL.x, position.x, p)
		"right": position.x = lerpf(LOGICAL.x, position.x, p)
		"bottom": position.y = lerpf(LOGICAL.y, position.y, p)
		"top": position.y = lerpf(-float(actor["height"]) * LOGICAL.y, position.y, p)
		"zoom":
			result["scale"] = 0.2 + 0.8 * p
			result["opacity"] = float(result["opacity"]) * p
		"pop":
			var c: float = 1.70158
			var u: float = raw - 1.0
			result["scale"] = maxf(0.0, 1.0 + (c + 1.0) * pow(u, 3.0) + c * u * u)
			result["opacity"] = float(result["opacity"]) * clampf(raw * 4.0, 0.0, 1.0)
	result["position"] = position + travel_offset(actor, time)
	var effect: Dictionary = actor.get("motion", {})
	var preset: String = str(effect.get("preset", "none"))
	if preset == "none":
		return result
	var local_time: float = time - entry_end(actor) - float(effect["delay"])
	if local_time <= 0.0:
		return result
	var cycles: float = local_time / maxf(0.2, float(effect["period"]))
	if not bool(effect["loop"]) and cycles >= 1.0:
		return result
	var phase: float = fmod(cycles, 1.0) * TAU * (-1.0 if bool(effect["reverse"]) else 1.0)
	var strength: float = clampf(float(effect["intensity"]), 0.0, 1.0)
	var wave: float = sin(phase)
	position = result["position"]
	match preset:
		"float": position.y -= 45.0 * strength * wave
		"sway": result["rotation"] = float(result["rotation"]) + 20.0 * strength * wave
		"pulse": result["scale"] = float(result["scale"]) * (1.0 + 0.12 * strength * wave)
		"spin": result["rotation"] = float(result["rotation"]) + rad_to_deg(phase)
		"shake":
			position.x += 18.0 * strength * (0.65 * sin(phase * 5.0) + 0.35 * sin(phase * 11.0))
			position.y += 9.0 * strength * sin(phase * 7.0)
		"bounce": position.y -= 90.0 * strength * pow(sin(phase * 0.5), 2.0)
		"nod":
			result["rotation"] = float(result["rotation"]) + 12.0 * strength * wave
			position.y += 5.0 * strength * pow(sin(phase * 0.5), 2.0)
		"recoil":
			var impulse: float = pow(sin(fmod(cycles, 1.0) * PI), 2.0)
			var direction: float = (1.0 if bool(actor["flipX"]) else -1.0) * (-1.0 if bool(effect["reverse"]) else 1.0)
			position.x += 65.0 * strength * impulse * direction
			result["rotation"] = float(result["rotation"]) + 12.0 * strength * impulse * direction
		"heartbeat": result["scale"] = float(result["scale"]) * (1.0 + 0.22 * strength * pow(wave, 8.0))
		"flutter":
			position.y -= 25.0 * strength * wave
			result["rotation"] = float(result["rotation"]) + 15.0 * strength * sin(phase * 3.0)
	result["position"] = position
	return result

static func transform(actor: Dictionary, elapsed: float, animated: bool = true) -> Transform2D:
	var value: Dictionary = pose(actor, elapsed, animated)
	var angle: float = deg_to_rad(float(value["rotation"]))
	var size_scale: float = float(value["scale"])
	var x_axis: Vector2 = Vector2(cos(angle), sin(angle)) * size_scale
	var y_axis: Vector2 = Vector2(-sin(angle), cos(angle)) * size_scale
	var pivot: Vector2 = value["pivot"]
	var flip: bool = bool(actor["flipX"])
	var shift: Vector2 = Vector2(float(actor["width"]) * LOGICAL.x if flip else 0.0, 0.0) - pivot
	var origin: Vector2 = Vector2(value["position"]) + pivot + x_axis * shift.x + y_axis * shift.y
	return Transform2D(-x_axis if flip else x_axis, y_axis, origin)

static func anchor(actor: Dictionary, elapsed: float, u: float = 0.5, v: float = 0.22, animated: bool = true) -> Vector2:
	return transform(actor, elapsed, animated) * (Vector2(float(actor["width"]) * u, float(actor["height"]) * v) * LOGICAL)
