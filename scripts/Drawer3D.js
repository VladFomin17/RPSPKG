import { Matrix4 } from './Matrix4.js';
export class Drawer3D {
  constructor(canvas, points, edges, options = {}) { this.canvas=canvas;this.ctx=canvas.getContext('2d');this.source=points.map(([x,y,z])=>({x,y,z}));this.points=this.source.map(p=>({...p}));this.edges=edges;this.projection=options.projection || 'drop-z';this.angle=0;this.zoom=2.1;this.offset={x:0,y:0}; }
  reset(){this.points=this.source.map(p=>({...p}));this.angle=0;this.zoom=2.1;this.offset={x:0,y:0};this.draw();}
  rotateY(a){this.angle+=a;this.draw();} scale(v){this.zoom*=v;this.draw();} move(x,y){this.offset.x+=x;this.offset.y+=y;this.draw();}
  transformed(){const m=Matrix4.multiply(Matrix4.translation(this.offset.x,this.offset.y,0),Matrix4.multiply(Matrix4.rotateY(this.angle),Matrix4.scale(this.zoom,this.zoom,this.zoom)));return Matrix4.transform(this.points,m);}
  screen(p){const x=this.projection==='cabinet'?p.x+0.5*p.z:p.x;const y=this.projection==='cabinet'?p.y+0.3*p.z:p.y;return {x:this.canvas.width/2+x,y:this.canvas.height/2-y};}
  draw(){const {ctx,canvas}=this;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#b4bbc8';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,canvas.height/2);ctx.lineTo(canvas.width,canvas.height/2);ctx.moveTo(canvas.width/2,0);ctx.lineTo(canvas.width/2,canvas.height);ctx.stroke();const pts=this.transformed();ctx.strokeStyle='#dc2626';ctx.lineWidth=3;for(const [a,b] of this.edges){const p=this.screen(pts[a]),q=this.screen(pts[b]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();}}
}
