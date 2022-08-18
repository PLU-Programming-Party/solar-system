import { SpatialBody } from "./SpatialBody";
import G from "./GravityConstant";
import { Vector3, Euler } from "three";

export type KeplarElements = {
    eccentricity: number,
    semi_major_axis: number,
    inclination: number,
    ascending_node: number,
    periapsis: number,
    true_anomaly: number
};

export function keplarToCartesian(centralBody: SpatialBody, mass: number, elements: KeplarElements): {pos: Vector3, vel: Vector3} {
    const {
        eccentricity: e, 
        semi_major_axis: a, 
    } = elements;

    const i = elements.inclination * Math.PI / 180;
    const capOmega = elements.ascending_node * Math.PI / 180;
    const littleOmega = elements.periapsis * Math.PI / 180;
    const f = elements.true_anomaly * Math.PI / 180;

    // Standard gravitational parameter
    const mu = G * (centralBody.mass);
    // Eccentric Anomaly
    const E = Math.atan2(Math.sqrt(1 - e * e) * Math.sin(f), e + Math.cos(f));

    const distance = a * (1 - e * Math.cos(E));

    const pos = new Vector3(Math.cos(f), Math.sin(f), 0).multiplyScalar(distance);
    const vel = new Vector3(-Math.sin(E), Math.sqrt(1 - e * e) * Math.cos(E), 0).multiplyScalar(Math.sqrt(mu * a) / distance);

    const xRotation = new Euler(0, 0, capOmega);
    const yRotation = new Euler(i, 0, 0);
    const zRotation = new Euler(0, 0, littleOmega);

    pos.applyEuler(zRotation);
    pos.applyEuler(yRotation);
    pos.applyEuler(xRotation);

    vel.applyEuler(zRotation);
    vel.applyEuler(yRotation);
    vel.applyEuler(xRotation);

    pos.add(centralBody.pos);
    vel.add(centralBody.vel);
    return {pos, vel};
}

export function specificOrbit(spatialBody1: SpatialBody, spatialBody2: SpatialBody):number{
    //V^2 / 2 - u / r 
    //V - relative orbital speed (diff of spatialBody2 and spatialBody1)
    //u - masses of the bodies multiplied by the gravitational constant
    //r - distance between the two points
    const v = spatialBody2.vel.distanceTo(spatialBody1.vel)
    const u = (spatialBody2.mass + spatialBody1.mass)*G
    const r = spatialBody2.pos.distanceTo(spatialBody1.pos)

    return Math.pow(v, 2) / 2 - u / r;
}
