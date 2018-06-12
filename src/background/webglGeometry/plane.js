const nanogl = require('nanogl');

class Plane {
  constructor(gl, segments, width, height) {
    this.gl = gl;

    var widthHalf = width / 2;
    var heightHalf = height / 2;

    var gridX = Math.floor(segments);
    var gridY = Math.floor(segments);

    var gridX1 = gridX + 1;
    var gridY1 = gridY + 1;

    var segmentWidth = width / gridX;
    var segmentHeight = height / gridY;

    var indices = [];
    var vertices = [];
    // var normals = [];
    var uvs = [];

    // generate vertices, normals and uvs
    var ix, iy;
    for (iy = 0; iy < gridY1; iy ++) {
        var y = iy * segmentHeight - heightHalf;
        for (ix = 0; ix < gridX1; ix ++) {
            var x = ix * segmentWidth - widthHalf;

            vertices.push(x, - y, 0);
            // normals.push(0, 0, 1);
            uvs.push(ix / gridX);
            uvs.push((iy / gridY));
        }
    }

    // indices
    for (iy = 0; iy < gridY; iy ++) {
        for (ix = 0; ix < gridX; ix ++) {
            var a = ix + gridX1 * iy;
            var b = ix + gridX1 * (iy + 1);
            var c = (ix + 1) + gridX1 * (iy + 1);
            var d = (ix + 1) + gridX1 * iy;

            // faces
            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }

    vertices = new Float32Array(vertices);
    indices = new Uint16Array(indices);
    uvs = new Float32Array(uvs);


    // Create a buffer with the vertices and bind it to the gl buffer
    var verticesBuffer = new nanogl.ArrayBuffer(this.gl, vertices, this.gl.STATIC_DRAW);
    var uvBuffer = new nanogl.ArrayBuffer(this.gl, uvs, this.gl.STATIC_DRAW);

    var indiceBuffer = new nanogl.IndexBuffer(this.gl, this.gl.UNSIGNED_SHORT, indices, this.gl.STATIC_DRAW);
    verticesBuffer.attrib('aPosition', 3, this.gl.FLOAT);
    uvBuffer.attrib('aUv', 2, this.gl.FLOAT);

    this.vBuffer = verticesBuffer;
    this.iBuffer = indiceBuffer;
    this.uvBuffer = uvBuffer;
  }
}

export default Plane;
