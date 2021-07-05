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
  imageList.forEach(image => {
    const varName = getVarName(image);
    importStr += 'import ' + varName + ' from \'./' + image + '\';\n';
    exportStr += `  '${image}': ${varName},\n`;
  });
  exportStr = `export default {\n${exportStr}}`;
  content += `\n${importStr}\n${exportStr}`;
  return content;
};