import { getTileGidMap } from './common';

/**
 * 
 * @param {} tinyObj 
 * @param {} info
 */
function layout(tinyObj, info = {}) {
  const {
    x = 0,
    y = 0,
    name = '',
    opacity = 1,
    visible = true,
    rotation = 0,
    height = 0,
    width = 0,
  } = info;
  tinyObj.name = name;
  tinyObj.setPosition(x, y - height); // 这里需要注意下，tiled 的元素锚点在左下
  tinyObj.setVisible(visible);
  tinyObj.setOpacity(opacity);
  tinyObj.setRotation(Tiny.deg2radian(rotation));
}

export default (Tiny.TiledLayersContianer = class TiledLayersContianer extends Tiny.Container {
  constructor(tiledJsonData, resource) {
    super();
    this.childrenMap = {};
    this.tiledJsonData = tiledJsonData;
    this.resource = resource;
    this.gidMap = getTileGidMap(tiledJsonData);
    this._render();
    //
  }
  
  /**
   * 按 tiled 信息渲染
   * @private
   */
  _render() {
    const layers = this.tiledJsonData.layers;
    (layers || []).forEach(layer => {
      const container = new Tiny.Container();
      layout(container, layer);
      this.addChild(container);
      this._setChildrenMap(container);
      //
      const objects = layer.objects || [];
      objects.forEach(obj => {
        const gid = obj.gid;
        const tileInfo = this.gidMap[gid];
        if (tileInfo) {
          // 先尝试从缓存中取
          const imageName = tileInfo.image;
          const imageUrl = this.resource[imageName];
          let texture = Tiny.TextureCache[imageUrl];
          if (!texture) {
            texture = Tiny.Texture.fromImage(imageUrl);
          }
          const sprite = new Tiny.Sprite(texture);
          layout(sprite, obj);
          container.addChild(sprite);
          this._setChildrenMap(sprite);
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
