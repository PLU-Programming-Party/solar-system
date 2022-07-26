import { SpacialBody } from "./SpacialBody";
import * as THREE from 'three';
import G from "./GravityConstant";
export type entity = {
    body: SpacialBody,
    mesh: THREE.Mesh
}
export class PlanetarySystem {
    private _bodies: entity[];

    /**
     * Creates instance of PlanetarySystem
     */
    constructor() {
        this._bodies = [];
    }

    public constructCentralBody(mass: number) {
        const centralBody = new SpacialBody(new THREE.Vector3(), undefined, mass, true);
        
        const geometry = new THREE.SphereGeometry(Math.pow(mass, 1/3), 32, 16);
        const material = new THREE.MeshBasicMaterial( { color: 0x9D00FF } );

        const body = {
            body: centralBody,
            mesh: new THREE.Mesh(geometry, material)
        };
        
        this.addBody(body);
        return body;
    }

    earthNormalTexture = new THREE.TextureLoader().load('assets/earth_normal.jpg')

    public constructPlanetaryBody(distance: number, mass: number, orbitBody: SpacialBody) {
        const pos = (new THREE.Vector3(distance, 0, 0)).add(orbitBody.pos);
        const vel = (new THREE.Vector3(0, Math.sqrt(G * orbitBody.mass / Math.abs(distance)), 0)).add(orbitBody.vel);
        const planetaryBody = new SpacialBody(pos, vel, mass);
        
        const geometry = new THREE.SphereGeometry(Math.pow(mass, 1/3), 32, 16);
        const material = new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff } );
        material.normalMap = this.earthNormalTexture;
        material.normalScale = new THREE.Vector2(10, 10);
        material.shininess = 0;

        const body = {
            body: planetaryBody,
            mesh: new THREE.Mesh(geometry, material)
        };
        
        this.addBody(body);
        return body;
    }

    public clone(): PlanetarySystem {
        let newSystem = new PlanetarySystem();
        for (const body of this._bodies)
            newSystem.addBody({ body: body.body.clone(), mesh: body.mesh.clone()});
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

    public addMeshes(scene: THREE.Scene) {
        for (const sb of this._bodies)
            scene.add(sb.mesh);
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
        for (const sb of this._bodies)
            sb.body.update(time);
    }

    public meshUpdate() {
        for (const sb of this._bodies)
            sb.mesh.position.set(sb.body.pos.x, sb.body.pos.y, sb.body.pos.z);
    }

    public addBody(body: entity) {
        this._bodies.push(body);
    }
    
}