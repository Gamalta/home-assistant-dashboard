import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {useEffect, useRef} from 'react';

function ThreeJSRenderer() {
  const rendererContainer = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const mouseDown = useRef(false);
  const lastMousePosition = useRef({x: 0, y: 0});

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    sceneRef.current = scene;

    const loader = new GLTFLoader();
    loader.load(
      '/Pince.glb',
      gltfResult => {
        const sword = gltfResult.scene;
        sword.scale.set(10, 10, 10);
        scene.add(sword);
        const box = new THREE.Box3().setFromObject(sword);
        const center = box.getCenter(new THREE.Vector3());
        sword.position.sub(center);
        console.log('sword loaded');
      },
      xhr => {
        if (xhr.lengthComputable) {
          const percentLoaded = (xhr.loaded / xhr.total) * 100;
          console.log(percentLoaded + '% chargé');
        } else {
          console.log('Chargement en cours...');
        }
      },
      error => {
        console.error('Une erreur est survenue lors du chargement : ', error);
      }
    );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff);
    rendererContainer.current &&
      rendererContainer.current.appendChild(renderer.domElement);

    const handleMouseDown = (event: any) => {
      mouseDown.current = true;
      lastMousePosition.current.x = event.clientX;
      lastMousePosition.current.y = event.clientY;
    };

    const handleMouseUp = () => {
      mouseDown.current = false;
    };

    const handleMouseMove = (event: any) => {
      if (!mouseDown.current) return;

      const deltaX = event.clientX - lastMousePosition.current.x;
      const deltaY = event.clientY - lastMousePosition.current.y;

      const sensitivity = 0.005;
      const rotateSpeedX = deltaX * sensitivity;
      const rotateSpeedY = deltaY * sensitivity;

      const euler = new THREE.Euler(rotateSpeedY, rotateSpeedX, 0, 'XYZ');
      sceneRef.current.rotation.x += euler.x;
      sceneRef.current.rotation.y += euler.y;

      lastMousePosition.current.x = event.clientX;
      lastMousePosition.current.y = event.clientY;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    const handleMouseWheel = (event: any) => {
      const deltaY = event.deltaY;
      const zoomSpeed = 0.1; // Vitesse du zoom
      camera.position.z += deltaY * zoomSpeed; // Ajuste la position de la caméra selon le mouvement de la molette
    };

    window.addEventListener('wheel', handleMouseWheel); // Écoute les événements de la molette de la souris

    const animate = () => {
      requestAnimationFrame(animate);

      // Add animation logic here

      renderer.render(scene, cameraRef.current);
    };

    animate();

    // Cleanup function to remove the renderer when component unmounts
    return () => {
      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleMouseWheel);
      rendererContainer.current &&
        rendererContainer.current.removeChild(renderer.domElement);
    };
  }, []); // Empty dependency array ensures useEffect runs only once

  return <div ref={rendererContainer} />;
}
