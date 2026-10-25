// Те же 2D-точки и рёбра, что введены в lab1.
// Нулевая точка сохранена для 1-based нумерации рёбер.
export const points2D = [
    [],
    [-5, -3],
    [-5, 9],
    [5, 9],
    [5, -3],
    [-3, 9],
    [-2, 12],
    [-1, 12],
    [0, 11],
    [1, 12],
    [2, 12],
    [3, 9],
    [-2, 9],
    [-1, 11],
    [0, 9],
    [1, 11],
    [-3, 4],
    [-4, 6],
    [-3, 7],
    [-1, 6],
    [-1, 5],
    [3, 4],
    [1, 5],
    [1, 6],
    [3, 7],
    [4, 6],
    [-3, 5],
    [-3, 6],
    [-2, 6],
    [-2, 5],
    [2, 5],
    [2, 6],
    [3, 6],
    [3, 5],
    [-3, 2],
    [3, 2],
    [1, -1],
    [-1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [-1, 2],
    [1, 2],
    [1, 1],
    [-5, 4],
    [-7, 2],
    [-8, 0],
    [-8, -2],
    [-6, -2],
    [-6, 0],
    [5, 4],
    [7, 2],
    [8, 0],
    [8, -2],
    [6, -2],
    [6, 0],
    [-2, -3],
    [-3, -6],
    [-3, -8],
    [-3, -9],
    [-5, -8],
    [-5, -9],
    [2, -3],
    [3, -6],
    [3, -8],
    [5, -8],
    [5, -9],
    [2, 9],
    [3, -9]
];

export const edges2D = [
    [1, 2], [1, 4], [2, 3], [3, 4],
    [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11],
    [12, 13], [12, 67], [13, 14], [14, 15], [15, 67],
    [16, 17], [16, 20], [17, 18], [18, 19], [19, 20],
    [21, 22], [21, 25], [22, 23], [23, 24], [24, 25],
    [26, 27], [26, 29], [27, 28], [28, 29],
    [30, 31], [30, 33], [31, 32], [32, 33],
    [34, 35], [34, 37], [35, 36], [36, 37], [36, 39], [37, 38], [38, 39],
    [40, 41], [40, 43], [41, 42], [42, 43],
    [44, 45], [45, 46], [46, 47], [46, 49], [47, 48], [48, 49],
    [50, 51], [51, 52], [52, 53], [52, 55], [53, 54], [54, 55],
    [56, 57], [57, 58], [58, 59], [58, 60], [59, 61], [60, 61],
    [62, 63], [63, 64], [64, 65], [64, 68], [65, 66], [66, 68]
];

export const faceLoops2D = [
    [1, 2, 3, 4],
    [5, 6, 7, 13, 12],
    [7, 8, 14, 13],
    [9, 8, 14, 15],
    [15, 11, 67],
    [15, 9, 67],
    [9, 10, 11, 15, 67],
    [16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25],
    [26, 27, 28, 29],
    [30, 31, 32, 33],
    [34, 35, 36, 37],
    [36, 37, 38, 39],
    [40, 41, 42, 43],
    [46, 47, 48, 49],
    [52, 53, 54, 55],
    [58, 59, 60, 61],
    [64, 65, 66, 68]
];

export const holeLoops2D = [];

function loopArea(loop) {
    let area = 0;
    for (let i = 0; i < loop.length; i++) {
        const [x1, y1] = points2D[loop[i]];
        const [x2, y2] = points2D[loop[(i + 1) % loop.length]];
        area += x1 * y2 - x2 * y1;
    }
    return Math.abs(area) / 2;
}

// Контур с наибольшей площадью считаем силуэтом: всё, что лежит внутри него,
// в трёхмерной модели скрыто телом, поэтому боковые грани у таких рёбер не нужны.
const outerLoop = faceLoops2D.reduce(
    (best, loop) => (loopArea(loop) > loopArea(best) ? loop : best)
);

const outerPoints = outerLoop.map(index => points2D[index]);
const outerBox = {
    minX: Math.min(...outerPoints.map(point => point[0])),
    maxX: Math.max(...outerPoints.map(point => point[0])),
    minY: Math.min(...outerPoints.map(point => point[1])),
    maxY: Math.max(...outerPoints.map(point => point[1]))
};

const OUTER_MARGIN = 0.5;

function isInternalPoint(index) {
    const [x, y] = points2D[index];
    return x > outerBox.minX + OUTER_MARGIN && x < outerBox.maxX - OUTER_MARGIN
        && y > outerBox.minY + OUTER_MARGIN && y < outerBox.maxY - OUTER_MARGIN;
}

// Для двумерной отрисовки часть рёбер по Z не рисовалась, но в трёхмерной сцене
// фигура должна быть сплошным телом: передняя плоскость z = +depth/2,
// задняя z = -depth/2, боковые грани — по внешним рёбрам контура.
export function extrudeCharacter(depth = 4) {
    const base = points2D.slice(1).map(([x, y]) => [x, y, depth / 2]);
    const back = base.map(([x, y]) => [x, y, -depth / 2]);
    const points = [...base, ...back];
    const count = base.length;
    const edges = [];
    const faces = [];

    for (const [a, b] of edges2D) {
        edges.push([a - 1, b - 1]);
        edges.push([a - 1 + count, b - 1 + count]);

        if (!isInternalPoint(a) || !isInternalPoint(b)) {
            faces.push([a - 1, b - 1, b - 1 + count, a - 1 + count]);
        }
    }

    for (let i = 0; i < count; i++) {
        edges.push([i, i + count]);
    }

    for (const loop of faceLoops2D) {
        const front = loop.map(index => index - 1);
        const back = [...front].reverse().map(index => index + count);

        for (let i = 1; i < front.length - 1; i++) {
            faces.push([front[0], front[i], front[i + 1]]);
            faces.push([back[0], back[i], back[i + 1]]);
        }
    }

    const holes = holeLoops2D.map(loop => loop.map(index => index - 1));
    return {points, edges, faces, holes};
}
