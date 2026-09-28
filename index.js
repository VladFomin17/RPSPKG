import {Drawer3D} from './scripts/Drawer3D.js';
import {extrudeCharacter} from './scripts/CharacterModel3D.js';

const model = extrudeCharacter();
const drawer = new Drawer3D(
    document.querySelector('#canvas'),
    model.points,
    model.edges,
    {initialZoom: 22}
);

document.querySelector('#title').textContent = 'Лабораторная работа №2 — 3D, отбрасывание координаты Z';

const actions = {
    reset: () => drawer.reset(),
    rotateLeft: () => drawer.rotateY(-Math.PI / 18),
    rotateRight: () => drawer.rotateY(Math.PI / 18),
    scaleDown: () => drawer.scale(0.9),
    scaleUp: () => drawer.scale(1.1),
    moveLeft: () => drawer.move(-10, 0),
    moveRight: () => drawer.move(10, 0),
    moveUp: () => drawer.move(0, 10),
    moveDown: () => drawer.move(0, -10)
};

for (const [id, action] of Object.entries(actions)) {
    document.querySelector(`#${id}`).addEventListener('click', action);
}

drawer.draw();
