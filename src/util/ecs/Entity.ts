import * as THREE from 'three';
import type Component from './Component';

class Entity{
    components: Component[] = [];
    private _id: number;

    constructor(components: Component[]) {
        this.components = components;
        this._id = 0; 
    } 

    _getEntityId(): number {
        return this._id;
    }

    _addComponent(component: Component): void {
        this.components.push(component);
    }

    _removeComponent(component: Component): void {
        this.components.splice(this.components.indexOf(component), 1);
    }
}

export default Entity;