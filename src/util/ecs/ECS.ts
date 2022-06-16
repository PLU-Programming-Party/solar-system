import Entity from './Entity';
import Component from './Component';
import Transform from './Transform';
import Mesh from './Mesh';

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

// Functions
export { addComponent, removeComponent, getComponent, getData, setData, getEntityID };

// Classes and Types
export { Entity, Component, Transform, Mesh };


