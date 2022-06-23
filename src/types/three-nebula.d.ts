declare module 'three-nebula' {
    export default class ParticleSystem{
        public addEmitter(e: Emitter): ParticleSystem;
        public addRenderer(r: SpriteRenderer): ParticleSystem;
        public update(delta: number): void;
    }
    export class Color{
        public constructor(colorA: any | number | string, colorB: any | number | string, life?: number, easing?: Function, isEnabled?: boolean);
    }
    export class Emitter{}
    export class Particle{}
    export class SpriteRenderer{
        public constructor(scene: any, three: any);
    }
    export class Position{
        public constructor(p?: PointZone);
    }
    export class Mass{
        public constructor(min: number, max?: number, center?: boolean);
    }
    export class Rate{
        public constructor(numPan: number | any[] | Span, timePan: number | any[] | Span);
    }
    export class Span{
        public constructor(a: Number | any[], b?: Number, center?: Number);
    }
    export class PointZone{
        public constructor(x: Number | Vector3D, y?: Number, z?: Number);
    }
    export class Life{
        public constructor(min: number, max?: number, center?: boolean, isEnabled?: boolean);
    }
    export class RadialVelocity{
        public constructor(radius: number | Span, vector3d: Vector3D, theta: number);
    }
    export class Vector3D{
        public constructor(x : number, y : number, z : number);
    }
    export class Radius{
        public constructor(width: number, height: number, center?: boolean);
    }
    export class Alpha{
        public constructor(alphaA: number, alphaB: number, life?: number, easing?: Function, isEnabled?: boolean);
    }
    export class Scale{
        public constructor(scaleA: number, scaleB: number, life?: number, easing?: Function, isEnabled?: boolean);
    }


}


