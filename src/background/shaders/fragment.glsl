precision highp float;

varying vec2 vUv;

void main(void) {
  gl_FragColor = vec4(1.0) * (1.0 / gl_FragCoord.w) * 0.5;
}
