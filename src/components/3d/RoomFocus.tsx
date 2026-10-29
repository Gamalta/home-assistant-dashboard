import {useFrame, useThree} from '@react-three/fiber';
import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import type {Position3dType} from '../../configs/house';
import {portraitDistance, roomCameraPose} from '../../utils/camera';

// Distance caméra–pièce en paysage, en unités du modèle.
const DISTANCE = 4;
// Pixels dont la pièce remonte : elle se centre entre l'en-tête (≈ 70 px) et
// le carrousel (≈ 330 px), plutôt qu'au centre de l'écran.
const LIFT = 130;
const EPSILON = 0.01;

type Controls = THREE.EventDispatcher<{start: object; end: object}> & {
  target: THREE.Vector3;
  update: () => boolean;
};

type Pose = {position: THREE.Vector3; target: THREE.Vector3};

type RoomFocusProps = {
  position: Position3dType;
  base: THREE.Vector3Tuple;
};

export function RoomFocus(props: RoomFocusProps) {
  const {position, base} = props;
  const camera = useThree(state => state.camera);
  const controls = useThree(state => state.controls) as Controls | null;
  const invalidate = useThree(state => state.invalidate);
  const size = useThree(state => state.size);
  const aspect = size.width / size.height;
  const goal = useRef<Pose | null>(null);
  const placed = useRef(false);
  const ownStart = useRef(false);

  // La projection se décale, pas la cible : la 3D reste visible derrière le
  // carrousel et les gestes tournent toujours autour de la pièce.
  useEffect(() => {
    const {width, height} = size;
    camera.setViewOffset(width, height, 0, LIFT, width, height);
    invalidate();
    return () => camera.clearViewOffset();
  }, [camera, size, invalidate]);

  // Un geste de l'utilisateur interrompt le vol ; son « end » viendra au relâcher.
  useEffect(() => {
    if (!controls) return;
    const cancel = () => {
      if (!ownStart.current) goal.current = null;
    };
    controls.addEventListener('start', cancel);
    return () => {
      controls.removeEventListener('start', cancel);
      if (goal.current) controls.dispatchEvent({type: 'end'});
      goal.current = null;
    };
  }, [controls]);

  useEffect(() => {
    if (!controls) return;
    const pose = roomCameraPose(
      position,
      base,
      DISTANCE * portraitDistance(aspect),
    );
    const next = {
      position: new THREE.Vector3(...pose.position),
      target: new THREE.Vector3(...pose.target),
    };
    // Le premier cadrage se fait sans vol : l'écran s'ouvre sur la pièce.
    if (!placed.current) {
      placed.current = true;
      camera.position.copy(next.position);
      controls.target.copy(next.target);
      controls.update();
      invalidate();
      return;
    }
    if (reached(camera.position, controls.target, next)) return;
    // Comme un geste : Camera passe en mode mouvement (DPR réduit, ombres
    // suspendues) jusqu'au « end » de l'arrivée (ADR 0005).
    if (!goal.current) {
      ownStart.current = true;
      controls.dispatchEvent({type: 'start'});
      ownStart.current = false;
    }
    goal.current = next;
    invalidate();
  }, [position, base, aspect, camera, controls, invalidate]);

  useFrame((_, delta) => {
    const next = goal.current;
    if (!next || !controls) return;
    const t = 1 - Math.exp(-6 * Math.min(delta, 0.05));
    camera.position.lerp(next.position, t);
    controls.target.lerp(next.target, t);
    if (reached(camera.position, controls.target, next)) {
      camera.position.copy(next.position);
      controls.target.copy(next.target);
      goal.current = null;
      controls.dispatchEvent({type: 'end'});
    }
    // Oriente la caméra dès cette image, sans attendre celle d'OrbitControls.
    controls.update();
    invalidate();
  });

  return null;
}

function reached(position: THREE.Vector3, target: THREE.Vector3, pose: Pose) {
  return (
    position.distanceTo(pose.position) < EPSILON &&
    target.distanceTo(pose.target) < EPSILON
  );
}
