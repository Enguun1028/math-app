"""What if your speed doubled every 2 seconds? Part 1, set in Ulaanbaatar.

Builds the whole scene in code (owner, 2026-10-23: "use Blender, animate like that"), then renders PNG frames.
Low-poly on purpose, no shadows: it has to render on a laptop with integrated graphics.
Geometry is merged into one mesh per material and scene part, so building takes seconds, not minutes.

Run:  blender -b --factory-startup -P whatif_ub.py -- <out_dir> <seconds> [width] [height] [start_second] [--no-render]
The runner stays in place; the world slides past him. Speed doubles every K seconds:
v = 2^(t/K) m/s, distance d = K (2^(t/K) - 1) / ln 2.
"""
import bmesh
import bpy
import math
import os
import random
import sys
from mathutils import Matrix

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
flags = [a for a in argv if a.startswith('--')]
argv = [a for a in argv if not a.startswith('--')]
OUT = os.path.abspath(argv[0]) if argv else os.path.abspath('frames')
SECONDS = float(argv[1]) if len(argv) > 1 else 10.0
W = int(argv[2]) if len(argv) > 2 else 720
H = int(argv[3]) if len(argv) > 3 else 1280
START = float(argv[4]) if len(argv) > 4 else 0.0
FPS = 30
K = 2.0                              # doubling time in seconds (owner, 2026-10-23)
T_SOUND = K * math.log2(343)         # 16.8 s
dist = lambda t: K * (2 ** (t / K) - 1) / math.log(2)
D_SOUND = dist(T_SOUND)

# ---------- scene ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.fps = FPS
sc.frame_start, sc.frame_end = 1, max(1, round(SECONDS * FPS))
sc.render.resolution_x, sc.render.resolution_y = W, H
sc.render.resolution_percentage = 100
for eng in ('BLENDER_EEVEE_NEXT', 'BLENDER_EEVEE', 'BLENDER_WORKBENCH'):
    try:
        sc.render.engine = eng
        break
    except TypeError:
        pass
sc.render.image_settings.file_format = 'PNG'
sc.render.filepath = os.path.join(OUT, '')
ee = sc.eevee
for attr, val in (('taa_render_samples', 4), ('use_shadows', False), ('use_raytracing', False), ('use_gtao', False),
                  ('use_volumetric_shadows', False)):
    if hasattr(ee, attr):
        try:
            setattr(ee, attr, val)
        except Exception:
            pass
try:
    sc.view_settings.view_transform = 'Standard'
except TypeError:
    pass

T_ORBIT = K * math.log2(7900)        # 25.9 s: orbital speed, he lifts off
T_SPACE = T_ORBIT + 5.5               # cut to the view of Earth from space
T_LIGHT = K * math.log2(299_792_458)  # 56.3 s: the speed of light

# Sky: a clear Mongolian blue that fades into black space with stars (space = 0 … 1, keyed per frame).
world = bpy.data.worlds.new('sky')
sc.world = world
world.use_nodes = True
wn = world.node_tree
bg = wn.nodes['Background']
bg.inputs['Strength'].default_value = 1.0
wtc = wn.nodes.new('ShaderNodeTexCoord')
wnoise = wn.nodes.new('ShaderNodeTexNoise')
wnoise.inputs['Scale'].default_value = 900
wn.links.new(wtc.outputs['Generated'], wnoise.inputs['Vector'])
wramp = wn.nodes.new('ShaderNodeValToRGB')
wramp.color_ramp.elements[0].position = 0.72
wramp.color_ramp.elements[0].color = (0, 0, 0, 1)
wramp.color_ramp.elements[1].position = 0.76
wramp.color_ramp.elements[1].color = (1.6, 1.6, 1.6, 1)
wn.links.new(wnoise.outputs['Fac'], wramp.inputs['Fac'])
wmix = wn.nodes.new('ShaderNodeMix')
wmix.data_type = 'RGBA'
SKY = next(i for i in wmix.inputs if i.name == 'A' and i.type == 'RGBA')
SKY.default_value = (0.20, 0.45, 0.95, 1)
wn.links.new(wramp.outputs['Color'], next(i for i in wmix.inputs if i.name == 'B' and i.type == 'RGBA'))
wn.links.new(next(o for o in wmix.outputs if o.type == 'RGBA'), bg.inputs['Color'])
SPACE = wmix.inputs['Factor']
SPACE.default_value = 0.0

sun = bpy.data.lights.new('sun', 'SUN')
sun.energy = 2.4
if hasattr(sun, 'use_shadow'):
    sun.use_shadow = False
sun_o = bpy.data.objects.new('sun', sun)
sun_o.rotation_euler = (math.radians(50), 0, math.radians(30))
sc.collection.objects.link(sun_o)


# ---------- materials ----------
def principled(m):
    return next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')


def mat(name, color, emit=0.0, rough=0.85):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = principled(m)
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Roughness'].default_value = rough
    if emit:
        key = 'Emission Color' if 'Emission Color' in b.inputs else 'Emission'
        b.inputs[key].default_value = (*color, 1)
        b.inputs['Emission Strength'].default_value = emit
    return m


def window_mat(name, wall, glass=(0.12, 0.18, 0.30), floor=2.9, bay=3.2):
    """A panel-block facade: a window every `bay` metres along the wall and every `floor` metres up."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = principled(m)
    tc = nt.nodes.new('ShaderNodeTexCoord')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(tc.outputs['Object'], sep.inputs[0])

    def op(kind, a, b_=None, val=None):
        n = nt.nodes.new('ShaderNodeMath')
        n.operation = kind
        nt.links.new(a, n.inputs[0])
        if b_ is not None:
            nt.links.new(b_, n.inputs[1])
        elif val is not None:
            n.inputs[1].default_value = val
        return n.outputs[0]

    along = op('ADD', sep.outputs['X'], sep.outputs['Y'])
    fa = op('FRACT', op('DIVIDE', along, val=bay))
    fz = op('FRACT', op('DIVIDE', sep.outputs['Z'], val=floor))
    ma = op('MULTIPLY', op('GREATER_THAN', fa, val=0.28), op('LESS_THAN', fa, val=0.72))
    mz = op('MULTIPLY', op('GREATER_THAN', fz, val=0.32), op('LESS_THAN', fz, val=0.78))
    mask = op('MULTIPLY', ma, mz)
    mix = nt.nodes.new('ShaderNodeMix')
    mix.data_type = 'RGBA'
    nt.links.new(mask, mix.inputs['Factor'])
    a_in = next(i for i in mix.inputs if i.name == 'A' and i.type == 'RGBA')
    b_in = next(i for i in mix.inputs if i.name == 'B' and i.type == 'RGBA')
    a_in.default_value = (*wall, 1)
    b_in.default_value = (*glass, 1)
    out = next(o for o in mix.outputs if o.type == 'RGBA')
    nt.links.new(out, b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.7
    return m


M = {
    'asphalt': mat('asphalt', (0.07, 0.07, 0.08)),
    'line': mat('line', (0.95, 0.95, 0.9)),
    'walk': mat('walk', (0.62, 0.61, 0.58)),
    'ground': mat('ground', (0.55, 0.52, 0.44)),
    'trunk': mat('trunk', (0.35, 0.24, 0.16)),
    'leaf': mat('leaf', (0.24, 0.55, 0.25)),
    'hill': mat('hill', (0.46, 0.55, 0.32)),
    'mount': mat('mount', (0.36, 0.45, 0.30)),
    'ger': mat('ger', (0.96, 0.95, 0.92)),
    'gerdoor': mat('gerdoor', (0.92, 0.45, 0.12)),
    'steppe': mat('steppe', (0.55, 0.66, 0.30)),
    'glass': mat('glass', (0.20, 0.45, 0.85), emit=0.4, rough=0.15),
    'deel': mat('deel', (0.10, 0.32, 0.80)),
    'sash': mat('sash', (0.98, 0.55, 0.10)),
    'boot': mat('boot', (0.10, 0.08, 0.07)),
    'skin': mat('skin', (0.80, 0.58, 0.42)),
    'hair': mat('hair', (0.05, 0.04, 0.04)),
    'boom': mat('boom', (1.0, 1.0, 1.0), emit=6.0),
    'horse': mat('horse', (0.42, 0.26, 0.15)),
    'trail': mat('trail', (1.0, 0.85, 0.45), emit=8.0),
    'star': mat('star', (1.0, 0.95, 0.8), emit=30.0),
}
PASTEL = [(0.93, 0.86, 0.70), (0.92, 0.72, 0.70), (0.70, 0.82, 0.92), (0.95, 0.85, 0.52), (0.76, 0.90, 0.80), (0.94, 0.93, 0.90)]
WALLS = [window_mat(f'block{i}', c) for i, c in enumerate(PASTEL)]
CARS = [mat(f'car{i}', c, rough=0.4) for i, c in enumerate([(0.85, 0.1, 0.1), (0.9, 0.9, 0.92), (0.1, 0.1, 0.12), (0.2, 0.4, 0.8), (0.75, 0.75, 0.78)])]


# ---------- geometry, merged per material ----------
def empty(name, parent=None):
    e = bpy.data.objects.new(name, None)
    sc.collection.objects.link(e)
    e.parent = parent
    return e


class Group:
    """Collects shapes into one bmesh per material; build() turns them into objects under one empty."""

    def __init__(self, name, parent=None):
        self.name = name
        self.root = empty(name, parent)
        self.bms = {}

    def _bm(self, m):
        if m.name not in self.bms:
            self.bms[m.name] = (bmesh.new(), m)
        return self.bms[m.name][0]

    def box(self, size, loc, m):
        sx, sy, sz = size
        mx = Matrix.Translation((loc[0], loc[1], loc[2] + sz / 2)) @ Matrix.Diagonal((sx, sy, sz, 1))
        bmesh.ops.create_cube(self._bm(m), size=1, matrix=mx)

    def cyl(self, r, h, loc, m, verts=12, r2=None):
        mx = Matrix.Translation((loc[0], loc[1], loc[2] + h / 2))
        bmesh.ops.create_cone(self._bm(m), cap_ends=True, segments=verts, radius1=r, radius2=r if r2 is None else r2, depth=h, matrix=mx)

    def cone(self, r, h, loc, m, verts=12):
        self.cyl(r, h, loc, m, verts, r2=0.0)

    def blob(self, r, loc, m, scale=(1, 1, 1), subdiv=1):
        mx = Matrix.Translation(loc) @ Matrix.Diagonal((*scale, 1))
        bmesh.ops.create_icosphere(self._bm(m), subdivisions=subdiv, radius=r, matrix=mx)

    def build(self):
        for key, (bm, m) in self.bms.items():
            me = bpy.data.meshes.new(f'{self.name}_{key}')
            bm.to_mesh(me)
            bm.free()
            me.materials.append(m)
            o = bpy.data.objects.new(f'{self.name}_{key}', me)
            sc.collection.objects.link(o)
            o.parent = self.root
        self.bms = {}
        return self.root


def ger(g, x, y, s=1.0):
    g.cyl(3.2 * s, 2.0 * s, (x, y, 0), M['ger'], verts=16)
    g.cone(3.4 * s, 1.5 * s, (x, y, 2.0 * s), M['ger'], verts=16)
    g.box((0.9 * s, 0.2, 1.5 * s), (x, y - 3.15 * s, 0), M['gerdoor'])


def tree(g, x, y):
    g.cyl(0.18, 2.2, (x, y, 0), M['trunk'], verts=6)
    g.blob(1.6, (x, y, 3.3), M['leaf'])


def car(g, x, y, rnd):
    m = rnd.choice(CARS)
    g.box((1.8, 4.3, 0.75), (x, y, 0.25), m)
    g.box((1.6, 2.2, 0.6), (x, y - 0.2, 1.0), m)


def horse(g, x, y, rnd):
    g.box((0.5, 1.6, 0.7), (x, y, 1.0), M['horse'])
    g.box((0.3, 0.7, 0.35), (x, y + 0.95, 1.55), M['horse'])
    for dx in (-0.18, 0.18):
        for dy in (-0.6, 0.6):
            g.box((0.12, 0.12, 1.0), (x + dx, y + dy, 0), M['horse'])


# ---------- the city: one block of P metres, repeated; copies cover the view ----------
P = 240.0
city = Group('city')
for k in range(-1, 4):
    y0 = k * P
    city.box((16, P, 0.05), (0, y0 + P / 2, 0), M['asphalt'])
    for side in (-1, 1):
        city.box((7, P, 0.18), (side * 11.5, y0 + P / 2, 0), M['walk'])
        city.box((140, P, 0.04), (side * 85, y0 + P / 2, 0), M['ground'])
    for i in range(int(P / 9)):
        city.box((0.22, 3.0, 0.06), (0, y0 + i * 9, 0.02), M['line'])
        for side in (-1, 1):
            city.box((0.18, 3.0, 0.06), (side * 4, y0 + i * 9, 0.02), M['line'])
    rnd = random.Random(3)                    # the same layout in every copy, so the seam never shows
    for side in (-1, 1):
        y = y0 + 4
        while y < y0 + P - 30:
            length = rnd.uniform(34, 58)
            floors = rnd.choice([5, 5, 9, 9, 12])
            city.box((12, length, floors * 2.9), (side * 22, y + length / 2, 0), rnd.choice(WALLS))
            y += length + rnd.uniform(9, 16)
        for j in range(int(P / 14)):
            tree(city, side * 9.5, y0 + 6 + j * 14)
        for j in range(5):
            car(city, side * 6.6, y0 + 20 + j * 46 + rnd.uniform(-5, 5), rnd)
        y = y0 + 20
        while y < y0 + P - 40:                # second row: more blocks and a glass tower now and then
            length = rnd.uniform(40, 70)
            if rnd.random() < 0.25:
                city.box((16, 16, rnd.uniform(60, 95)), (side * 52, y + 8, 0), M['glass'])
            else:
                city.box((12, length, rnd.choice([9, 12, 16]) * 2.9), (side * 50, y + length / 2, 0), rnd.choice(WALLS))
            y += length + rnd.uniform(15, 30)
# Blue Sky Tower, the sail-shaped glass tower on Sükhbaatar Square, at the end of the avenue
for i in range(10):
    w = 34 - i * 2.6
    city.box((14, w, 10.5), (0, 2.5 * P + 60 + (34 - w) / 2, i * 10.5), M['glass'])
city = city.build()

# the hills with the ger district, and the mountains around the city (slower: they are far)
far = Group('far')
rnd = random.Random(5)
for side in (-1, 1):
    for i in range(10):
        hx, hy = side * rnd.uniform(170, 300), rnd.uniform(150, 1600)
        far.blob(1, (hx, hy, -30), M['hill'], scale=(rnd.uniform(80, 130), rnd.uniform(80, 130), rnd.uniform(55, 80)), subdiv=2)
        for g in range(7):
            ger(far, hx - side * rnd.uniform(40, 75), hy + rnd.uniform(-50, 50), 1.6)
far = far.build()
mountains = Group('mountains')
for i in range(14):
    mountains.cone(rnd.uniform(350, 700), rnd.uniform(260, 520), (rnd.uniform(-1600, 1600), rnd.uniform(2200, 3200), -20), M['mount'], verts=7)
mountains = mountains.build()

# ---------- the steppe (after the speed of sound) ----------
P2 = 900.0
steppe = Group('steppe')
for k in range(-1, 4):
    y0 = k * P2
    steppe.box((4000, P2, 0.05), (0, y0 + P2 / 2, -0.02), M['steppe'])
    steppe.box((9, P2, 0.06), (0, y0 + P2 / 2, 0), M['asphalt'])
    for i in range(int(P2 / 12)):
        steppe.box((0.22, 3.0, 0.07), (0, y0 + i * 12, 0.02), M['line'])
    rnd = random.Random(11)
    for g in range(26):
        ger(steppe, rnd.choice((-1, 1)) * rnd.uniform(25, 400), y0 + rnd.uniform(0, P2), 1.2)
    for g in range(10):                      # a few gers and their horses close to the road
        gx, gy = rnd.choice((-1, 1)) * rnd.uniform(14, 40), y0 + rnd.uniform(0, P2)
        ger(steppe, gx, gy, 1.0)
        for h in range(3):
            horse(steppe, gx + rnd.uniform(-8, 8), gy + rnd.uniform(8, 20), rnd)
    for h in range(14):
        horse(steppe, rnd.choice((-1, 1)) * rnd.uniform(15, 200), y0 + rnd.uniform(0, P2), rnd)
steppe = steppe.build()

def part(name, parent, shapes, loc=(0, 0, 0)):
    g = Group(name, parent)
    for kind, args in shapes:
        getattr(g, kind)(*args)
    root = g.build()
    root.location = loc
    return root


# ---------- Earth from space (far from the street scene; a second camera looks at it) ----------
EARTH_AT = (0.0, 0.0, -50000.0)
R_EARTH = 60.0                        # scene units; only the look matters here
EARTH_SPIN = float(os.environ.get('EARTH_SPIN', '2.7'))   # turns Asia toward the camera
EARTH_TILT = float(os.environ.get('EARTH_TILT', '0.65'))


ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')
EARTH_IMG = os.path.join(ASSETS, 'earth_2048.jpg')      # NASA Blue Marble, public domain
CLOUD_IMG = os.path.join(ASSETS, 'clouds_2048.jpg')


def image_node(nt, path):
    n = nt.nodes.new('ShaderNodeTexImage')
    n.image = bpy.data.images.load(path)
    return n


def earth_mat():
    m = bpy.data.materials.new('earth')
    m.use_nodes = True
    nt = m.node_tree
    b = principled(m)
    if os.path.exists(EARTH_IMG):
        img = image_node(nt, EARTH_IMG)
        nt.links.new(img.outputs['Color'], b.inputs['Base Color'])
        key = 'Emission Color' if 'Emission Color' in b.inputs else 'Emission'
        nt.links.new(img.outputs['Color'], b.inputs[key])      # a little glow so the night side still reads
        b.inputs['Emission Strength'].default_value = 0.35
        b.inputs['Roughness'].default_value = 0.85
        return m
    tex = nt.nodes.new('ShaderNodeTexNoise')
    tex.inputs['Scale'].default_value = 2.2
    tex.inputs['Detail'].default_value = 6
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    els = ramp.color_ramp.elements
    els[0].position, els[0].color = 0.52, (0.03, 0.12, 0.42, 1)     # ocean
    els[1].position, els[1].color = 0.55, (0.20, 0.42, 0.16, 1)     # coast and grass
    e = els.new(0.66)
    e.color = (0.55, 0.47, 0.30, 1)                                  # steppe and desert, like Mongolia
    nt.links.new(tex.outputs['Fac'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Roughness'].default_value = 0.9
    return m


def cloud_mat():
    m = bpy.data.materials.new('clouds')
    m.use_nodes = True
    nt = m.node_tree
    b = principled(m)
    b.inputs['Base Color'].default_value = (1, 1, 1, 1)
    if os.path.exists(CLOUD_IMG):
        img = image_node(nt, CLOUD_IMG)
        img.image.colorspace_settings.name = 'Non-Color'
        ramp = nt.nodes.new('ShaderNodeValToRGB')
        ramp.color_ramp.elements[0].position = 0.45
        ramp.color_ramp.elements[1].position = 1.0
        nt.links.new(img.outputs['Color'], ramp.inputs['Fac'])
    else:
        tex = nt.nodes.new('ShaderNodeTexNoise')
        tex.inputs['Scale'].default_value = 4.5
        tex.inputs['Detail'].default_value = 8
        ramp = nt.nodes.new('ShaderNodeValToRGB')
        ramp.color_ramp.elements[0].position = 0.55
        ramp.color_ramp.elements[1].position = 0.68
        nt.links.new(tex.outputs['Fac'], ramp.inputs['Fac'])
    nt.links.new(ramp.outputs['Color'], b.inputs['Alpha'])
    if hasattr(m, 'surface_render_method'):
        m.surface_render_method = 'DITHERED'
    elif hasattr(m, 'blend_method'):
        m.blend_method = 'HASHED'
    return m


space = empty('space')
space.location = EARTH_AT
bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=R_EARTH)
earth = bpy.context.active_object
earth.data.materials.append(earth_mat())
earth.parent = space
bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=R_EARTH * 1.015)
clouds = bpy.context.active_object
clouds.data.materials.append(cloud_mat())
clouds.parent = space
bpy.ops.object.shade_smooth()
# the runner's orbit: a glowing ring that gets brighter as the laps get faster, and the runner himself
orbit = empty('orbit', space)
orbit.rotation_euler = (math.radians(68), math.radians(-12), 0)
bpy.ops.mesh.primitive_torus_add(major_radius=R_EARTH * 1.06, minor_radius=0.25, major_segments=200, minor_segments=8)
trail = bpy.context.active_object
TRAIL_MAT = mat('trailglow', (1.0, 0.85, 0.45), emit=0.5)
trail.data.materials.append(TRAIL_MAT)
trail.parent = orbit
TRAIL_EMIT = principled(TRAIL_MAT).inputs['Emission Strength']
dot = part('dot', orbit, [('blob', (2.2, (0, 0, 0), M['star'], (1, 1, 1), 2))])
for o in (earth, clouds):
    o.location = (0, 0, 0)
    o.rotation_mode = 'ZYX'                 # spin about the Earth's axis first, then tilt toward the camera

cam2_data = bpy.data.cameras.new('cam2')
cam2_data.lens = 35
cam2_data.clip_end = 2000
cam2 = bpy.data.objects.new('cam2', cam2_data)
sc.collection.objects.link(cam2)
cam2.parent = space
cam2.location = (0, -380, 30)
cam2.rotation_euler = (math.radians(82), 0, 0)


# ---------- the runner, seen from behind: a few moving parts ----------
runner = empty('runner')
parts = {}
for side, name in ((-1, 'legL'), (1, 'legR')):
    parts[name] = part(name, runner, [('box', ((0.17, 0.17, 0.62), (0, 0, -0.62), M['deel'])),
                                      ('box', ((0.2, 0.3, 0.3), (0, 0.04, -0.95), M['boot']))], (side * 0.13, 0, 0.95))
for side, name in ((-1, 'armL'), (1, 'armR')):
    parts[name] = part(name, runner, [('box', ((0.14, 0.14, 0.6), (0, 0, -0.6), M['deel'])),
                                      ('box', ((0.12, 0.12, 0.12), (0, 0, -0.72), M['skin']))], (side * 0.33, 0, 1.62))
part('body', runner, [('box', ((0.56, 0.34, 0.95), (0, 0, 0.78), M['deel'])),
                      ('box', ((0.6, 0.38, 0.13), (0, 0, 1.08), M['sash'])),
                      ('box', ((0.52, 0.3, 0.45), (0, 0, 1.25), M['deel'])),
                      ('box', ((0.12, 0.12, 0.12), (0, 0, 1.7), M['skin'])),
                      ('blob', (0.17, (0, 0.02, 1.9), M['skin'])),
                      ('blob', (0.175, (0, -0.03, 1.93), M['hair']))])

# the boom ring at the speed of sound
bpy.ops.mesh.primitive_torus_add(major_radius=1.0, minor_radius=0.04, major_segments=64, minor_segments=6)
ring = bpy.context.active_object
ring.data.materials.append(M['boom'])
ring.location = (0, 3.0, 1.2)
ring.rotation_euler = (math.radians(90), 0, 0)

# ---------- camera ----------
cam_data = bpy.data.cameras.new('cam')
cam_data.lens = 24
cam_data.clip_end = 6000
cam = bpy.data.objects.new('cam', cam_data)
sc.collection.objects.link(cam)
sc.camera = cam
target = empty('target')
target.location = (0, 14, 1.6)
track = cam.constraints.new('TRACK_TO')
track.target = target
track.track_axis = 'TRACK_NEGATIVE_Z'
track.up_axis = 'UP_Y'


# ---------- animation: one key per frame, each holding exactly on its frame ----------
def key(o, path, f):
    o.keyframe_insert(path, frame=f)


phase = 0.0
theta = 0.0
space_frame = math.ceil((T_SPACE - START) * FPS) + 1     # first frame whose time is in space
m0 = sc.timeline_markers.new('street', frame=1)
m0.camera = cam2 if space_frame <= 1 else cam
sc.camera = m0.camera
if 1 < space_frame <= sc.frame_end:
    m1 = sc.timeline_markers.new('space', frame=space_frame)
    m1.camera = cam2
for f in range(sc.frame_start, sc.frame_end + 1):
    t = START + (f - 1) / FPS
    v, d = 2 ** (t / K), dist(t)
    in_city = t < T_SOUND
    lift = min(1.0, max(0.0, (t - T_ORBIT) / (T_SPACE - T_ORBIT)))
    alt = 4000 * lift ** 2.5
    SPACE.default_value = lift
    SPACE.keyframe_insert('default_value', frame=f)
    target.location = (0, 14, 1.6 - 22 * lift ** 1.5)
    key(target, 'location', f)
    city.location = (0, -(d % P), 0)
    city.scale = (1, 1, 1) if in_city else (0, 0, 0)
    steppe.location = (0, 0 if in_city else -((d - D_SOUND) % P2), 0)
    steppe.scale = (0, 0, 0) if in_city else (1, 1, 1)
    far.location = (0, -0.25 * d, 0)
    far.scale = (1, 1, 1) if in_city else (0, 0, 0)
    mountains.location = (0, -min(0.02 * d, 900), -alt)
    steppe.location = (steppe.location[0], steppe.location[1], -alt)
    for o in (city, steppe, far, mountains):
        key(o, 'location', f)
        key(o, 'scale', f)
    # stride: faster with speed, capped so the legs stay readable
    freq = min(4.5, 1.4 + 0.45 * math.log2(v + 1))
    phase += 2 * math.pi * freq / FPS
    s = math.sin(phase)
    parts['legL'].rotation_euler = (s * 0.75, 0, 0)
    parts['legR'].rotation_euler = (-s * 0.75, 0, 0)
    parts['armL'].rotation_euler = (-s * 0.7, 0, 0)
    parts['armR'].rotation_euler = (s * 0.7, 0, 0)
    runner.rotation_euler = (-min(0.32, 0.06 + 0.015 * t), 0, 0)
    runner.location = (0, 0, 0.06 * abs(s))
    for o in (parts['legL'], parts['legR'], parts['armL'], parts['armR'], runner):
        key(o, 'rotation_euler', f)
    key(runner, 'location', f)
    b = (t - T_SOUND) / 0.6
    ring.scale = (0, 0, 0) if b < 0 or b > 1 else (0.6 + 3.2 * b, 0.6 + 3.2 * b, 1.0)
    key(ring, 'scale', f)
    shake = 0.12 * math.sin(f * 2.3) if 0 <= b <= 1 else 0.0
    shake += 0.05 * math.sin(f * 3.1) * lift
    cam.location = (0.6 + shake, -4.4, 2.0 + shake * 0.6)
    key(cam, 'location', f)
    # space: laps around Earth, faster and faster; the ring glows brighter with every lap per second
    if t >= T_SPACE:
        theta += v / 6.371e6 / FPS
        laps = v / (2 * math.pi * 6.371e6)
        dot.location = (R_EARTH * 1.06 * math.cos(theta), R_EARTH * 1.06 * math.sin(theta), 0)
        TRAIL_EMIT.default_value = 0.4 + 14 * min(1.0, laps / 4)
        u = (t - T_SPACE) / (SECONDS + START - T_SPACE + 1e-6)
        cam2.location = (0, -380 + 90 * u, 30 - 10 * u)
    key(dot, 'location', f)
    TRAIL_EMIT.keyframe_insert('default_value', frame=f)
    key(cam2, 'location', f)
    earth.rotation_euler = (EARTH_TILT, 0, EARTH_SPIN + 0.0015 * f)
    clouds.rotation_euler = (EARTH_TILT, 0, EARTH_SPIN + 0.0022 * f)
    key(earth, 'rotation_euler', f)
    key(clouds, 'rotation_euler', f)


def fcurves_of(action):
    if hasattr(action, 'fcurves'):
        return list(action.fcurves)
    out = []                                   # Blender 5: layered actions
    for layer in getattr(action, 'layers', []):
        for strip in layer.strips:
            for bag in getattr(strip, 'channelbags', []):
                out.extend(bag.fcurves)
    return out


for o in bpy.data.objects:
    ad = o.animation_data
    if ad and ad.action:
        for fc in fcurves_of(ad.action):
            for kp in fc.keyframe_points:
                kp.interpolation = 'CONSTANT'

os.makedirs(OUT, exist_ok=True)
print(f'[whatif] {len(bpy.data.objects)} objects, frames {sc.frame_start}-{sc.frame_end}, engine {sc.render.engine}, out {OUT}')
stills = next((a.split('=', 1)[1] for a in flags if a.startswith('--stills=')), None)
if stills:                                    # check a few moments: --stills=8,18,28 (seconds)
    for sec in stills.split(','):
        sc.frame_set(round((float(sec) - START) * FPS) + 1)
        sc.render.filepath = os.path.join(OUT, f'still_{float(sec):05.1f}.png')
        bpy.ops.render.render(write_still=True)
elif '--no-render' not in flags:
    bpy.ops.render.render(animation=True)
