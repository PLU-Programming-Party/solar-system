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
import { createOrbitPath, createEarthMesh, createStarField, createSunMesh, OrbitUpdater } from './render/PlanetaryRenderer';
import skyBox from './Skybox';

const vertexShader = require('./shaders/atmosphere_vert.glsl');
const fragmentShader = require('./shaders/atmosphere_frag.glsl');

// const box = new THREE.Mesh(
//   new THREE.SphereGeometry(25, 32, 32),
//   new THREE.ShaderMaterial({
//     vertexShader,
//     fragmentShader,
//     uniforms: {
//       texture: {
//         value: new THREE.TextureLoader().load('assets/earth.jpg')
//       }
//     }
//   })
// );

const box = new THREE.Mesh(
  new THREE.SphereGeometry(25, 32, 32),
  new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load('assets/earth.jpg'),
    side: THREE.DoubleSide,
    normalMap: new THREE.TextureLoader().load('assets/earth_normal.jpg'),
  })
);

box.position.set(250, 0, 0);
scene.add(box);

const atmosphere = new THREE.Mesh(
  new THREE.SphereGeometry(25, 32, 32),
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
      viewVector: { value: new THREE.Vector3() },
      color: { value: new THREE.Color(0x2084ff) },
      brightness: { value: 0.5 },
    }
  })
);

atmosphere.scale.set(1.15, 1.15, 1.15);
atmosphere.position.set(250, 0, 0);
scene.add(atmosphere);

const sunGlow = new THREE.Mesh(
  new THREE.SphereGeometry(25, 32, 32),
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    uniforms: {
      viewVector: { value: new THREE.Vector3() },
      color: { value: new THREE.Color(0xffffaa) },
      brightness: { value: 0.3 },
    }
  })
);

sunGlow.position.set(0, 0, 0);
scene.add(sunGlow);


//TODO: Live update keplar elements
//TODO: Create a more comprehensive testing suite

type SpatialEntity = {
  body: SpatialBody,
  visual: THREE.Group,
  orbit: THREE.Group,
  updateOrbit: OrbitUpdater
}

// Globals
const _entities: SpatialEntity[] = [];
const _keplarElementMap = new Map<SpatialEntity, KeplarElements>(); 
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let ps = new PlanetarySystem();

// Create central body of system
const sunMass = 10000;
const sun = ps.constructBody(sunMass, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0), true);
appendNewEntity(sun, createSunMesh(sunMass));

// Main GUI setup 
const sceneParams = {
  pauseScene: false,
  showOrbit: true,
  updateOrbit: true,
  addRandomPlanet(){
    addNewPlanet(Math.random() * 100, sun, createRandomKeplarElements({eccentricity: 0, inclination: 0}));
  } 
}

const sceneGUI = gui.addFolder('Scene Controls');
sceneGUI.add( sceneParams, 'pauseScene').name('Pause Scene');
sceneGUI.add( sceneParams, 'showOrbit').name('Show Orbit');
sceneGUI.add( sceneParams, 'updateOrbit').name('Update Orbit');
sceneGUI.add( sceneParams, 'addRandomPlanet').name('Add Random Planet');

// Setup solar system
let activeEntity: SpatialEntity = null;
const activeKeplarElements: KeplarElements = {
  eccentricity: 0,
  semi_major_axis: 250,
  inclination: 0,
  ascending_node: 0,
  periapsis: 0,
  true_anomaly: 0
}

const earthMass = 500;
addNewPlanet(earthMass, sun, createRandomKeplarElements({eccentricity: 0, semi_major_axis: 250, inclination: 0}));

const xanMass = 750;
addNewPlanet(xanMass, sun, createRandomKeplarElements({eccentricity: 0, semi_major_axis: 400, inclination: 0}));

scene.add(createStarField(Math.random(), 10));
scene.add(skyBox);

// General Scene Setup
let ambient = new THREE.AmbientLight(0x333333);

scene.add(ambient);
camera.position.set(0, 0, 500);
camera.lookAt(0,0,0); 

// Keplar GUI folder
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

// other stuff
window.addEventListener('click', onMouseClick);
window.addEventListener('resize', onWindowResize);
requestAnimationFrame(animate);
setInterval(fixedUpdate, fixedInterval);

function animate() {
  let atmosPosition = new THREE.Vector3();
  atmosphere.getWorldPosition(atmosPosition);
  let viewVector = new THREE.Vector3().subVectors( camera.position, atmosPosition);
  atmosphere.material.uniforms.viewVector.value = viewVector;

  let sunGlowPosition = new THREE.Vector3();
  sunGlow.getWorldPosition(sunGlowPosition);
  let sunGlowViewVector = new THREE.Vector3().subVectors( camera.position, sunGlowPosition);
  sunGlow.material.uniforms.viewVector.value = sunGlowViewVector;

  cameraController.update();
  renderer.render(scene, camera);//composer.render();
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

// Functions

function addNewPlanet(mass: number, primaryBody: SpatialBody, keplar: KeplarElements) {
  const body = ps.constructBodyRelative(mass, primaryBody, keplar);
  const entity = appendNewEntity(body, createEarthMesh(mass));
  activeEntity = entity;
  _keplarElementMap.set(entity, keplar);
  return entity;
}

function createRandomKeplarElements({eccentricity = Math.random(), semi_major_axis = Math.random() * 1000, inclination = Math.random() * Math.PI, ascending_node = Math.random() * Math.PI, periapsis = Math.random() * Math.PI, true_anomaly = Math.random() * Math.PI}): KeplarElements {
  return {
    eccentricity,
    semi_major_axis,
    inclination,
    ascending_node,
    periapsis,
    true_anomaly,
  }
}

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