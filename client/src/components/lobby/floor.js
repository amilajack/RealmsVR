import {
  BufferGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  VertexColors,
} from 'three';

class Floor extends Mesh {
  constructor() {
    const size = 256;
    const geometry = new PlaneGeometry(size, size, size, size);
    geometry.rotateX(Math.PI * -0.5);
    const color = new Color();
    geometry.faces.forEach((face, i) => {
      if (i % 2 === 1) {
        face.color.copy(color);
      } else {
        face.color.setHex(0x555555);
        face.color.offsetHSL(0, 0, Math.random() * -0.1);
        color.copy(face.color);
      }
    });
    super(
      (new BufferGeometry()).fromGeometry(geometry),
      new MeshBasicMaterial({
        vertexColors: VertexColors,
      })
    );
  }
}

export default Floor;
