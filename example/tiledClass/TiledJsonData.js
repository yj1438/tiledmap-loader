import { getTileGidMap, fixTiledInfo, getProperties } from './common';

export default class TiledData {
  /**
   * 
   * @param {Object} tiledJson 
   * @param {Object<module>} resource 
   */
  constructor(tiledJson, resource) {
    this.tiledJson = tiledJson;
    this.resource = resource;
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

  _getRenderInfo() {
    const info = (this.tiledJson.layers || []).map(layer => {
      const layerInfo = fixTiledInfo(layer, false);
      layerInfo.properties = getProperties(layer);
      layerInfo.objects = (layer.objects || []).map(obj => {
        const objectInfo = fixTiledInfo(obj, true);
        const gid = obj.gid;
        const tileInfo = this.tiledGidMap[gid];
        objectInfo.gid = gid;
        objectInfo.imageName = tileInfo.image;
        objectInfo.imageUrl = this.resource[tileInfo.image];
        objectInfo.properties = getProperties(obj);
        return objectInfo;
      });
      return layerInfo;
    });
    return info;
  }

  _getItemMapByName() {
    const objectMap = {};
    this.renderInfo.forEach(layer => {
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
