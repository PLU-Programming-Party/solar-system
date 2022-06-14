import { SpacialBody } from "./SpacialBody";
import * as THREE from 'three';
export class PlanetarySystem {
    private static readonly G = 6.67 * Math.pow(10, -11); // N * m^2 / kg^2

    private _bodies: SpacialBody[];

    /**
     * Creates instance of PlanetarySystem
     */
    constructor() {
        this._bodies = [];
    }

    /**
     * Calculates force and acceleration
     * of each body in system
     */
    public accelerateSystem() {
        for (const body of this._bodies){
            let netForce = new THREE.Vector3();
            for (const compareBody of this._bodies) {
                if (body.id !== compareBody.id) {
                    // Calculate force magnitude G * m1 * m2 / r^2
                    let force = PlanetarySystem.G * body.mass * compareBody.mass / Math.pow(body.pos.distanceTo(compareBody.pos), 2);
                    
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

            body.accelerate(acc);
        }
    }

    /**
     * Calls update function for each body
     */
    public updateSystem() {
        for (const sb of this._bodies)
            sb.update();
    }

    public addBody(body: SpacialBody) {
        this._bodies.push(body);
    }
    
}