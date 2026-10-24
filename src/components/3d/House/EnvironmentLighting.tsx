import {Environment} from '@react-three/drei';
import * as THREE from 'three';
import nightEnvironment from '../assets/dikhololo_night_1k.hdr?url';
import nightLightProbe from '../../../rendering/environment/nightLightProbe.json';

type EnvironmentLightingProps = {
  reflections: boolean;
};

// Calculée depuis le HDR à l'avance : sans les reflets, ses 1,7 Mo ne sont
// pas téléchargés.
const nightSphericalHarmonics = new THREE.SphericalHarmonics3().fromArray(
  nightLightProbe,
);

export function EnvironmentLighting(props: EnvironmentLightingProps) {
  const {reflections} = props;

  if (reflections) return <Environment files={nightEnvironment} />;
  return <lightProbe args={[nightSphericalHarmonics]} />;
}
