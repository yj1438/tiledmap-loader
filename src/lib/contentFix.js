const commmon = require('./common');

/**
 * 更新替换老 json 里的 tilesets 和 layers
 * @param {Object} oldJsonData tiledJsonData
 * @param {Array} newTilesetsData
 * @returns 
 */
exports.fixObjectGid = function (oldJsonData, newTilesetsData = []) {
  // 取老的图片 url map
  const oldGidMap = commmon.getTileGidMap(oldJsonData);
  // 老的 layers 上增加 image url 参数
  oldJsonData.layers.forEach(layer => {
    layer.objects.forEach(obj => {
      const gid = obj.gid;
      const tile = oldGidMap[gid];
      if (tile) {
        obj.image = tile.image;
      }
    });
  });
  // 取新的图片 url map，取到每个的 gid
  const newImageMap = {};
  newTilesetsData.forEach(tileset => {
    const firstgid = tileset.firstgid;
    tileset.tiles.forEach((tile, index) => {
      newImageMap[tile.image] = {
        gid: firstgid + index,
        ...tile,
      };
    });
  });
  // 根据老的 gid 刷新新的 layers 里的 gid
  oldJsonData.layers.forEach(layer => {
    layer.objects.forEach(obj => {
      const image = obj.image;
      const tile = newImageMap[image];
      if (tile) {
        obj.gid = tile.gid;
        delete obj.image;
      }
    });
  });
  oldJsonData.tilesets = newTilesetsData;
  return oldJsonData;
}

