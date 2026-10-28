import {EntityName, FilterByDomain} from '@hakit/core';
import Box from '@mui/material/Box';
import {useEffect, useRef} from 'react';
import type {LedLayoutType} from '../../../configs/house';
import {ledAreas} from '../../../utils/entity/ambilight';
import {CameraStream} from './CameraStream';

const WIDTH = 160;
const HEIGHT = 90;
// La cadence du flux des LED de HyperHDR (10 Hz par défaut).
const REFRESH_MS = 100;

type LedGlowProps = {
  cameraEntityId: FilterByDomain<EntityName, 'camera'>;
  ledLayout: LedLayoutType;
};

// Chaque LED reprend son pixel de l'image « LED Gradient » et le peint sur sa
// zone du bord de l'écran ; le flou en fait le halo autour de la TV. Dessiner
// sans relire les pixels marche aussi avec une image d'une autre origine.
export function LedGlow(props: LedGlowProps) {
  const {cameraEntityId, ledLayout} = props;
  const canvas = useRef<HTMLCanvasElement>(null);
  const image = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const context = canvas.current?.getContext('2d');
    if (!context) return;
    const areas = ledAreas(ledLayout);
    const timer = window.setInterval(() => {
      const leds = image.current;
      if (!leds?.naturalWidth) return;
      areas.forEach((area, led) => {
        context.drawImage(
          leds,
          Math.floor(((led + 0.5) * leds.naturalWidth) / areas.length),
          Math.floor(leds.naturalHeight / 2),
          1,
          1,
          area.x * WIDTH,
          area.y * HEIGHT,
          area.width * WIDTH,
          area.height * HEIGHT,
        );
      });
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [ledLayout]);

  return (
    <>
      <CameraStream
        ref={image}
        cameraEntityId={cameraEntityId}
        alt=""
        sx={{display: 'none'}}
      />
      <Box
        component="canvas"
        ref={canvas}
        width={WIDTH}
        height={HEIGHT}
        data-testid="led-glow"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          transform: 'scale(1.15)',
          filter: 'blur(16px)',
        }}
      />
    </>
  );
}
