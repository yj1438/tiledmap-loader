import TiledLayersContianer from '../tiledClass/TiledLayersContianer.pixi';
import TiledJsonData from '../tiledClass/TiledJsonData';
import tiledData from './resource/index.tiled';

console.warn(tiledData);

export default {
  app: null,
  root: null,
  init() {
    const height = 1624;
    const view = document.getElementById('J_canvas');
    view.style.width = '375px';
    view.style.height = `${height / 2}px`;
    this.app = new PIXI.Application({
      view,
      width: 750,
      height: height,
      antialias: true,
      backgroundColor: 0x98d8ff
    });
    this.root = this.app.stage;
  
    // eg1: TiledContainer
    const container = new TiledLayersContianer(tiledData.tiledJson, tiledData.resource);
    this.root.addChild(container);
    console.log(container)
    // 获取一个 PIXI 元素
    const items = container.getChildByName('obj1');
    console.log(items)

    // eg2: TiledJsonData
    const tiledJsonData = new TiledJsonData(tiledData.tiledJson, tiledData.resource);
    console.log(tiledJsonData);
    // 获取一个元素的基础信息
    const objs = tiledJsonData.getObjectByName('obj1');
    console.log(objs); // { x, y, height, width, rotation, properties, visible }
  },
};
