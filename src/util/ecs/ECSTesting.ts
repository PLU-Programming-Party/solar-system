import * as ECS from './ECS';
import { Vector3 } from 'three';

class ECSTesting {
    constructor() {
        this.test();
    }
    
    test() {
        let transform = new ECS.Transform(0);
        let entity = new ECS.Entity([transform]);
        console.log(ECS.getEntityID(entity));
        console.log(ECS.getData(entity, transform));
        const newPos = new Vector3(1, 2, 3);
        const newRot = new Vector3(4, 5, 6);
        const newScale = new Vector3(7, 8, 9);
        ECS.setData(entity, transform, { position: newPos, rotation: newRot, scale: newScale });
        console.log(ECS.getData(entity, transform));
    }
}

export default ECSTesting;