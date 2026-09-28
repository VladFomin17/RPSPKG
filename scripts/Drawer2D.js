export class Drawer2D {
    constructor(canvas, points, edges) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.source = points.map(([x, y]) => ({x, y}));
        this.points = points.map(([x, y]) => ({x, y}));
        this.edges = edges;
        this.angle = 0;
        this.zoom = 24;
        this.offset = {x: 0, y: 0};
    }

    reset() {
        this.points = this.source.map(point => ({...point}));
        this.angle = 0;
        this.zoom = 24;
        this.offset = {x: 0, y: 0};
        this.draw();
    }

    rotate(angle) {
        this.angle += angle;
        this.draw();
    }

    scale(value) {
        this.zoom *= value;
        this.draw();
    }

    move(dx, dy) {
        this.offset.x += dx;
        this.offset.y += dy;
        this.draw();
    }

    screen({x, y}) {
        const cos = Math.cos(this.angle);
        const sin = Math.sin(this.angle);
        const rotatedX = x * cos - y * sin;
        const rotatedY = x * sin + y * cos;

        return {
            x: this.canvas.width / 2 + (rotatedX + this.offset.x) * this.zoom,
            y: this.canvas.height / 2 - (rotatedY + this.offset.y) * this.zoom
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

        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 3;
        for (const [a, b] of this.edges) {
            const first = this.screen(this.points[a]);
            const second = this.screen(this.points[b]);
            ctx.beginPath();
            ctx.moveTo(first.x, first.y);
            ctx.lineTo(second.x, second.y);
            ctx.stroke();
        }
    }
}
