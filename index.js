import {extrudeCharacter} from './scripts/CharacterModel3D.js';
import {ZBufferDrawer} from './scripts/ZBufferDrawer.js';

const drawer = new ZBufferDrawer(
    document.querySelector('#canvas'),
    extrudeCharacter(),
    {initialZoom: 22}
);

document.querySelector('#title').textContent = 'Лабораторная работа №4 — ваша фигура и Z-буфер';

const actions = {
    reset: () => drawer.reset(),
    rotateLeft: () => drawer.rotateY(-Math.PI / 18),
    rotateRight: () => drawer.rotateY(Math.PI / 18),
    rotateUp: () => drawer.rotateX(-Math.PI / 18),
    rotateDown: () => drawer.rotateX(Math.PI / 18),
    scaleDown: () => drawer.scale(0.9),
    scaleUp: () => drawer.scale(1.1),
    moveLeft: () => drawer.move(-5, 0),
    moveRight: () => drawer.move(5, 0),
    moveUp: () => drawer.move(0, 5),
    moveDown: () => drawer.move(0, -5),
    moveZBack: () => drawer.moveZ(-5),
    moveZForward: () => drawer.moveZ(5)
};

for (const [id, action] of Object.entries(actions)) {
    document.querySelector(`#${id}`).addEventListener('click', action);
}

drawer.draw();
