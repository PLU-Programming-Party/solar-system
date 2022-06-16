import * as _ from 'lodash';
import * as THREE from 'three';
import cube from './Cubes';
import scene from './Scene';
import camera from './Camera';
import renderer from './Renderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { SpacialBody } from './gravity/SpacialBody';
import { PlanetarySystem } from './gravity/PlanetarySystem';
import { AmbientLight, LineBasicMaterial, PointLight } from 'three';

let sun = new SpacialBody(
	new THREE.Vector3(),
	undefined,
	696340000,
	1410,
	true
);

let earth = new SpacialBody(
	new THREE.Vector3(150000000000, 0, 0),
	new THREE.Vector3(0, 29800, 0),
	6371000,
	5510
);

let moon = new SpacialBody(
  new THREE.Vector3(150000000000 + 384400000, 0, 0),
  new THREE.Vector3(0, 29800 + 1022, 0),
  1737400,
  3340
)

let ps = new PlanetarySystem();
ps.addBody(earth);
ps.addBody(sun);
ps.addBody(moon);

let startTime = performance.now();

let scale = 0.0000000001;
let timeScale = 60 * 60 * 24;

let radiusScale = scale * 10;
let radiusScaleSun = scale * 50;

const sunMesh = new THREE.Mesh(new THREE.SphereGeometry(sun.radius * radiusScaleSun, 32, 16), new THREE.MeshBasicMaterial({ color: 0xFFFF00 }));
const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(earth.radius * radiusScale, 32, 16), new THREE.MeshPhongMaterial({ color: 0x0000ff }));
const moonMesh = new THREE.Mesh(new THREE.SphereGeometry(moon.radius * radiusScale, 32, 16), new THREE.MeshPhongMaterial({ color: 0x888888 }));

let light = new PointLight(0xFFFFFF);
light.position.set(sun.pos.x, sun.pos.y, sun.pos.z);

let ambient = new AmbientLight(0x333333);

let simulation = ps.predictPath(earth, timeScale / 1000, 365 * 1000).map(p => p.multiplyScalar(scale));
const material = new LineBasicMaterial({color:0xff0000});
const geometry = new THREE.BufferGeometry().setFromPoints(simulation);
const line = new THREE.Line(geometry, material);

scene.add(sunMesh);
scene.add(earthMesh);
scene.add(moonMesh);
scene.add(light);
scene.add(ambient);
scene.add(line);
camera.position.set(0, 0, 20);
camera.lookAt(0,0,0); 

let controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;


//animation frame for cube
function animate() {
  requestAnimationFrame( animate );

  let endTime = performance.now();

  let delta = (endTime - startTime) / 1000;

  startTime = endTime;

  ps.accelerateSystem(delta * timeScale);
  ps.updateSystem(delta * timeScale);
  
  controls.update();

  sunMesh.position.set(sun.pos.x, sun.pos.y, sun.pos.z);
  earthMesh.position.set(earth.pos.x * scale, earth.pos.y * scale, earth.pos.z * scale);
  moonMesh.position.set(moon.pos.x * scale, moon.pos.y * scale, moon.pos.z * scale);

  renderer.render( scene, camera );
};
animate();
/*
function component() {
    const element = document.createElement('div');

    element.innerHTML = _.join(['Hello', 'webpack'], ' ');

    return element;
  }

  document.body.appendChild(component());
  */