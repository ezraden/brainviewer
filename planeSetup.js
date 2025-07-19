// planeSetup.js

import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/Addons.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

export function createPlanesAndLabels(scene, camera, renderer, controls) {
    // Materials
    const materialXY = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, opacity: 0.3, transparent: true });
    const materialXZ = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, opacity: 0.3, transparent: true });
    const materialYZ = new THREE.MeshBasicMaterial({ color: 0x0000ff, side: THREE.DoubleSide, opacity: 0.3, transparent: true });

    // Plane geometry
    const planeGeometry = new THREE.PlaneGeometry(200, 200);

    // Create planes
    const planeXY = new THREE.Mesh(planeGeometry, materialXY);
    const planeXZ = new THREE.Mesh(planeGeometry, materialXZ);
    const planeYZ = new THREE.Mesh(planeGeometry, materialYZ);

    planeXY.rotation.set(0, 0, 0);
    planeXZ.rotation.set(Math.PI / 2, 0, 0);
    planeYZ.rotation.set(0, Math.PI / 2, 0);

    planeXY.position.set(0, 0, 0);
    planeXZ.position.set(0, 0, 0);
    planeYZ.position.set(0, 0, 0);

    scene.add(planeXY, planeXZ, planeYZ);

    // Labels
    function createLabel(text, position) {
        const labelDiv = document.createElement('div');
        labelDiv.className = 'label';
        labelDiv.style.position = 'absolute';
        labelDiv.style.color = 'white';
        labelDiv.style.fontSize = '20px';
        labelDiv.style.pointerEvents = 'none';
        labelDiv.innerText = text;

        const label = new CSS2DObject(labelDiv);
        label.position.copy(position);
        return label;
    }

    scene.add(
        createLabel('x', new THREE.Vector3(101.5, 0, 0)),
        createLabel('y', new THREE.Vector3(0, 101.5, 0)),
        createLabel('z', new THREE.Vector3(0, 0, 101.5))
    );

    // TransformControls for rotation
    const transformControlsXY = new TransformControls(camera, renderer.domElement);
    transformControlsXY.attach(planeXY);
    transformControlsXY.setMode('rotate');
    scene.add(transformControlsXY);
    transformControlsXY.addEventListener('dragging-changed', e => controls.enabled = !e.value);

    const transformControlsXZ = new TransformControls(camera, renderer.domElement);
    transformControlsXZ.attach(planeXZ);
    transformControlsXZ.setMode('rotate');
    scene.add(transformControlsXZ);
    transformControlsXZ.addEventListener('dragging-changed', e => controls.enabled = !e.value);

    const transformControlsYZ = new TransformControls(camera, renderer.domElement);
    transformControlsYZ.attach(planeYZ);
    transformControlsYZ.setMode('rotate');
    scene.add(transformControlsYZ);
    transformControlsYZ.addEventListener('dragging-changed', e => controls.enabled = !e.value);

    return {
        planeXY,
        planeXZ,
        planeYZ,
        transformControlsXY,
        transformControlsXZ,
        transformControlsYZ
    };
}
