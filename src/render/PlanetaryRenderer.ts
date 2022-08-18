import * as THREE from 'three';
import SimplexNoise from 'simplex-noise';

let earthNormalTexture: THREE.Texture;

export type OrbitUpdater = (points: THREE.Vector3[]) => void;

export function createOrbitPath(points: THREE.Vector3[]): [THREE.Group, OrbitUpdater] {
    const material = new THREE.LineBasicMaterial({color: 0x999999});
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    const group = new THREE.Group();
    group.add(line);
    const updateFunc = (points: THREE.Vector3[]) => {
        geometry.setFromPoints(points);
    }
    return [group, updateFunc];
}



export function createEarthMesh(mass: number): THREE.Group{
    earthNormalTexture ??= new THREE.TextureLoader().load('assets/earth_normal.jpg');
    const geometry = new THREE.SphereGeometry(Math.pow(mass, 1/3), 32, 16);  //TODO: Use radius instead of mass
    const material = new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff } );
    material.normalMap = earthNormalTexture;
    material.normalScale = new THREE.Vector2(10, 10);
    material.shininess = 0;
    const earthGroup = new THREE.Group();
    earthGroup.add(new THREE.Mesh(geometry, material));
    return earthGroup;
}
    
export function createSunMesh(mass: number): THREE.Group{
    const geometry = new THREE.SphereGeometry(Math.pow(mass, 1/3), 32, 16); //TODO: Use radius instead of mass
    const material = new THREE.MeshPhongMaterial( { color: 0x9D00FF } );
    material.emissive = new THREE.Color(0x9D00FF);

    let light = new THREE.PointLight(0xFFFFFF);
    light.position.set(0, 0, 0);

    const sunGroup = new THREE.Group();
    sunGroup.add(new THREE.Mesh(geometry, material));
    sunGroup.add(light);
    return sunGroup;
}

export function createStarField(seed: number, totalNebulas: number): THREE.Group{
    const spriteGroup = new THREE.Group();
    const textureLoader = new THREE.TextureLoader();

    const starMaterial = new THREE.SpriteMaterial( { map: textureLoader.load( 'assets/star.png' ) } );
    const sprites = generateSprites( [starMaterial], seed);
    spriteGroup.add( ... sprites );

    const nebulaMaterials: THREE.SpriteMaterial[] = [];
    for (let i = 1; i <= totalNebulas; i++)
    nebulaMaterials.push(new THREE.SpriteMaterial( { map: textureLoader.load( 'assets/nebula' + i + '.png' ) } ));
    const nebulas = generateSprites(nebulaMaterials, seed, 20, 5);
    spriteGroup.add( ... nebulas );
    return spriteGroup;
}

function generateSprites(spriteMaterials: THREE.SpriteMaterial[], seed?: number, totalSprites = 4000, scale = 1, distance = 3000, noiseScale = .005): THREE.Sprite[] {
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

