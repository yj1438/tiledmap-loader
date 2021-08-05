import TiledLayersContianer from '../tiledClass/TiledLayersContianer.pixi';
import TiledData from '../tiledClass/TiledData';
import indexTiledData from './resource/index.tiled';

console.warn(indexTiledData);

export default {
  app: null,
  root: null,
  init() {
    const width = 750;
    const height = 1624;
    const view = document.getElementById('J_canvas');
    view.style.width = `${width / 2}px`;
    view.style.height = `${height / 2}px`;
    this.app = new PIXI.Application({
      view,
      width: width,
      height: height,
      antialias: true,
      backgroundColor: 0x98d8ff
    });
    PIXI._app = this.app;
    this.root = this.app.stage;
  
    // eg1: TiledContainer
    const canvasOption = {
      width: this.app.screen.width,
      height: this.app.screen.height,
    };
    const container = new TiledLayersContianer(indexTiledData.tiledJson, indexTiledData.resource, canvasOption);
    this.root.addChild(container);
    console.log(container)
    // 获取一个 PIXI 元素
    const item = container.getChildByName('obj1');
    console.log(item);
    // 获取一个(框)区域
    const frame = container.getChildByName('frame');
    const sprite = PIXI.Sprite.from('https://gw.alipayobjects.com/mdn/rms_93c05c/afts/img/A*sw6_QZgKyW8AAAAAAAAAAAAAARQnAQ');
    frame.addChild(sprite);

    // eg2: TiledJsonData
    const tiledData = new TiledData(indexTiledData.tiledJson, indexTiledData.resource, canvasOption);
    console.log(tiledData);
    // 获取一个元素的基础信息
    const obj = tiledData.getObjectByName('bg');
    console.log(obj); // { x, y, height, width, rotation, properties, visible }
  },
};
