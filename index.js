import {Drawer3D} from './scripts/Drawer3D.js';
import {extrudeCharacter} from './scripts/CharacterModel3D.js';

const model = extrudeCharacter();
const drawers = [
    new Drawer3D(document.querySelector('#frontCanvas'), model.points, model.edges, {projection: 'front', initialZoom: 22}),
    new Drawer3D(document.querySelector('#topCanvas'), model.points, model.edges, {projection: 'top', initialZoom: 22}),
    new Drawer3D(document.querySelector('#sideCanvas'), model.points, model.edges, {projection: 'side', initialZoom: 22})
];

document.querySelector('#title').textContent = 'Лабораторная работа №3 — три ортографические проекции';

function redraw() {
    for (const drawer of drawers) {
        drawer.draw();
    }
}

const actions = {
    reset: () => drawers.forEach(drawer => drawer.reset()),
    rotateLeft: () => drawers.forEach(drawer => drawer.rotateY(-Math.PI / 18)),
    rotateRight: () => drawers.forEach(drawer => drawer.rotateY(Math.PI / 18)),
    rotateUp: () => drawers.forEach(drawer => drawer.rotateX(-Math.PI / 18)),
    rotateDown: () => drawers.forEach(drawer => drawer.rotateX(Math.PI / 18)),
    scaleDown: () => drawers.forEach(drawer => drawer.scale(0.9)),
    scaleUp: () => drawers.forEach(drawer => drawer.scale(1.1)),
    moveLeft: () => drawers.forEach(drawer => drawer.move(-10, 0)),
    moveRight: () => drawers.forEach(drawer => drawer.move(10, 0)),
    moveUp: () => drawers.forEach(drawer => drawer.move(0, 10)),
    moveDown: () => drawers.forEach(drawer => drawer.move(0, -10))
};

for (const [id, action] of Object.entries(actions)) {
    document.querySelector(`#${id}`).addEventListener('click', action);
}

redraw();
