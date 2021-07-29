import TiledJsonData from './TiledJsonData';

/**
 * 
 * @param {} tinyObj 
 * @param {} info
 */
function layout(tinyObj, info = {}) {
  tinyObj.tiledInfo = info;
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
  tinyObj.name = name;
  tinyObj.setVisible(visible);
  tinyObj.setOpacity(opacity);
  tinyObj.setPosition(x, y);
  if (type === 'object') {
    tinyObj.width = width;
    tinyObj.height = height;
    tinyObj.setAnchor(anchor.x, anchor.y);
    tinyObj.setRotation(rotation / 180 * Math.PI)
  }
}

export default (Tiny.TiledLayersContianer = class TiledLayersContianer extends Tiny.Container {
  constructor(tiledJson, resource) {
    super();
    this.childrenMap = {};
    this.tiledJsonData = new TiledJsonData(tiledJson, resource);
    this.renderContent();
    //
  }
  
  /**
   * 按 tiled 信息渲染
   * @private
   */
  renderContent() {
    const layers = this.tiledJsonData.renderInfo;
    (layers || []).forEach(layer => {
      const container = new Tiny.Container();
      layout(container, layer);
      this.addChild(container);
      this._setChildrenMap(container);
      //
      const objects = layer.objects || [];
      objects.forEach(obj => {
        // 先尝试从缓存中取
        let texture = Tiny.TextureCache[obj.imageUrl];
        if (!texture) {
          texture = Tiny.Texture.fromImage(obj.imageUrl);
        }
        const sprite = new Tiny.Sprite(texture);
        layout(sprite, obj);
        container.addChild(sprite);
        this._setChildrenMap(sprite);
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
