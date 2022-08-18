import * as THREE from 'three';

const skyboxSize = 10000;

const box = new THREE.BoxGeometry(skyboxSize, skyboxSize, skyboxSize);
const materials = [
    new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('assets/textures/skybox_back.png'),
        side: THREE.DoubleSide
    }) as THREE.MeshBasicMaterial,
    new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('assets/textures/skybox_front.png'),
        side: THREE.DoubleSide
    }) as THREE.MeshBasicMaterial,
    new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('assets/textures/skybox_up.png'),
        side: THREE.DoubleSide
    }) as THREE.MeshBasicMaterial,
    new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('assets/textures/skybox_down.png'),
        side: THREE.DoubleSide
    }) as THREE.MeshBasicMaterial,
    new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('assets/textures/skybox_left.png'),
        side: THREE.DoubleSide
    }) as THREE.MeshBasicMaterial,
    new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('assets/textures/skybox_right.png'),
        side: THREE.DoubleSide
    }) as THREE.MeshBasicMaterial
];

const skyBox = new THREE.Mesh(box, materials);

export default skyBox;
