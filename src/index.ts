import * as _ from 'lodash';
import * as THREE from 'three';
import scene from './Scene';
import camera from './Camera';
import renderer from './Renderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { PlanetarySystem } from './gravity/PlanetarySystem';
import nebulaSystem from './Background'
import { generateSprites } from './SpriteGeneration';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import GUI from 'lil-gui';
import { KeplarElements, keplarToCartesian, specificOrbit } from './gravity/GravityCalc';
import { SpacialBody } from './gravity/SpacialBody';

// GUI setup
const gui = new GUI();

const params = {
  exposure: 1,
  threshold: 0,
  bloomStrength: 1.5,
  bloomRadius: 0,
  pauseScene: false,
  orbit: 10 
}

// Post proc setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const bloomPass = new UnrealBloomPass( new THREE.Vector2(window.innerWidth, window.innerHeight), params.bloomStrength, params.bloomRadius, params.threshold);
renderer.toneMappingExposure = Math.pow(params.exposure, 4);
composer.addPass(bloomPass);

gui.add( params, 'exposure', 0, 2).onChange((val: number) => {
  renderer.toneMappingExposure = Math.pow(val, 4);
});
gui.add( params, 'threshold', 0, 1).onChange((val: number) => {
  bloomPass.threshold = val;
});
gui.add( params, 'bloomStrength', 0, 3).onChange((val: number) => {
  bloomPass.strength = val;
});
gui.add( params, 'bloomRadius', 0, 1).onChange((val: number) => {
  bloomPass.radius = val;
});
gui.add( params, 'pauseScene');
gui.add( params, 'orbit');


let ps = new PlanetarySystem();

const sun = ps.constructCentralBody(10000);

const keplarElements: KeplarElements = {
  eccentricity: 0,
  semi_major_axis: 250,
  inclination: 0,
  ascending_node: 0,
  periapsis: 0,
  true_anomaly: 0
};

const initialState = keplarToCartesian(sun.body, 500, keplarElements);

const earth = {
  body: new SpacialBody(initialState.pos, initialState.vel, 500),
  mesh: new THREE.Mesh(new THREE.SphereGeometry(5, 32, 16), new THREE.MeshPhongMaterial({color: 0x0000ff}))
};
ps.addBody(earth);

const keplarElementNames = Object.keys(keplarElements);

const keplarGui = gui.addFolder("Keplar Elements");
for (let name of keplarElementNames) {
  keplarGui.add(keplarElements, name).onChange((val: number) => {
    const stateVectors = keplarToCartesian(sun.body, 500, keplarElements);
    earth.body.pos.set(stateVectors.pos.x, stateVectors.pos.y, stateVectors.pos.z);
    earth.body.vel.set(stateVectors.vel.x, stateVectors.vel.y, stateVectors.vel.z)
  });
}


// const moon = ps.constructPlanetaryBody(50, 10, earth.body);
// const xanadu = ps.constructPlanetaryBody(200, 1, sun.body);

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

  composer.render();
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

// let moonSimulation = ps.predictPath(moon.body, fixedInterval, intervals);
// const moonMaterial = new THREE.LineBasicMaterial({color:moon.mesh.material.color});
// const moonGeometry = new THREE.BufferGeometry().setFromPoints(moonSimulation);
// const moonLine = new THREE.Line(moonGeometry, moonMaterial);
// scene.add(moonLine);

// const xanIntervals = 2 * Math.PI * xanadu.body.pos.distanceTo(sun.body.pos) / xanadu.body.vel.length() / fixedInterval;
// let xanSimulation = ps.predictPath(xanadu.body, fixedInterval, xanIntervals);
// const xanMaterial = new THREE.LineBasicMaterial({color:xanadu.mesh.material.color});
// const xanGeometry = new THREE.BufferGeometry().setFromPoints(xanSimulation);
// const xanLine = new THREE.Line(xanGeometry, xanMaterial);
// scene.add(xanLine);

function fixedUpdate() {
  if(params.pauseScene){
    return;
  }
  ps.accelerateSystem(fixedInterval);
  ps.updateSystem(fixedInterval);
  params.orbit = specificOrbit(earth.body, sun.body);
  console.log(params.orbit);
}

requestAnimationFrame(animate);
setInterval(fixedUpdate, fixedInterval);
