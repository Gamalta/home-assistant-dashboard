import {useEntity} from '@hakit/core';
import type {LightConfigType} from '../../../configs/house';
import Box from '@mui/material/Box';
import {useState} from 'react';

type RoomLightImageProps = {
  lightConfig: LightConfigType;
};

const colors = ['red', 'green', 'blue'] as const;

/** Calques RGB superposés sur le plan 2D selon la couleur de la lumière. */
export function RoomLightImage(props: RoomLightImageProps) {
  const {lightConfig} = props;
  const [loadedCount, setLoadedCount] = useState(0);
  const light = useEntity(lightConfig.lightEntityId, {
    returnNullIfNotFound: true,
  });

  if (!light) return null;
  const layers = colors.filter(color => !!lightConfig.layer?.[color]);
  // On attend tous les calques présents (pas forcément 3) pour éviter un
  // affichage partiel de la couleur.
  const allLoaded = loadedCount >= layers.length;

  return layers.map(color => (
    <Box
      component="img"
      key={color}
      src={lightConfig.layer?.[color]}
      onLoad={() => setLoadedCount(prev => prev + 1)}
      sx={{
        zIndex: 10,
        mixBlendMode: 'lighten',
        opacity:
          light.state === 'on' && allLoaded
            ? ((light.custom.color?.[colors.indexOf(color)] ?? 0) / 255) *
              ((light.custom.brightnessValue ?? 100) / 100)
            : 0,
      }}
    />
  ));
}
