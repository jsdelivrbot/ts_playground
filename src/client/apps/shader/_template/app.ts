
import 'config-loader!./.config.ts';
import 'htmlout-loader!./en.html';
console.log(__filename);

//

import './style.scss';

declare const GlslEditor;
console.log(require('./shader.glsl'));
const glslEditor = new GlslEditor('#glsl_editor', {
    canvas_size: 500,
    canvas_draggable: true,
    theme: 'monokai',
    multipleBuffers: true,
    watchHash: true,
    fileDrops: true,
    menu: true,
});
