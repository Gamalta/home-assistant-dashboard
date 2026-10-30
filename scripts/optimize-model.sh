#!/usr/bin/env sh
# Compresse un modèle glTF exporté de Blender pour le web :
# textures en WebP, simplification de la géométrie (écart invisible à la
# distance de la caméra), fusion des objets qui partagent un matériau (un draw
# call par matériau, voir l'ADR 0011), puis compression Meshopt (lue
# nativement par useGLTF). Les noms des matériaux, des lumières et de la
# caméra sont conservés.
#
# Usage : pnpm optimize-model <entrée.glb> [sortie.glb]
set -e

input="$1"
output="${2:-$1}"
if [ -z "$input" ]; then
  echo "Usage : pnpm optimize-model <entrée.glb> [sortie.glb]" >&2
  exit 1
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
gltf() { npx --yes @gltf-transform/cli@4.5.1 "$@"; }
# Les dépendances de la CLI (meshoptimizer) servent au script node de la
# simplification, sans dépendance de plus dans le projet.
modules="$(npx --yes -p @gltf-transform/cli@4.5.1 -c 'dirname "$(dirname "$(command -v gltf-transform)")"')"

gltf webp "$input" "$tmp/webp.gltf"
# `join` fusionne les matériaux identiques sans regarder leur nom : un meuble
# pourrait devenir un mur. Le rôle que leur donne SceneMaterials, écrit dans
# `extras`, empêche ces fusions.
node -e '
const fs = require("fs");
const file = process.argv[1];
const gltf = JSON.parse(fs.readFileSync(file));
for (const material of gltf.materials ?? []) {
  const name = (material.name ?? "").toLowerCase().replace(/\.\d+$/, "");
  const wall = name.startsWith("wall_") || ["white", "yellowbrt"].includes(name);
  const role = wall ? "wall" : name.startsWith("room_") ? "ground" : "other";
  material.extras = {...material.extras, role};
}
fs.writeFileSync(file, JSON.stringify(gltf));
' "$tmp/webp.gltf"
# Les UV d'un objet sans texture ne servent à rien, et leurs coutures
# empêchent de souder ses sommets, donc de le simplifier.
gltf prune "$tmp/webp.gltf" "$tmp/prune.glb" --keep-attributes false
gltf weld "$tmp/prune.glb" "$tmp/weld.glb"
# Écart maximal : 0,05 % de la taille de chaque objet, donc avant la fusion qui
# en ferait de gros objets, et au moins 2 mm, moins d'un pixel à la distance
# de la caméra : les petits objets trop détaillés (touches, poignées) sont
# simplifiés eux aussi (ADR 0048).
NODE_PATH="$modules" node -e '
const {NodeIO} = require("@gltf-transform/core");
const {ALL_EXTENSIONS} = require("@gltf-transform/extensions");
const {simplifyPrimitive} = require("@gltf-transform/functions");
const {MeshoptSimplifier} = require("meshoptimizer");
(async () => {
  await MeshoptSimplifier.ready;
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const document = await io.read(process.argv[1]);
  for (const mesh of document.getRoot().listMeshes()) {
    for (const prim of mesh.listPrimitives()) {
      const size = MeshoptSimplifier.getScale(prim.getAttribute("POSITION").getArray(), 3);
      const error = Math.max(0.0005, 0.002 / size);
      simplifyPrimitive(prim, {simplifier: MeshoptSimplifier, ratio: 0, error});
    }
  }
  await io.write(process.argv[2], document);
})();
' "$tmp/weld.glb" "$tmp/simple.glb"
# `join` aplatit aussi la hiérarchie (`flatten`) : les objets de tout le
# modèle qui partagent un matériau deviennent une seule primitive.
gltf join "$tmp/simple.glb" "$tmp/join.glb"
gltf meshopt "$tmp/join.glb" "$output"
