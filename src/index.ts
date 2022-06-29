import * as _ from 'lodash';
import * as THREE from 'three';
import scene from './Scene';
import camera from './Camera';
import renderer from './Renderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { PlanetarySystem } from './gravity/PlanetarySystem';

let ps = new PlanetarySystem();

const sun = ps.constructCentralBody(500);
const earth = ps.constructPlanetaryBody(200, 100, sun);
const moon = ps.constructPlanetaryBody(10, .0001, earth);

const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.MeshBasicMaterial({ color: 0xFFFF00 }));
const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 16), new THREE.MeshPhongMaterial({ color: 0x0000ff }));
const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.MeshPhongMaterial({ color: 0x888888 }));

let light = new THREE.PointLight(0xFFFFFF);
light.position.set(sun.pos.x, sun.pos.y, sun.pos.z);

let ambient = new THREE.AmbientLight(0x333333);

scene.add(sunMesh);
scene.add(earthMesh);
scene.add(moonMesh);
scene.add(light);
scene.add(ambient);
camera.position.set(0, 0, 300);
camera.lookAt(0,0,0); 

let controls = new OrbitControls(camera, renderer.domElement);

//animation frame for cube
function animate() {
  // camera.position.set(earth.pos.x, earth.pos.y, .2);
  controls.update();

  sunMesh.position.set(sun.pos.x, sun.pos.y, sun.pos.z);
  earthMesh.position.set(earth.pos.x, earth.pos.y, earth.pos.z);
  moonMesh.position.set(moon.pos.x, moon.pos.y, moon.pos.z);

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
};


const fixedInterval = 20; // Interval time in milliseconds

const intervals = (2 * Math.PI * earth.pos.distanceTo(sun.pos)) / earth.vel.length() / (fixedInterval);

let sunSimulation = ps.predictPath(sun, fixedInterval, intervals).map(p => p);
const sunMaterial = new THREE.LineBasicMaterial({color:0xffff00});
const sunGeometry = new THREE.BufferGeometry().setFromPoints(sunSimulation);
const sunLine = new THREE.Line(sunGeometry, sunMaterial);
scene.add(sunLine);

let earthSimulation = ps.predictPath(earth, fixedInterval, intervals).map(p => p);
const earthMaterial = new THREE.LineBasicMaterial({color:0xff0000});
const earthGeometry = new THREE.BufferGeometry().setFromPoints(earthSimulation);
const earthLine = new THREE.Line(earthGeometry, earthMaterial);
scene.add(earthLine);

let moonSimulation = ps.predictPath(moon, fixedInterval, intervals).map(p => p);
const moonMaterial = new THREE.LineBasicMaterial({color:0x00ff00});
const moonGeometry = new THREE.BufferGeometry().setFromPoints(moonSimulation);
const moonLine = new THREE.Line(moonGeometry, moonMaterial);
scene.add(moonLine);

function fixedUpdate() {
  ps.accelerateSystem(fixedInterval);
  ps.updateSystem(fixedInterval);
}

requestAnimationFrame(animate);
setInterval(fixedUpdate, fixedInterval);
