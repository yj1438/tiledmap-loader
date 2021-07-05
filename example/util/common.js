/**
 * 获取 tiledJson 里 tiled 的 gid map
 * @param {Object} tiledJsonData tiled 生成的产物
 * @returns 
 */
exports.getTileGidMap = function(tiledJsonData) {
  const oldGidMap = {};
  tiledJsonData.tilesets.forEach(tileset => {
    const firstgid = tileset.firstgid;
    tileset.tiles.forEach((tile, index) => {
      oldGidMap[firstgid + index] = tile;
    });
  });
  return oldGidMap;
}