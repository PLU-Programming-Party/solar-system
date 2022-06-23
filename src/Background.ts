import ParticleSystem, { Color, Emitter, Rate, Span, Position, SpriteRenderer, PointZone, Life, Mass, RadialVelocity, Vector3D, Radius, Alpha, Scale } from 'three-nebula'
import * as THREE from 'three'

export default function nebulaSystem(scene: THREE.Scene, three: typeof THREE){
    const system = new ParticleSystem();
    const emitter: any = new Emitter();
    const color1: THREE.Color = new THREE.Color();
    const color2: THREE.Color = new THREE.Color();

    emitter.setRate(new Rate(new Span(4, 16), new Span(0.01)))
    .addInitializers([
      new Position(new PointZone(0, 0)),
      new Mass(1),
      new Radius(6, 12),
      new Life(3),
      new RadialVelocity(45, new Vector3D(0, 1, 0), 180),
    ])
    .addBehaviours([
      new Alpha(1, 0),
      new Scale(0.3, 0.6),
      new Color(color1, color2),
    ])
    .emit();

    return system.addEmitter(emitter).addRenderer(new SpriteRenderer(scene, three));
}

