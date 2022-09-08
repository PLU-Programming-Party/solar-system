precision mediump float;

vec2 vUv;
uniform sampler2D iChannel0;

out vec4 fragColor_1;

void main() {
  float sample_0 = 1.0;
  vec4 fragColor = vec4(sample_0);
  // fragColor_1 = texture2D(iChannel0, vUv);
  fragColor_1 = vec4(1, 0, 0, 1);
}
