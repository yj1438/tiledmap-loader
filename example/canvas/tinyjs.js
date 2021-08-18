import TiledLayersContainer from '../tiledClass/TiledLayersContainer.tinyjs';
import indexTiledData from './resource/index.tiled';

console.warn(indexTiledData);

const width = 750;
const height = 1624;

export default {
  app: null,
  root: null,
  init() {
    this.app = new Tiny.Application({
      showFPS: true,
      viewTouched: true, // 支持滑动
      referWidth: width / 2,
      height: height / 2,
      dpi: 2,
      canvasId: 'J_canvas',
      renderType: 1, // {UNKNOWN: 0, WEBGL: 1, CANVAS: 2}
      renderOptions: {
        backgroundColor: 0x98d8ff,
        transparent: false, // canvas 不透明,
        antialias: true, // 抗锯齿
      },
    });
    this.root = new Tiny.Container();
    this.app.run(this.root);

    this._render();
  },
  _render() {
    const container = new TiledLayersContainer(
      indexTiledData.tiledJson,
      indexTiledData.resource,
      { width: width, height: height, layoutRef: 'center' }
    );
    this.root.addChild(container);
    /*
     * 获取一个元素
     */
    // 图片 sprite
    const item = container.getChildByName('obj1');
    // 占位框
    const placeholder = container.getChildByName('placeholder');
    const sprite1 = Tiny.Sprite.from('https://gw.alipayobjects.com/mdn/rms_93c05c/afts/img/A*sw6_QZgKyW8AAAAAAAAAAAAAARQnAQ');
    placeholder.addChild(sprite1);
    // (框/点)区域
    const frame = container.getChildByName('frame');
    const sprite2 = Tiny.Sprite.from('https://gw.alipayobjects.com/mdn/rms_93c05c/afts/img/A*sw6_QZgKyW8AAAAAAAAAAAAAARQnAQ');
    frame.addChild(sprite2);
  },
};
