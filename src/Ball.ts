import * as ECS from "./util/ecs/ECS";
import * as THREE from "three";

const ball = new ECS.Entity([new ECS.Transform(0)]);
const transform = ECS.getData(ball, ball.components[0]);
console.log(transform);
const mesh = new ECS.Mesh(0);
ECS.setData(ball, mesh, new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial({ color: 0xffffff })));
ECS.addComponent(ball, mesh);

export default ball; 