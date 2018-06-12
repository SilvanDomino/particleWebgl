attribute vec2 aUv;

uniform sampler2D uParticlePos;
uniform mat4 uMvp;

varying vec2 vUv;

void main() {
  vUv = aUv;
  // uMvp;
  vec3 position = texture2D(uParticlePos, aUv).xyz;
  gl_PointSize = 1.;
  gl_Position =  uMvp * vec4(position.xyz, 1);

}
