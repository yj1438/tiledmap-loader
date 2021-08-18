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
function getProperties(tiledItemInfo = {}) {
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

/**
 * 重新组装渲染数据
 * @tiledItemInfo {Object} Tiled 原始产物 
 * @type {('layer'|'sprite'|'container')} 元素类型 layer|sprite|container
 * @globalOpation {Object} 全局配置
 */
export function fixTiledInfo(tiledItemInfo = {}, type = '', globalOpation) {
  const isSprite = type === 'sprite';
  const info = {
    name: tiledItemInfo.name || '',
    type: type,
    opacity: typeof tiledItemInfo.opacity === 'number' ? tiledItemInfo.opacity : 1,
    visible: tiledItemInfo.visible,
    height: tiledItemInfo.height,
    width: tiledItemInfo.width,
    scale: 1,
    x: 0,
    y: 0,
    anchor: { x: isSprite ? 0.5 : 0, y: isSprite ? 0.5 : 0 },
    rotation: 0,
  };
  info.properties = getProperties(tiledItemInfo);
  // Tiled 产物坐标等修正
  const layoutInfo = calcPosAndRotation(tiledItemInfo, isSprite);
  info.x = layoutInfo.x;
  info.y = layoutInfo.y;
  info.rotation = layoutInfo.rotation;
  // 布局定位适配
  const _layout = fixLayout(info, globalOpation);
  info.x = _layout.x;
  info.y = _layout.y;
  return info;
}

/**
 * 求三角形长边
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
 * @param {object} drawInfo tiled 生成的 layer/object 配置信息，
 * @param {boolean} canRotate 是否旋转
 * @return {object} { x, y, rotation }
 */
function calcPosAndRotation(drawInfo, canRotate = false) {
  const {
    gid,
    x = 0,
    y = 0,
    offsetx = 0,
    offsety = 0,
    height = 0,
    width = 0,
    rotation = 0, // 目前不支持
  } = drawInfo;
  // 默认修正到左上角
  
  let pos = { x: x || offsetx, y: (y || offsety), rotation: 0 };
  if (gid) {
    pos = { x: x || offsetx, y: (y || offsety) - height, rotation: 0 };
  }
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

/**
 * 布局修正
 * 1. right / bottom 等定位
 */
export function fixLayout(layoutInfo, globalOpation) {
  const _layout = {
    x: layoutInfo.x,
    y: layoutInfo.y,
  };
  //
  let layoutRef = layoutInfo.layoutRef
    || (layoutInfo.properties
      ? (layoutInfo.properties.layoutRef || ['left', 'top'])
      : ['left', 'top']);
  if (layoutRef === 'center') {
    layoutRef = ['center', 'center'];
  }
  layoutRef = layoutRef.slice(0, 2);
  const layoutRefX = layoutRef.indexOf('left') >= 0
    ? 'left'
    : layoutRef.indexOf('right') >= 0
      ? 'right'
      : layoutRef.indexOf('center') >= 0
        ? 'center' : 'left';
  const layoutRefY = layoutRef.indexOf('top') >= 0
    ? 'top'
    : layoutRef.indexOf('bottom') >= 0
      ? 'bottom'
      : layoutRef.indexOf('center') >= 0
        ? 'center' : 'top';
  //
  if (layoutInfo.type === 'layer') {
    // 修正布局
    if (layoutRefX === 'left') {
      _layout.x = layoutInfo.x;
    } else if (layoutRefX === 'right') {
      _layout.x = globalOpation.canvasWidth - (globalOpation.width - layoutInfo.x);
    } else if (layoutRefX === 'center') {
      _layout.x = globalOpation.canvasWidth / 2 - (globalOpation.width / 2 - layoutInfo.x);
    }
    if (layoutRefY === 'top') {
      _layout.y = layoutInfo.y;
    } else if (layoutRefY === 'bottom') {
      _layout.y = globalOpation.canvasHeight - (globalOpation.height - layoutInfo.y);
    } else if (layoutRefY === 'center') {
      _layout.y = globalOpation.canvasHeight / 2 - (globalOpation.height / 2 - layoutInfo.y);
    }
  }
  //
  return _layout;
}