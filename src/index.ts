import * as _ from 'lodash';
import * as THREE from 'three';
import scene from './Scene';
import camera from './Camera';
import { PlanetarySystem } from './gravity/PlanetarySystem';
import gui from './GUI';
import { KeplarElements, keplarToCartesian } from './gravity/GravityCalc';
import { SpatialBody } from './gravity/SpatialBody';
import cameraController from './CameraControls';
import composer from './Composer';
import G from './gravity/GravityConstant';
import { createOrbitPath, createEarthMesh, createStarField, createSunMesh, OrbitUpdater } from './render/PlanetaryRenderer';

type SpatialEntity = {
  body: SpatialBody,
  visual: THREE.Group,
  orbit: THREE.Group,
  updateOrbit: OrbitUpdater
}

const _entities: SpatialEntity[] = [];

//TODO: Create a more comprehensive testing suite

function configureGUI(){
  //TODO: refactor GUI
}

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

const keplarElements: KeplarElements = {
  eccentricity: 0,
  semi_major_axis: 250,
  inclination: 0,
  ascending_node: 0,
  periapsis: 0,
  true_anomaly: 0
};

function appendNewEntity(body: SpatialBody, group: THREE.Group): SpatialEntity {
  scene.add(group);
  body.onPositionChange = (x,y,z) => group.position.set(x,y,z);
  let simulation = ps.predictPath(body, fixedInterval, intervals);
  const [orbit, updateOrbit] = createOrbitPath(simulation);
  scene.add(orbit);
  const entity: SpatialEntity = {
    body,
    visual: group,
    orbit,
    updateOrbit
  }
  _entities.push(entity);
  return entity;
}

const sunMass = 10000;
const sun = ps.constructBody(sunMass, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true);
appendNewEntity(sun, createSunMesh(sunMass));

const earthMass = 500;
const earth = ps.constructBodyRelative(earthMass, sun, keplarElements);
appendNewEntity(earth, createEarthMesh(earthMass));

scene.add(createStarField(Math.random(), 10));


const fixedInterval = 20; // Interval time in milliseconds
let intervals = 2 * Math.PI * Math.sqrt(Math.pow(keplarElements.semi_major_axis, 3) / (G * sun.mass)) / fixedInterval;

const keplarGui = gui.addFolder("Keplar Elements");
keplarGui.onChange(() => {
  intervals = 2 * Math.PI * Math.sqrt(Math.pow(keplarElements.semi_major_axis, 3) / (G * sun.mass)) / fixedInterval;
  const stateVectors = keplarToCartesian(sun, 500, keplarElements);
  earth.pos.set(stateVectors.pos.x, stateVectors.pos.y, stateVectors.pos.z);
  earth.vel.set(stateVectors.vel.x, stateVectors.vel.y, stateVectors.vel.z);
})
keplarGui.add(keplarElements, 'eccentricity', 0, 1).name('Eccentricity');
keplarGui.add(keplarElements, 'semi_major_axis', 100, 1000).name('Semi-Major Axis');
keplarGui.add(keplarElements, 'inclination', 0, 360).name('Inclination');
keplarGui.add(keplarElements, 'ascending_node', 0, 360).name('Angle of Asc. Node');
keplarGui.add(keplarElements, 'periapsis', 0, 360).name('Periapsis');
keplarGui.add(keplarElements, 'true_anomaly', 0, 360).name('True Anomaly');

let ambient = new THREE.AmbientLight(0x333333);

scene.add(ambient);
camera.position.set(0, 0, 500);
camera.lookAt(0,0,0); 

//animation frame for cube
function animate() {
  cameraController.update();

  composer.render();
  requestAnimationFrame(animate);
 
};

function fixedUpdate() {

  for( let entity of _entities ){
    if(sceneParams.updateOrbit){
      entity.updateOrbit(ps.predictPath(entity.body, fixedInterval, intervals));
    }
    entity.orbit.visible = sceneParams.showOrbit;
  }

  if(sceneParams.pauseScene){
    return;
  }

  ps.accelerateSystem(fixedInterval);
  ps.updateSystem(fixedInterval);
}

requestAnimationFrame(animate);
setInterval(fixedUpdate, fixedInterval);
