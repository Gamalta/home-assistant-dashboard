#!/usr/bin/env sh
# Précalcule l'éclairage d'un modèle déjà optimisé (ADR 0046). Blender déplie
# le modèle sur un second jeu d'UV, puis Cycles calcule deux cartes de lumière
# diffuse avec rebonds : le ciel seul et le soleil seul. Le modèle est réécrit
# avec ce dépliage, et ses cartes sont écrites à côté de lui :
# Demo.glb → Demo-sky.webp et Demo-sun.webp. Compter quelques minutes.
#
# Usage : pnpm bake-lighting <modèle.glb>
# Blender 5 est attendu dans /Applications, sinon : BLENDER=<chemin>.
set -e

model="$1"
if [ -z "$model" ]; then
  echo "Usage : pnpm bake-lighting <modèle.glb>" >&2
  exit 1
fi
blender="${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
gltf() { npx --yes @gltf-transform/cli@4.5.1 "$@"; }
# Les dépendances de la CLI (décodeur Meshopt, sharp) servent aux deux
# scripts node ci-dessous, sans dépendance de plus dans le projet.
modules="$(npx --yes -p @gltf-transform/cli@4.5.1 -c 'dirname "$(dirname "$(command -v gltf-transform)")"')"

# Blender ne lit pas Meshopt : le modèle lui est donné décompressé.
NODE_PATH="$modules" node -e '
const {NodeIO} = require("@gltf-transform/core");
const {ALL_EXTENSIONS} = require("@gltf-transform/extensions");
const {dequantize} = require("@gltf-transform/functions");
const {MeshoptDecoder} = require("meshoptimizer");
(async () => {
  await MeshoptDecoder.ready;
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({"meshopt.decoder": MeshoptDecoder});
  const document = await io.read(process.argv[1]);
  for (const extension of document.getRoot().listExtensionsUsed()) {
    if (extension.extensionName === "EXT_meshopt_compression") extension.dispose();
  }
  await document.transform(dequantize());
  await io.write(process.argv[2], document);
})();
' "$model" "$tmp/model.glb"

"$blender" -b --factory-startup -P "$(dirname "$0")/bake-lighting.py" -- \
  "$tmp/model.glb" "$tmp/baked.glb" "$tmp/sky.png" "$tmp/sun.png"

gltf meshopt "$tmp/baked.glb" "$model"
NODE_PATH="$modules" node -e '
const sharp = require("sharp");
const [sky, sun, base] = process.argv.slice(1);
Promise.all([
  sharp(sky).webp({quality: 90}).toFile(`${base}-sky.webp`),
  sharp(sun).webp({quality: 90}).toFile(`${base}-sun.webp`),
]);
' "$tmp/sky.png" "$tmp/sun.png" "${model%.glb}"
