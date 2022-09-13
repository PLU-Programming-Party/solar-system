import { OrbitUpdater } from "../render/PlanetaryRenderer";
import { PlanetarySystem } from "./PlanetarySystem";
import { SpatialBody } from "./SpatialBody";
import { KeplarElements } from '../gravity/GravityCalc';
import * as THREE from 'three';
import scene from '../Scene';
import { createOrbitPath, createEarthMesh, createSunMesh } from '../render/PlanetaryRenderer';

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
    private _sun: SpatialBody;

    public constructor(private fixedInterval: number, private intervals: number) {
        this._system = new PlanetarySystem();
        this._entities = [];
        this._keplarElementMap = new Map<SpatialEntity, KeplarElements>();
        this._sun = new SpatialBody();
    }

    public randomize(planetCount = 10, distanceThreshold = 100, complexity = 0, moonProbability = .2) {
      const moonGen = this.createRecursiveMoonGenerator(planetCount, complexity, moonProbability);

      this._system = new PlanetarySystem();
      this._entities = [];
      this._keplarElementMap = new Map<SpatialEntity, KeplarElements>();
        
      const sunMass = 10000;
      this._sun = this._system.constructBody(sunMass, undefined, undefined, true);
      const mesh = createSunMesh(sunMass);
      this.appendNewEntity(this._sun, mesh);

      while (this._keplarElementMap.size < planetCount) {
        const planet = this.addRandomPlanet(distanceThreshold, this._sun);
        moonGen(0, distanceThreshold / 20, planet);
      }
    }

    private createRecursiveMoonGenerator(maxPlanets: number, complexity: number, moonProbability: number) {
      const moonGen = (depth: number, distanceThreshold: number, body: SpatialBody) => {
        if (Math.random() >= moonProbability || this._keplarElementMap.size >= maxPlanets || depth >= complexity)
          return false;

        const moon = this.addRandomPlanet(distanceThreshold, body);

        while (this._keplarElementMap.size < maxPlanets && moonGen(depth + 1, distanceThreshold / 20, moon));

        return true;
      }
      return moonGen;
    }

    public addRandomPlanet(distanceThreshold = 100, centralBody = this._sun): SpatialBody {
      let lastApsis;
      if (this._keplarElementMap.size == 0 || centralBody.id != this._sun.id) {
        lastApsis = 0;
      } else {
        const lastKeplar = this._keplarElementMap.get(this._entities[this._entities.length - 1]);
        lastApsis = lastKeplar.semi_major_axis * (1 + lastKeplar.eccentricity);
      }

      const periapsis = lastApsis + distanceThreshold * (1 + Math.random());
      const semi_major_axis = periapsis + Math.random() * distanceThreshold;
      const eccentricity = 1 - periapsis/semi_major_axis;
      const centralMass = centralBody.mass;
      const mass = Math.random() * (centralMass / 25) + (centralMass / 100);

      const randomElements = createRandomKeplarElements({semi_major_axis, eccentricity});
      return this.addNewPlanet(mass, centralBody, randomElements).body;
    }

    public get system() {
        return this._system;
    }

    public get entities() {
      return this._entities;
    }

    public get keplarElementMap() {
      return this._keplarElementMap
    }

    public get sun() {
      return this._sun;
    }

    private appendNewEntity(body: SpatialBody, group: THREE.Group): SpatialEntity {
        scene.add(group);
        body.onPositionChange = (x, y, z) => group.position.set(x, y, z);
        const [orbit, updateOrbit] = createOrbitPath(this._system.getPoseHistory(body));
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

    private addNewPlanet(mass: number, primaryBody: SpatialBody, keplar: KeplarElements) {
      const body = this._system.constructBodyRelative(mass, primaryBody, keplar);
      const entity = this.appendNewEntity(body, createEarthMesh(mass));
      this._keplarElementMap.set(entity, keplar);
      return entity;
    }
}
  
function createRandomKeplarElements({eccentricity = Math.random(), semi_major_axis = Math.random() * 900 + 100, inclination = Math.random() * 40 + 250, ascending_node = Math.random() * 40 + -20, periapsis = Math.random() * 360, true_anomaly = Math.random() * 360}): KeplarElements {
  return {
    eccentricity,
    semi_major_axis,
    inclination,
    ascending_node,
    periapsis,
    true_anomaly,
  }
}

