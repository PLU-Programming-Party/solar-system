import * as ECS from "./util/ecs/ECS";
import * as THREE from "three";

const ball = new ECS.Entity([ECS.TRANSFORM]);
const transform = ECS.getData(ball, ball.components[0]);
console.log(transform);
const mesh = ECS.MESH;
ECS.setData(ball, mesh, new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial({ color: 0xffffff })));
ECS.addComponent(ball, mesh);

export default ball; 