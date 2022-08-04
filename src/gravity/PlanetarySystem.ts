import { SpacialBody } from "./SpacialBody";
import * as THREE from 'three';
import G from "./GravityConstant";
import { KeplarElements, keplarToCartesian } from "./GravityCalc";

export type OnChangeCallback = (x: number, y: number, z: number) => void;

export type entity = {
    body: SpacialBody,
    onPositionChange: OnChangeCallback
}

export class PlanetarySystem {
    private _bodies: entity[];

    constructor() {
        this._bodies = [];
    }
    // TODO: NO MORE ENTITIES! USE SPACIALBODY INSTEAD

    public constructBody(mass: number, position: THREE.Vector3, velocity: THREE.Vector3, isStationary: boolean, onPositionChange: OnChangeCallback): entity {
        const body = new SpacialBody(position, velocity, mass, isStationary);

        const bodyEntity = {
            body,
            onPositionChange
        };

        this.addBody(bodyEntity);
        return bodyEntity;
    }

    public constructBodyRelative(mass: number, relativeBody: SpacialBody, elements: KeplarElements, onPositionChange: OnChangeCallback): entity{
        const {pos, vel} = keplarToCartesian(relativeBody, mass, elements);
        return this.constructBody(mass, pos, vel, false, onPositionChange);
    }

    clone(): PlanetarySystem {
        let newSystem = new PlanetarySystem();
        for (const body of this._bodies)
            newSystem.addBody({ body: body.body.clone(), onPositionChange: null });
        return newSystem;
    }

    public predictPath(body: SpacialBody, time: number, count: number): THREE.Vector3[] {
        let clonedSystem = this.clone();

        let clonedBody = clonedSystem._bodies.filter(b => b.body.id === body.id)[0].body;

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
        for (const current of this._bodies) {
            const body = current.body;
            let netForce = new THREE.Vector3();
            for (const compare of this._bodies) {
                const compareBody = compare.body;
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
            sb.body.update(time);
            sb.onPositionChange?.(sb.body.pos.x, sb.body.pos.y, sb.body.pos.z);
        }
    }

    addBody(body: entity) {
        this._bodies.push(body);
    } //TODO: UpdateBodyRelative instead of addBody. 
}

//garbage.txt

    // Texturing mesh
    //earthNormalTexture = new THREE.TextureLoader().load('assets/earth_normal.jpg')
    // const geometry = new THREE.SphereGeometry(Math.pow(mass, 1/3), 32, 16);
        // const material = new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff } );
        // material.normalMap = this.earthNormalTexture;
        // material.normalScale = new THREE.Vector2(10, 10);
        // material.shininess = 0;