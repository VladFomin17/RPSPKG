export function characterModel() {
    const points = [];
    const edges = [];
    const faces = [];

    function addBox(centerX, centerY, centerZ, width, height, depth) {
        const offset = points.length;
        const vertices = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ];
        const boxEdges = [
            [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6],
            [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]
        ];
        const boxFaces = [
            [0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1],
            [1, 5, 6, 2], [2, 6, 7, 3], [4, 0, 3, 7]
        ];

        for (const [x, y, z] of vertices) {
            points.push([
                centerX + x * width / 2,
                centerY + y * height / 2,
                centerZ + z * depth / 2
            ]);
        }
        for (const [a, b] of boxEdges) edges.push([offset + a, offset + b]);
        for (const face of boxFaces) faces.push(face.map(index => offset + index));
    }

    addBox(0, 90, 0, 70, 70, 50);
    addBox(0, 10, 0, 90, 90, 45);
    addBox(-65, 15, 0, 30, 80, 35);
    addBox(65, 15, 0, 30, 80, 35);
    addBox(-25, -75, 0, 35, 80, 40);
    addBox(25, -75, 0, 35, 80, 40);

    return {points, edges, faces};
}
