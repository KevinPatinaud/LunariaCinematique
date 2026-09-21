class_name LunariaCinematicAssets
extends RefCounted
## library:// is a logical namespace. Only the caller chooses a trusted root.
## Shipped builds use imported res:// resources; the desktop viewer can open raw files.
const Validator = preload("CinematicValidator.gd")
const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"]
const AUDIO_EXTENSIONS = ["wav", "ogg", "mp3"]
const MAX_FILE_BYTES: int = 100 * 1024 * 1024
var root: String = "res://LunariaArtLibrary"
var allow_external: bool = false
var error: String = ""

func configure(value: String, external: bool = false) -> bool:
	error = ""
	var candidate: String = value.replace("\\", "/")
	var packaged: bool = candidate.begins_with("res://") or candidate.begins_with("user://")
	if candidate.is_empty() or (not packaged and (not external or not candidate.is_absolute_path() or "://" in candidate)):
		error = "La bibliothèque doit être un dossier res://, user:// ou un dossier local choisi explicitement."
		return false
	var drive_root: bool = candidate.length() == 3 and candidate.ends_with(":/")
	root = candidate if drive_root or candidate in ["res://", "user://", "/"] else candidate.trim_suffix("/")
	allow_external = external
	return true

func resolve(ref: String) -> String:
	if not Validator.safe_asset_ref(ref):
		return ""
	return root.path_join(ref.substr(10))

func exists(ref: String) -> bool:
	var path: String = resolve(ref)
	if path.is_empty(): return false
	if path.begins_with("res://"):
		return ResourceLoader.exists(path) or FileAccess.file_exists(path)
	return FileAccess.file_exists(path)

func _can_read_raw(path: String) -> bool:
	var file: FileAccess = FileAccess.open(path, FileAccess.READ)
	if file == null:
		error = "Fichier introuvable ou inaccessible : " + path
		return false
	var length: int = file.get_length()
	file.close()
	if length <= 0 or length > MAX_FILE_BYTES:
		error = "Ressource vide ou trop volumineuse (100 Mio maximum) : " + path
		return false
	return true

func texture(ref: String) -> Texture2D:
	error = ""
	var path: String = resolve(ref)
	if path.is_empty() or not path.get_extension().to_lower() in IMAGE_EXTENSIONS:
		error = "Référence image interdite : " + ref
		return null
	if path.begins_with("res://") and ResourceLoader.exists(path):
		var resource: Resource = ResourceLoader.load(path)
		if resource is Texture2D: return resource as Texture2D
		error = "Cette ressource n'est pas une texture : " + ref
		return null
	if not _can_read_raw(path): return null
	var image: Image = Image.load_from_file(path)
	if image == null or image.is_empty():
		error = "Image illisible : " + ref
		return null
	if image.get_width() > 16384 or image.get_height() > 16384:
		error = "Image trop grande (16384 pixels maximum par côté) : " + ref
		return null
	return ImageTexture.create_from_image(image)

func audio(ref: String) -> AudioStream:
	error = ""
	var path: String = resolve(ref)
	if path.is_empty() or not path.get_extension().to_lower() in AUDIO_EXTENSIONS:
		error = "Référence audio interdite : " + ref
		return null
	var resource: AudioStream
	if path.begins_with("res://") and ResourceLoader.exists(path):
		resource = ResourceLoader.load(path) as AudioStream
	else:
		if not _can_read_raw(path): return null
		match path.get_extension().to_lower():
			"wav": resource = AudioStreamWAV.load_from_file(path)
			"ogg": resource = AudioStreamOggVorbis.load_from_file(path)
			"mp3": resource = AudioStreamMP3.load_from_file(path)
	if resource == null:
		error = "Son illisible : " + ref
		return null
	# Never mutate an imported/shared stream's loop flags.
	return resource.duplicate() as AudioStream
