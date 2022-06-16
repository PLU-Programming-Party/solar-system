import { Component } from "./ECS";
import * as THREE from "three";

class Mesh extends Component {
    private _mesh: THREE.Mesh;

    constructor(entity_id: number) {
        super();
        this._mesh = new THREE.Mesh();
        this._mesh.name = 'mesh';
        this._mesh.userData.entity_id = entity_id;
    }

    _getData(entity_id: number): any {
        return this._mesh;
    }

    _setData(entity_id: number, data: any): void {
        this._mesh = data;
    }
}

export default Mesh;