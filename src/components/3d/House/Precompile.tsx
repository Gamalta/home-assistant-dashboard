import {useThree} from '@react-three/fiber';
import {useEffect} from 'react';
import type {RenderBackend} from '../../../rendering/backends';

type PrecompileProps = {
  backend: RenderBackend;
  onCompiled: () => void;
};

/**
 * Compile les shaders en arrière-plan (KHR_parallel_shader_compile) pendant
 * que le `<Canvas>` est en `frameloop="never"`. Sans cela, la première image
 * les compile de façon synchrone et fige l'écran plusieurs secondes sur la
 * tablette. Placé en dernier, son effet passe après ceux qui préparent la
 * scène (matériaux, ombres, lumières).
 */
export function Precompile(props: PrecompileProps) {
  const {backend, onCompiled} = props;
  const gl = useThree(state => state.gl);
  const scene = useThree(state => state.scene);
  const camera = useThree(state => state.camera);
  const frameloop = useThree(state => state.frameloop);
  const invalidate = useThree(state => state.invalidate);

  useEffect(() => {
    let cancelled = false;
    backend.compile(gl, scene, camera).then(() => {
      if (!cancelled) onCompiled();
    });
    return () => {
      cancelled = true;
    };
  }, [backend, gl, scene, camera]);

  // Rien d'autre ne réclame la première image une fois la compilation finie.
  useEffect(() => {
    if (frameloop === 'demand') invalidate();
  }, [frameloop, invalidate]);

  return null;
}
