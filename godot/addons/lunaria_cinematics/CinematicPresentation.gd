extends RefCounted
## Optional bridge to the ONE game presentation catalog. Static films keep working
## when the addon is installed alone. Animated films require the shared runtime.
const Motion = preload("CinematicMotion.gd")
const Elements = preload("CinematicElements.gd")
var registry: Script
var math: Script
var sprites: Script
var vfx: Script
var audio: Node
var error: String = ""
var enabled: bool = false
var effects: Array[Dictionary] = []
var _owner: Control
var _scope: String = ""
var _walk_framings: Dictionary = {}

func configure(owner: Control, document: Dictionary, library_root: String) -> bool:
	shutdown()
	error = ""
	_owner = owner
	var animated: bool = false
	for shot: Dictionary in document.shots:
		for actor: Dictionary in shot.actors:
			if actor.has("animation"): animated = true
	if not animated: return true
	for path: String in ["res://domain/presentation/animation_registry.gd","res://presentation/animation/sprite_player.gd","res://presentation/audio/catalog_audio.gd"]:
		if not ResourceLoader.exists(path):
			error = "Cette cinématique utilise le catalogue partagé. Installe le runtime Lunaria 1.10 et publie le projet associé."
			return false
	registry = load("res://domain/presentation/animation_registry.gd")
	math = load("res://domain/presentation/animation_math.gd")
	sprites = load("res://presentation/animation/sprite_player.gd")
	vfx = load("res://presentation/animation/vfx_player.gd")
	var link: Dictionary = document.get("presentationCatalog",{})
	if str(link.get("projectId","")) != registry.project_id():
		error = "Le catalogue de la cinématique ne correspond pas au projet de jeu chargé."
		return false
	if not str(link.get("file","")).is_empty() and str(link.file) != "content/design/game_content.json":
		error = "La cinématique référence un catalogue non publié. Publie la campagne depuis le Studio pour résoudre son lien."
		return false
	if library_root.trim_suffix("/") != "res://LunariaArtLibrary":
		error = "Les animations partagées utilisent la bibliothèque unique publiée res://LunariaArtLibrary."
		return false
	for shot: Dictionary in document.shots:
		for actor: Dictionary in shot.actors:
			if not actor.has("animation"): continue
			var clip: Dictionary = registry.actor_binding(actor.animation)
			if clip.is_empty():
				error = "Animation ou slot introuvable pour " + str(actor.name)
				return false
			if actor.animation.has("elementPlayback") != clip.has("element") or (clip.has("element") and (
					actor.animation.mode != "animation" or actor.get("role") != "prop" or clip.frames.is_empty() or actor.asset != clip.frames[0].asset)):
				error = "Référence d’élément animé invalide pour " + str(actor.name)
				return false
			if actor.animation.mode == "species" and registry.visual(str(actor.animation.speciesId)).is_empty():
				error = "Espèce introuvable pour " + str(actor.name)
				return false
	audio = load("res://presentation/audio/catalog_audio.gd").new()
	owner.add_child(audio)
	enabled = true
	return true

func set_volumes(music_level: float, sound_level: float) -> void:
	if is_instance_valid(audio): audio.configure(music_level>0,sound_level>0,music_level,sound_level)
func set_paused(value: bool) -> void:
	if is_instance_valid(audio): audio.set_catalog_paused(value)
func enter_shot(id: String) -> void:
	_scope = "film:" + id + ":"
	effects.clear()
	if is_instance_valid(audio): audio.clear_catalog()
func shutdown() -> void:
	effects.clear()
	_walk_framings.clear()
	enabled = false
	if is_instance_valid(audio):
		audio.clear_catalog()
		audio.queue_free()
	audio = null

func _smooth(value: float) -> float:
	var t: float = clampf(value, 0.0, 1.0)
	return t * t * (3.0 - 2.0 * t)

func _movement_timing(actor: Dictionary, elapsed: float) -> Dictionary:
	var movement: Dictionary = actor.get("movement", {})
	if not bool(movement.get("enabled", false)):
		return {"has_movement":false,"traveling":false,"traveled_px":0.0,"travel_elapsed":0.0,"direction_x":0}
	var time_value: float = maxf(0.0, elapsed) if is_finite(elapsed) else 0.0
	var exit_data: Dictionary = actor.get("exit", {})
	if str(exit_data.get("preset", "none")) != "none" and time_value >= float(exit_data.get("start", 0.0)):
		time_value = float(exit_data.get("start", 0.0))
	var entry_data: Dictionary = actor.get("entry", {})
	var entry_end: float = 0.0 if str(entry_data.get("preset", "none")) == "none" else float(entry_data.get("delay", 0.0)) + float(entry_data.get("duration", 0.0))
	var local: float = time_value - entry_end - float(movement.get("delay", 0.0))
	var dist_x: float = float(movement.get("dx", 0.0)) * 1600.0
	var dist_y: float = float(movement.get("dy", 0.0)) * 900.0
	if local <= 0.0 or sqrt(dist_x * dist_x + dist_y * dist_y) < 0.001:
		return {"has_movement":true,"traveling":false,"traveled_px":0.0,"travel_elapsed":0.0,"direction_x":0}
	var leg_duration: float = maxf(0.1, float(movement.get("duration", 1.0)))
	var cycles: float = local / leg_duration
	var linear_easing: bool = str(movement.get("easing", "smooth")) == "linear"
	var repeats: bool = str(movement.get("repeat", "once")) == "pingpong"
	var completed_legs: int = int(floor(cycles)) if repeats else 0
	var leg_fraction: float = cycles - float(completed_legs) if repeats else clampf(cycles, 0.0, 1.0)
	var forward: bool = (completed_legs % 2) == 0
	var eased: float = leg_fraction if linear_easing else _smooth(leg_fraction)
	var path: Dictionary = Motion.sample_movement_path(movement, eased if forward else 1.0 - eased)
	var signed_dx: float = float(path.tangent_x) * (1.0 if forward else -1.0)
	var direction: int = 0 if absf(signed_dx) < 0.001 else (1 if signed_dx > 0.0 else -1)
	return {"has_movement":true,"traveling":repeats or cycles < 1.0 - 0.000001,
		"traveled_px":float(path.length) * (float(completed_legs) + eased),
		"travel_elapsed":local if repeats else minf(local, leg_duration), "direction_x":direction}

static func _movement_clip_time(animation: Dictionary, visual: Dictionary, slot: String, scale_value: float, timing: Dictionary, speed: float, clip_duration: float) -> float:
	var stride: float = float(animation.get("stridePx", 0.0))
	var frames: Array = animation.get("frames", [])
	if stride <= 0.0 and str(animation.get("scope", "")) == "cinematic" and str(animation.get("kind", "")) == "frames" and bool(animation.get("loop", false)) and frames.size() > 1 and slot in ["move", "walk"]:
		var crop: Dictionary = frames[0].get("region", {})
		var drawn_width: float = float(visual.width)
		if not crop.is_empty():
			drawn_width = minf(drawn_width, float(visual.height) * float(crop.width) / float(crop.height))
		# A complete cycle covers two steps, estimated from the displayed frame width.
		stride = 0.8 * drawn_width
	if stride <= 0.0:
		return float(timing.travel_elapsed) * speed
	return float(timing.traveled_px) * maxf(0.01, clip_duration) * speed / (stride * maxf(0.1, scale_value))

static func _walk_aspect(animation: Dictionary, slot: String) -> float:
	if str(animation.get("scope", "")) != "cinematic" or str(animation.get("kind", "")) != "frames" or str(animation.get("sourceAssetRef", "")).is_empty() or slot not in ["move", "walk", "run"]:
		return 0.0
	var aspect: float = 0.0
	for frame: Dictionary in animation.get("frames", []):
		if not frame.has("region"): return 0.0
		aspect = maxf(aspect, float(frame.region.width) / float(frame.region.height))
	return aspect

static func _median(values: Array[float]) -> float:
	values.sort()
	return (values[values.size() >> 1] + values[(values.size() - 1) >> 1]) * 0.5

func _measure_walk(still_ref: String, frames: Array) -> Dictionary:
	var still: Texture2D = sprites.texture({"asset": still_ref})
	if still == null: return {}
	var still_bounds: Rect2 = sprites.texture_bounds(still)
	if still_bounds.size.y <= 0.0: return {}
	var heights: Array[float] = []
	var bottoms: Array[float] = []
	for frame: Dictionary in frames:
		var texture: Texture2D = sprites.texture(frame)
		if texture == null: return {}
		var bounds: Rect2 = sprites.texture_bounds(texture)
		if bounds.size.y <= 0.0: return {}
		heights.append(bounds.size.y / texture.get_height())
		bottoms.append(bounds.end.y / texture.get_height())
	var height: float = _median(heights)
	if height < 0.1: return {}
	return {"static_height": still_bounds.size.y / still.get_height(), "static_bottom": still_bounds.end.y / still.get_height(),
		"frame_height": height, "frame_bottom": _median(bottoms)}

func geometry(actor: Dictionary, elapsed: float) -> Dictionary:
	if not enabled or not actor.has("animation"): return {}
	var binding: Dictionary = actor.animation
	var animation: Dictionary = registry.actor_binding(binding)
	if animation.is_empty(): return {}
	var visual: Dictionary = registry.visual(str(binding.speciesId)).duplicate(true)
	if visual.is_empty(): visual = {"sprite":{"asset":actor.asset},"width":100.0,"height":100.0,"baseline":0.0,"mirror":false,"tint":"#ffffff"}
	visual.baseline = 0.0
	var dimensions := Vector2(float(actor.width)*1600.0,float(actor.height)*900.0)
	var scale_value: float = minf(dimensions.x/float(visual.width),dimensions.y/float(visual.height))
	var anchor_y: float = dimensions.y
	var walk_aspect: float = _walk_aspect(animation, str(binding.slot))
	var stretch_static: bool = false
	if walk_aspect > 0.0:
		visual.width = float(visual.height) * walk_aspect
		scale_value = dimensions.y / float(visual.height)
		var key: String = str(actor.asset) + "\n" + str(animation.id)
		if not _walk_framings.has(key): _walk_framings[key] = _measure_walk(str(actor.asset), animation.frames)
		var framing: Dictionary = _walk_framings[key]
		if not framing.is_empty():
			scale_value *= float(framing.static_height) / float(framing.frame_height)
			var anchor: Dictionary = animation.frames[0].get("anchor", animation.anchor)
			anchor_y = dimensions.y * float(framing.static_bottom) + (float(anchor.y) - float(framing.frame_bottom)) * float(visual.height) * scale_value
	var speed: float = float(binding.speed)
	var base_time: float = maxf(0.0,elapsed-float(actor.entry.delay))*speed
	var timing: Dictionary = _movement_timing(actor, elapsed)
	if bool(binding.get("autoFlip", false)) and int(timing.direction_x) != 0:
		var actor_flip: bool = bool(actor.get("flipX", false))
		var visual_mirror: bool = bool(visual.get("mirror", false))
		var base_facing_right: bool = not (actor_flip != visual_mirror)
		var auto_flip: bool = base_facing_right if int(timing.direction_x) < 0 else (not base_facing_right)
		if auto_flip: visual.mirror = not visual_mirror
	var active_animation: Dictionary = animation
	var time: float = base_time
	if bool(binding.get("syncWithMovement", false)) and bool(timing.has_movement):
		if not bool(timing.traveling):
			if str(animation.get("scope", "game")) == "cinematic":
				active_animation = {
					"id": str(animation.get("id", "")) + "_rest",
					"name": str(animation.get("name", "")),
					"scope": "cinematic",
					"kind": "frames",
					"frames": [{"asset": str(actor.get("asset", "")), "duration": 1.0, "anchor": {"x": 0.5, "y": 1.0}}],
					"duration": 1.0,
					"loop": true,
					"anchor": {"x": 0.5, "y": 1.0},
					"transform": animation.get("transform", {"x": 0.0, "y": 0.0, "rotation": 0.0, "scaleX": 1.0, "scaleY": 1.0, "opacity": 1.0}),
					"motion": {"preset": "none", "amplitude": 0.0, "period": 1.0},
					"attachments": animation.get("attachments", []),
					"markers": [],
				}
				time = 0.0
				if walk_aspect > 0.0:
					stretch_static = true
					anchor_y = dimensions.y
					scale_value = 1.0
					if int(timing.direction_x) == 0: visual.mirror = false
			else:
				var idle_clip: Dictionary = registry.resolve(str(binding.get("speciesId", "")), "idle") if not str(binding.get("speciesId", "")).is_empty() else {}
				if not idle_clip.is_empty() and str(idle_clip.get("id", "")) != str(animation.get("id", "")):
					active_animation = idle_clip
					time = base_time
				else:
					time = 0.0
		else:
			time = _movement_clip_time(animation, visual, str(binding.slot), scale_value, timing, speed, float(math.duration(animation)))
	return {"animation":active_animation,"visual":visual,"dimensions":dimensions,"scale":scale_value,"time":time,
		"anchor_y":anchor_y,"stretch_static":stretch_static}

func point(actor: Dictionary, elapsed: float, name: String, quiet: bool) -> Vector2:
	var data: Dictionary = geometry(actor,elapsed)
	if data.is_empty(): return Vector2(float(actor.width)*800.0,float(actor.height)*900.0*.22)
	if data.stretch_static:
		var position: Vector2 = math.attachment(data.animation, name)
		if bool(data.visual.get("mirror", false)): position.x = 1.0 - position.x
		return position * data.dimensions
	var sampled: Dictionary = sprites.descriptor(data.animation,data.visual,float(data.time),quiet)
	if sampled.is_empty(): return data.dimensions*Vector2(.5,.22)
	var local: Vector2 = sampled.local*((math.attachment(data.animation,name)-sampled.pivot)*sampled.size)
	return Vector2(data.dimensions.x * 0.5, data.anchor_y) + local * float(data.scale)

func draw_actor(canvas: CanvasItem, actor: Dictionary, elapsed: float, root: Transform2D, opacity: float, quiet: bool) -> void:
	if enabled and actor.animation.has("elementPlayback"):
		var clip: Dictionary = registry.actor_binding(actor.animation)
		Elements.draw(canvas, sprites, clip, actor, elapsed, root, opacity, quiet)
		return
	var data: Dictionary = geometry(actor,elapsed)
	if data.is_empty(): return
	if data.stretch_static:
		var still: Texture2D = sprites.texture({"asset": actor.asset})
		if still == null: return
		if bool(data.visual.get("mirror", false)):
			root *= Transform2D(Vector2(-1.0, 0.0), Vector2.DOWN, Vector2(data.dimensions.x, 0.0))
		canvas.draw_set_transform_matrix(root)
		canvas.draw_texture_rect(still, Rect2(Vector2.ZERO, data.dimensions), false, Color(1.0, 1.0, 1.0, opacity))
		canvas.draw_set_transform_matrix(Transform2D.IDENTITY)
		return
	var local := Transform2D(0.0, Vector2.ONE * float(data.scale), 0.0, Vector2(data.dimensions.x * 0.5, data.anchor_y))
	sprites.draw_clip(canvas,data.animation,data.visual,float(data.time),root*local,quiet,opacity)

func references(shot: Dictionary) -> Array[String]:
	var refs: Array[String] = []
	if not enabled: return refs
	for actor: Dictionary in shot.actors:
		var data: Dictionary = geometry(actor,0.0)
		if data.is_empty(): continue
		var sprite_ref: String = str(data.visual.sprite.asset)
		if not refs.has(sprite_ref): refs.append(sprite_ref)
		var clips: Array[Dictionary] = [data.animation]
		var primary: Dictionary = registry.actor_binding(actor.animation)
		if not primary.is_empty() and str(primary.get("id","")) != str(data.animation.get("id","")):
			clips.append(primary)
		if bool(actor.animation.get("syncWithMovement", false)) and not str(actor.animation.get("speciesId","")).is_empty() and str(primary.get("scope", "game")) != "cinematic":
			var idle_clip: Dictionary = registry.resolve(str(actor.animation.speciesId), "idle")
			if not idle_clip.is_empty(): clips.append(idle_clip)
		for clip: Dictionary in clips:
			for frame: Dictionary in clip.get("frames", []):
				if not refs.has(frame.asset): refs.append(frame.asset)
			for marker: Dictionary in clip.get("markers", []):
				var definition: Dictionary = registry.AUDIO.get(marker.ref,{}) if marker.type == "sound" else registry.VFX.get(marker.ref,{}) if marker.type == "vfx" else {}
				var ref: String = str(definition.get("asset",""))
				if not ref.is_empty() and not refs.has(ref): refs.append(ref)
	return refs

func advance(shot: Dictionary, before: float, after: float, quiet: bool) -> void:
	if not enabled or after <= before: return
	vfx.advance(effects,after-before)
	var owners: Array[String] = []
	for actor: Dictionary in shot.actors:
		if not actor.has("animation") or actor.animation.has("elementPlayback"): continue
		var owner_id: String = _scope + str(actor.id)
		var pose: Dictionary = Motion.pose(actor,after)
		if float(pose.opacity) > 0: owners.append(owner_id)
		var data: Dictionary = geometry(actor,after)
		var delay: float = float(actor.entry.delay)
		if data.is_empty() or after < delay: continue
		var from: float = (before-delay)*float(actor.animation.speed)
		if before == 0.0 and delay == 0.0: from = -0.0000001
		for entry: Dictionary in math.markers_between(data.animation,from,float(data.time)):
			var marker: Dictionary = entry.marker
			# This whitelist has NO connection to AbilityRuntime or a battle instance.
			if marker.type == "release": continue
			var at: float = float(entry.at)/float(actor.animation.speed)+delay
			var exit_data: Dictionary = actor.get("exit", {})
			if str(exit_data.get("preset", "none")) != "none" and at >= float(exit_data.get("start", 0.0)) + float(exit_data.get("duration", 0.0)): continue
			var position: Vector2 = Motion.transform(actor,at)*point(actor,at,str(marker.attach),quiet)
			if marker.type == "sound" and is_instance_valid(audio): audio.play_catalog(str(marker.ref),owner_id)
			elif marker.type == "vfx":
				var previous_size: int = effects.size()
				vfx.add(effects,str(marker.ref),position,-1,str(actor.id),str(marker.attach),true)
				if effects.size() > previous_size: effects.back().age = maxf(0,after-at)
	for effect: Dictionary in effects:
		for actor: Dictionary in shot.actors:
			if str(actor.id) == str(effect.team):
				var definition: Dictionary = registry.VFX.get(effect.id,{})
				if definition.get("preset","") in ["halo","flash","trail"]: effect.position = Motion.transform(actor,after)*point(actor,after,str(effect.attach),quiet)
	if is_instance_valid(audio): audio.retain_catalog_owners(owners)
func draw_effects(canvas: CanvasItem, transform_value: Transform2D, quiet: bool) -> void:
	if not enabled: return
	canvas.draw_set_transform_matrix(transform_value)
	vfx.draw(canvas,effects,quiet)
