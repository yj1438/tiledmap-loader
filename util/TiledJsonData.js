import { getTileGidMap, getNamedObjectMap } from './common';

export default class TiledData {
  constructor(tiledJson) {
    this._tiledJson = tiledJson;
    this.tiledGidMap = getTileGidMap(tiledJson);
    this.itemMapByName = getNamedObjectMap(tiledJson);
  }

  getObjectByName(name) {
    return this.itemMapByName[name];
  }
}
