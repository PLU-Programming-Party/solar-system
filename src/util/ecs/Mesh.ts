import { Component } from "./ECS";
import * as THREE from "three";

class Mesh extends Component {
    private _mesh: THREE.Mesh[] = [];

    constructor(entity_id: number) {
        super(entity_id);
        console.log(this._ids);
    }

    _getData(entity_id: number): any {
        return this._mesh[entity_id];
    }

    _setData(entity_id: number, data: any): void {
        this._mesh[entity_id] = data;
    }
}

export default Mesh;