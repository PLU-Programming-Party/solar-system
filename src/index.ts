import * as _ from 'lodash';
import * as THREE from 'three';
import scene from './Scene';
import camera from './Camera';
import renderer from './Renderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { PlanetarySystem } from './gravity/PlanetarySystem';
import nebulaSystem from './Background'
import { generateSprites } from './SpriteGeneration';

let ps = new PlanetarySystem();

const sun = ps.constructCentralBody(10000);
const earth = ps.constructPlanetaryBody(500, 500, sun.body);
const moon = ps.constructPlanetaryBody(50, 10, earth.body);
const xanadu = ps.constructPlanetaryBody(200, 1, sun.body);

ps.addMeshes(scene);

let light = new THREE.PointLight(0xFFFFFF);
light.position.set(sun.body.pos.x, sun.body.pos.y, sun.body.pos.z);

let ambient = new THREE.AmbientLight(0x333333);

scene.add(light);
scene.add(ambient);
camera.position.set(0, 0, 500);
camera.lookAt(0,0,0); 

const textureLoader = new THREE.TextureLoader();
const seed = Math.random();

const starMaterial = new THREE.SpriteMaterial( { map: textureLoader.load( 'assets/star.png' ) } );
const sprites = generateSprites( [starMaterial], seed);
scene.add( ... sprites );

const totalNebulas = 10;
const nebulaMaterials: THREE.SpriteMaterial[] = [];
for (let i = 1; i <= totalNebulas; i++)
  nebulaMaterials.push(new THREE.SpriteMaterial( { map: textureLoader.load( 'assets/nebula' + i + '.png' ) } ));
const nebulas = generateSprites(nebulaMaterials, seed, 20, 5);
scene.add( ... nebulas );

let controls = new OrbitControls(camera, renderer.domElement);

//animation frame for cube
function animate() {
  // camera.position.set(earth.pos.x, earth.pos.y, .2);
  controls.update();

  ps.meshUpdate();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
 
};


const fixedInterval = 20; // Interval time in milliseconds

const intervals = (2 * Math.PI * earth.body.pos.distanceTo(sun.body.pos)) / earth.body.vel.length() / (fixedInterval);

let sunSimulation = ps.predictPath(sun.body, fixedInterval, intervals);
const sunMaterial = new THREE.LineBasicMaterial({color:sun.mesh.material.color});
const sunGeometry = new THREE.BufferGeometry().setFromPoints(sunSimulation);
const sunLine = new THREE.Line(sunGeometry, sunMaterial);
scene.add(sunLine);

let earthSimulation = ps.predictPath(earth.body, fixedInterval, intervals);
const earthMaterial = new THREE.LineBasicMaterial({color:earth.mesh.material.color});
const earthGeometry = new THREE.BufferGeometry().setFromPoints(earthSimulation);
const earthLine = new THREE.Line(earthGeometry, earthMaterial);
scene.add(earthLine);

let moonSimulation = ps.predictPath(moon.body, fixedInterval, intervals);
const moonMaterial = new THREE.LineBasicMaterial({color:moon.mesh.material.color});
const moonGeometry = new THREE.BufferGeometry().setFromPoints(moonSimulation);
const moonLine = new THREE.Line(moonGeometry, moonMaterial);
scene.add(moonLine);

const xanIntervals = 2 * Math.PI * xanadu.body.pos.distanceTo(sun.body.pos) / xanadu.body.vel.length() / fixedInterval;
let xanSimulation = ps.predictPath(xanadu.body, fixedInterval, xanIntervals);
const xanMaterial = new THREE.LineBasicMaterial({color:xanadu.mesh.material.color});
const xanGeometry = new THREE.BufferGeometry().setFromPoints(xanSimulation);
const xanLine = new THREE.Line(xanGeometry, xanMaterial);
scene.add(xanLine);

function fixedUpdate() {
  ps.accelerateSystem(fixedInterval);
  ps.updateSystem(fixedInterval);
}

requestAnimationFrame(animate);
setInterval(fixedUpdate, fixedInterval);
