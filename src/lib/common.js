exports.output = function(msg) {
  console.log(`\n${JSON.stringify(msg)}\n`);
}

exports.arr2Obj = function(arr, keyName = 'id') {
  const obj = {};
  if (Object.prototype.toString.call(arr) === '[object Array]') {
    arr.forEach(item => {
      obj[item[keyName]] = item;
    });
  }
  return obj;
}

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
