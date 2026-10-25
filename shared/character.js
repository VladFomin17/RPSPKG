import * as THREE from 'three';
import {extrudeCharacter} from '../scripts/CharacterModel3D.js';

const range = (from, to) => Array.from({length: to - from + 1}, (_, index) => from + index);

/**
 * Части фигуры — это связные блоки исходных точек (см. points2D).
 * Для каждой части задан шарнир: поворот выполняется вокруг него.
 */
const PARTS = [
    {name: 'body', indices: [...range(0, 42), 66], pivot: [0, 0, 0]},
    {name: 'leftArm', indices: range(43, 48), pivot: [-5, 4, 0]},
    {name: 'rightArm', indices: range(49, 54), pivot: [5, 4, 0]},
    {name: 'leftLeg', indices: range(55, 60), pivot: [-2, -3, 0]},
    {name: 'rightLeg', indices: [...range(61, 65), 67], pivot: [2, -3, 0]}
];

function isDegenerate(points, a, b, c) {
    const [ax, ay, az] = points[a];
    const [bx, by, bz] = points[b];
    const [cx, cy, cz] = points[c];

    const ux = bx - ax;
    const uy = by - ay;
    const uz = bz - az;
    const vx = cx - ax;
    const vy = cy - ay;
    const vz = cz - az;

    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;

    return nx * nx + ny * ny + nz * nz < 1e-8;
}

function pushTriangle(positions, points, pivot, a, b, c) {
    for (const index of [a, b, c]) {
        positions.push(
            points[index][0] - pivot[0],
            points[index][1] - pivot[1],
            points[index][2] - pivot[2]
        );
    }
}

/**
 * Фигура собирается из отдельных групп: корпус, две руки, две ноги.
 * Геометрия каждой группы сдвинута так, что её начало координат — шарнир.
 */
export function buildCharacter(mesh = extrudeCharacter(4)) {
    const count = mesh.points.length / 2;
    const root = new THREE.Group();
    const groups = {};

    const material = new THREE.MeshStandardMaterial({
        color: 0xd64040,
        roughness: 0.45,
        metalness: 0.08,
        side: THREE.DoubleSide
    });

    for (const part of PARTS) {
        const indices = new Set(part.indices);
        const positions = [];

        for (const face of mesh.faces) {
            if (!indices.has(face[0] % count)) {
                continue;
            }

            for (let i = 1; i < face.length - 1; i++) {
                const a = face[0];
                const b = face[i];
                const c = face[i + 1];

                if (isDegenerate(mesh.points, a, b, c)) {
                    continue;
                }

                pushTriangle(positions, mesh.points, part.pivot, a, b, c);
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.computeVertexNormals();

        const group = new THREE.Group();
        group.name = part.name;
        group.position.set(...part.pivot);

        const partMesh = new THREE.Mesh(geometry, material);
        partMesh.castShadow = true;

        group.add(partMesh);
        root.add(group);
        groups[part.name] = group;
    }

    return {root, groups, material};
}
