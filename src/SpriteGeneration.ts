import * as THREE from 'three';
import SimplexNoise from 'simplex-noise';

export function generateSprites(stars = 700, distance = 700, noiseScale = .005, seed?: number): THREE.Sprite[] {
    const starTextureMap = new THREE.TextureLoader().load( 'assets/star.png' );
    const starMaterial = new THREE.SpriteMaterial( { map: starTextureMap } );

    const perlin = new SimplexNoise(seed);

    const sprites: THREE.Sprite[] = [];
    
    while (sprites.length < stars) {
        const starPos = (new THREE.Vector3()).randomDirection().multiplyScalar(distance);

        const starProb = (perlin.noise3D(starPos.x * noiseScale, starPos.y * noiseScale, starPos.z * noiseScale) + 1) / 2;

        if (starProb > Math.random() + .3) {
            const sprite = new THREE.Sprite(starMaterial);
            sprite.position.set(starPos.x, starPos.y, starPos.z);
            const size = Math.pow(Math.random() * 15, 2) / 7;
            sprite.scale.set(size, size, size);
            sprites.push(sprite);  
        }
    }

    return sprites;
}