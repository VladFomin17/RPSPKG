import * as THREE from 'three';
import {extrudeCharacter} from '../scripts/CharacterModel3D.js';

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
 * Проекционная (box) развёртка: для каждого треугольника выбирается ось
 * по доминирующей компоненте нормали, а UV берутся из двух других координат.
 * Для выдавленной фигуры это даёт непрерывную картинку на передней грани.
 */
function applyBoxUVs(geometry) {
    const position = geometry.getAttribute('position');
    const uv = new Float32Array(position.count * 2);

    for (let i = 0; i < position.count; i += 3) {
        const ax = position.getX(i);
        const ay = position.getY(i);
        const az = position.getZ(i);

        const ux = position.getX(i + 1) - ax;
        const uy = position.getY(i + 1) - ay;
        const uz = position.getZ(i + 1) - az;

        const vx = position.getX(i + 2) - ax;
        const vy = position.getY(i + 2) - ay;
        const vz = position.getZ(i + 2) - az;

        const nx = Math.abs(uy * vz - uz * vy);
        const ny = Math.abs(uz * vx - ux * vz);
        const nz = Math.abs(ux * vy - uy * vx);

        const axis = nz >= nx && nz >= ny ? 'z' : ny >= nx ? 'y' : 'x';

        for (let k = 0; k < 3; k++) {
            const x = position.getX(i + k);
            const y = position.getY(i + k);
            const z = position.getZ(i + k);

            const u = axis === 'z' ? x : axis === 'y' ? x : z;
            const v = axis === 'z' ? y : axis === 'y' ? z : y;

            uv[(i + k) * 2] = u;
            uv[(i + k) * 2 + 1] = v;
        }
    }

    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

/**
 * Рисунок из лабораторной №4: треугольники без общих вершин (нормаль у каждого
 * своя) и UV-развёртка в мировых единицах. Масштаб текстуры задаётся через repeat.
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
    applyBoxUVs(geometry);
    geometry.computeVertexNormals();
    return geometry;
}
