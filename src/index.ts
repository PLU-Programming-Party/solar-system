import * as _ from 'lodash';
import * as THREE from 'three';
import cube from './Cubes';
import scene from './Scene';
import camera from './Camera';
import renderer from './Renderer';

scene.add(cube);
camera.position.set(0, 0, 10);
camera.lookAt(0,0,0); 

//animation frame for cube
function animate() {
  requestAnimationFrame( animate );

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render( scene, camera );
};
animate();