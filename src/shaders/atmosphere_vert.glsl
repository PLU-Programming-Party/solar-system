uniform vec3 viewVector;
uniform vec3 color;
uniform float brightness;

varying float intensity;

void main() {
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
  vec3 actual_normal = vec3(modelMatrix * vec4(normal, 0.0));
  intensity = pow(brightness -  dot(normalize(viewVector), actual_normal), 3.0 );
}