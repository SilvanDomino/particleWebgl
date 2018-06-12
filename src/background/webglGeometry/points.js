const nanogl = require('nanogl');

class Particle {
  constructor(gl, width, height) {
    this.gl = gl;

    let uvs = [];

    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        uvs.push(i / width);
        uvs.push(j / height);
      }
    }
    uvs = new Float32Array(uvs);
    let uvBuffer = new nanogl.ArrayBuffer(this.gl, uvs, this.gl.STATIC_DRAW);
    uvBuffer.attrib('aUv', 2, this.gl.FLOAT);
    this.uvBuffer = uvBuffer;

  }
}

export default Particle;
