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
const _keplarElementMap = new Map<SpatialEntity, KeplarElements>();

//TODO: Live update keplar elements
//TODO: Create a more comprehensive testing suite

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

let activeEntity: SpatialEntity = null;
const activeKeplarElements: KeplarElements = {
  eccentricity: 0,
  semi_major_axis: 250,
  inclination: 0,
  ascending_node: 0,
  periapsis: 0,
  true_anomaly: 0
}

const earthElements: KeplarElements = {...activeKeplarElements};

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
  group.userData.entity = entity;
  _entities.push(entity);
  return entity;
}

const sunMass = 10000;
const sun = ps.constructBody(sunMass, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true);
appendNewEntity(sun, createSunMesh(sunMass));

const earthMass = 500;
const earth = ps.constructBodyRelative(earthMass, sun, earthElements);
const earthEntity = appendNewEntity(earth, createEarthMesh(earthMass));
activeEntity = earthEntity;
_keplarElementMap.set(earthEntity, earthElements);

const xanElements: KeplarElements = {
  eccentricity: 0,
  semi_major_axis: 400,
  inclination: 0,
  ascending_node: 0,
  periapsis: 0,
  true_anomaly: 0
};

const xanMass = 750;
const xan = ps.constructBodyRelative(xanMass, sun, xanElements);
const xanEntity = appendNewEntity(xan, createEarthMesh(xanMass));
_keplarElementMap.set(xanEntity, xanElements);

scene.add(createStarField(Math.random(), 10));

const fixedInterval = 20; // Interval time in milliseconds
let intervals = 2 * Math.PI * Math.sqrt(Math.pow(activeKeplarElements.semi_major_axis, 3) / (G * sun.mass)) / fixedInterval;

const keplarGui = gui.addFolder("Keplar Elements");
keplarGui.onChange(() => {
  intervals = 2 * Math.PI * Math.sqrt(Math.pow(activeKeplarElements.semi_major_axis, 3) / (G * sun.mass)) / fixedInterval;
  const stateVectors = keplarToCartesian(sun, 500, activeKeplarElements);
  activeEntity.body.pos.set(stateVectors.pos.x, stateVectors.pos.y, stateVectors.pos.z);
  activeEntity.body.vel.set(stateVectors.vel.x, stateVectors.vel.y, stateVectors.vel.z);
})
keplarGui.add(activeKeplarElements, 'eccentricity', 0, 1).name('Eccentricity').listen();
keplarGui.add(activeKeplarElements, 'semi_major_axis', 100, 1000).name('Semi-Major Axis').listen();
keplarGui.add(activeKeplarElements, 'inclination', 0, 360).name('Inclination').listen();
keplarGui.add(activeKeplarElements, 'ascending_node', 0, 360).name('Angle of Asc. Node').listen();
keplarGui.add(activeKeplarElements, 'periapsis', 0, 360).name('Periapsis').listen();
keplarGui.add(activeKeplarElements, 'true_anomaly', 0, 360).name('True Anomaly').listen();

let ambient = new THREE.AmbientLight(0x333333);

scene.add(ambient);
camera.position.set(0, 0, 500);
camera.lookAt(0,0,0); 

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

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

window.addEventListener('click', onMouseClick);

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
