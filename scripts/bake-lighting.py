# Précalcul de l'éclairage d'un modèle glTF dans Cycles, lancé par
# bake-lighting.sh : un dépliage UV « lightmap » (TEXCOORD_1), puis deux cartes
# de lumière diffuse avec rebonds, sans la couleur des matériaux : le ciel seul
# et le soleil seul.
#
# Usage : Blender -b -P bake-lighting.py -- <entrée.glb> <sortie.glb>
#         <ciel.png> <soleil.png>
import bpy, sys, math, time
import numpy as np
from mathutils import Vector

src, out_glb, sky_png, sun_png = sys.argv[sys.argv.index('--') + 1:]
size, samples = 2048, 512
# Soleil fixe, en degrés : azimut 0 au nord (-Z dans three.js), 90 à l'est.
SUN_ELEVATION, SUN_AZIMUTH = 40, 220
SCALE = 1.5  # marge au-dessus de 1 avant l'encodage 8 bits, lue par le shader
elevation, azimuth = map(math.radians, (SUN_ELEVATION, SUN_AZIMUTH))
# Repère de Blender : Z vers le haut, -Y vers le nord.
sun_dir = Vector((math.sin(azimuth) * math.cos(elevation),
                  math.cos(azimuth) * math.cos(elevation),
                  math.sin(elevation)))
start = time.time()

def log(*values):
    print('[bake %5.1fs]' % (time.time() - start), *values, flush=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src, merge_vertices=True)
scene = bpy.context.scene
layer = bpy.context.view_layer
meshes = [o for o in scene.objects if o.type == 'MESH']
log('objets', len(meshes), 'faces', sum(len(o.data.polygons) for o in meshes))

# Dépliage commun à tous les objets, à l'échelle de leur surface réelle.
for o in meshes:
    uvs = o.data.uv_layers
    if not uvs:
        # Des UV nulles : celles par défaut de Blender découpent chaque face.
        uvs.new(name='UVMap').data.foreach_set('uv', [0.0] * 2 * len(o.data.loops))
    uvs[0].active_render = True
    uvs.active = uvs.new(name='lightmap')
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:
    o.select_set(True)
layer.objects.active = meshes[0]
scene.tool_settings.use_uv_select_sync = True
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.0,
                         area_weight=0.0, correct_aspect=True,
                         scale_to_bounds=False)
bpy.ops.uv.average_islands_scale()
bpy.ops.uv.pack_islands(rotate=True, margin_method='FRACTION',
                        margin=3 / size)
bpy.ops.object.mode_set(mode='OBJECT')

bpy.ops.export_scene.gltf(filepath=out_glb, export_format='GLB',
                          export_texcoords=True, export_normals=True,
                          export_extras=True, export_cameras=True,
                          export_lights=True, export_yup=True,
                          export_image_format='AUTO')
log('export', out_glb)

# Éclairage du précalcul : ni lampes ni émission, un sol gris sous la maison.
for o in scene.objects:
    if o.type in ('LIGHT', 'CAMERA'):
        o.hide_render = True
for m in bpy.data.materials:
    if not m.node_tree:
        continue
    for n in m.node_tree.nodes:
        if n.type == 'BSDF_PRINCIPLED':
            n.inputs['Emission Strength'].default_value = 0
corners = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
center = sum(corners, Vector()) / len(corners)
floor = min(c.z for c in corners)
bpy.ops.mesh.primitive_plane_add(size=400, location=(center.x, center.y, floor - 0.005))
ground = bpy.context.object
ground_material = bpy.data.materials.new('bake_ground')
ground_material.use_nodes = True
ground_bsdf = ground_material.node_tree.nodes['Principled BSDF']
ground_bsdf.inputs['Base Color'].default_value = (0.4, 0.4, 0.4, 1)
ground_bsdf.inputs['Roughness'].default_value = 1
ground.data.materials.append(ground_material)

sun_light = bpy.data.lights.new('bake_sun', 'SUN')
sun_light.energy = math.pi  # une face tournée vers le soleil reçoit 1
sun_light.angle = math.radians(4)
sun = bpy.data.objects.new('bake_sun', sun_light)
scene.collection.objects.link(sun)
sun.rotation_mode = 'QUATERNION'
sun.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(sun_dir)

world = bpy.data.worlds.new('bake')
world.use_nodes = True
scene.world = world
background = world.node_tree.nodes['Background']
background.inputs['Color'].default_value = (1, 1, 1, 1)

prefs = bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type = 'METAL'
prefs.refresh_devices()
for device in prefs.devices:
    device.use = True
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'
scene.cycles.samples = samples
scene.cycles.max_bounces = 6
scene.cycles.diffuse_bounces = 4
scene.cycles.glossy_bounces = 0
scene.cycles.transparent_max_bounces = 8

image = bpy.data.images.new('bake', size, size, alpha=False, float_buffer=True)
for m in {slot.material for o in meshes for slot in o.material_slots if slot.material}:
    tree = m.node_tree
    for n in tree.nodes:
        n.select = False
    node = tree.nodes.new('ShaderNodeTexImage')
    node.image = image
    node.select = True
    tree.nodes.active = node

bpy.ops.object.select_all(action='DESELECT')
for o in meshes:
    o.select_set(True)
layer.objects.active = meshes[0]
bake = scene.render.bake
bake.use_pass_direct = True
bake.use_pass_indirect = True
bake.use_pass_color = False
bake.margin = 6
bake.margin_type = 'EXTEND'
bake.use_clear = True
bake.target = 'IMAGE_TEXTURES'

def bake_to(path):
    bpy.ops.object.bake(type='DIFFUSE')
    pixels = np.empty(size * size * 4, np.float32)
    image.pixels.foreach_get(pixels)
    pixels = pixels.reshape(-1, 4)
    linear = np.clip(pixels[:, :3] / SCALE, 0, 1)
    encoded = np.where(linear <= 0.0031308, linear * 12.92,
                       1.055 * np.power(linear, 1 / 2.4) - 0.055)
    pixels[:, :3] = encoded
    pixels[:, 3] = 1
    out = bpy.data.images.new('out', size, size, alpha=False)
    out.colorspace_settings.name = 'Non-Color'
    out.pixels.foreach_set(pixels.ravel())
    out.filepath_raw = path
    out.file_format = 'PNG'
    out.save()
    log('carte', path, 'moyenne %.3f' % float(np.mean(linear) * SCALE))

background.inputs['Strength'].default_value = 1
sun.hide_render = True
bake_to(sky_png)
background.inputs['Strength'].default_value = 0
sun.hide_render = False
bake_to(sun_png)
log('fini')
