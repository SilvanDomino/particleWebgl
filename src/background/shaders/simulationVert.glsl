attribute vec2 aUv;

varying vec2 vUv;

uniform mat4 uMvp;

void main() {
  vUv = aUv;
  gl_PointSize = 1.0;

  gl_Position = uMvp * vec4(aUv -0.495, -2, 1);
}
