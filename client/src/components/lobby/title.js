import {
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  PlaneBufferGeometry,
} from 'three';

class Title extends Mesh {
  constructor({ anisotropy }) {
    const renderer = document.createElement('canvas');
    renderer.width = 1024;
    renderer.height = 1024;
    const texture = new CanvasTexture(renderer);
    texture.anisotropy = anisotropy;
    super(
      new PlaneBufferGeometry(2, 2),
      new MeshBasicMaterial({
        map: texture,
        transparent: true,
      })
    );
    this.lookAt(0, -0.25, 1);
    this.position.set(0, 2, -3);
    this.renderer = renderer;
    this.texture = texture;
    setTimeout(() => this.draw(), 250);
  }

  draw() {
    const { renderer, texture } = this;
    const ctx = renderer.getContext('2d');
    const grd = ctx.createLinearGradient(0, 0, 0, renderer.height);
    grd.addColorStop(0, 'rgba(0,0,0,0.25)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, renderer.width, renderer.height);
    ctx.font = '700 200px Roboto';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#eee';
    ctx.fillText(
      'RealmsVR',
      renderer.width * 0.5,
      renderer.height * 0.2
    );
    ctx.font = '60px Roboto';
    ctx.fillStyle = '#999';
    ctx.fillText(
      'A recursive VR experience',
      renderer.width * 0.5,
      renderer.height * 0.5
    );
    ctx.font = '60px Roboto';
    ctx.fillStyle = '#bbb';
    ctx.fillText(
      'dani@gatunes © 2019',
      renderer.width * 0.5,
      renderer.height * 0.8
    );
    texture.needsUpdate = true;
  }
}

export default Title;
