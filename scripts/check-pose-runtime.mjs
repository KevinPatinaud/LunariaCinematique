import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { newActor, newBubble, newCinematic } from '../dist/shared/model.js';
import { actorWithPose } from '../dist/shared/poseGeneration.js';
import { prepareCinematic } from '../dist/shared/geometry.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2), option = (key, fallback) => args.includes(key) ? args[args.indexOf(key) + 1] : fallback;
const image = option('--image', ''), output = option('--out', ''), godot = option('--godot', process.env.GODOT_BIN || 'C:/Program Files/Godot/Godot_v4.7.2-stable_win64_console.exe');
if (!image) throw Error('Usage: node scripts/check-pose-runtime.mjs --image <PNG> [--out <folder>] [--godot <exe>]');
const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'lunaria-pose-godot-'));
async function run(parameters) {
  return new Promise((resolve, reject) => {
    const child = spawn(godot, parameters, { windowsHide: true, stdio: ['ignore','pipe','pipe'] });
    let log = ''; child.stdout.on('data', bytes => { log += bytes; }); child.stderr.on('data', bytes => { log += bytes; });
    const timer = setTimeout(() => { child.kill(); reject(Error('Godot : délai de vérification dépassé.')); },60000);
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('exit', code => { clearTimeout(timer); code === 0 && !/SCRIPT ERROR|Parse Error/.test(log) ? resolve(log) : reject(Error(log)); });
  });
}
try {
  await fs.cp(path.join(root,'godot/addons'),path.join(directory,'addons'),{recursive:true});
  await fs.mkdir(path.join(directory,'LunariaArtLibrary/poses'),{recursive:true});
  await fs.copyFile(image,path.join(directory,'LunariaArtLibrary/poses/radis.png'));
  const png = await fs.readFile(image);
  if (png.length < 24 || png.subarray(0,8).toString('hex') !== '89504e470d0a1a0a') throw Error('The test requires a PNG image of Radis.');
  const actor = newActor({ ref:'library://poses/radis.png',name:'Radis',kind:'character' },1);
  actor.animation = { mode:'species',speciesId:'radis',animationId:'idle',slot:'idle',speed:1 };
  const film = newCinematic(); film.shots[0].duration=20;
  film.shots[0].actors = [actorWithPose(actor,'library://poses/radis.png',{width:png.readUInt32BE(16),height:png.readUInt32BE(20)})];
  film.shots[0].actors[0].entry={preset:'none',duration:0.1,delay:0};
  film.shots[0].transition={type:'cut',duration:0};
  film.shots[0].dialogueStart=0;
  const bubble = newBubble(actor.id); bubble.text='Je pleure.'; film.shots[0].bubbles=[bubble];
  await fs.writeFile(path.join(directory,'film.json'),JSON.stringify(prepareCinematic(film)));
  await fs.writeFile(path.join(directory,'project.godot'),'config_version=5\n[application]\nconfig/name="Pose runtime QA"\n[display]\nwindow/size/viewport_width=1000\nwindow/size/viewport_height=650\n[rendering]\nrenderer/rendering_method="gl_compatibility"\nenvironment/defaults/default_clear_color=Color(0.12,0.18,0.14,1)\n');
  await fs.writeFile(path.join(directory,'main.gd'),`extends SceneTree
const Player = preload("res://addons/lunaria_cinematics/CinematicPlayer.gd")
func _initialize() -> void:
  call_deferred("verify_pose")
func verify_pose() -> void:
  var player = Player.new()
  root.add_child(player)
  player.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
  if not player.play_file("res://film.json"):
    push_error(player.last_error)
    quit(1)
    return
  player.pause()
  player._elapsed = 1.0
  player.queue_redraw()
  await process_frame
  await process_frame
  await process_frame
  var actor = player._document.shots[0].actors[0]
  if actor.has("animation") or not player._textures.has(actor.asset):
    push_error("The static pose did not load.")
    quit(1)
    return
  if player._document.shots[0].bubbles[0].speakerId != actor.id:
    quit(1)
    return
  await RenderingServer.frame_post_draw
  var captured = root.get_texture().get_image()
  var visible_red_pixels = 0
  for y in range(0, captured.get_height(), 4):
    for x in range(0, captured.get_width(), 4):
      var pixel = captured.get_pixel(x, y)
      if pixel.r > 0.25 and pixel.r > pixel.g * 1.3:
        visible_red_pixels += 1
  if visible_red_pixels < 10:
    push_error("The Radis pose is missing from the rendered frame.")
    quit(1)
    return
  var error = captured.save_png("res://pose-runtime.png")
  if error != OK:
    quit(1)
    return
  print("POSE_RUNTIME checks=4 failures=0")
  quit(0)
`);
  const imported = await run(['--headless','--editor','--path',directory,'--import']);
  // A real renderer is required for the exported capture, with a hidden Windows process.
  const log = await run(['--path',directory,'--script','res://main.gd']);
  if (!String(log).includes('POSE_RUNTIME checks=4 failures=0')) throw Error(String(log));
  if (output) {
    await fs.mkdir(output,{recursive:true});
    await fs.copyFile(path.join(directory,'pose-runtime.png'),path.join(output,'pose-runtime.png'));
    await fs.writeFile(path.join(output,'pose-runtime.log'),String(imported)+String(log));
  }
  process.stdout.write(String(log));
} finally { await fs.rm(directory,{recursive:true,force:true,maxRetries:5,retryDelay:200}); }
