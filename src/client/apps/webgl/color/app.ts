
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';

import {mat4} from 'gl-matrix';

import {WebGL, Object, CameraType} from '../webgl';
import * as objects from '../objects';

const sphere = require('../sphere.json');

console.log(__filename);
console.log('WebGL Trials')

// ref: https://codepen.io/cantelope/pen/zzmORP

const elCanvas = document.getElementById('canvas-element-id') as HTMLCanvasElement;
const {
    clientWidth,
    clientHeight,
} = elCanvas;

const webgl = new WebGL(elCanvas, CameraType.ORBIT);
webgl.setProgram(require('./phong.vert'), require('./vFinalColor.frag'));

// webgl.setObject('pos', objects.HALF_SQUARE);
webgl.setAttributeMap({
    vbo: 'aVertexPosition',
    nbo: 'aVertexNormal',
    cbo: 'aVertexColor',
});

webgl.addObject(objects.createFloor(60, 1));
webgl.addObject(objects.createAxis(20));
webgl.addObject(objects.CONE6);
webgl.addObject(sphere as Object);

const uMVMatrix = mat4.create();
mat4.identity(uMVMatrix);
mat4.translate(uMVMatrix, uMVMatrix, [0.0, -2.0, -50.0])
webgl.initCamera(uMVMatrix);

const uPMatrix = mat4.create(); // The projection matrix
mat4.identity(uPMatrix);
mat4.perspective(uPMatrix, 45, clientWidth / clientHeight, 0.1, 1000.0);

const uNMatrix = mat4.create();
mat4.invert(uNMatrix, uMVMatrix);
mat4.transpose(uNMatrix, uNMatrix);

const uLightPosition = [0, 120, 120];
const uLightAmbient = [0.20, 0.20, 0.20, 1.0];
const uLightDiffuse = [1.0, 1.0, 1.0, 1.0];

webgl.run({
    uMVMatrix,
    uPMatrix,
    uNMatrix,
    uLightPosition,
    uLightAmbient,
    uLightDiffuse,
}, (state) => {
    webgl.updateMVMatrix(state.uMVMatrix);
    webgl.setUniformValues(state);
    // webgl.drawArea();
    webgl.drawObjects();
}, true);

// draw half rect
// apply color
// change frag

// ch5_SimpleAnimation.html
