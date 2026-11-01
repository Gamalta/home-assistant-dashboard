import {useLoader} from '@react-three/fiber';
import {useMemo} from 'react';
import * as THREE from 'three';
import type {LightMaps} from '../rendering/shaders/BakedLight/common';

/** Charge les cartes de lumière d'un modèle, lues sur son second jeu d'UV. */
export function useLightMaps(urls?: {sky: string; sun: string}) {
  const textures = useLoader(
    THREE.TextureLoader,
    urls ? [urls.sky, urls.sun] : [],
  );
  return useMemo((): LightMaps | undefined => {
    if (textures.length === 0) return undefined;
    for (const texture of textures) {
      // Exportées sans retournement, comme les textures glTF.
      texture.flipY = false;
      texture.channel = 1;
      texture.colorSpace = THREE.SRGBColorSpace;
      // Une lumière douce n'a pas besoin de mipmaps, qui coûteraient un tiers
      // de mémoire en plus.
      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
    }
    const [sky, sun] = textures;
    return {sky, sun};
  }, [textures]);
}
