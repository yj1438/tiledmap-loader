import TiledLayersContianer from '../util/TiledLayersContianer';
import tiledData from './resource/index.tiled';

console.warn(tiledData);

const tinyOption = {
  showFPS: true,
  viewTouched: true, // 支持滑动
  referWidth: 375,
  // height: 590,
  dpi: 2,
  canvasId: 'J_canvas',
  renderType: 2, // {UNKNOWN: 0, WEBGL: 1, CANVAS: 2}
  renderOptions: {
    backgroundColor: 0x98d8ff,
    transparent: false, // canvas 不透明,
    // antialias: true, // 抗锯齿
  },
  // extraContextAttributes: {
  //   alpha: false,
  //   antialias: false,
  //   gameMode: true,
  //   preserveDrawingBuffer: true, // 支持 webgl 获取 toDataUrl
  // },
  // fps: 20,
  // autoRender: false,
};

const canvas = {
  tinyApp: null,
  root: null,
  init() {
    Tiny.resources = Tiny.resources || {};
    Tiny.app = this.tinyApp = new Tiny.Application(tinyOption);
    this.root = new Tiny.Container();
    this.tinyApp.run(this.root);
    this._render();
  },
  _render() {
    const container = new TiledLayersContianer(tiledData.tiledJson, tiledData.resource);
    this.root.addChild(container);
    // 获取一个 tiny 元素
    const items = container.getChildByName('layer1');
    console.log(items)
  },
};

export default canvas;