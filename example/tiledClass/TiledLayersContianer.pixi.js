import { getTileGidMap, calcPosAndRotation } from './common';

/**
 * 
 * @param {} tinyObj 
 * @param {} info
 */
function layout(obj, info = {}) {
  const {
    x = 0,
    y = 0,
    name = '',
    opacity = 1,
    visible = true,
    rotation = 0, // 目前不支持
    height = 0,
    width = 0,
  } = info;
  obj.name = name;
  obj.visible = visible;
  obj.alpha = opacity;
  if (obj.constructor === PIXI.Sprite) {
    const posAndRotation = calcPosAndRotation(info, true);
    obj.width = width;
    obj.height = height;
    obj.anchor.set(0.5, 0.5);
    obj.position.set(posAndRotation.x, posAndRotation.y); // 这里需要注意下，tiled 的元素锚点在左下
    obj.angle = posAndRotation.rotation;
  } else {
    obj.position.set(x, y - height); // 这里需要注意下，tiled 的元素锚点在左下
  }
}

export default (PIXI.TiledLayersContianer = class TiledLayersContianer extends PIXI.Container {
  constructor(tiledJsonData, resource) {
    super();
    this.childrenMap = {};
    this.tiledJsonData = tiledJsonData;
    this.resource = resource;
    this.gidMap = getTileGidMap(tiledJsonData);
    this.renderContent();
    //
  }
  
  /**
   * 按 tiled 信息渲染
   * @private
   */
  renderContent() {
    const layers = this.tiledJsonData.layers;
    (layers || []).forEach(layer => {
      const container = new PIXI.Container();
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
          let texture = PIXI.utils.TextureCache[imageUrl];
          if (!texture) {
            texture = PIXI.Texture.fromImage(imageUrl);
          }
          const sprite = new PIXI.Sprite(texture);
          layout(sprite, obj);
          container.addChild(sprite);
          this._setChildrenMap(sprite);
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
