import TiledData from './TiledData';

/**
 * 布局等基础属性设置
 * @param {PIXI.Container | PIXI.Sprite}
 * @param {Object} info
 */
function layout(obj, info = {}) {
  obj.tiledInfo = info;
  const {
    name = '',
    opacity = 1,
    visible = true,
    height = 0,
    width = 0,
    type = '',
    anchor = {},
    rotation = 0,
    x = 0,
    y = 0,
  } = info;
  obj.name = name;
  obj.visible = visible;
  obj.alpha = opacity;
  obj.position.set(x, y);
  if (obj.constructor === PIXI.Sprite && type === 'object') {
    obj.width = width;
    obj.height = height;
    obj.anchor.set(anchor.x, anchor.y);
    obj.angle = rotation;
  }
}

export default (PIXI.TiledLayersContainer = class TiledLayersContainer extends PIXI.Container {
  constructor(tiledJson, resource, canvasOption) {
    super();
    this.childrenMap = {};
    this.tiledData = new TiledData(tiledJson, resource, canvasOption);
    this.renderContent();
  }
  
  /**
   * 按 tiled 信息渲染
   * @private
   */
  renderContent() {
    const layers = this.tiledData.renderInfo;
    (layers || []).forEach(layer => {
      const container = new PIXI.Container();
      layout(container, layer);
      this.addChild(container);
      this._setChildrenMap(container);
      //
      const objects = layer.objects || [];
      objects.forEach(obj => {
        if (obj.imageUrl) {
          let texture = PIXI.utils.TextureCache[obj.imageUrl];
          if (!texture) {
            texture = PIXI.Texture.fromImage(obj.imageUrl);
          }
          const sprite = new PIXI.Sprite(texture);
          layout(sprite, obj);
          container.addChild(sprite);
          this._setChildrenMap(sprite);
        } else {
          const _container = new PIXI.Container();
          layout(_container, obj);
          container.addChild(_container);
          this._setChildrenMap(_container);
        }
      });
    });
  }

  /**
   * 根据 name 获取指定元素列表
   * @returns {Array<Object>}
   */
  getChildrenByName(name) {
    return this.childrenMap[name] || [];
  }

  /**
   * 根据 name 获取指定一个元素
   * @returns {Object}
   */
  getChildByName(name) {
    return this.getChildrenByName(name)[0];
  }

  /**
   * @private
   * @param {Object} tinyObj 
   */
  _setChildrenMap(tinyObj) {
    const name = tinyObj.name;
    if (name) {
      const children = this.childrenMap[name] || [];
      children.push(tinyObj);
      this.childrenMap[name] = children;
    }
  }
})
