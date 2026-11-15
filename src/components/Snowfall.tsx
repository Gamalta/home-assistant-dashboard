import Box from '@mui/material/Box';
import {useEffect, useRef} from 'react';

const FALL = [
  {transform: 'translate3d(0, -1vh, 0)'},
  {transform: 'translate3d(4vw, 101vh, 0)'},
];

// Répartition fixe, au nombre d'or, plutôt qu'aléatoire : le rendu reste pur.
// Les gros flocons, plus proches, tombent plus vite.
const FLAKES = Array.from({length: 40}, (_, index) => {
  const size = 2 + (index % 3);
  const duration = 16_000 - 2_000 * size;
  return {
    left: (index * 61.8) % 100,
    size,
    duration,
    delay: -((index * 0.618) % 1) * duration,
  };
});

type SnowfallProps = {
  paused?: boolean;
};

/** Neige légère, animée par le compositeur : la scène 3D ne redessine rien. */
export function Snowfall(props: SnowfallProps) {
  const {paused} = props;
  const ref = useRef<HTMLDivElement>(null);

  // Web Animations plutôt qu'une animation CSS : sans événement
  // `animationiteration`, Chrome ne recalcule pas les styles à chaque chute.
  useEffect(() => {
    if (paused) return;
    const animations = [...ref.current!.children].map((flake, index) =>
      flake.animate(FALL, {
        duration: FLAKES[index].duration,
        delay: FLAKES[index].delay,
        iterations: Infinity,
      }),
    );
    return () => animations.forEach(animation => animation.cancel());
  }, [paused]);

  return (
    <Box
      ref={ref}
      aria-hidden
      data-testid="snowfall"
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        '@media (prefers-reduced-motion: reduce)': {display: 'none'},
      }}
    >
      {FLAKES.map((flake, index) => (
        <Box
          key={index}
          sx={theme => ({
            position: 'absolute',
            top: 0,
            left: `${flake.left}%`,
            width: flake.size,
            height: flake.size,
            borderRadius: '50%',
            bgcolor: '#fff',
            // À l'arrêt, au-dessus du cadre.
            transform: FALL[0].transform,
            // Sur le fond clair, un flocon blanc ne se voit qu'à son ombre.
            boxShadow: '0 0 3px rgba(40, 50, 80, 0.45)',
            ...theme.applyStyles('dark', {boxShadow: 'none', opacity: 0.8}),
          })}
        />
      ))}
    </Box>
  );
}
