attribute vec3 position;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float index;
uniform float time;
uniform float size;

varying vec3 vPosition;
varying vec2 vUv;

void main() {
    float flapTime = radians(sin(time * 6.0 - length(position.xy) / size * 2.6 + index * 2.0) * 45.0 + 30.0);
    // float flapTime = radians(sin(time * 6.0 / size * 2.6 + index * 2.0) * 45.0 + 30.0);
    float hovering = cos(time * 2.0 + index * 3.0) * size / 16.0;
    vec3 updatePosition = vec3(
        cos(flapTime) * position.x,
        position.y + hovering,
        sin(flapTime) * abs(position.x) + hovering
    );

    vec4 mvPosition = modelViewMatrix * vec4(updatePosition, 1.0);

    vPosition = position;
    vUv = uv;

    gl_Position = projectionMatrix * mvPosition;
}
