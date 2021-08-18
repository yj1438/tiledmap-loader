import { getTileGidMap, fixTiledInfo, fixLayout } from './common';

export default class TiledData {
  /**
   * 
   * @param {Object} tiledJson 
   * @param {Object<module>} resource 
   */
  constructor(tiledJson, resource, canvasOption = {}) {
    this.tiledJson = tiledJson;
    this.resource = resource;
    this.canvasOption = canvasOption;
    this.tiledGidMap = getTileGidMap(tiledJson);
    this.renderInfo = this._getRenderInfo();
    this.itemMapByName = this._getItemMapByName();
  }

  getObjectByName(name) {
    return this.getObjectListByName(name)[0];
  }

  getObjectListByName(name) {
    return this.itemMapByName[name] || [];
  }

  /**
   * 获取渲染树
   * @returns
   */
  _getRenderInfo() {
    let layers = (this.tiledJson.layers || []);
    const globalOption = {
      width: this.tiledJson.width,
      height: this.tiledJson.height,
      canvasWidth: this.canvasOption.width,
      canvasHeight: this.canvasOption.height,
    };
    layers = layers.map(layer => {
      const layerInfo = fixTiledInfo(layer, 'layer', globalOption);
      layerInfo.objects = (layer.objects || []).map(obj => {
        // 取图片
        const gid = obj.gid;
        const tileInfo = gid ? this.tiledGidMap[gid] : null;
        const imageUrl = tileInfo ? this.resource[tileInfo.image] : '';
        //
        const objectInfo = fixTiledInfo(obj, imageUrl ? 'sprite' : 'container', globalOption);
        if (imageUrl) {
          objectInfo.gid = gid;
          objectInfo.imageUrl = imageUrl;
          objectInfo.imageName = tileInfo.image;
        }
        return objectInfo;
      });
      return layerInfo;
    });
    //
    const rootInfo = {
      x: 0,
      y: 0,
      type: 'layer',
      layoutRef: this.canvasOption.layoutRef || '',
    };
    const _layout = fixLayout(rootInfo, globalOption);
    rootInfo.x = _layout.x;
    rootInfo.y = _layout.y;
    return {
      rootInfo,
      layers,
    };
  }

  /**
   * 获取有 name 的元素 map
   * @returns
   */
  _getItemMapByName() {
    const objectMap = {};
    this.renderInfo.layers.forEach(layer => {
      const name = layer.name;
      if (name) {
        objectMap[name] = objectMap[name] || [];
        objectMap[name].push(layer);
      }
      layer.objects.forEach(obj => {
        const _name = obj.name;
        if (_name) {
          objectMap[_name] = objectMap[_name] || [];
          objectMap[_name].push(obj);
        }
      });
    });
    return objectMap;
  }
}
