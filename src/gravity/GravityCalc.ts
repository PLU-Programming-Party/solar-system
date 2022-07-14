import { SpacialBody } from "./SpacialBody";
import { Gravity } from "./GravityConstant";

export function specificOrbit(spacialBody1: SpacialBody, spacialBody2: SpacialBody):number{
    //V^2 / 2 - u / r 
    //V - relative orbital speed (diff of spatialBody2 and spatialBody1)
    //u - masses of the bodies multiplied by the gravitational constant
    //r - distance between the two points
    const v = spacialBody2.vel.distanceTo(spacialBody1.vel)
    const u = (spacialBody2.mass + spacialBody1.mass)*Gravity
    const r = spacialBody2.pos.distanceTo(spacialBody1.pos)

    return Math.pow(v, 2) / 2 - u / r;
}