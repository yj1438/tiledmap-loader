const commmon = require('./common');

function getVarName(imageName) {
  return 'image_' + imageName.replace(/\/|-|\./ig, '_');
}

// function _unique(arr) {
//   let _arr = arr;
//   const urlMap = {};
//   _arr = _arr.filter(item => {
//     const url = typeof item === 'object' ? item.url : item;
//     if (urlMap[url]) {
//       return false;
//     } else {
//       urlMap[url] = true;
//       return true;
//     }
//   });
//   return _arr;
// }

/**
 * 获取使用资源
 * @param {Object} loadContext 
 * @param {Object} jsonData 
 * @param {Object} options 
 * @param {Object} config 
 * @returns {string} module content
 */
module.exports = function(loadContext, jsonData, options, config) {
  let content = '';
  //
  const tileGidMap = commmon.getTileGidMap(jsonData);
  //
  const imageList = [];
  jsonData.layers.forEach(layer => {
    layer.objects.forEach(obj => {
      const gid = obj.gid;
      const tile = tileGidMap[gid];
      if (tile) {
        imageList.indexOf(tile.image) === -1 && imageList.push(tile.image);
      }
    });
  });
  let importStr = '';
  let exportStr = '';
  const esModule =
    typeof options.esModule !== 'undefined' ? options.esModule : true;
  imageList.forEach(image => {
    const varName = getVarName(image);
    importStr += esModule
      ? 'import ' + varName + ' from \'./' + image + '\';\n'
      : 'var ' + varName + ' = require(\'./' + image + '\');\n';
    exportStr += `  '${image}': ${varName},\n`;
  });
  exportStr = esModule
    ? `export default {\n${exportStr}}`
    : `module.exports = {\n${exportStr}}`;
  content += `\n${importStr}\n${exportStr}`;
  return content;
};