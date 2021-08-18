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
  const gidMap = {};
  tiledJsonData.tilesets.forEach(tileset => {
    const firstgid = tileset.firstgid;
    tileset.tiles.forEach((tile, index) => {
      gidMap[firstgid + index] = tile;
    });
  });
  return gidMap;
}

/**
 * 获取 properties object
 * @param {Object} drawInfo tiled 生成的 layer/object 配置信息，
 * [
 *   {
       "name": "layoutRef",
       "type": "string",
       "value": "left,top"
     }
 * ]
 */
exports.getProperties = function(tiledItemInfo = {}) {
  const { properties = [] } = tiledItemInfo;
  const obj = {};
  properties.forEach(p => {
    let value = p.value;
    if (typeof value === 'string') {
      let valueArr = value.split(',');
      if (valueArr.length > 1) {
        value = valueArr.map(v => v.trim());
      }
    }
    if (!obj[p.name]) {
      obj[p.name] = value;
    } else {
      if (Object.prototype.toString.call(obj[p.name]) !== '[object Array]') {
        obj[p.name] = [obj[p.name]];
      } 
      obj[p.name].push(value);
    }
  });
  return obj;
}