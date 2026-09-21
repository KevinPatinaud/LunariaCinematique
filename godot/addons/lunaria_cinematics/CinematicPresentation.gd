extends RefCounted
## Optional bridge to the ONE game presentation catalog. Static films keep working
## when the addon is installed alone. Animated films require the shared runtime.
const Motion = preload("CinematicMotion.gd")
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
			if registry.actor_binding(actor.animation).is_empty():
				error = "Animation ou slot introuvable pour " + str(actor.name)
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
	enabled = false
	if is_instance_valid(audio):
		audio.clear_catalog()
		audio.queue_free()
	audio = null

func geometry(actor: Dictionary, elapsed: float) -> Dictionary:
	if not enabled or not actor.has("animation"): return {}
	var animation: Dictionary = registry.actor_binding(actor.animation)
	if animation.is_empty(): return {}
	var visual: Dictionary = registry.visual(str(actor.animation.speciesId)).duplicate(true)
	if visual.is_empty(): visual = {"sprite":{"asset":actor.asset},"width":100.0,"height":100.0,"baseline":0.0,"mirror":false,"tint":"#ffffff"}
	visual.baseline = 0.0
	var dimensions := Vector2(float(actor.width)*1600.0,float(actor.height)*900.0)
	var scale_value: float = minf(dimensions.x/float(visual.width),dimensions.y/float(visual.height))
	var time: float = maxf(0.0,elapsed-float(actor.entry.delay))*float(actor.animation.speed)
	return {"animation":animation,"visual":visual,"dimensions":dimensions,"scale":scale_value,"time":time}

func point(actor: Dictionary, elapsed: float, name: String, quiet: bool) -> Vector2:
	var data: Dictionary = geometry(actor,elapsed)
	if data.is_empty(): return Vector2(float(actor.width)*800.0,float(actor.height)*900.0*.22)
	var sampled: Dictionary = sprites.descriptor(data.animation,data.visual,float(data.time),quiet)
	if sampled.is_empty(): return data.dimensions*Vector2(.5,.22)
	var local: Vector2 = sampled.local*((math.attachment(data.animation,name)-sampled.pivot)*sampled.size)
	return data.dimensions*Vector2(.5,1.0)+local*float(data.scale)

func draw_actor(canvas: CanvasItem, actor: Dictionary, elapsed: float, root: Transform2D, opacity: float, quiet: bool) -> void:
	var data: Dictionary = geometry(actor,elapsed)
	if data.is_empty(): return
	var local := Transform2D(0.0,Vector2.ONE*float(data.scale),0.0,data.dimensions*Vector2(.5,1.0))
	sprites.draw_clip(canvas,data.animation,data.visual,float(data.time),root*local,quiet,opacity)

func references(shot: Dictionary) -> Array[String]:
	var refs: Array[String] = []
	if not enabled: return refs
	for actor: Dictionary in shot.actors:
		var data: Dictionary = geometry(actor,0.0)
		if data.is_empty(): continue
		var sprite_ref: String = str(data.visual.sprite.asset)
		if not refs.has(sprite_ref): refs.append(sprite_ref)
		for frame: Dictionary in data.animation.frames:
			if not refs.has(frame.asset): refs.append(frame.asset)
		for marker: Dictionary in data.animation.markers:
			var definition: Dictionary = registry.AUDIO.get(marker.ref,{}) if marker.type == "sound" else registry.VFX.get(marker.ref,{}) if marker.type == "vfx" else {}
			var ref: String = str(definition.get("asset",""))
			if not ref.is_empty() and not refs.has(ref): refs.append(ref)
	return refs

func advance(shot: Dictionary, before: float, after: float, quiet: bool) -> void:
	if not enabled or after <= before: return
	vfx.advance(effects,after-before)
	var owners: Array[String] = []
	for actor: Dictionary in shot.actors:
		if not actor.has("animation"): continue
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
