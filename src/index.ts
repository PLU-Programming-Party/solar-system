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

// GUI setup
const gui = new GUI();

const params = {
  exposure: 1,
  threshold: 0,
  bloomStrength: 1.5,
  bloomRadius: 0,
  pauseScene: false,
  showOrbit: false
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
gui.add( params, 'showOrbit');

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

  composer.render();
  requestAnimationFrame(animate);
 
};


const fixedInterval = 20; // Interval time in milliseconds

const intervals = (2 * Math.PI * earth.body.pos.distanceTo(sun.body.pos)) / earth.body.vel.length() / (fixedInterval);

function createOrbitPath(pBody: any, ps: PlanetarySystem, intervals: number, fixedInterval: number) {
  let simulation = ps.predictPath(pBody.body, fixedInterval, intervals);
  const material = new THREE.LineBasicMaterial({color: pBody.mesh.material.color});
  const geometry = new THREE.BufferGeometry().setFromPoints(simulation);
  const line = new THREE.Line(geometry, material);
  return line;
}

const sunOrbit = createOrbitPath(sun, ps, intervals, fixedInterval);
scene.add(sunOrbit);

const earthOrbit = createOrbitPath(earth, ps, intervals, fixedInterval);
scene.add(earthOrbit);

const moonOrbit = createOrbitPath(moon, ps, intervals, fixedInterval);
scene.add(moonOrbit);

const xanIntervals = 2 * Math.PI * xanadu.body.pos.distanceTo(sun.body.pos) / xanadu.body.vel.length() / fixedInterval;
const xanOrbit = createOrbitPath(xanadu, ps, xanIntervals, fixedInterval);
scene.add(xanOrbit);

function fixedUpdate() {
  if(params.pauseScene){
    return;
  }

  if(params.showOrbit){
    sunOrbit.visible = true;
    earthOrbit.visible = true;
    moonOrbit.visible = true;
    xanOrbit.visible = true;
  } else {
    sunOrbit.visible = false;
    earthOrbit.visible = false;
    moonOrbit.visible = false;
    xanOrbit.visible = false;
  }
  
  ps.accelerateSystem(fixedInterval);
  ps.updateSystem(fixedInterval);
}

requestAnimationFrame(animate);
setInterval(fixedUpdate, fixedInterval);
