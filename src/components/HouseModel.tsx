import {useTheme} from '@mui/material';
import {useEffect, useRef} from 'react';
import * as THREE from 'three';

type HouseModelProps = {
  camera?: {x: number; y: number; z: number};
};

export function HouseModel(props: HouseModelProps) {
  const {camera} = props;
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);

    const lightGlobal = new THREE.AmbientLight(0xffffff, 1);
    scene.add(lightGlobal);

    const testLight = new THREE.DirectionalLight(0xffffff, 1);
    testLight.position.set(1, 1, 2);
    testLight.castShadow = true;
    scene.add(testLight);

    container.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({color: 0xff0000});
    const cube = new THREE.Mesh(geometry, material);
    cube.castShadow = true;
    scene.background = null;
    scene.add(cube);

    const planeGeometry = new THREE.PlaneGeometry(20, 20, 32, 32);
    const planeMaterial = new THREE.MeshStandardMaterial({
      color: theme.palette.background.default,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    plane.position.z = -2;
    scene.add(plane);

    camera.position.z = 5;

    renderer.render(scene, camera);

    return () => {
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} style={{width: '100%', height: '100%'}} />;
}
