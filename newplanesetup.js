import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/Addons.js';

function createPlaneLabel(text, plane, normalDirection) {
  const div = document.createElement('div');
  div.className = 'label';
  div.textContent = text;
  div.style.color = 'white';
  div.style.fontSize = '18px';
  div.style.pointerEvents = 'none';

  const label = new CSS2DObject(div);
  const normal = normalDirection.clone().applyQuaternion(plane.quaternion).normalize();
  const offset = normal.multiplyScalar(110);
  label.position.copy(plane.position.clone().add(offset));

  plane.add(label);
}

export function createClippingPlanes(scene) {
  const size = 200;
  const planeGeometry = new THREE.PlaneGeometry(size, size);

  const materials = {
    XY: new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.3 }),
    XZ: new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, transparent: true, opacity: 0.3 }),
    YZ: new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide, transparent: true, opacity: 0.3 })
  };

  const planeXY = new THREE.Mesh(planeGeometry, materials.XY);
  planeXY.name = 'XY';
  planeXY.userData.clipping = new THREE.Plane();
  createPlaneLabel('XY', planeXY, new THREE.Vector3(0, 0, 1));

  const planeXZ = new THREE.Mesh(planeGeometry, materials.XZ);
  planeXZ.name = 'XZ';
  planeXZ.rotation.x = Math.PI / 2;
  planeXZ.userData.clipping = new THREE.Plane();
  createPlaneLabel('XZ', planeXZ, new THREE.Vector3(0, 1, 0));

  const planeYZ = new THREE.Mesh(planeGeometry, materials.YZ);
  planeYZ.name = 'YZ';
  planeYZ.rotation.y = Math.PI / 2;
  planeYZ.userData.clipping = new THREE.Plane();
  createPlaneLabel('YZ', planeYZ, new THREE.Vector3(1, 0, 0));

  scene.add(planeXY, planeXZ, planeYZ);

  return { planeXY, planeXZ, planeYZ };
}
