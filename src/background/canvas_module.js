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

const particles = 16384;

class Canvas
{

  constructor()
  {
    this._canvas = document.querySelector('.background-js');
    this._canvas.width = window.innerWidth;
    this._canvas.height = window.innerHeight;

    //create a webgl context where we ask for no autoclear and no AA
    this.gl = this._canvas.getContext('webgl', {preserveDrawingBuffer: true, antialias: false});

    //query if we have OES_TEXTURE_FLOAT extension
    this.gl.getExtension('OES_texture_float');

    //enable depth testing
    this.gl.enable(this.gl.DEPTH_TEST);
    //set the clear color to black
    this.gl.clearColor(0, 0, 0, 1);

    //set static variables
    this.delta = 0;
    this.simulationIndex = 0;
    this.bufferSelector = 0;

    this._setupShaders();
    this._setupTextures();
    this._setupFbos();
    this._loadTextures();
    this._setupBuffers();
    this._setupMatrices();
    this._setUpEventListeners();

    //bind the canvas as drawing buffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    //clear the screen once before we start
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    requestAnimationFrame(()=> {this.draw(); });
  }

  draw()
  {
    //clear canvas at the start
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    //increase timestep
    this.delta += 0.01;
    //bind the drawing particle fbo
    this.particlePositionsFbo[(this.bufferSelector + 1) % this.particlePositions.length].bind();
    //let webgl know that we changed the viewport size
    this.gl.viewport(0, 0, 128, 128);
    //bind the simulation shader
    this.simulationShader.bind();
    //upload uniforms
    this.simulationShader.uMvp(this.planeCamera);
    this.simulationShader.uTest([this.delta, this.delta + 0.4]);
    this.simulationShader.uParticlePos(this.particlePositions[this.bufferSelector]);
    //rebind attributes for weird gpu setups
    this.geo.uvBuffer.attribPointer(this.simulationShader);
    //draw the points array
    this.gl.drawArrays(this.gl.POINTS, 0, particles);


    //alternate buffer selector
    this.bufferSelector = (this.bufferSelector + 1) % this.particlePositions.length;

    //bind the window as the drawing buffer
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    //let webgl know we changed viewport sizes
    this.gl.viewport(0, 0, this._canvas.width, this._canvas.height);
    //bind the drawshader
    this.drawShader.bind();
    //upload uniforms
    this.drawShader.uMvp(this.perspective);
    this.drawShader.uParticlePos(this.particlePositions[this.bufferSelector]);
    this.geo.uvBuffer.attribPointer(this.drawShader);
    //draw the points array to the screen
    this.gl.drawArrays(this.gl.POINTS, 0, particles);

    //request another animation frame
    requestAnimationFrame(()=> {this.draw(); });
  }

  _setupMatrices()
  {
    //generate a few simple matrices thanks to gl-mat4
    this.planeCamera = mat4.create();
    //generate a orthographic projection matrix with boundaries of -0.5 0.5 far 100 and near 0.001
    mat4.ortho(this.planeCamera, -0.5, 0.5, -0.5, 0.5, 0.001, 100.0);

    //generate a perspectie camera for the draw phase
    this.perspective = mat4.create();
    mat4.perspective(this.perspective, 60, (this._canvas.width * 2) / (this._canvas.height * 2), 0.0001, 100);
  }

  _setupShaders()
  {
    this.simulationShaders = [];
    //generate the shaders thanks to nanogl
    this.simulationShaders.push(new nanogl.Program(this.gl, simulationVert, simulationFrag0));
    this.simulationShaders.push(new nanogl.Program(this.gl, simulationVert, simulationFrag1));
    this.simulationShaders.push(new nanogl.Program(this.gl, simulationVert, simulationFrag2));
    this.simulationShaders.push(new nanogl.Program(this.gl, simulationVert, simulationFrag3));
    this.drawShader = new nanogl.Program(this.gl, standardVert, standardFrag);

    this.simulationShader = this.simulationShaders[0];

  }

  _setupTextures()
  {
    this.particlePositions = [];

    //create two textures thanks to nanogl
    this.particlePositions.push(new nanogl.Texture(this.gl, this.gl.RGBA, this.gl.FLOAT, this.gl.RGBA));
    this.particlePositions.push(new nanogl.Texture(this.gl, this.gl.RGBA, this.gl.FLOAT, this.gl.RGBA));

  }

  _loadTextures()
  {
    let pa = [];
    //generate a few points on a plane in normailzed space
    const size = Math.sqrt(particles);
    for (let i = 0; i < size; i++)
    {
      for (let j = 0; j < size; j++)
      {
        pa.push((i / size - 0.5) * 8);
        pa.push(0);
        pa.push(-1 - (j / size) * 2);
        pa.push(i + size + j);
      }
    }

    pa = new Float32Array(pa);
    for (let i = 0; i < this.particlePositions.length; i++)
    {
      this.particlePositions[i].fromData(size, size, pa);
      this.particlePositions[i].setFilter(false, false, false);

    }
  }

  _setupFbos()
  {
    this.particlePositionsFbo = [];
    this.particlePositionsFbo.push(new nanogl.Fbo(this.gl));
    this.particlePositionsFbo.push(new nanogl.Fbo(this.gl));
    for (let i = 0; i < this.particlePositions.length; i++)
    {
      const width = Math.sqrt(particles);
      this.particlePositionsFbo[i].bind();
      this.particlePositionsFbo[i].resize(width, width);
      this.particlePositionsFbo[i].attach(this.gl.COLOR_ATTACHMENT0, this.particlePositions[i]);
    }

  }

  _setupBuffers()
  {
    //create a Particle buffer
    this.geo = new Particle(this.gl, Math.sqrt(particles), Math.sqrt(particles));
  }

  _setUpEventListeners()
  {
    this._canvas.addEventListener('click', this._clickHandler.bind(this));
  }

  _clickHandler()
  {
    this.simulationIndex = (this.simulationIndex + 1) % (this.simulationShaders.length );
    this.simulationShader = this.simulationShaders[this.simulationIndex];
  }
}

export default Canvas;
