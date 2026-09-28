import {Matrix4} from './Matrix4.js';

export class ZBufferDrawer {
    constructor(canvas, model, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.source = model.points.map(([x, y, z]) => ({x, y, z}));
        this.edges = model.edges;
        this.faces = model.faces;
        this.points = this.source.map(point => ({...point}));
        this.initialZoom = options.initialZoom ?? 1.4;
        this.angle = 0;
        this.zoom = this.initialZoom;
        this.offset = {x: 0, y: 0};
    }

    reset() {
        this.points = this.source.map(point => ({...point}));
        this.angle = 0;
        this.zoom = this.initialZoom;
        this.offset = {x: 0, y: 0};
        this.draw();
    }

    rotateY(angle) {
        this.angle += angle;
        this.draw();
    }

    scale(value) {
        this.zoom *= value;
        this.draw();
    }

    move(x, y) {
        this.offset.x += x;
        this.offset.y += y;
        this.draw();
    }

    transformed() {
        const matrix = Matrix4.multiply(
            Matrix4.translation(this.offset.x, this.offset.y, 0),
            Matrix4.multiply(
                Matrix4.rotateY(this.angle),
                Matrix4.scale(this.zoom, this.zoom, this.zoom)
            )
        );
        return Matrix4.transform(this.points, matrix);
    }

    project(point) {
        return {
            x: this.canvas.width / 2 + point.x + 0.5 * point.z,
            y: this.canvas.height / 2 - point.y - 0.3 * point.z,
            z: point.z
        };
    }

    putTriangle(buffer, first, second, third) {
        const minX = Math.max(0, Math.floor(Math.min(first.x, second.x, third.x)));
        const maxX = Math.min(this.canvas.width - 1, Math.ceil(Math.max(first.x, second.x, third.x)));
        const minY = Math.max(0, Math.floor(Math.min(first.y, second.y, third.y)));
        const maxY = Math.min(this.canvas.height - 1, Math.ceil(Math.max(first.y, second.y, third.y)));
        const denominator = (second.y - third.y) * (first.x - third.x) + (third.x - second.x) * (first.y - third.y);

        if (Math.abs(denominator) < 1e-9) {
            return;
        }

        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                const u = ((second.y - third.y) * (x - third.x) + (third.x - second.x) * (y - third.y)) / denominator;
                const v = ((third.y - first.y) * (x - third.x) + (first.x - third.x) * (y - third.y)) / denominator;
                const w = 1 - u - v;

                if (u >= 0 && v >= 0 && w >= 0) {
                    const depth = u * first.z + v * second.z + w * third.z;
                    const index = y * this.canvas.width + x;
                    if (depth > buffer.z[index]) {
                        buffer.z[index] = depth;
                        buffer.color[index] = true;
                    }
                }
            }
        }
    }

    draw() {
        const points = this.transformed().map(point => this.project(point));
        const buffer = {
            z: new Float64Array(this.canvas.width * this.canvas.height).fill(-Infinity),
            color: new Array(this.canvas.width * this.canvas.height)
        };

        for (const face of this.faces) {
            this.putTriangle(buffer, points[face[0]], points[face[1]], points[face[2]]);
            if (face.length === 4) {
                this.putTriangle(buffer, points[face[0]], points[face[2]], points[face[3]]);
            }
        }

        const image = this.ctx.createImageData(this.canvas.width, this.canvas.height);
        for (let i = 0; i < buffer.color.length; i++) {
            const color = buffer.color[i] ? [37, 99, 235] : [255, 255, 255];
            image.data[i * 4] = color[0];
            image.data[i * 4 + 1] = color[1];
            image.data[i * 4 + 2] = color[2];
            image.data[i * 4 + 3] = 255;
        }
        this.ctx.putImageData(image, 0, 0);
        this.drawVisibleEdges(points, buffer.z);
    }

    drawVisibleEdges(points, depthBuffer) {
        this.ctx.strokeStyle = '#1d4ed8';
        this.ctx.lineWidth = 2;

        for (const [a, b] of this.edges) {
            let previous = null;

            for (let step = 0; step <= 80; step++) {
                const t = step / 80;
                const point = {
                    x: points[a].x + (points[b].x - points[a].x) * t,
                    y: points[a].y + (points[b].y - points[a].y) * t,
                    z: points[a].z + (points[b].z - points[a].z) * t
                };
                const x = Math.round(point.x);
                const y = Math.round(point.y);
                const visible = x >= 0 && y >= 0 && x < this.canvas.width && y < this.canvas.height && point.z >= depthBuffer[y * this.canvas.width + x] - 0.5;

                if (visible && previous) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(previous.x, previous.y);
                    this.ctx.lineTo(point.x, point.y);
                    this.ctx.stroke();
                }
                previous = visible ? point : null;
            }
        }
    }
}
