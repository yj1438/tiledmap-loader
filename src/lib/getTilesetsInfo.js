const glob = require('glob');
const path = require('path');
const execSync = require('child_process').execSync;
const template = require('./template');

let gid = 1;

function getTileset(basePath, dirname) {
  const files = glob.sync(path.join(basePath, dirname, '*.+(png|jpg|jpeg|webp|bmp)'));
  if (!files.length) {
    const _gid = gid;
    gid = gid + 0;
    return {
      ...template.getTemplate('tileset'),
      tiles: [],
      firstgid: _gid,
      name: dirname,
      tilecount: 0,
      tilewidth: 0,
      tileheight: 0,
    };
  }
  const consoleOutput = execSync('identify ' + files.join(' '), { encoding: 'utf8' });
  let count = 0;
  let maxWidth = 0;
  let maxHeight = 0;
  const result = consoleOutput.split('\n')
    .filter(info => !!info)
    .map((info, index) => {
      const m = info.match(/([0-9]+)x([0-9]+)/);
      const image = {
        id: index,
        image: path.relative(basePath, files[index]),
      };
      if (m) {
        const w = parseInt(m[1], 10);
        const h = parseInt(m[2], 10);
        image.imagewidth = w;
        image.imageheight = h;
        maxWidth = Math.max(maxWidth, w);
        maxHeight = Math.max(maxHeight, h);
      }
      count++;
      return image;
    });
  const _gid = gid;
  gid = gid + result.length;
  return {
    ...template.tileset,
    tiles: result,
    firstgid: _gid,
    name: dirname,
    tilecount: count,
    tilewidth: maxWidth,
    tileheight: maxHeight,
  };
}

/**
 * 获取 tilesets 信息
 * @param {string} basePath .tiled 所在文件夹的 path
 * @param {object} options loader 配置
 * @param {object} config .tiled 配置
 * @returns {Array}
 */
module.exports = function(loadContext, basePath, options, config) {
  const dirList = config.dir || [];
  const tilesets = [];
  gid = 1;
  for (let index = 0; index < dirList.length; index++) {
    const dir = dirList[index];
    const tileset = getTileset(basePath, dir);
    tilesets.push(tileset);
    loadContext.addContextDependency(path.join(basePath, dir));
  }
  return tilesets;
};
