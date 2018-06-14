const nanogl = require('nanogl')
const mat4 = require('gl-mat4');
import Plane from './webglGeometry/Plane';
import Particle from './webglGeometry/Points'

import standardVert from './shaders/standard.glsl';
import standardFrag from './shaders/fragment.glsl';
import simulationVert from './shaders/simulationVert.glsl';
import simulationFrag0 from './shaders/simulationFrag00.glsl';
import simulationFrag1 from './shaders/simulationFrag01.glsl';
import simulationFrag2 from './shaders/simulationFrag02.glsl';
import simulationFrag3 from './shaders/simulationFrag03.glsl';

import toHalf from './toHalf';

const particles = 16384;

class Canvas {
  constructor() {
    this._canvas = document.getElementsByClassName('background-js')[0];
    this._canvas.width = window.innerWidth;
    this._canvas.height = window.innerHeight;

    this.gl = this._canvas.getContext('webgl', {preserveDrawingBuffer: true, antialias: false});
    // this.ext = this.gl.getExtension('OES_texture_half_float');
    this.ext = this.gl.getExtension('OES_texture_float');

    console.log(this.ext.HALF_FLOAT_OES);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.clearColor(0, 0, 0, 1);
    this.delta = 0;
    this.simulationIndex = 0;
    this.setupShaders();
    this.setupTextures();
    this.setupFbos();
    this.loadTextures();
    this.setupBuffers();
    this.setupMatrices();
    this.setUpEventListeners();
    this.bufferSelector = 0;
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    requestAnimationFrame(()=> {this.draw(); });
  }

  setUpEventListeners() {
    this._canvas.addEventListener('click', this.clickHandler.bind(this));
  }

  clickHandler() {
    this.simulationIndex = (this.simulationIndex + 1) % (this.simulationShaders.length );
    this.simulationShader = this.simulationShaders[this.simulationIndex];
  }

  setupMatrices() {
    this.planeCamera = mat4.create();
    mat4.ortho(this.planeCamera, -0.5, 0.5, -0.5, 0.5, 0.001, 100.0);

    this.perspective = mat4.create();
    mat4.perspective(this.perspective, 60, (this._canvas.width * 2) / (this._canvas.height * 2), 0.0001, 100);
  }

  setupShaders() {
    this.simulationShaders = [];
    this.simulationShaders.push(new nanogl.Program(this.gl, simulationVert, simulationFrag0));
    this.simulationShaders.push(new nanogl.Program(this.gl, simulationVert, simulationFrag1));
    this.simulationShaders.push(new nanogl.Program(this.gl, simulationVert, simulationFrag2));
    this.simulationShaders.push(new nanogl.Program(this.gl, simulationVert, simulationFrag3));


    this.drawShader = new nanogl.Program(this.gl, standardVert, standardFrag);
    this.drawShader.bind();
    this.simulationShader = this.simulationShaders[0];

  }

  setupTextures() {
    this.particlePositions = [];
    console.log(this.ext.OES_HALF_FLOAT);

    this.particlePositions.push(new nanogl.Texture(this.gl, this.gl.RGBA, this.gl.FLOAT, this.gl.RGBA));
    this.particlePositions.push(new nanogl.Texture(this.gl, this.gl.RGBA, this.gl.FLOAT, this.gl.RGBA));

    this.flowTexture = new nanogl.Texture(this.gl, this.gl.RGBA, this.gl.FLOAT, this.gl.RGBA);
  }

  loadTextures() {
    let pa = [];
    const size = Math.sqrt(particles);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        pa.push((i / size - 0.5) * 8);
        pa.push(0);
        pa.push(-1 - (j / size) * 2);
        pa.push(i + size + j);
      }
    }
    const buffer = new Uint16Array(pa.length);
    for (let i = 0; i < buffer.length; i++)
      buffer[i] = toHalf(pa[i]);
    pa = new Float32Array(pa);
    // console.log(pa.uint32View);
    // console.log(new DataView(pa.buffer));
    for (let i = 0; i < this.particlePositions.length; i++) {
      this.particlePositions[i].fromData(size, size, pa);
      this.particlePositions[i].setFilter(false, false, false);

    }
  }

  setupFbos() {
    this.particlePositionsFbo = [];
    this.particlePositionsFbo.push(new nanogl.Fbo(this.gl));
    this.particlePositionsFbo.push(new nanogl.Fbo(this.gl));
    for (let i = 0; i < this.particlePositions.length; i++) {
      const width = Math.sqrt(particles);
      this.particlePositionsFbo[i].bind();
      this.particlePositionsFbo[i].resize(width, width);
      this.particlePositionsFbo[i].attach(this.gl.COLOR_ATTACHMENT0, this.particlePositions[i]);
    }

  }

  setupBuffers() {
    this.geo = new Particle(this.gl, Math.sqrt(particles), Math.sqrt(particles));
  }

  draw() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.delta += 0.01;
    this.particlePositionsFbo[(this.bufferSelector + 1) % this.particlePositions.length].bind();
    this.gl.viewport(0, 0, 128, 128);
    // this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.simulationShader.bind();
    this.simulationShader.uMvp(this.planeCamera);
    this.simulationShader.uTest([this.delta, this.delta + 0.4]);
    this.simulationShader.uParticlePos(this.particlePositions[this.bufferSelector]);
    this.geo.uvBuffer.attribPointer(this.simulationShader);
    this.gl.drawArrays(this.gl.POINTS, 0, particles);

    //draw to window
    //alternating data buffers
    this.drawShader.bind();

    // mat4.lookat(this.lookat, [])

    this.bufferSelector = (this.bufferSelector + 1) % this.particlePositions.length;
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0, 0, this._canvas.width, this._canvas.height);


    this.drawShader.uMvp(this.perspective);
    this.drawShader.uParticlePos(this.particlePositions[this.bufferSelector]);
    this.geo.uvBuffer.attribPointer(this.drawShader);
    this.gl.drawArrays(this.gl.POINTS, 0, particles);

    requestAnimationFrame(()=> {this.draw(); });
  }
}

export default Canvas;
