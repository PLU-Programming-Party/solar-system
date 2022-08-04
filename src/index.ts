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
import { createEarthMesh, createStarField, createSunMesh } from './render/PlanetaryRenderer';


//TODO: Create a more comprehensive testing suite

function configureGUI(){
  //TODO: add gui for scene params
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

function addBodyToScene(body: SpatialBody, group: THREE.Group) {
  scene.add(group);
  body.onPositionChange = (x,y,z) => group.position.set(x,y,z);
}

const sunMass = 10000;
const sun = ps.constructBody(sunMass, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true);
addBodyToScene(sun, createSunMesh(sunMass));

const earthMass = 500;
const earth = ps.constructBodyRelative(earthMass, sun, keplarElements);
addBodyToScene(earth, createEarthMesh(earthMass));

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
  // camera.position.set(earth.pos.x, earth.pos.y, .2);
  cameraController.update();

  composer.render();
  requestAnimationFrame(animate);
 
};

function createOrbitPath(pBody: SpatialBody, ps: PlanetarySystem, intervals: number, fixedInterval: number) {
  let simulation = ps.predictPath(pBody, fixedInterval, intervals);
  const material = new THREE.LineBasicMaterial({color: 0x999999});
  const geometry = new THREE.BufferGeometry().setFromPoints(simulation);
  const line = new THREE.Line(geometry, material);
  return line;
}

const sunOrbit = createOrbitPath(sun, ps, intervals, fixedInterval);
scene.add(sunOrbit);

const earthOrbit = createOrbitPath(earth, ps, intervals, fixedInterval);
scene.add(earthOrbit);

function fixedUpdate() {

  if(sceneParams.updateOrbit){
    sunOrbit.geometry.setFromPoints(ps.predictPath(sun, fixedInterval, intervals));
    earthOrbit.geometry.setFromPoints(ps.predictPath(earth, fixedInterval, intervals));
  }

  if(sceneParams.showOrbit){
    sunOrbit.visible = true;
    earthOrbit.visible = true;
  } else {
    sunOrbit.visible = false;
    earthOrbit.visible = false;
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
