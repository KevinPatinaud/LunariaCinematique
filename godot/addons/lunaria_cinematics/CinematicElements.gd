extends RefCounted
## Fixed-image presets. Sampling uses plan time and has no accumulated state.

static func _plume(base: Dictionary, asset: String, phase: float, element: Dictionary) -> Dictionary:
	return base.merged({"asset": asset, "y": -float(element.travel) * phase,
		"x": float(element.get("drift", 0.0)) * phase,
		"angle": float(element.get("sway", 0.0)) * sin(TAU * phase),
		"scale": Vector2.ONE * (0.75 + phase * 0.75), "opacity": maxf(0.0, sin(PI * phase))}, true)

static func _breath(asset: String, phase: float, reach: float) -> Dictionary:
	var released: float = maxf(0.0, (phase - 0.12) / 0.88)
	var forward: float = 1.0 - pow(1.0 - released, 3.0)
	var spread: float = 1.0 - pow(1.0 - phase, 2.0)
	return {"asset": asset, "x": reach * forward, "y": -reach * 0.28 * pow(released, 1.5),
		"angle": -18.0 * released, "scale": Vector2(0.12 + 1.16 * spread, 0.065 + 0.95 * spread),
		"opacity": 0.82 * minf(1.0, phase / 0.06) * pow(1.0 - phase * phase, 1.45)}

static func sample(clip: Dictionary, binding: Dictionary, elapsed: float, still: bool) -> Array[Dictionary]:
	var frames: Array = clip.frames
	var base := {"asset": str(frames[0].asset), "x": 0.0, "y": 0.0, "angle": 0.0,
		"scale": Vector2.ONE, "opacity": 1.0}
	var playback: Dictionary = binding.elementPlayback
	var time: float = (elapsed - float(playback.start)) * float(binding.speed)
	if time < 0.0: return []
	var loop: bool = bool(playback.loop)
	var preset: String = str(clip.element.preset)
	var travel: float = float(clip.element.travel)
	var cycles: float = time / float(clip.duration)
	if not loop and cycles >= 1.0:
		return [base] if preset == "rotate" else []
	if still: return [base]
	var phase: float = fposmod(cycles, 1.0)
	if preset == "rotate":
		base.angle = 360.0 * phase
		return [base]
	if preset == "exhale":
		var breath: Array[Dictionary] = [_breath(base.asset, phase, travel)]
		if frames.size() == 2 and phase >= 0.17:
			breath.append(_breath(str(frames[1].asset), (phase - 0.17) / 0.83, travel * 0.63))
		return breath
	if preset == "float":
		var layers: Array[Dictionary] = [_plume(base, str(frames[0].asset), phase, clip.element)]
		if frames.size() == 2 and cycles >= 0.5:
			var second_phase: float = fposmod(cycles - 0.5, 1.0) if loop else (phase - 0.5) * 2.0
			layers.append(_plume(base, str(frames[1].asset), second_phase, clip.element))
		return layers

	const IMPACT := 0.72
	if phase < IMPACT:
		base.y = travel * pow(phase / IMPACT, 2.0)
		return [base]
	var flash: float = (phase - IMPACT) / (1.0 - IMPACT)
	var splash: bool = frames.size() == 2
	if splash: base.asset = str(frames[1].asset)
	base.y = travel
	base.scale = Vector2((1.0 if splash else 0.65) + flash * 0.7, (1.0 + flash * 0.15) if splash else 0.25)
	base.opacity = 1.0 - flash
	return [base]

static func draw(canvas: CanvasItem, sprites: Script, clip: Dictionary, actor: Dictionary,
		elapsed: float, root: Transform2D, opacity: float, still: bool) -> void:
	var size := Vector2(float(actor.width) * 1600.0, float(actor.height) * 900.0)
	var pivot := Vector2(float(clip.element.pivot.x), float(clip.element.pivot.y)) * size
	for layer: Dictionary in sample(clip, actor.animation, elapsed, still):
		var texture: Texture2D = sprites.texture({"asset": layer.asset})
		if texture == null: continue
		var texture_size: Vector2 = texture.get_size()
		var draw_size: Vector2 = texture_size * minf(size.x / texture_size.x, size.y / texture_size.y)
		var rect := Rect2(Vector2((size.x - draw_size.x) * 0.5, size.y - draw_size.y) - pivot, draw_size)
		var local := Transform2D(deg_to_rad(float(layer.angle)), layer.scale, 0.0,
			pivot + Vector2(float(layer.x), float(layer.y)) * size.y)
		canvas.draw_set_transform_matrix(root * local)
		canvas.draw_texture_rect(texture, rect, false, Color(1.0, 1.0, 1.0, opacity * float(layer.opacity)))
	canvas.draw_set_transform_matrix(Transform2D.IDENTITY)
