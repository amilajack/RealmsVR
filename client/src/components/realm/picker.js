import { Color } from 'three';
import Panel from '@/components/panel';

class Picker extends Panel {
  constructor({ anisotropy }) {
    super({ anisotropy });
    const { renderer } = this;
    this.position.set(-0.15, 0.15, 0.075);
    this.rotation.set(0, Math.PI * 0.5, Math.PI * 0.1, 'ZYX');
    this.scale.set(0.3, 0.3, 1);
    this.block = {
      x: renderer.width * 0.05,
      y: renderer.height * 0.05,
      width: renderer.width * 0.75,
      height: renderer.height * 0.75,
    };
    this.strip = {
      x: renderer.width * 0.85,
      y: renderer.height * 0.05,
      width: renderer.width * 0.1,
      height: renderer.height * 0.75,
    };
    this.blockColor = new Color();
    this.color = new Color();
    this.blockColor.setRGB(1, 0, 0);
    this.color.copy(this.blockColor);
    this.draw();
  }

  draw() {
    const {
      block,
      blockColor,
      color,
      context: ctx,
      renderer,
      strip,
    } = this;

    super.draw();

    {
      const {
        x,
        y,
        width,
        height,
      } = block;
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = `#${blockColor.getHexString()}`;
      ctx.fillRect(0, 0, width, height);

      const grdWhite = ctx.createLinearGradient(0, 0, width, 0);
      grdWhite.addColorStop(0, 'rgba(255,255,255,1)');
      grdWhite.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grdWhite;
      ctx.fillRect(0, 0, width, height);

      const grdBlack = ctx.createLinearGradient(0, 0, 0, height);
      grdBlack.addColorStop(0, 'rgba(0,0,0,0)');
      grdBlack.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = grdBlack;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    {
      const {
        x,
        y,
        width,
        height,
      } = strip;
      ctx.save();
      ctx.translate(x, y);
      const grd = ctx.createLinearGradient(0, 0, 0, height);
      grd.addColorStop(0, 'rgba(255, 0, 0, 1)');
      grd.addColorStop(0.17, 'rgba(255, 255, 0, 1)');
      grd.addColorStop(0.34, 'rgba(0, 255, 0, 1)');
      grd.addColorStop(0.51, 'rgba(0, 255, 255, 1)');
      grd.addColorStop(0.68, 'rgba(0, 0, 255, 1)');
      grd.addColorStop(0.85, 'rgba(255, 0, 255, 1)');
      grd.addColorStop(1, 'rgba(255, 0, 0, 1)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }

    {
      ctx.save();
      const width = renderer.width * 0.3;
      const height = renderer.width * 0.1;
      ctx.translate(renderer.width * 0.35, renderer.height * 0.85);
      ctx.rect(0, 0, width, height);
      ctx.fillStyle = `#${color.getHexString()}`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }

  onPointer(point) {
    const {
      block,
      blockColor,
      color,
      context: ctx,
      pointer,
      strip,
    } = this;
    super.onPointer(point);
    [block, strip].forEach(({
      x,
      y,
      width,
      height,
    }, i) => {
      if (
        pointer.x < x
        || pointer.x > x + width
        || pointer.y < y
        || pointer.y > y + height
      ) {
        return;
      }
      const isStrip = i === 1;
      const imageData = ctx.getImageData(pointer.x, pointer.y, 1, 1).data;
      if (isStrip) {
        blockColor.setRGB(
          imageData[0] / 0xFF,
          imageData[1] / 0xFF,
          imageData[2] / 0xFF
        );
      }
      color.setRGB(
        imageData[0] / 0xFF,
        imageData[1] / 0xFF,
        imageData[2] / 0xFF
      );
      this.draw();
    });
  }
}

export default Picker;
