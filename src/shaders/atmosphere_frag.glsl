uniform sampler2D textureSampler;
in vec2 vUV;

void main() {
    gl_FragColor = texture(textureSampler, vUV); // vec4(1, 1, 0.5, 1); //
}