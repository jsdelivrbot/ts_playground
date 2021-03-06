attribute vec3 pos;
attribute vec3 rect;
uniform vec3 col;

uniform mat4 mModelView;
uniform mat4 mPerspective;

varying vec4 vFinalColor;

void main() {
    // vFinalColor = vec4( 1, 0.0, 0.0, 1.0 );
    gl_Position = mPerspective * mModelView * vec4(pos, 1.0);
    // gl_Position = mPerspective * vec4(pos, 1.0);
    // gl_Position = vec4(pos, 1.0);
}