import { Drawer2D } from './scripts/Drawer2D.js';

const points = [
  [-40, 144], [-64, 120], [-64, 40], [-40, 16], [-24, 16], [-24, -8],
  [-80, -8], [-80, -88], [-56, -88], [-56, -32], [-32, -56], [-32, -136],
  [-32, -144], [-8, -144], [-8, -136], [-8, -80], [0, -88], [8, -80],
  [8, -136], [8, -144], [32, -144], [32, -136], [32, -56], [56, -32],
  [56, -88], [80, -88], [80, -8], [24, -8], [24, 16], [40, 16],
  [64, 40], [64, 120], [40, 144], [-56, 120], [-8, 120], [-8, 72],
  [8, 120], [8, 72]
];

const edges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,27],[27,28],[28,29],[29,30],[30,31],[31,32],[32,0],
  [5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,20],[20,21],[21,22],[22,23],[23,24],[24,25],[25,26],[26,27],
  [33,34],[34,35],[35,33],[36,37],[37,38],[38,36]];

const drawer = new Drawer2D(document.querySelector('#canvas'), points, edges);
document.querySelector('#title').textContent = 'Лабораторная работа №1 — 2D-отрисовка';
drawer.draw();
const actions = { reset: () => drawer.reset(), rotateLeft: () => drawer.rotate(-Math.PI / 18), rotateRight: () => drawer.rotate(Math.PI / 18), scaleDown: () => drawer.scale(0.9), scaleUp: () => drawer.scale(1.1), moveLeft: () => drawer.move(-10, 0), moveRight: () => drawer.move(10, 0), moveUp: () => drawer.move(0, 10), moveDown: () => drawer.move(0, -10) };
for (const [id, action] of Object.entries(actions)) document.querySelector(`#${id}`).addEventListener('click', action);

