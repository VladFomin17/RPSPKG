export class Drawer2D {
  constructor(canvas, points, edges) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.source = points.map(([x, y]) => ({ x, y })); this.points = points.map(([x, y]) => ({ x, y })); this.edges = edges; this.angle = 0; this.zoom = 2.2; this.offset = { x: 0, y: 0 }; }
  reset() { this.points = this.source.map(p => ({ ...p })); this.angle = 0; this.zoom = 2.2; this.offset = { x: 0, y: 0 }; this.draw(); }
  rotate(angle) { this.angle += angle; this.draw(); }
  scale(value) { this.zoom *= value; this.draw(); }
  move(dx, dy) { this.offset.x += dx; this.offset.y += dy; this.draw(); }
  screen({ x, y }) { const c = Math.cos(this.angle), s = Math.sin(this.angle); const rx = x * c - y * s; const ry = x * s + y * c; return { x: this.canvas.width / 2 + (rx + this.offset.x) * this.zoom, y: this.canvas.height / 2 - (ry + this.offset.y) * this.zoom }; }
  draw() { const { ctx, canvas } = this; ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = '#b4bbc8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, canvas.height / 2); ctx.lineTo(canvas.width, canvas.height / 2); ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height); ctx.stroke(); ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 3; for (const [a, b] of this.edges) { const p = this.screen(this.points[a]), q = this.screen(this.points[b]); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); } }
}

