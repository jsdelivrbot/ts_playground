
// ref: https://codepen.io/tsuhre/pen/LLdpWO

import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
import './style.css';

// import * as p5 from 'p5';
require('p5');

console.log(__filename);
console.log('hi')

window.addEventListener('resize', resize, false);

var fireworks;
var hills;
var stars;
var dirs = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0], [1, 0],
    [-1, 1], [0, 1], [1, 1]
];

function Conway() {
    this.x = Math.floor(Math.random() * width);
    this.y = Math.floor(Math.random() * height * .7);
    this.type = Math.floor(Math.random() * 3);
    this.size = Math.random() * 2;
    this.angle = Math.random() * Math.PI;
    this.baseHue = Math.random() * 360;
    this.hueSwap = Math.random() * 30 + 60;
    this.gridSize = 61;
    if (this.gridSize % 2 == 0) this.gridSize;
    this.center = Math.floor(this.gridSize / 2);
    this.cyclesPerTick = 5;
    this.numTicks = 0;
    this.finished = false;
    this.grid = [];

    for (var i = 0; i < 2; i++) {
        this.grid.push([]);
    }

    for (var i = 0; i < this.gridSize; i++) {
        this.grid[0].push([]);
        this.grid[1].push([]);
        for (var j = 0; j < this.gridSize; j++) {
            this.grid[0][i].push(false);
            this.grid[1][i].push(false);
        }
    }

    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            if (Math.random() > .5) {
                this.grid[0][this.center - i][this.center - j] = true;
                this.grid[0][this.center + i][this.center + j] = true;
                if (this.type == 0) {
                    this.grid[0][this.center + i][this.center - j] = true;
                    this.grid[0][this.center - i][this.center + j] = true;
                }
                else if (this.type == 1) {
                    this.grid[0][this.center - j][this.center + i] = true;
                    this.grid[0][this.center + j][this.center - i] = true;
                } else if (this.type == 2) {
                    this.grid[0][this.center + i][this.center - j] = true;
                    this.grid[0][this.center - i][this.center + j] = true;
                    this.grid[0][this.center - j][this.center + i] = true;
                    this.grid[0][this.center + j][this.center - i] = true;
                    this.grid[0][this.center - j][this.center - i] = true;
                    this.grid[0][this.center + j][this.center + i] = true;
                }
            }
        }
    }

    this.tick = function () {
        var ind = (this.numTicks % 2);
        for (var i = 0; i < this.gridSize; i++) {
            for (var j = 0; j < this.gridSize; j++) {
                var neighbors = 0;
                for (var k = 0; k < dirs.length; k++) {
                    var dx = i + dirs[k][0];
                    var dy = j + dirs[k][1];
                    if (dx >= 0 && dy >= 0 &&
                        dx < this.gridSize - 1 && dy < this.gridSize - 1) {
                        if (this.grid[ind][dx][dy]) neighbors++;
                    }
                }
                if ((this.grid[ind][i][j] &&
                    (neighbors == 2 || neighbors == 3)) ||
                    (!this.grid[ind][i][j] && neighbors == 3)) {
                    this.grid[(ind + 1) % 2][i][j] = true;
                } else {
                    this.grid[(ind + 1) % 2][i][j] = false;
                }
            }
        }
    }

    this.render = function () {
        this.numTicks++;
        var mod = Math.pow(((48 - this.numTicks) / 40), 2);
        this.size += mod * .5;
        var ind = this.numTicks % 2;
        translate(this.x, this.y);
        scale(this.size);
        for (var i = 0; i < this.gridSize; i++) {
            for (var j = 0; j < this.gridSize; j++) {
                if (this.grid[ind][i][j]) {
                    fill(this.baseHue + Math.random() * this.hueSwap,
                        100, 100, mod * 100);
                    // fill(0, 100, 100);
                    rect(i - this.center, j - this.center, 1, 1);
                }
            }
        }

        if (this.numTicks > 40) this.finished = true;
        resetMatrix();
    }
}

function Hill(distance) {
    this.scale = distance * 20;
    this.bal = distance * 50;
    this.hue = 180 - distance * 60;
    this.pos = Math.random() * 2 - .5;

    this.heights = [];
    for (var i = 0; i < 40; i++) {
        var y = 200 * sin((i / 40) * PI);
        this.heights.push(y);
    }

    this.render = function () {
        fill(this.hue, this.bal, this.bal);
        for (var i = 0; i < 40; i++) {
            var x = width * this.pos - 10 * this.scale;
            var y = this.heights[i];
            rect(x + i * this.scale, height - y + this.scale * 4, this.scale + 1, y);
        }
    }
}

function Star() {
    this.x = Math.random();
    this.y = Math.random();
    this.size = Math.random() * 2 + 1;

    this.render = function () {
        fill(160 + Math.random() * 40, 40, 60 + Math.random() * 20);
        rect(this.x * width, this.y * height, this.size, this.size);
    }
}

function setup() {
    createCanvas();
    colorMode(HSB, 360, 100, 100, 100);
    ellipseMode(CENTER);
    frameRate(10);
    fireworks = [];
    hills = [];
    for (var i = 0; i < 80; i++) {
        hills.push(new Hill(i / 80));
    }
    stars = [];
    for (var i = 0; i < 1000; i++) {
        stars.push(new Star());
    }
    resize();
    fireworks.push(new Conway())
}

function draw() {
    background(0);
    noStroke();

    if (!stars) return;
    for (var i = 0; i < stars.length; i++) {
        stars[i].render();
    }

    if (!fireworks) return;
    for (var i = fireworks.length - 1; i >= 0; i--) {
        if (fireworks[i].finished) {
            fireworks.splice(i, 1);
        } else {
            fireworks[i].tick();
            fireworks[i].render();
        }
    }

    for (var i = 0; i < hills.length; i++) {
        hills[i].render();
    }

    if (Math.random() < .08) {
        fireworks.push(new Conway());
    }
}

function resize() {
    resizeCanvas(window.innerWidth, window.innerHeight);
}

window['setup'] = setup;
window['draw'] = draw;
window['resize'] = resize;
