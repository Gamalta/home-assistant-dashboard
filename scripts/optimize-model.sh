#!/usr/bin/env sh
# Compresse un modèle glTF exporté de Blender pour le web :
# textures en WebP puis géométrie en Meshopt (lu nativement par useGLTF).
# Les noms des nœuds et matériaux (lumières, murs, sols) sont conservés.
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

npx --yes @gltf-transform/cli@4 webp "$input" "$tmp/webp.glb"
npx --yes @gltf-transform/cli@4 meshopt "$tmp/webp.glb" "$output"
