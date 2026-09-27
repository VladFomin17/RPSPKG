export function characterModel() {
  const points=[], edges=[], faces=[];
  const addBox=(cx,cy,cz,w,h,d)=>{const n=points.length;for(const [x,y,z] of [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]])points.push([cx+x*w/2,cy+y*h/2,cz+z*d/2]);for(const [a,b] of [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]])edges.push([n+a,n+b]);for(const face of [[0,1,2,3],[4,7,6,5],[0,4,5,1],[1,5,6,2],[2,6,7,3],[4,0,3,7]])faces.push(face.map(i=>n+i));};
  addBox(0,90,0,70,70,50); addBox(0,10,0,90,90,45); addBox(-65,15,0,30,80,35); addBox(65,15,0,30,80,35); addBox(-25,-75,0,35,80,40); addBox(25,-75,0,35,80,40);
  return {points,edges,faces};
}
