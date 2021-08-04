const loaderUtils = require('loader-utils');
const yaml = require('yaml-js');
const fse = require('fs-extra');

const template = require('./lib/template');
const getTilesetsInfo = require('./lib/getTilesetsInfo');
const getResourceInfo = require('./lib/getResourceInfo');
const contentFix = require('./lib/contentFix');
const common = require('./lib/common');
const cache = require('./lib/cache');

const Suffix = '.tiled';
const FilesName = {
  json: '.tiled.json',
  resource: '.tiled.resource.js',
  project: '.tiled-project',
};

const DefaultConfig = {
  dir: [],
  width: 750,
  height: 1624,
};

/**
 * tiledmap-loader
 * options: {
 *   process
 * }
 * @param {*} content
 * @param {*} map
 * @param {*} meta
 */
module.exports = function(content, map, meta) {
  const self = this;
  const callback = self.async();
  const options = loaderUtils.getOptions(self) || {}; // loader options
  const config = Object.assign({}, DefaultConfig, yaml.load(content.toString()) || {}); // .tiled 文件配置
  // 入口相关 path
  const context = self.context; // .tiled dir path
  const resourcePath = self.resourcePath; // .tiled path
  // 本地生成的几个文件
  const jsonFilePath = resourcePath.replace(Suffix, FilesName.json); // json file path
  const resourceFilePath = resourcePath.replace(Suffix, FilesName.resource); // resource js file path
  const projectFilePath = resourcePath.replace(Suffix, FilesName.project); // project file path
  // 输出内容引用文件
  const requestPath = loaderUtils.stringifyRequest(self, resourcePath); //
  const importJsonPath = requestPath.replace(Suffix, FilesName.json);
  const importResourcePath = requestPath.replace(Suffix, FilesName.resource);
  // options.process 为 false 时，直接使用本地文件，不走编译
  if (options.process === false) {
    console.log('\n>>>>>>\n process === false: tiledmap-loader 不执行，直接使用本地已构建文件。\n>>>>>>')
  } else {
    //
    self.cacheable(true);
    // 获取 tiled tilesets 信息
    const tilesetsInfo = getTilesetsInfo(self, context, options, config);
    // 重写核心 json 文件
    let mainJson;
    if (fse.existsSync(jsonFilePath)) {
      const jsonFile = fse.readJSONSync(jsonFilePath, { encoding: 'utf8' });
      cache.set(jsonFilePath, jsonFile);
      mainJson = contentFix.fixObjectGid(jsonFile, tilesetsInfo);
    } else {
      mainJson = template.getTemplate('main');
      const layerJson = template.getTemplate('layer');
      mainJson.width = config.width;
      mainJson.height = config.height;
      mainJson.layers.push(layerJson);
      mainJson.nextlayerid = layerJson.id + 1;
      mainJson.tilesets = tilesetsInfo;
    }
    if (cache.isChange(jsonFilePath, mainJson)) {
      common.output('重写 json 文件');
      fse.writeJSONSync(jsonFilePath, mainJson, { spaces: '  ' });
      cache.set(jsonFilePath, mainJson);
    }
    this.addDependency(jsonFilePath); // 将 tiled json 文件加入依赖监听，会涉及 resource 文件的修改
    // 重写资源文件
    if (fse.existsSync(resourceFilePath)) {
      const resourceFile = fse.readFileSync(resourceFilePath, { encoding: 'utf8' });
      cache.set(resourceFilePath, resourceFile);
    }
    const resourceJs = getResourceInfo(self, mainJson, options, config);
    if (cache.isChange(resourceFilePath, resourceJs)) {
      common.output('重写 resource 文件');
      fse.writeFileSync(resourceFilePath, resourceJs, { encoding: 'utf8' });
      cache.set(resourceFilePath, resourceJs);
    }
    // 检查 project 文件
    if (!fse.existsSync(projectFilePath)) {
      common.output('增加 tiled project 文件：' + projectFilePath);
      fse.writeJSONSync(projectFilePath, template.getTemplate('tiledProject'), { spaces: '  ' });
    }
  }
  //
  const esModule =
    typeof options.esModule !== 'undefined' ? options.esModule : true;
  const res = esModule
    ? `
    import tiledJson from ${importJsonPath};
    import resource from ${importResourcePath};
    export default { tiledJson, resource };
    `
    : `
    var tiledJson = require(${importJsonPath});
    var resource = require(${importResourcePath});
    module.exports = { tiledJson, resource };
    `;
  callback(null, res, map, meta);
};

module.exports.raw = true;
