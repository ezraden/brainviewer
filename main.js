import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { createPlanesAndLabels } from './planeSetup.js';
import brainURL from './assets/full_brain_binary.stl?url';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 100);

// WebGL renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// CSS2D renderer for axis labels
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0xcccccc, 0.4));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(1, 1, 1).normalize();
scene.add(dirLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;
controls.enableZoom = true;

// Load STL automatically
const loader = new STLLoader();
loader.load(brainURL, geometry => {
  geometry.center();

  // Calculate bounds for plane setup
  const boundingBox = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position);
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  const width = size.x / 2;
  const height = size.y / 2;

  // Add anatomical planes and labels
  createPlanesAndLabels(scene, width, height);

  // Brain material
  const material = new THREE.MeshStandardMaterial({
    color: 0x7f7fff,
    metalness: 0.3,
    roughness: 0.6,
    side: THREE.DoubleSide
  });

  const brainMesh = new THREE.Mesh(geometry, material);
  scene.add(brainMesh);
});

// Animate
function animate() {
  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  });
}
animate();

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// Fullscreen on double-click
window.addEventListener('dblclick', () => {
  const canvas = renderer.domElement;
  if (!document.fullscreenElement) {
    canvas.requestFullscreen?.() || canvas.webkitRequestFullscreen?.();
  } else {
    document.exitFullscreen?.() || document.webkitExitFullscreen?.();
  }
});
