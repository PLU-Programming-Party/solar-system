import * as THREE from 'three';
import { Component } from './ECS';

class Transform extends Component{
    position: THREE.Vector3[] = [];
    rotation: THREE.Vector3[] = [];
    scale: THREE.Vector3[] = [];
    private _size: number;
    private _ids: number[] = [];

    constructor(entity_id: number) {
        super();
        this._size = this.position.length;
        this._ids.push(entity_id);
        this.position.push(new THREE.Vector3(0, 0, 0));
        this.rotation.push(new THREE.Vector3(0, 0, 0));
        this.scale.push(new THREE.Vector3(1, 1, 1));
    }

    _getData(entity_id: number): any {
        const entity_index = this._ids.indexOf(entity_id);
        if (entity_index === -1) {
            return null;
        } else {
            return {
                position: this.position[entity_index],
                rotation: this.rotation[entity_index],
                scale: this.scale[entity_index]
            };
        }
    }

    _setData(entity_id: number, data: any): void {
        const entity_index = this._ids.indexOf(entity_id);
        if (entity_index === -1) {
            this._ids.push(entity_id);
            this.position.push(data.position);
            this.rotation.push(data.rotation);
            this.scale.push(data.scale);
        } else {
            this.position[entity_index] = data.position;
            this.rotation[entity_index] = data.rotation;
            this.scale[entity_index] = data.scale;
        }
    }
}

export default Transform;