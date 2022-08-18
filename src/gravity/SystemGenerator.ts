import { OrbitUpdater } from "../render/PlanetaryRenderer";
import { PlanetarySystem } from "./PlanetarySystem";
import { SpatialBody } from "./SpatialBody";
import { KeplarElements, keplarToCartesian } from '../gravity/GravityCalc';
import * as THREE from 'three';
import scene from '../Scene';
import { createOrbitPath, createEarthMesh, createSunMesh } from '../render/PlanetaryRenderer';
import { random } from "lodash";

type SpatialEntity = {
    body: SpatialBody,
    visual: THREE.Group,
    orbit: THREE.Group,
    updateOrbit: OrbitUpdater
}

export class SystemGenerator {
    private _system: PlanetarySystem;
    private _entities: SpatialEntity[];
    private _keplarElementMap: Map<SpatialEntity, KeplarElements>;

    public constructor(private fixedInterval: number, private intervals: number) {
        this._system = new PlanetarySystem();
        this._entities = [];
        this._keplarElementMap = new Map<SpatialEntity, KeplarElements>();
    }

    public randomize(complexity = 0, planetCount = 10, moonProbability = .1, distanceThreshold = 100) {
        this._system = new PlanetarySystem();
        this._entities = [];
        this._keplarElementMap = new Map<SpatialEntity, KeplarElements>();
        
        const sunMass = 10000;
        const sun = this._system.constructBody(sunMass, undefined, undefined, true);
        const mesh = createSunMesh(sunMass);
        this.appendNewEntity(sun, mesh);
    
        for (let i = 1; i <= planetCount; i++) {
            const randomElements = createRandomKeplarElements({eccentricity: 0, semi_major_axis: i * distanceThreshold});
            const randomMass = Math.random() * 400 + 100;
            this.addNewPlanet(randomMass, sun, randomElements);
        }

    }

    public get system(): PlanetarySystem {
        return this._system;
    }

    public appendNewEntity(body: SpatialBody, group: THREE.Group): SpatialEntity {
        scene.add(group);
        body.onPositionChange = (x, y, z) => group.position.set(x, y, z);
        let simulation = this._system.predictPath(body, this.fixedInterval, this.intervals);
        const [orbit, updateOrbit] = createOrbitPath(simulation);
        scene.add(orbit);
        const entity: SpatialEntity = {
          body,
          visual: group,
          orbit,
          updateOrbit
        };
        group.userData.entity = entity;
        this._entities.push(entity);
        return entity;
    }

    public addNewPlanet(mass: number, primaryBody: SpatialBody, keplar: KeplarElements) {
      const body = this._system.constructBodyRelative(mass, primaryBody, keplar);
      const entity = this.appendNewEntity(body, createEarthMesh(mass));
      this._keplarElementMap.set(entity, keplar);
      return entity;
    }
}
  
export function createRandomKeplarElements({eccentricity = Math.random(), semi_major_axis = Math.random() * 1000, inclination = Math.random() * Math.PI, ascending_node = Math.random() * Math.PI, periapsis = Math.random() * Math.PI, true_anomaly = Math.random() * Math.PI}): KeplarElements {
  return {
    eccentricity,
    semi_major_axis,
    inclination,
    ascending_node,
    periapsis,
    true_anomaly,
  }
}

