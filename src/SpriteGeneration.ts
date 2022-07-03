import * as THREE from 'three';
import SimplexNoise from 'simplex-noise';

export function generateSprites(spriteMaterials: THREE.SpriteMaterial[], seed?: number, totalSprites = 4000, scale = 1, distance = 3000, noiseScale = .005): THREE.Sprite[] {
    const perlin = new SimplexNoise(seed);

    const sprites: THREE.Sprite[] = [];
    
    while (sprites.length < totalSprites) {
        const starPos = (new THREE.Vector3()).randomDirection().multiplyScalar(distance);

        const starProb = (perlin.noise3D(starPos.x * noiseScale, starPos.y * noiseScale, starPos.z * noiseScale) + 1) / 2;

        if (starProb > Math.random() * .7 + .3) {
            const sprite = new THREE.Sprite(spriteMaterials[Math.floor(Math.random() * spriteMaterials.length)]);
            sprite.position.set(starPos.x, starPos.y, starPos.z);
            const size = (Math.pow(2, Math.random() * 7 + 3) / 20 + 15) * scale;
            sprite.scale.set(size, size, size);
            sprites.push(sprite);  
        }
    }

    return sprites;
}