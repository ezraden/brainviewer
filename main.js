import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { createPlanesAndLabels } from './planeSetup.js';
import brainURL from './assets/full_brain_binary.stl?url';

// Scene and Camera
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 1.5);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#webgl'),
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.xr.enabled = true; // ✅ Enable XR
document.body.appendChild(renderer.domElement);

// Add VR Button
document.body.appendChild(VRButton.createButton(renderer));

// CSS2D Renderer for Labels
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0x888888, 0.6));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(1, 1, 1).normalize();
scene.add(dirLight);

// Orbit Controls for desktop
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Load STL model
const loader = new STLLoader();
loader.load(brainURL, geometry => {
  geometry.center();

  const boundingBox = new THREE.Box3().setFromBufferAttribute(geometry.attributes.position);
  const size = new THREE.Vector3();
  boundingBox.getSize(size);
  const width = size.x / 2;
  const height = size.y / 2;

  createPlanesAndLabels(scene, width, height);

  const material = new THREE.MeshStandardMaterial({
    color: 0x7f7fff,
    metalness: 0.2,
    roughness: 0.5,
    side: THREE.DoubleSide
  });

  const brainMesh = new THREE.Mesh(geometry, material);
  scene.add(brainMesh);
});

// Handle resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});

// Animate
renderer.setAnimationLoop(() => {
  controls.update(); // only affects desktop
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
});
