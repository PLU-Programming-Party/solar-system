import * as THREE from "three";

let earthNormalTexture: THREE.Texture;

export function createEarthMesh(mass: number): THREE.Mesh{
    earthNormalTexture ??= new THREE.TextureLoader().load('assets/earth_normal.jpg');
    const geometry = new THREE.SphereGeometry(Math.pow(mass, 1/3), 32, 16);  //TODO: Use radius instead of mass
    const material = new THREE.MeshPhongMaterial( { color: Math.random() * 0xffffff } );
    material.normalMap = earthNormalTexture;
    material.normalScale = new THREE.Vector2(10, 10);
    material.shininess = 0;
    return new THREE.Mesh(geometry, material);
}
    
export function createSunMesh(mass: number): THREE.Mesh{
    const geometry = new THREE.SphereGeometry(Math.pow(mass, 1/3), 32, 16); //TODO: Use radius instead of mass
    const material = new THREE.MeshPhongMaterial( { color: 0x9D00FF } );
    material.emissive = new THREE.Color(0x9D00FF);
    return new THREE.Mesh(geometry, material);
}

