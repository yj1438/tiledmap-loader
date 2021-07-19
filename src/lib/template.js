const main = {
  "compressionlevel": -1,
  "width": 750,
  "height": 1624,
  "infinite": false,
  "layers": [
  ],
  "nextlayerid": 2,
  "nextobjectid": 1,
  "orientation": "orthogonal",
  "renderorder": "left-up",
  "tiledversion": "1.7.0",
  "tileheight": 1,
  "tilesets": [
  ],
  "tilewidth": 1,
  "type": "map",
  "version": "1.6"
};

const layer = {
  "draworder": "index",
  "id": 1,
  "name": "layer1",
  "objects": [],
  "opacity": 1,
  "type": "objectgroup",
  "visible": true,
  "x": 0,
  "y": 0
};

const tileset = {
  "columns": 0,
  "firstgid": 1,
  "grid": {
    "height": 1,
    "orientation": "orthogonal",
    "width": 1
  },
  "margin": 0,
  "name": "images",
  "spacing": 0,
  "tilecount": 0,
  "tilewidth": 0,
  "tileheight": 0,
  "tiles": []
};

const tiledProject = {
  "automappingRulesFile": "",
  "commands": [
  ],
  "extensionsPath": "extensions",
  "folders": [
    ".",
  ],
  "objectTypesFile": ""
};

const TemplateMap = {
  main,
  layer,
  tileset,
  tiledProject,
};

/**
 * 获取模板对象
 * @param {('main'|'layer'|'tileset'|'tiledProject')} name
 */
exports.getTemplate = function getTemplate(name) {
  const tpl = TemplateMap[name];
  if (!name) return null;
  return JSON.parse(JSON.stringify(tpl));
}