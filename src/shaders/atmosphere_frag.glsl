varying float intensity;
uniform vec3 color;

void main() {
  vec3 glow = color * intensity;
  gl_FragColor = vec4( glow, 1.0 );
}