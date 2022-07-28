import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import camera from './Camera';
import renderer from './Renderer';
const cameraController = new OrbitControls(camera, renderer.domElement);
export default cameraController