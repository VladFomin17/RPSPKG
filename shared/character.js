import * as THREE from 'three';
import {extrudeCharacter, points2D, edges2D} from '../scripts/CharacterModel3D.js';

/** Площадь треугольника меньше порога — грань вырождена (в модели такие есть). */
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

/**
 * Рисунок из лабораторной №4 превращается в BufferGeometry.
 * Вершины не общие: нормаль у каждого треугольника своя, поэтому жёсткие
 * рёбра сохраняются, а двусторонний материал сам развернёт нормаль к камере
 * (обход граней в исходной модели произвольный).
 */
export function characterGeometry(mesh = extrudeCharacter(4)) {
    const positions = [];

    for (const face of mesh.faces) {
        for (let i = 1; i < face.length - 1; i++) {
            const a = face[0];
            const b = face[i];
            const c = face[i + 1];

            if (isDegenerate(mesh.points, a, b, c)) {
                continue;
            }

            positions.push(...mesh.points[a], ...mesh.points[b], ...mesh.points[c]);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return geometry;
}

export function characterMesh(options = {}) {
    const material = new THREE.MeshStandardMaterial({
        color: options.color ?? 0xd64040,
        roughness: options.roughness ?? 0.42,
        metalness: options.metalness ?? 0.08,
        flatShading: false,
        side: THREE.DoubleSide
    });

    return new THREE.Mesh(options.geometry ?? characterGeometry(), material);
}

/**
 * Контурные линии рисунка (edges2D) только на передней плоскости: рисунок
 * односторонний, поэтому лицо и детали видны спереди и отсутствуют сзади.
 * В лабораторной №4 это были чёрные линии поверх заливки.
 */
export function characterOutline(depth = 4, options = {}) {
    const zFront = depth / 2 + 0.012;
    const positions = [];

    for (const [a, b] of edges2D) {
        const [ax, ay] = points2D[a];
        const [bx, by] = points2D[b];

        positions.push(ax, ay, zFront, bx, by, zFront);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    return new THREE.LineSegments(
        geometry,
        new THREE.LineBasicMaterial({
            color: options.color ?? 0x111827,
            transparent: true,
            opacity: options.opacity ?? 0.9
        })
    );
}
