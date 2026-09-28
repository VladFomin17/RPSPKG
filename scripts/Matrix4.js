export class Matrix4 {
  static multiply(a, b) { return a.map((row, i) => b[0].map((_, j) => row.reduce((sum, _, k) => sum + a[i][k] * b[k][j], 0))); }
  static transform(points, matrix) { return points.map(p => { const v = Matrix4.multiply(matrix, [[p.x],[p.y],[p.z],[1]]); return { x:v[0][0], y:v[1][0], z:v[2][0], w:v[3][0] }; }); }
  static translation(x,y,z) { return [[1,0,0,x],[0,1,0,y],[0,0,1,z],[0,0,0,1]]; }
  static scale(x,y,z) { return [[x,0,0,0],[0,y,0,0],[0,0,z,0],[0,0,0,1]]; }
  static rotateY(a) { const c=Math.cos(a),s=Math.sin(a); return [[c,0,s,0],[0,1,0,0],[-s,0,c,0],[0,0,0,1]]; }
  static rotateX(a) { const c=Math.cos(a),s=Math.sin(a); return [[1,0,0,0],[0,c,-s,0],[0,s,c,0],[0,0,0,1]]; }
}
