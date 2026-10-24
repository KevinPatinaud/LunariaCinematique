extends SceneTree

const Player = preload("res://addons/lunaria_cinematics/CinematicPlayer.gd")
var failures := 0

func check(ok: bool, label: String) -> void:
	if not ok:
		failures += 1
		printerr("FAIL: " + label)

func _initialize() -> void:
	var player = Player.new()
	var ref := "library://garden.png"
	check(player._is_extended_background(ref, Vector2(1600, 720)), "20:9 ordinary filename")
	check(player._is_extended_background("library://garden_wide_v01.png", Vector2(2090, 941)), "legacy panorama")
	check(not player._is_extended_background(ref, Vector2(1600, 900)), "16:9 ordinary source")
	check(not player._is_extended_background(ref, Vector2(3000, 900)), "unrelated aspect ratio")
	var image := Image.create(1600, 720, false, Image.FORMAT_RGBA8)
	image.fill(Color.GREEN)
	player._textures[ref] = ImageTexture.create_from_image(image)
	var shot := {"background": {"asset": ref, "fit": "cover"}}
	for width in [1600.0, 1800.0, 2000.0, 2200.0]:
		var bounds: Rect2 = player._background_bounds(shot, Rect2((1600.0 - width) / 2.0, 0.0, width, 900.0))
		var expected := minf(width, 2000.0)
		check(is_equal_approx(bounds.size.x, expected), "visible width " + str(width))
		check(is_equal_approx(bounds.position.x, (1600.0 - expected) / 2.0), "centre alignment " + str(width))
		check(is_equal_approx(bounds.size.y, 900.0), "constant height " + str(width))
	player.free()
	if failures == 0:
		print("PANORAMA_SMOKE PASS: 16 checks")
	quit(0 if failures == 0 else 1)
