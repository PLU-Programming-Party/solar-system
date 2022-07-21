import { SpacialBody } from "./SpacialBody";
import { Gravity } from "./GravityConstant";
import { Vector3, Euler } from "three";

export type KeplarElements = {
    eccentricity: number,
    semi_major_axis: number,
    inclination: number,
    ascending_node: number,
    periapsis: number,
    true_anomaly: number
};

export function keplarToCartesian(sb1: SpacialBody, mass: number, elements: KeplarElements): {pos: Vector3, vel: Vector3} {
    const {
        eccentricity: e, 
        semi_major_axis: a, 
        inclination: i, 
        ascending_node: capOmega, 
        periapsis: littleOmega, 
        true_anomaly: f
    } = elements;

    // Standard gravitational parameter
    const mu = Gravity * (sb1.mass + mass);
    // Eccentric Anomaly
    const E = a * (1 - Math.pow(e, 2)) / (1 + e * Math.cos(f));

    const distance = a * (1 - e * Math.cos(E));

    const pos = new Vector3(Math.cos(f), Math.sin(f), 0).multiplyScalar(distance);
    const vel = new Vector3(-Math.sin(E), Math.sqrt(1 - e * e) * Math.cos(E), 0).multiplyScalar(Math.sqrt(mu * a) / distance);

    const xRotation = new Euler(0, 0, -capOmega);
    const yRotation = new Euler(-i, 0, 0);
    const zRotation = new Euler(0, 0, -littleOmega);

    pos.applyEuler(xRotation);
    pos.applyEuler(yRotation);
    pos.applyEuler(zRotation);

    vel.applyEuler(xRotation);
    vel.applyEuler(yRotation);
    vel.applyEuler(zRotation);

    pos.add(sb1.pos);
    vel.add(sb1.vel);
    return {pos, vel};

}

export function specificOrbit(spacialBody1: SpacialBody, spacialBody2: SpacialBody):number{
    //V^2 / 2 - u / r 
    //V - relative orbital speed (diff of spatialBody2 and spatialBody1)
    //u - masses of the bodies multiplied by the gravitational constant
    //r - distance between the two points
    const v = spacialBody2.vel.distanceTo(spacialBody1.vel)
    const u = (spacialBody2.mass + spacialBody1.mass)*Gravity
    const r = spacialBody2.pos.distanceTo(spacialBody1.pos)

    return Math.pow(v, 2) / 2 - u / r;
}