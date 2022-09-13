import * as THREE from 'three';

export type OnChangeCallback = (x: number, y: number, z: number) => void;

export class SpatialBody {
    private _pos: THREE.Vector3;
    private _vel: THREE.Vector3;
    private _mass: number;

    private static nextId = 0;
    private _id: number;

    private isStationary: boolean;
    public onPositionChange: OnChangeCallback;

    /**
     * Creates an instance of SpacialBody
     * 
     * @param pos
     * @param vel
     * @param mass
     * @param isStationary
     */
    constructor(pos: THREE.Vector3 = new THREE.Vector3(), vel: THREE.Vector3 = new THREE.Vector3(), mass = 1, isStationary = false) {
        this._id = SpatialBody.nextId;
        SpatialBody.nextId++;

        this._pos = pos;
        this._vel = vel;
        this._mass = mass;

        this.isStationary = isStationary;
    }

    public clone(): SpatialBody {
        let newBody = new SpatialBody(this._pos.clone(), this._vel.clone(), this.mass, this.isStationary);
        newBody._id = this._id;
        return newBody;
    }

    /**
     * Applies acceleration to velocity
     * 
     * @param acc Rate of velocity's change
     * @param time in milliseconds
     */
    public accelerate(acc: THREE.Vector3, time: number = 20) {
        if (!this.isStationary){
            acc.multiplyScalar(time);
            this._vel.add(acc);
        }
    }

    /**
     * Applies velocity to position
     * 
     * @param time in milliseconds
     */
    public update(time: number = 20) {
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

    public get vel(): THREE.Vector3 {
        return this._vel;
    }

    public set pos(pos: THREE.Vector3) {
        this._pos = pos;
    }

    public set vel(vel: THREE.Vector3) {
        this._vel = vel;
    }

    public get mass(): number {
        return this._mass;
    }

}
