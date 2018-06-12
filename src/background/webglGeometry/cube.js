const nanogl = require('nanogl');

class Cube {
  constructor(gl) {
    this.gl = gl;
    var vertices =
     [-1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,

      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,

      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,

      // Right face
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,

      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0];
    var color = [];
    for (let i = 0; i < 72; i++)
        color.push(Math.random());
    var indices = [
        0, 1, 2,
        0, 2, 3,
        4, 5, 6,
        4, 6, 7,
        8, 9, 10,
        8, 10, 11,
        12, 13, 14,
        12, 14, 15,
        16, 17, 18,
        16, 18, 19,
        20, 21, 22,
        20, 22, 23

    ];
    vertices = new Float32Array(vertices);
    indices = new Uint16Array(indices);
    color = new Float32Array(color);
    var verticesBuffer = new nanogl.ArrayBuffer(this.gl, vertices, this.gl.STATIC_DRAW);
    var colourBuffer = new nanogl.ArrayBuffer(this.gl, color, this.gl.STATIC_DRAW);
    var indiceBuffer = new nanogl.IndexBuffer(this.gl, this.gl.UNSIGNED_SHORT, indices, this.gl.STATIC_DRAW);
    verticesBuffer.attrib("aPosition", 3, this.gl.FLOAT);
    colourBuffer.attrib("aColor", 3, this.gl.FLOAT);

    this.vBuffer = verticesBuffer;
    this.iBuffer = indiceBuffer;
    this.cBuffer = colourBuffer;
  }
}

export default Cube;
