"""
APEX ROOFING — photoreal frame-sequence renderer (Blender / Cycles)
===================================================================
Renders a continuous 4-waypoint camera move (shingles -> gutters -> windows ->
hero/framing) as a PNG sequence. The browser scrubber plays these frames back
on scroll, so ALL realism (path-traced GI, real glass refraction, PBR surfaces)
is spent here, offline. The user's device only flips through a flipbook.

HOW TO RUN
----------
GUI:      open Blender -> Scripting tab -> open this file -> Run Script
Headless: blender --background --python render_roof_cycles.py
Module:   python3 render_roof_cycles.py        (uses the `bpy` PyPI module)

Frames land in ./frames/frame_0001.png ... and drop straight into the
roofing-scroll-v2.html player (set FRAMES.enabled = true there).

The house here is the SAME placeholder geometry as the browser mock so the
camera lines up. Swap in your real asset by importing a .glb at the marked
spot and deleting build_house() — the lighting/camera/render rig stays.

CHEAP TEST RENDERS (no need to edit the tunables below)
-------------------------------------------------------
Every tunable can be overridden from the environment, so a fast sanity render is:
    APEX_RES=1280x720 APEX_SAMPLES=24 APEX_TEST_FRAME=18 python3 render_roof_cycles.py
APEX_TEST_FRAME=N renders ONLY frame N as a single still (frame_0018.png) along
the real 180-frame camera path, instead of the whole animation.

TUNE THESE
----------
"""
import os

def _env_str(key, default):
    v = os.environ.get(key)
    return v if v not in (None, "") else default

def _env_int(key, default):
    v = os.environ.get(key)
    try: return int(v) if v not in (None, "") else default
    except ValueError: return default

def _env_float(key, default):
    v = os.environ.get(key)
    try: return float(v) if v not in (None, "") else default
    except ValueError: return default

def _env_bool(key, default):
    v = os.environ.get(key)
    if v in (None, ""): return default
    return v.strip().lower() in ("1", "true", "yes", "on")

def _env_res(key, default):
    v = os.environ.get(key)
    if v in (None, ""): return default
    try:
        w, h = v.lower().split("x")
        return (int(w), int(h))
    except Exception:
        return default

RESOLUTION   = _env_res("APEX_RES", (1920, 1080))     # bump to (2560,1440)/(3840,2160) for hero
TOTAL_FRAMES = _env_int("APEX_TOTAL_FRAMES", 180)     # scroll resolution; more = smoother, longer
SAMPLES      = _env_int("APEX_SAMPLES", 160)          # Cycles samples (denoiser cleans the rest)
USE_DENOISE  = _env_bool("APEX_DENOISE", True)
RENDER       = _env_bool("APEX_RENDER", True)         # False = just build the scene, don't render
HDRI_PATH    = _env_str("APEX_HDRI", "")              # optional .hdr/.exr for IBL; "" = Nishita sky
SUN_ELEV_DEG = _env_float("APEX_SUN_ELEV", 34)        # sun height; lower = longer dramatic shadows
SUN_DIR_DEG  = _env_float("APEX_SUN_DIR", -42)        # sun compass rotation
OUTPUT_DIR   = _env_str("APEX_OUTPUT_DIR", "//frames/")  # // = relative to this .blend / cwd
TEST_FRAME   = _env_int("APEX_TEST_FRAME", 0)         # >0 = render only this single frame as a still
EXPOSURE     = _env_float("APEX_EXPOSURE", -0.6)      # view-transform exposure stops (-=darker)
SKY_STRENGTH = _env_float("APEX_SKY", 0.9)            # Nishita IBL strength (ambient fill)

# ---------------------------------------------------------------------------
import bpy, math
from math import radians

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def safe_set(node, names, val):
    """Set a Principled input by name, tolerant of Blender 3.x vs 4.x renames."""
    for n in names:
        if n in node.inputs:
            try: node.inputs[n].default_value = val; return True
            except Exception: pass
    return False

def principled(name, base, rough=0.6, metal=0.0, ior=1.45,
               transmission=0.0, coat=0.0, bump_tex=None, bump_strength=0.4):
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    nt = mat.node_tree; nodes = nt.nodes; links = nt.links
    p = nodes.get("Principled BSDF")
    safe_set(p, ["Base Color"], (*base, 1.0))
    safe_set(p, ["Roughness"], rough)
    safe_set(p, ["Metallic"], metal)
    safe_set(p, ["IOR"], ior)
    safe_set(p, ["Transmission Weight", "Transmission"], transmission)
    safe_set(p, ["Coat Weight", "Clearcoat"], coat)
    safe_set(p, ["Coat Roughness", "Clearcoat Roughness"], 0.1)
    if bump_tex:
        tex = nodes.new("ShaderNodeTexNoise") if bump_tex == "noise" else nodes.new("ShaderNodeTexWave")
        if bump_tex == "noise":
            tex.inputs["Scale"].default_value = 80.0
            tex.inputs["Detail"].default_value = 6.0
        else:  # wave -> shingle courses
            if hasattr(tex, "bands_direction"):
                tex.bands_direction = 'Y'
            tex.inputs["Scale"].default_value = 14.0
            tex.inputs["Distortion"].default_value = 1.5
        bump = nodes.new("ShaderNodeBump")
        bump.inputs["Strength"].default_value = bump_strength
        links.new(tex.outputs[0], bump.inputs["Height"])
        links.new(bump.outputs["Normal"], p.inputs["Normal"])
    return mat

def add_box(name, size, loc, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object; o.name = name
    o.scale = (size[0]/2, size[1]/2, size[2]/2)
    bpy.ops.object.transform_apply(scale=True)
    o.data.materials.append(mat)
    for poly in o.data.polygons: poly.use_smooth = False
    return o

def build_environment():
    scn = bpy.context.scene
    world = bpy.data.worlds.new("ApexWorld"); scn.world = world
    world.use_nodes = True; nt = world.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    bg  = nt.nodes.new("ShaderNodeBackground")
    out = nt.nodes.new("ShaderNodeOutputWorld")
    if HDRI_PATH and os.path.exists(bpy.path.abspath(HDRI_PATH)):
        env = nt.nodes.new("ShaderNodeTexEnvironment")
        env.image = bpy.data.images.load(bpy.path.abspath(HDRI_PATH))
        nt.links.new(env.outputs["Color"], bg.inputs["Color"])
        bg.inputs["Strength"].default_value = 1.0
    else:
        sky = nt.nodes.new("ShaderNodeTexSky"); sky.sky_type = 'NISHITA'
        sky.sun_elevation = radians(SUN_ELEV_DEG)
        sky.sun_rotation  = radians(SUN_DIR_DEG)
        if hasattr(sky, "air_density"): sky.air_density = 1.6
        # The Nishita sky carries its own blindingly-bright sun disc. We add a
        # dedicated SUN lamp below for crisp, controllable contact shadows, so
        # kill the sky's disc to avoid a double-sun blowout (keep sky as IBL).
        if hasattr(sky, "sun_disc"): sky.sun_disc = False
        nt.links.new(sky.outputs[0], bg.inputs["Color"])
        bg.inputs["Strength"].default_value = SKY_STRENGTH
    nt.links.new(bg.outputs[0], out.inputs[0])

    # matching sun for crisp contact shadows
    bpy.ops.object.light_add(type='SUN', location=(0, 0, 20))
    sun = bpy.context.active_object
    sun.data.energy = 3.2
    sun.data.angle = radians(1.2)          # small = sharper shadows
    sun.rotation_euler = (radians(90 - SUN_ELEV_DEG), 0, radians(SUN_DIR_DEG))

def build_house():
    # ---- materials -------------------------------------------------------
    wall_m    = principled("Wall", (0.80, 0.76, 0.67), rough=0.92, bump_tex="noise", bump_strength=0.25)
    shingle_m = principled("Shingle", (0.16, 0.18, 0.20), rough=0.74, coat=0.15,
                           bump_tex="wave", bump_strength=0.55)
    metal_m   = principled("Gutter", (0.74, 0.73, 0.70), rough=0.28, metal=1.0)
    glass_m   = principled("Glass", (0.92, 0.95, 1.0), rough=0.02, transmission=1.0, ior=1.45)
    frame_m   = principled("WinFrame", (0.92, 0.90, 0.84), rough=0.5)
    door_m    = principled("Door", (0.32, 0.20, 0.11), rough=0.55, coat=0.2)
    ground_m  = principled("Ground", (0.05, 0.05, 0.045), rough=1.0)

    # ---- ground ----------------------------------------------------------
    bpy.ops.mesh.primitive_plane_add(size=120, location=(0, 0, 0))
    bpy.context.active_object.data.materials.append(ground_m)

    # >>> SWAP POINT: to use a real model, delete everything below this line
    #     and instead: bpy.ops.import_scene.gltf(filepath="house.glb")

    # ---- walls -----------------------------------------------------------
    add_box("Walls", (6, 5, 3.2), (0, 0, 1.6), wall_m)

    # gable end triangles (x = +/-3), front faces -Y
    import bmesh
    for sx in (-3, 3):
        me = bpy.data.meshes.new("Gable"); ob = bpy.data.objects.new("Gable", me)
        bpy.context.collection.objects.link(ob)
        bm = bmesh.new()
        v1 = bm.verts.new((sx, -2.5, 3.2)); v2 = bm.verts.new((sx, 2.5, 3.2))
        v3 = bm.verts.new((sx, 0.0, 4.9))
        bm.faces.new((v1, v2, v3)); bm.to_mesh(me); bm.free()
        ob.data.materials.append(wall_m)

    # ---- roof slopes (SHINGLES) -----------------------------------------
    # Built explicitly from eave/ridge coordinates so the slopes seat ON the
    # walls (no rotation guesswork): ridge runs along X at y=0,z=4.9 to match
    # the gable apex; eaves overhang the walls (y=2.5) and gutter line (y=2.95).
    RX = 3.35            # roof half-length in X (slight gable overhang)
    EY, EZ = 3.05, 3.10  # eave: y-overhang past gutter, z just above wall top
    RZ = 4.90            # ridge height (matches gable apex)
    for sy in (1, -1):
        me = bpy.data.meshes.new("RoofSlope"); ob = bpy.data.objects.new("RoofSlope", me)
        bpy.context.collection.objects.link(ob)
        bm = bmesh.new()
        v0 = bm.verts.new((-RX, sy * EY, EZ))   # eave, -X
        v1 = bm.verts.new(( RX, sy * EY, EZ))   # eave, +X
        v2 = bm.verts.new(( RX, 0.0,     RZ))   # ridge, +X
        v3 = bm.verts.new((-RX, 0.0,     RZ))   # ridge, -X
        bm.faces.new((v0, v1, v2, v3))
        bm.normal_update(); bm.to_mesh(me); bm.free()
        ob.data.materials.append(shingle_m)
    add_box("Ridge", (7.0, 0.3, 0.18), (0, 0, 4.96), shingle_m)

    # ---- GUTTERS + downspouts -------------------------------------------
    for sy in (2.95, -2.95):
        add_box("Gutter", (7.0, 0.34, 0.22), (0, sy, 3.18), metal_m)
        add_box("Downspout", (0.22, 0.22, 3.2), (3.3, sy, 1.6), metal_m)

    # ---- WINDOWS (front facade, -Y) + door ------------------------------
    for sx in (-1.9, 1.9):
        add_box("WinFrame", (1.28, 0.10, 1.58), (sx, -2.49, 1.9), frame_m)
        add_box("Glass",    (1.10, 0.12, 1.40), (sx, -2.52, 1.9), glass_m)
    add_box("Door", (1.1, 0.14, 2.1), (0, -2.52, 1.05), door_m)

def build_camera():
    scn = bpy.context.scene
    # look-at target empty
    bpy.ops.object.empty_add(location=(0, 0, 4.3)); tgt = bpy.context.active_object
    tgt.name = "CamTarget"
    bpy.ops.object.camera_add(location=(5.5, -6, 8)); cam = bpy.context.active_object
    cam.data.lens = 50
    cam.data.dof.use_dof = True
    cam.data.dof.focus_object = tgt
    cam.data.dof.aperture_fstop = 3.2          # gentle cinematic depth of field
    con = cam.constraints.new('TRACK_TO')
    con.target = tgt; con.track_axis = 'TRACK_NEGATIVE_Z'; con.up_axis = 'UP_Y'
    scn.camera = cam

    # 4 waypoints in Blender Z-up space: (cam_loc, target_loc)
    WP = [
        ((5.5, -6.0, 8.0),  (0.0,  0.0, 4.3)),   # shingles  (above roof)
        ((8.0, -5.0, 3.6),  (2.5, -2.8, 3.2)),   # gutters   (eave level)
        ((0.5, -10.0, 2.2), (0.0, -2.5, 1.9)),   # windows   (facade)
        ((-9.0, -9.0, 5.2), (0.0,  0.0, 2.5)),   # hero/framing (pulled back)
    ]
    # spread keys across the timeline with brief dwell holds at each stop
    stops = [0.10, 0.37, 0.63, 0.90]
    scn.frame_start = 1; scn.frame_end = TOTAL_FRAMES
    for i, (cloc, tloc) in enumerate(WP):
        f = max(1, round(stops[i] * TOTAL_FRAMES))
        for obj, loc in ((cam, cloc), (tgt, tloc)):
            obj.location = loc
            obj.keyframe_insert("location", frame=f)
            # short dwell hold so the camera "settles" on each part
            if 0 < i < 3:
                obj.keyframe_insert("location", frame=min(TOTAL_FRAMES, f + 8))
    # bezier easing on every fcurve -> smooth ease in/out at each waypoint
    for obj in (cam, tgt):
        if obj.animation_data and obj.animation_data.action:
            for fc in obj.animation_data.action.fcurves:
                for kp in fc.keyframe_points:
                    kp.interpolation = 'BEZIER'
                    kp.handle_left_type = kp.handle_right_type = 'AUTO_CLAMPED'

def setup_render():
    scn = bpy.context.scene
    scn.render.engine = 'CYCLES'
    # GPU if available, else CPU
    try:
        prefs = bpy.context.preferences.addons['cycles'].preferences
        for ctype in ('OPTIX', 'CUDA', 'HIP', 'METAL', 'ONEAPI'):
            try:
                prefs.compute_device_type = ctype; prefs.refresh_devices()
                if any(d.type != 'CPU' for d in prefs.devices):
                    for d in prefs.devices: d.use = True
                    scn.cycles.device = 'GPU'
                    print(f"[apex] GPU compute: {ctype}"); break
            except Exception: continue
    except Exception as e:
        print("[apex] GPU setup skipped:", e)

    scn.cycles.samples = SAMPLES
    scn.cycles.use_denoising = USE_DENOISE
    try: scn.cycles.denoiser = 'OPENIMAGEDENOISE'
    except Exception: pass
    scn.render.resolution_x, scn.render.resolution_y = RESOLUTION
    scn.render.resolution_percentage = 100
    scn.render.film_transparent = False
    scn.render.image_settings.file_format = 'PNG'
    scn.render.image_settings.color_mode = 'RGB'
    scn.render.filepath = os.path.join(OUTPUT_DIR, "frame_")
    # realistic color management
    try: scn.view_settings.view_transform = 'AgX'      # Blender 4.x filmic-successor
    except Exception:
        try: scn.view_settings.view_transform = 'Filmic'
        except Exception: pass
    scn.view_settings.look = 'AgX - Medium High Contrast' if scn.view_settings.view_transform == 'AgX' else 'None'
    scn.view_settings.exposure = EXPOSURE

def render_single_still(frame):
    """Cheap validation path: render ONE frame of the real path as a still."""
    scn = bpy.context.scene
    frame = max(scn.frame_start, min(scn.frame_end, frame))
    scn.frame_set(frame)
    base = bpy.path.abspath(OUTPUT_DIR)
    os.makedirs(base, exist_ok=True)
    scn.render.filepath = os.path.join(base, f"frame_{frame:04d}")
    print(f"[apex] TEST single still -> frame {frame}")
    bpy.ops.render.render(write_still=True)
    print(f"[apex] done -> {scn.render.filepath}.png")

def main():
    reset()
    build_environment()
    build_house()
    build_camera()
    setup_render()
    print(f"[apex] scene ready · {TOTAL_FRAMES} frames @ {RESOLUTION[0]}x{RESOLUTION[1]} · {SAMPLES} spp")
    if RENDER:
        if TEST_FRAME > 0:
            render_single_still(TEST_FRAME)
        else:
            print("[apex] rendering sequence ...")
            bpy.ops.render.render(animation=True)
            print(f"[apex] done -> {bpy.path.abspath(OUTPUT_DIR)}")

main()
