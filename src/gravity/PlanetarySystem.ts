import { SpatialBody } from "./SpatialBody";
import * as THREE from 'three';
import G from "./GravityConstant";
import { KeplarElements, keplarToCartesian } from "./GravityCalc";

export class PlanetarySystem {
    private _bodies: SpatialBody[];
    private _poseHistory: Map<SpatialBody, THREE.Vector3[]>;
    private _historyCounter: number;

    constructor(private historySize: number = 10000, private historyPrecision: number = 10) {
        this._bodies = [];
        this._poseHistory = new Map<SpatialBody, THREE.Vector3[]>();
        this._historyCounter = 0;
    }

    public constructBody(mass: number, position: THREE.Vector3, velocity: THREE.Vector3, isStationary: boolean): SpatialBody {
        const body = new SpatialBody(position, velocity, mass, isStationary);
        this.addBody(body);
        this._poseHistory.set(body, [body.pos.clone()]);
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

    public backtrack(fixedUpdateTime: number) {
        for (const body of this._bodies) {
            const history = this._poseHistory.get(body);
            if (history.length > 0) {
                const firstPos = history[0];
                const secondPos = (history.length > 1) ? history[1] : body.pos;
                const vel = secondPos.clone().sub(firstPos).divideScalar(fixedUpdateTime);

                body.pos = firstPos;
                body.vel = vel;
                this._poseHistory.set(body, [body.pos.clone()]);
            }
        }
    }

    public warmup(time: number) {
        for (let i = 0; i < this.historySize; i++) {
            this.accelerateSystem(time);
            this.updateSystem(time);
        }
    }

    public getPoseHistory(body: SpatialBody) {
        return this._poseHistory.get(body);
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
                    const distance = body.pos.distanceTo(compareBody.pos);
                    let force = G * body.mass * compareBody.mass /  (distance * distance);
                    
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
            this._poseHistory.get(sb).push(sb.pos.clone());
            if(this._poseHistory.get(sb).length > this.historySize) {
                this._poseHistory.get(sb).shift();
            }
            const oldestPosition = this._poseHistory.get(sb)[0];
            sb.onPositionChange?.(oldestPosition.x, oldestPosition.y, oldestPosition.z);
        }
    }

    addBody(body: SpatialBody) {
        this._bodies.push(body);
    } 
}