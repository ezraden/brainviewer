import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'; // ✅ WebXR support
import { createClippingPlanes } from './newplanesetup.js';
import { GUI } from 'lil-gui';
import brainURL from './assets/full_brain_binary.stl?url';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 100);

// WebGL renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true; // ✅ Enable XR
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer)); // ✅ Add VR button

// CSS2D renderer
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

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;
controls.enableZoom = true;

// GUI
const gui = new GUI();
const settings = {
  brainRotation: true,
  enableXY: false,
  enableXZ: false,
  enableYZ: false,
  clipXYSide: 'none',
  clipXZSide: 'none',
  clipYZSide: 'none'
};
gui.add(settings, 'brainRotation').name('Brain Rotation');

let planeXY, planeXZ, planeYZ;
let brainMesh;

const loader = new STLLoader();
loader.load(brainURL, geometry => {
  geometry.center();

  const material = new THREE.MeshStandardMaterial({
    color: 0x7f7fff,
    metalness: 0.3,
    roughness: 0.6,
    side: THREE.DoubleSide
  });

  brainMesh = new THREE.Mesh(geometry, material);
  scene.add(brainMesh);

  ({ planeXY, planeXZ, planeYZ } = createClippingPlanes(scene));

  // Plane visibility toggles
  const planesFolder = gui.addFolder('Planes');
  planesFolder.add(settings, 'enableXY').name('Show XY').onChange(v => planeXY.visible = v);
  planesFolder.add(settings, 'enableXZ').name('Show XZ').onChange(v => planeXZ.visible = v);
  planesFolder.add(settings, 'enableYZ').name('Show YZ').onChange(v => planeYZ.visible = v);

  // Plane rotation sliders
  const rotationFolder = gui.addFolder('Plane Rotation');
  const addRotationControls = (folder, plane, name) => {
    const sub = folder.addFolder(`${name} Rotation`);
    sub.add(plane.rotation, 'x', 0, Math.PI * 2).step(0.01).name('Tilt X');
    sub.add(plane.rotation, 'y', 0, Math.PI * 2).step(0.01).name('Tilt Y');
    sub.add(plane.rotation, 'z', 0, Math.PI * 2).step(0.01).name('Tilt Z');
  };
  addRotationControls(rotationFolder, planeXY, 'XY');
  addRotationControls(rotationFolder, planeXZ, 'XZ');
  addRotationControls(rotationFolder, planeYZ, 'YZ');

  // Clipping side selection
  const clippingFolder = gui.addFolder('Clipping Side');
  clippingFolder.add(settings, 'clipXYSide', ['none', 'front', 'back']).name('Clip XY Side');
  clippingFolder.add(settings, 'clipXZSide', ['none', 'front', 'back']).name('Clip XZ Side');
  clippingFolder.add(settings, 'clipYZSide', ['none', 'front', 'back']).name('Clip YZ Side');

  renderer.localClippingEnabled = true;
});

// Animate
function animate() {
  renderer.setAnimationLoop(() => {
    controls.enabled = settings.brainRotation;

    if (brainMesh) {
      const planes = [];

      const updateClipping = (plane, side) => {
        if (side === 'none') return;

        const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(plane.quaternion).normalize();
        if (side === 'back') normal.negate();

        const constant = -plane.position.clone().dot(normal);
        plane.userData.clipping.set(normal, constant);
        planes.push(plane.userData.clipping);
      };

      updateClipping(planeXY, settings.clipXYSide);
      updateClipping(planeXZ, settings.clipXZSide);
      updateClipping(planeYZ, settings.clipYZSide);

      brainMesh.material.clippingPlanes = planes;
    }

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
