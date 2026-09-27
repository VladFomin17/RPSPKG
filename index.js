import { characterModel } from './scripts/CharacterModel.js';
import { ZBufferDrawer } from './scripts/ZBufferDrawer.js';
const drawer = new ZBufferDrawer(document.querySelector('#canvas'), characterModel());
document.querySelector('#title').textContent = 'Лабораторная работа №4 — удаление невидимых линий, Z-буфер'; drawer.draw();
const actions = { reset: () => drawer.reset(), rotateLeft: () => drawer.rotateY(-Math.PI / 18), rotateRight: () => drawer.rotateY(Math.PI / 18), scaleDown: () => drawer.scale(0.9), scaleUp: () => drawer.scale(1.1), moveLeft: () => drawer.move(-10, 0), moveRight: () => drawer.move(10, 0), moveUp: () => drawer.move(0, 10), moveDown: () => drawer.move(0, -10) };
for (const [id, action] of Object.entries(actions)) document.querySelector(`#${id}`).addEventListener('click', action);
