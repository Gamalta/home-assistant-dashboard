#!/usr/bin/env sh
# Compresse un modèle glTF exporté de Blender pour le web :
# textures en WebP, simplification de la géométrie (tolérance très faible,
# écart invisible), fusion des objets qui partagent un matériau (un draw call
# par matériau, voir l'ADR 0011), puis compression Meshopt (lue nativement
# par useGLTF). Les noms des matériaux, des lumières et de la caméra sont
# conservés.
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
gltf weld "$tmp/webp.gltf" "$tmp/weld.glb"
# --error : écart maximal relatif à la taille de chaque objet (0,05 %), donc
# avant la fusion qui en ferait de gros objets.
gltf simplify "$tmp/weld.glb" "$tmp/simple.glb" --ratio 0 --error 0.0005
# `join` aplatit aussi la hiérarchie (`flatten`) : les objets de tout le
# modèle qui partagent un matériau deviennent une seule primitive.
gltf join "$tmp/simple.glb" "$tmp/join.glb"
gltf meshopt "$tmp/join.glb" "$output"
