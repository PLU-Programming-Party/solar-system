import * as _ from 'lodash';
import * as THREE from 'three';
import scene from './Scene';
import camera from './Camera';
import renderer from './Renderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { SpacialBody } from './gravity/SpacialBody';
import { PlanetarySystem } from './gravity/PlanetarySystem';
import nebulaSystem from './Background'

let sun = new SpacialBody(
	new THREE.Vector3(),
	undefined,
	696340000,
	1410,
	true
);

let earth = new SpacialBody(
	new THREE.Vector3(150000000000, 0, 0),
	new THREE.Vector3(0, 29800, 0),
	6371000,
	5510
);

let moon = new SpacialBody(
  new THREE.Vector3(150000000000 + 384400000, 0, 0),
  new THREE.Vector3(0, 29800 + 1022, 0),
  1737400,
  3340
)

let ps = new PlanetarySystem();
ps.addBody(earth);
ps.addBody(sun);
ps.addBody(moon);

let scale = 0.0000000001;
let timeScale = 60 * 60 * 6;

let radiusScale = scale * 10;
let radiusScaleSun = scale * 10;

const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(sun.radius * radiusScaleSun, 32, 16), new THREE.MeshBasicMaterial({ color: 0xFFFF00 }));
const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(earth.radius * radiusScale, 32, 16), new THREE.MeshPhongMaterial({ color: 0x0000ff }));
const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(moon.radius * radiusScale, 32, 16), new THREE.MeshPhongMaterial({ color: 0x888888 }));

let light = new THREE.PointLight(0xFFFFFF);
light.position.set(sun.pos.x, sun.pos.y, sun.pos.z);

let ambient = new THREE.AmbientLight(0x333333);

scene.add(sunMesh);
scene.add(earthMesh);
scene.add(moonMesh);
scene.add(light);
scene.add(ambient);
camera.position.set(0, 0, 20);
camera.lookAt(0,0,0); 

const nebula = nebulaSystem(scene, THREE);

let controls = new OrbitControls(camera, renderer.domElement);

//animation frame for cube
function animate() {
  // camera.position.set(earth.pos.x * scale, earth.pos.y * scale, .2);
  controls.update();

  sunMesh.position.set(sun.pos.x * scale, sun.pos.y * scale, sun.pos.z * scale);
  earthMesh.position.set(earth.pos.x * scale, earth.pos.y * scale, earth.pos.z * scale);
  moonMesh.position.set(moon.pos.x * scale, moon.pos.y * scale, moon.pos.z * scale);

  renderer.render(scene, camera);
  nebula.update(0);
  requestAnimationFrame(animate);
 
};

const fixedInterval = 20; // Interval time in milliseconds
const deltaTime = fixedInterval / 1000 * timeScale;

const approxYear = 368 * 24 * 60 * 60 / timeScale; // Semi-redundent "24 * 60 * 60 / timeScale"; only important if timeScale changes
const simulationIterations = approxYear * 1000 / fixedInterval;

let earthSimulation = ps.predictPath(earth, deltaTime, simulationIterations).map(p => p.multiplyScalar(scale));
const earthMaterial = new THREE.LineBasicMaterial({color:0xff0000});
const earthGeometry = new THREE.BufferGeometry().setFromPoints(earthSimulation);
const earthLine = new THREE.Line(earthGeometry, earthMaterial);

let moonSimulation = ps.predictPath(moon, deltaTime, simulationIterations).map(p => p.multiplyScalar(scale));
const moonMaterial = new THREE.LineBasicMaterial({color:0x00ff00});
const moonGeometry = new THREE.BufferGeometry().setFromPoints(moonSimulation);
const moonLine = new THREE.Line(moonGeometry, moonMaterial);

scene.add(earthLine);
scene.add(moonLine);

function fixedUpdate() {
  ps.accelerateSystem(deltaTime);
  ps.updateSystem(deltaTime);
}

requestAnimationFrame(animate);
setInterval(fixedUpdate, fixedInterval);
