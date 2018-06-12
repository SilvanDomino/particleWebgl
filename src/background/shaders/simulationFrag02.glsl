precision mediump float;

#define PI 3.1415926535897932384626433832795;

varying vec2 vUv;

uniform vec2 uTest;

uniform sampler2D uParticlePos;

void main(void) {
  uTest;
  vec4 particle = texture2D(uParticlePos, vUv);
  //move the simulation here
  particle.y = cos(particle.z + particle.z + uTest.x + particle.w) * 5.;
  particle.x = sin(particle.w * 0.05 + particle.z + uTest.x) * 20.;

  gl_FragColor = particle;
}
