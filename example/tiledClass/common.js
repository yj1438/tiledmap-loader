/**
 * 获取 tiledJson 里 tiled 的 gid map
 * @param {Object} tiledJsonData tiled 生成的产物
 * @returns 
 */
export function getTileGidMap(tiledJsonData) {
  const gidMap = {};
  tiledJsonData.tilesets.forEach((tileset, index) => {
    const firstgid = tileset.firstgid;
    tileset.tiles.forEach((tile, _index) => {
      tile.tilesetsIndex = index;
      const gid = firstgid + _index;
      tile.gid = gid;
      gidMap[gid] = tile;
    });
  });
  return gidMap;
}

function fixBaseInfo(tiledItemInfo) {
  const layoutInfo = calcPosAndRotation(tiledItemInfo); // 基础信息修正
  tiledItemInfo.x = layoutInfo.x;
  tiledItemInfo.y = layoutInfo.y;
  tiledItemInfo.rotation = layoutInfo.rotation;
  return tiledItemInfo;
}

/**
 * 获取 named 元素信息
 * @param {Object} tiledJsonData 
 * @returns
 */
export function getNamedObjectMap(tiledJsonData) {
  const objectMap = {};
  tiledJsonData.layers.forEach(layer => {
    const name = layer.name;
    if (name) {
      layer.type = 'layer';
      objectMap[name] = objectMap[name] || [];
      fixBaseInfo(layer);
      objectMap[name].push(layer);
    }
    layer.objects.forEach(obj => {
      const _name = obj.name;
      if (_name) {
        obj.type = 'object';
        objectMap[_name] = objectMap[_name] || [];
        fixBaseInfo(obj);
        objectMap[_name].push(obj);
      }
    });
  });
  return objectMap;
}

/**
 * 三角形长边
 * @param {number} a
 * @param {number} b
 * @returns 
 */
function trigonometric(a, b) {
  a = Number(a);
  b = Number(b);
  return Math.sqrt(a * a + b * b);
}

/**
 * 解决两个问题
 * 1. tiled 的元素 anchor 默认是在左下，而且无法调整，这和 pixi 的不相符
 * 2. tiled 在旋转的同时，会根据原图片左下点的实际绝对坐标，调整 x/y 坐标值，非常反人类，需要进行计算修正
 * > https://discourse.mapeditor.org/t/why-does-rotation-change-x-y/4086
 * @param {object} info tiled 生成的配置信息
 * @param {boolean} canRotate 是否旋转
 * @return {object} { x, y, rotation }
 */
export function calcPosAndRotation(info, canRotate = false) {
  const {
    x = 0,
    y = 0,
    height = 0,
    width = 0,
    rotation = 0, // 目前不支持
  } = info;
  const pos = { x: x, y: y - height, rotation: 0 }; // 默认修正到左上角
  // 图片左下角 anchor 位置和旋转角度的修正
  if (canRotate) {
    if (rotation) {
      const _w2 = width / 2, // 1/2 宽度
            _h2 = height / 2; // 1/2 高度
      const radius = trigonometric(_w2, _h2); // 半径
      const originDeg = -Math.atan(_w2 / _h2); // 原始左下角的弧度值
      const deg = originDeg - rotation / 180 * Math.PI; // 当前左下角的弧度值
      /*
      原始公式
      设：
        tiled 旋转后原图左下角绝对坐标主为(a, b)
        不旋转原图左下角坐标绘制坐标为(x, y)
      x + w / 2 + R * sinA = a;
      y - h / 2 + R * cosA = b;
      */
      const _x = x - _w2 - radius * Math.sin(deg);
      const _y = y + _h2 - radius * Math.cos(deg);
      pos.x = _x;
      pos.y = _y - height;
    }
    pos.x = pos.x + width / 2;
    pos.y = pos.y + height / 2;
    pos.rotation = rotation;
  }
  return pos;
}