import Entity from './Entity';
import Component from './Component';
import Transform from './Transform';
import Mesh from './Mesh';

/**
 * This file contains the API for the ECS framework.
 * ECS stands for Entity Component System, and promotes a 
 * compositional, data-oriented architecture for game 
 * development. 
 * 
 * Objects in a scene should be represented by "entities". 
 * Entities can have "components", which are containers for
 * data. Components can be used to store data such as position,
 * rotation, scale, and mesh data, among other things. Logic
 * is not contained in the components, but rather in separate 
 * "systems", which operate on the data in the components.
 * 
 * Users can create entities by simply instantiating the Entity 
 * class. They can then assign a pre-created component to the
 * entity, or write their own component by extending the
 * Component class, and instantiating and exporting it from
 * this file.
 */

// Functions
function addComponent(entity: Entity, component: Component): void {
    entity._addComponent(component);
}

function removeComponent(entity: Entity, component: Component): void {
    entity._removeComponent(component);
}

function getComponent<Type>(entity: Entity, type: any): any {
    for (let component of entity.components) {
        if (component instanceof type) {
            return component;
        }
    }
}

function getData(entity: Entity, component: Component): any {
    return component._getData(entity._getEntityId());
}

function setData(entity: Entity, component: Component, data: any): void {
    component._setData(entity._getEntityId(), data);
}

function getEntityID(entity: Entity): number {
    return entity._getEntityId();
}


export { addComponent, removeComponent, getComponent, getData, setData, getEntityID };

// Classes and Types
const TRANSFORM = new Transform(0);
const MESH = new Mesh(0);

export { Entity, Component, TRANSFORM, MESH };


