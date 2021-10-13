export default (PIXI.TiledSprite = class TiledSprite extends PIXI.Sprite {
  fixAnchor(x, y) {
    const { x: anchorX, y: anchorY } = this.anchor;
    const { x: posX, y: posY } = this.position;
    const _x = Number.isNaN(parseFloat(x)) ? anchorX : parseFloat(x);
    const _y = Number.isNaN(parseFloat(y)) ? anchorY : parseFloat(y);
    // 调整 anchor
    const self = this;
    const fixFn = function() {
      const fixX = (_x - anchorX) * self.width;
      const fixY = (_y - anchorY) * self.height;
      self.position.set(posX + fixX, posY + fixY);
      self.anchor.set(_x, _y);
    };
    if (this.texture.height <= 1 && this.texture.width <= 1) {
      this.texture.on('update', () => {
        fixFn();
      });
    } else {
      fixFn();
    }
  }
});
