import * as THREE from "three";

let earthNormalTexture: THREE.Texture;

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

    let light = new THREE.PointLight(0xFFFFFF); // TODO: Maybe put point light in sun mesh maker?
    light.position.set(0, 0, 0);

    const sunGroup = new THREE.Group();
    sunGroup.add(new THREE.Mesh(geometry, material));
    sunGroup.add(light);
    return sunGroup;
}

