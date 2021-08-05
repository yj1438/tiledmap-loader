import TiledData from './TiledData';

/**
 * 
 * @param {Tiny.Container | Tiny.Sprite} obj 
 * @param {object} info
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
  obj.setVisible(visible);
  obj.setOpacity(opacity);
  obj.setPosition(x, y);
  if (obj.constructor === Tiny.Sprite && type === 'object') {
    obj.width = width;
    obj.height = height;
    obj.setAnchor(anchor.x, anchor.y);
    obj.setRotation(rotation / 180 * Math.PI)
  }
}

export default (Tiny.TiledLayersContainer = class TiledLayersContainer extends Tiny.Container {
  constructor(tiledJson, resource, canvasOption) {
    super();
    this.childrenMap = {};
    this.tiledData = new TiledData(tiledJson, resource, canvasOption);
    this.renderContent();
    //
  }
  
  /**
   * 按 tiled 信息渲染
   * @private
   */
  renderContent() {
    const layers = this.tiledData.renderInfo;
    (layers || []).forEach(layer => {
      const container = new Tiny.Container();
      layout(container, layer);
      this.addChild(container);
      this._setChildrenMap(container);
      //
      const objects = layer.objects || [];
      objects.forEach(obj => {
        if (obj.imageUrl) {
          // 先尝试从缓存中取
          let texture = Tiny.TextureCache[obj.imageUrl];
          if (!texture) {
            texture = Tiny.Texture.fromImage(obj.imageUrl);
          }
          const sprite = new Tiny.Sprite(texture);
          layout(sprite, obj);
          container.addChild(sprite);
          this._setChildrenMap(sprite);
        } else {
          const _container = new Tiny.Container();
          layout(_container, obj);
          container.addChild(_container);
          this._setChildrenMap(_container);
        }
      });
    });
  }

  /**
   * 根据 name 获取指定元素列表
   * @returns {Array<TinyObject>}
   */
  getChildrenByName(name) {
    return this.childrenMap[name] || [];
  }

  /**
   * 根据 name 获取指定一个元素
   * @returns {TinyObject}
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
