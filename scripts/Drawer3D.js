import { Matrix4 } from './Matrix4.js';

export class Drawer3D {
    constructor(canvas, points, edges, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.source = points.map(([x, y, z]) => ({x, y, z}));
        this.points = this.source.map(point => ({...point}));
        this.edges = edges;
        this.projection = options.projection || 'drop-z';
        this.initialZoom = options.initialZoom ?? 2.1;
        this.color = options.color || '#1d4ed8';
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
        if (this.projection === 'top') {
            return {x: point.x, y: point.z};
        }
        if (this.projection === 'side') {
            return {x: point.z, y: point.y};
        }
        if (this.projection === 'cabinet') {
            return {x: point.x + 0.5 * point.z, y: point.y + 0.3 * point.z};
        }
        return {x: point.x, y: point.y};
    }

    screen(point) {
        const projected = this.project(point);
        return {
            x: this.canvas.width / 2 + projected.x,
            y: this.canvas.height / 2 - projected.y
        };
    }

    draw() {
        const {ctx, canvas} = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#b4bbc8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();

        const points = this.transformed();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        for (const [a, b] of this.edges) {
            const first = this.screen(points[a]);
            const second = this.screen(points[b]);
            ctx.beginPath();
            ctx.moveTo(first.x, first.y);
            ctx.lineTo(second.x, second.y);
            ctx.stroke();
        }
    }
}
