import * as _ from 'lodash';
import * as THREE from 'three';
import scene from './Scene';
import camera from './Camera';
import renderer from './Renderer';
import { PlanetarySystem } from './gravity/PlanetarySystem';
import gui from './GUI';
import { KeplarElements, keplarToCartesian } from './gravity/GravityCalc';
import { SpatialBody } from './gravity/SpatialBody';
import cameraController from './CameraControls';
import composer from './Composer';
import G from './gravity/GravityConstant';
import { createEarthMesh, createStarField, createSunMesh, OrbitUpdater } from './render/PlanetaryRenderer';
import skyBox from './Skybox';
import { SystemGenerator } from './gravity/SystemGenerator';

//TODO: Live update keplar elements
//TODO: Create a more comprehensive testing suite

export type SpatialEntity = {
  body: SpatialBody,
  visual: THREE.Group,
  orbit: THREE.Group,
  updateOrbit: OrbitUpdater
}

// Globals
// export const _entities: SpatialEntity[] = [];
// const _keplarElementMap = new Map<SpatialEntity, KeplarElements>(); 
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
// export let ps = new PlanetarySystem();


// Create central body of system
// const sunMass = 10000;
// const sun = ps.constructBody(sunMass, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true);
// appendNewEntity(sun, createSunMesh(sunMass));

// const earthMass = 500;
// addNewPlanet(earthMass, sun, createRandomKeplarElements({eccentricity: 0, semi_major_axis: 250, inclination: 0}));

// const xanMass = 750;
// addNewPlanet(xanMass, sun, createRandomKeplarElements({eccentricity: 0, semi_major_axis: 400, inclination: 0}));

scene.add(createStarField(Math.random(), 10));
scene.add(skyBox);

// General Scene Setup
let ambient = new THREE.AmbientLight(0x333333);

scene.add(ambient);
camera.position.set(0, 0, 500);
camera.lookAt(0,0,0); 

// // Keplar GUI folder
export const fixedInterval = 20; // Interval time in milliseconds
export let intervals = 5000;
// export let intervals = 2 * Math.PI * Math.sqrt(Math.pow(activeKeplarElements.semi_major_axis, 3) / (G * sun.mass)) / fixedInterval;

// other stuff
window.addEventListener('click', onMouseClick);
window.addEventListener('resize', onWindowResize);

// System Generation GUI
const generatorParams = {
  planets: 3,
  distanceThreshold: 500,
  complexity: 1,
  probability: .2,
  randomize(){
    for (const entity of _entities)
      scene.remove(...[entity.orbit, entity.visual]);

    systemGenerator.randomize(this.planets, this.distanceThreshold, this.complexity, this.probability);
    ps = systemGenerator.system;
    ps.warmup(fixedInterval);
    _entities = systemGenerator.entities;
    _keplarElementMap = systemGenerator.keplarElementMap;
    sun = systemGenerator.sun;

    updateAllOrbits();
  }
}
const generatorGUI = gui.addFolder("System Generator");
generatorGUI.add(generatorParams, 'planets').name('Max Planets/Moons');
generatorGUI.add(generatorParams, 'distanceThreshold', 50, 2000).name('Min Distance');
generatorGUI.add(generatorParams, 'complexity').name('Complexity');
generatorGUI.add(generatorParams, 'probability', 0, 1).name('Probability');
generatorGUI.add(generatorParams, 'randomize').name('Randomize');

// Setup solar system
const systemGenerator = new SystemGenerator(fixedInterval, intervals);
// const distanceThreshold: number = 500;
systemGenerator.randomize(3, generatorParams.distanceThreshold, 1, .2);
let ps = systemGenerator.system;
let _entities = systemGenerator.entities;
let _keplarElementMap = systemGenerator.keplarElementMap;
let sun = systemGenerator.sun;

// Scene Gui
const sceneParams = {
  pauseScene: false,
  showOrbit: true,
  updateOrbit: false,
  addRandomPlanet(){
    ps.backtrack(fixedInterval);
    systemGenerator.addRandomPlanet(generatorParams.distanceThreshold);
    ps.warmup(fixedInterval);
  } 
}
const sceneGUI = gui.addFolder('Scene Controls');
sceneGUI.add( sceneParams, 'pauseScene').name('Pause Scene');
sceneGUI.add( sceneParams, 'showOrbit').name('Show Orbit');
sceneGUI.add( sceneParams, 'updateOrbit').name('Update Orbit');
sceneGUI.add( sceneParams, 'addRandomPlanet').name('Add Random Planet');

// Keplar Elements Gui
let activeEntity: SpatialEntity = null;
const activeKeplarElements: KeplarElements = {
  eccentricity: 0,
  semi_major_axis: 250,
  inclination: 0,
  ascending_node: 0,
  periapsis: 0,
  true_anomaly: 0
}
const keplarGui = gui.addFolder("Keplar Elements");
keplarGui.onChange(() => {
  ps.backtrack(fixedInterval);
  // intervals = 2 * Math.PI * Math.sqrt(Math.pow(activeKeplarElements.semi_major_axis, 3) / (G * sun.mass)) / fixedInterval;
  const stateVectors = keplarToCartesian(sun, 500, activeKeplarElements);
  activeEntity.body.pos.set(stateVectors.pos.x, stateVectors.pos.y, stateVectors.pos.z);
  activeEntity.body.vel.set(stateVectors.vel.x, stateVectors.vel.y, stateVectors.vel.z);
  ps.warmup(fixedInterval);
});
keplarGui.add(activeKeplarElements, 'eccentricity', 0, 1).name('Eccentricity').listen();
keplarGui.add(activeKeplarElements, 'semi_major_axis', 100, 1000).name('Semi-Major Axis').listen();
keplarGui.add(activeKeplarElements, 'inclination', 0, 360).name('Inclination').listen();
keplarGui.add(activeKeplarElements, 'ascending_node', 0, 360).name('Angle of Asc. Node').listen();
keplarGui.add(activeKeplarElements, 'periapsis', 0, 360).name('Periapsis').listen();
keplarGui.add(activeKeplarElements, 'true_anomaly', 0, 360).name('True Anomaly').listen();

ps.warmup(fixedInterval);
updateAllOrbits();
requestAnimationFrame(animate);
setInterval(fixedUpdate, fixedInterval);

function animate() {
  cameraController.update();
  composer.render();
  requestAnimationFrame(animate);
 
};

function updateAllOrbits() {
  for (const entity of _entities) {
    entity.updateOrbit(ps.getPoseHistory(entity.body));
  }
}

function fixedUpdate() {
  for( let entity of _entities ){
    if(sceneParams.updateOrbit){
      entity.updateOrbit(ps.getPoseHistory(entity.body));
    }
    entity.orbit.visible = sceneParams.showOrbit;
  }

  if(sceneParams.pauseScene){
    return;
  }

  ps.accelerateSystem(fixedInterval);
  ps.updateSystem(fixedInterval);
}

// Functions

// function addNewPlanet(mass: number, primaryBody: SpatialBody, keplar: KeplarElements) {
//   const body = ps.constructBodyRelative(mass, primaryBody, keplar);
//   const entity = appendNewEntity(body, createEarthMesh(mass));
//   activeEntity = entity;
//   _keplarElementMap.set(entity, keplar);
//   return entity;
// }

// function createRandomKeplarElements({eccentricity = Math.random(), semi_major_axis = Math.random() * 1000, inclination = Math.random() * Math.PI, ascending_node = Math.random() * Math.PI, periapsis = Math.random() * Math.PI, true_anomaly = Math.random() * Math.PI}): KeplarElements {
//   return {
//     eccentricity,
//     semi_major_axis,
//     inclination,
//     ascending_node,
//     periapsis,
//     true_anomaly,
//   }
// }

// Raycaster to handle selecting planets
function onMouseClick(event: MouseEvent) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(_entities.map(e => e.visual));
  if (intersects.length > 0) {
    const intersect = intersects[0];
    let parent = intersect.object.parent;
    let entity: SpatialEntity;
    while(parent) {
      if (parent.userData.entity) {
        entity = parent.userData.entity;
        break;
      } else { 
        parent = parent.parent;
      }
    }
      
    if (entity) {
      const keplar = _keplarElementMap.get(entity);
      Object.assign(activeKeplarElements, keplar);
      activeEntity = entity;
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}