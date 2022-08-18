import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

import renderer from './Renderer';
import scene from './Scene';
import camera from './Camera';

import gui from './GUI';

import { Vector2 } from 'three';

// Post-Processing Parameters
const pp = {
    exposure: 1,
    threshold: 0,
    bloomStrength: 1.5,
    bloomRadius: 0
  }
  
  // Post proc setup
  const composer = new EffectComposer(renderer);
  export default composer;

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  
  const bloomPass = new UnrealBloomPass( new Vector2(window.innerWidth, window.innerHeight), pp.bloomStrength, pp.bloomRadius, pp.threshold);
  renderer.toneMappingExposure = Math.pow(pp.exposure, 4);
  composer.addPass(bloomPass);
  
  const ppGUI = gui.addFolder('Post-Processing Effects');
  ppGUI.add( pp, 'exposure', 0, 2).name('Exposure').onChange((val: number) => {
    renderer.toneMappingExposure = Math.pow(val, 4);
  });
  ppGUI.add( pp, 'threshold', 0, 1).name('Threshold').onChange((val: number) => {
    bloomPass.threshold = val;
  });
  ppGUI.add( pp, 'bloomStrength', 0, 3).name('Bloom Strength').onChange((val: number) => {
    bloomPass.strength = val;
  });
  ppGUI.add( pp, 'bloomRadius', 0, 1).name('Bloom Radius').onChange((val: number) => {
    bloomPass.radius = val;
  });