import TiledLayersContainer from '../tiledClass/TiledLayersContainer.pixi';
import TiledData from '../tiledClass/TiledData';
import indexTiledData from './resource/index.tiled';

console.warn(indexTiledData);

const { clientHeight, clientWidth } = document.body;
const width = clientWidth * 2;
const height = clientHeight * 2;

export default {
  app: null,
  root: null,
  init() {
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
    this.root = this.app.stage;

    this._render();
  },
  _render() {

    // eg1: TiledContainer
    const container = new TiledLayersContainer(
      indexTiledData.tiledJson,
      indexTiledData.resource,
      { width: width, height: height, layoutRef: 'center' },
    );
    this.root.addChild(container);
    /*
     * 获取一个元素
     */
    // 图片 sprite
    const item = container.getChildByName('obj1');
    console.log('object', item);
    // 占位框
    const placeholder = container.getChildByName('placeholder');
    console.log('placeholder', placeholder);
    const sprite1 = PIXI.Sprite.from('https://gw.alipayobjects.com/mdn/rms_93c05c/afts/img/A*sw6_QZgKyW8AAAAAAAAAAAAAARQnAQ');
    placeholder.addChild(sprite1);
    // (框/点)区域
    const frame = container.getChildByName('frame'); // point
    console.log('frame', frame);
    const sprite2 = PIXI.Sprite.from('https://gw.alipayobjects.com/mdn/rms_93c05c/afts/img/A*sw6_QZgKyW8AAAAAAAAAAAAAARQnAQ');
    frame.addChild(sprite2);

    // eg2: TiledJsonData
    // const tiledData = new TiledData(
    //   indexTiledData.tiledJson,
    //   indexTiledData.resource,
    //   { width: width, height: height, layoutRef: 'center' },
    // );
    // console.log(tiledData);
    // // 获取一个元素的基础信息
    // const obj = tiledData.getObjectByName('bg');
    // console.log(obj); // { x, y, height, width, rotation, properties, visible }
  }
};
