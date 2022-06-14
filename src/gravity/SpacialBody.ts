import * as THREE from 'three';
export class SpacialBody {
    private _pos: THREE.Vector3; // m
    private _vel: THREE.Vector3; // m/s
    private _radius: number; // m
    
    private _mass: number; // kg

    private static nextId = 0;
    private _id: number;

    private isStationary: boolean;

    /**
     * Creates an instance of SpacialBody
     * 
     * @param pos          xyz in meters
     * @param vel          xyz in m/s
     * @param radius       distance from center to edge in meters
     * @param density      kg / m^3
     * @param isStationary Does the body stay in the same location
     */
    constructor(pos: THREE.Vector3 = new THREE.Vector3(), vel: THREE.Vector3 = new THREE.Vector3(), radius = 1, density = 3000, isStationary = false) {
        this._id = SpacialBody.nextId;
        SpacialBody.nextId++;

        this._pos = pos;
        this._vel = vel;
        this._radius = radius;

        // Calculate Mass
        let volume = 4 * Math.PI * Math.pow(radius, 3) / 3;
        this._mass = volume * density;

        this.isStationary = isStationary;
    }

    /**
     * Applies acceleration to velocity
     * 
     * @param acc Rate of velocity's change // m/s^2
     * @param time in seconds
     */
    public accelerate(acc: THREE.Vector3, time: number = 1) {
        if (!this.isStationary){
            acc.multiplyScalar(time);
            this._vel.add(acc);
        }
    }

    /**
     * Applies velocity to position
     * 
     * @param time in seconds
     */
    public update(time: number = 1) {
        if (!this.isStationary) {
            let delta = this._vel.clone();
            delta.multiplyScalar(time);
            this._pos.add(delta);
        }
    }

    public get id(): number {
        return this._id;
    }
 
    public get pos(): THREE.Vector3 {
        return this._pos;
    }

    public get mass(): number {
        return this._mass;
    }

    public get radius(): number {
        return this._radius;
    }

}
