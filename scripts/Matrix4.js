export class Matrix4 {
    static multiply(first, second) {
        return first.map((row, rowIndex) => second[0].map((_, columnIndex) => row.reduce(
            (sum, _, index) => sum + first[rowIndex][index] * second[index][columnIndex],
            0
        )));
    }

    static transform(points, matrix) {
        return points.map(point => {
            const vector = Matrix4.multiply(matrix, [[point.x], [point.y], [point.z], [1]]);
            return {
                x: vector[0][0],
                y: vector[1][0],
                z: vector[2][0],
                w: vector[3][0]
            };
        });
    }

    static translation(x, y, z) {
        return [[1, 0, 0, x], [0, 1, 0, y], [0, 0, 1, z], [0, 0, 0, 1]];
    }

    static scale(x, y, z) {
        return [[x, 0, 0, 0], [0, y, 0, 0], [0, 0, z, 0], [0, 0, 0, 1]];
    }

    static rotateY(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [[cos, 0, sin, 0], [0, 1, 0, 0], [-sin, 0, cos, 0], [0, 0, 0, 1]];
    }

    static rotateX(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [[1, 0, 0, 0], [0, cos, -sin, 0], [0, sin, cos, 0], [0, 0, 0, 1]];
    }

    static rotateZ(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [[cos, -sin, 0, 0], [sin, cos, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    }
}
