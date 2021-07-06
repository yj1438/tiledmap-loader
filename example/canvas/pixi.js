import TiledLayersContianer from '../tiledClass/TiledLayersContianer.pixi';
import tiledData from './resource/index.tiled';

console.warn(tiledData);

const options = {
  width: 750,
  height: 1334,
};

export default {
  app: null,
  root: null,
  init() {
    const view = document.getElementById('J_canvas');
    view.style.width = '375px';
    view.style.height = '812px';
    this.app = new PIXI.Application({
      view,
      width: 750,
      height: 1624,
      antialias: true,
      backgroundColor: 0x98d8ff
    });
    this.root = this.app.stage;
    //
    this._render();
  },
  _render() {
    const container = new TiledLayersContianer(tiledData.tiledJson, tiledData.resource);
    this.root.addChild(container);
    // eg 获取一个 PIXI 元素
    const items = container.getChildByName('layer1');
    console.log(items)
  },
};
