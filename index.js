import { Drawer3D } from './scripts/Drawer3D.js';
const points = [[-80,-80,-80],[80,-80,-80],[80,80,-80],[-80,80,-80],[-80,-80,80],[80,-80,80],[80,80,80],[-80,80,80]];
const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
const drawer = new Drawer3D(document.querySelector('#canvas'), points, edges);
document.querySelector('#title').textContent = 'Лабораторная работа №2 — 3D, отбрасывание координаты Z'; drawer.draw();
const actions = { reset: () => drawer.reset(), rotateLeft: () => drawer.rotateY(-Math.PI / 18), rotateRight: () => drawer.rotateY(Math.PI / 18), scaleDown: () => drawer.scale(0.9), scaleUp: () => drawer.scale(1.1), moveLeft: () => drawer.move(-10, 0), moveRight: () => drawer.move(10, 0), moveUp: () => drawer.move(0, 10), moveDown: () => drawer.move(0, -10) };
for (const [id, action] of Object.entries(actions)) document.querySelector(`#${id}`).addEventListener('click', action);
