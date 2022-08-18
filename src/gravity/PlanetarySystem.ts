import { SpatialBody } from "./SpatialBody";
import * as THREE from 'three';
import G from "./GravityConstant";
import { KeplarElements, keplarToCartesian } from "./GravityCalc";

export class PlanetarySystem {
    private _bodies: SpatialBody[];

    constructor() {
        this._bodies = [];
    }

    public constructBody(mass: number, position: THREE.Vector3, velocity: THREE.Vector3, isStationary: boolean): SpatialBody {
        const body = new SpatialBody(position, velocity, mass, isStationary);
        this.addBody(body);
        return body;
    }

    public constructBodyRelative(mass: number, relativeBody: SpatialBody, elements: KeplarElements): SpatialBody{
        const {pos, vel} = keplarToCartesian(relativeBody, mass, elements);
        return this.constructBody(mass, pos, vel, false);
    }

    clone(): PlanetarySystem {
        let newSystem = new PlanetarySystem();
        for (const body of this._bodies)
            newSystem.addBody(body.clone());
        return newSystem;
    }

    public predictPath(body: SpatialBody, time: number, count: number): THREE.Vector3[] {
        let clonedSystem = this.clone();

        let clonedBody = clonedSystem._bodies.filter(b => b.id === body.id)[0];

        let positions: THREE.Vector3[] = [];

        positions.push(clonedBody.pos.clone());
        for (let i = 0; i < count; i++) {
            clonedSystem.accelerateSystem(time);
            clonedSystem.updateSystem(time);
            positions.push(clonedBody.pos.clone());
        }

        return positions;
    }

    /**
     * Calculates force and acceleration
     * of each body in system
     */
    public accelerateSystem(time: number) {
        for (const body of this._bodies) {
            let netForce = new THREE.Vector3();
            for (const compareBody of this._bodies) {
                if (body.id !== compareBody.id) {
                    // Calculate force magnitude G * m1 * m2 / r^2
                    let force = G * body.mass * compareBody.mass / Math.pow(body.pos.distanceTo(compareBody.pos), 2);
                    
                    // Calculate force vector direction
                    let direction = compareBody.pos.clone();
                    direction.sub(body.pos);
                    direction.normalize();
                    
                    let forceVector = direction.clone()
                    forceVector.multiplyScalar(force);
                    netForce.add(forceVector);
                }
            }

            // Calculate acceleration a = F / m
            let acc = netForce.clone();
            acc.divideScalar(body.mass);

            body.accelerate(acc, time);
        }
    }

    /**
     * Calls update function for each body
     */
    public updateSystem(time: number) {
        for (const sb of this._bodies) {
            sb.update(time);
            sb.onPositionChange?.(sb.pos.x, sb.pos.y, sb.pos.z);
        }
    }

    addBody(body: SpatialBody) {
        this._bodies.push(body);
    } 
}