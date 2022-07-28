import * as _ from 'lodash';
import * as THREE from 'three';
import scene from './Scene';
import camera from './Camera';
import { PlanetarySystem } from './gravity/PlanetarySystem';
import { generateSprites } from './SpriteGeneration';
import gui from './GUI';
import { KeplarElements, keplarToCartesian } from './gravity/GravityCalc';
import { SpacialBody } from './gravity/SpacialBody';
import cameraController from './CameraControls';
import composer from './Composer';
import G from './gravity/GravityConstant';

const sceneParams = {
  pauseScene: false,
  showOrbit: true,
  updateOrbit: true
}
const sceneGUI = gui.addFolder('Scene Controls');
sceneGUI.add( sceneParams, 'pauseScene').name('Pause Scene');
sceneGUI.add( sceneParams, 'showOrbit').name('Show Orbit');
sceneGUI.add( sceneParams, 'updateOrbit').name('Update Orbit');

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

const fixedInterval = 20; // Interval time in milliseconds
let intervals = 2 * Math.PI * Math.sqrt(Math.pow(keplarElements.semi_major_axis, 3) / (G * sun.body.mass)) / fixedInterval;

const keplarGui = gui.addFolder("Keplar Elements");
keplarGui.onChange(() => {
  intervals = 2 * Math.PI * Math.sqrt(Math.pow(keplarElements.semi_major_axis, 3) / (G * sun.body.mass)) / fixedInterval;
  const stateVectors = keplarToCartesian(sun.body, 500, keplarElements);
  earth.body.pos.set(stateVectors.pos.x, stateVectors.pos.y, stateVectors.pos.z);
  earth.body.vel.set(stateVectors.vel.x, stateVectors.vel.y, stateVectors.vel.z);
})
keplarGui.add(keplarElements, 'eccentricity', 0, 1).name('Eccentricity');
keplarGui.add(keplarElements, 'semi_major_axis', 100, 1000).name('Semi-Major Axis');
keplarGui.add(keplarElements, 'inclination', 0, 360).name('Inclination');
keplarGui.add(keplarElements, 'ascending_node', 0, 360).name('Angle of Asc. Node');
keplarGui.add(keplarElements, 'periapsis', 0, 360).name('Periapsis');
keplarGui.add(keplarElements, 'true_anomaly', 0, 360).name('True Anomaly');

// const keplarElementNames = Object.keys(keplarElements);
// for (let name of keplarElementNames) {
//   keplarGui.add(keplarElements, name, 0 , 360).onChange((val: number) => {
//     const stateVectors = keplarToCartesian(sun.body, 500, keplarElements);
//     earth.body.pos.set(stateVectors.pos.x, stateVectors.pos.y, stateVectors.pos.z);
//     earth.body.vel.set(stateVectors.vel.x, stateVectors.vel.y, stateVectors.vel.z);
//   });
// }


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

//animation frame for cube
function animate() {
  // camera.position.set(earth.pos.x, earth.pos.y, .2);
  cameraController.update();

  ps.meshUpdate();

  composer.render();
  requestAnimationFrame(animate);
 
};

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

// const moonOrbit = createOrbitPath(moon, ps, intervals, fixedInterval);
// scene.add(moonOrbit);

// const xanIntervals = 2 * Math.PI * xanadu.body.pos.distanceTo(sun.body.pos) / xanadu.body.vel.length() / fixedInterval;
// const xanOrbit = createOrbitPath(xanadu, ps, xanIntervals, fixedInterval);
// scene.add(xanOrbit);

function fixedUpdate() {

  if(sceneParams.updateOrbit){
    sunOrbit.geometry.setFromPoints(ps.predictPath(sun.body, fixedInterval, intervals));
    earthOrbit.geometry.setFromPoints(ps.predictPath(earth.body, fixedInterval, intervals));
    // moonOrbit.geometry.setFromPoints(ps.predictPath(moon.body, fixedInterval, intervals));
    // xanOrbit.geometry.setFromPoints(ps.predictPath(xanadu.body, fixedInterval, xanIntervals));
  }

  if(sceneParams.showOrbit){
    sunOrbit.visible = true;
    earthOrbit.visible = true;
    // moonOrbit.visible = true;
    // xanOrbit.visible = true;
  } else {
    sunOrbit.visible = false;
    earthOrbit.visible = false;
    // moonOrbit.visible = false;
    // xanOrbit.visible = false;
  }

  if(sceneParams.pauseScene){
    return;
  }

  ps.accelerateSystem(fixedInterval);
  ps.updateSystem(fixedInterval);
  // params.orbit = specificOrbit(earth.body, sun.body);
  // console.log(params.orbit);
}

requestAnimationFrame(animate);
setInterval(fixedUpdate, fixedInterval);
