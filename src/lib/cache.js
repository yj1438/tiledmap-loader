const sortKeys = require('sort-keys');

const cacheMap = {};

function toString(value) {
  let _value = '';
  switch (typeof value) {
    case 'function':
      _value = value.toString();
      break;
    case 'object':
      _value = JSON.stringify(sortKeys(value, {deep: true}));
      break;
    default:
      _value = String(value);
      break;
  }
  return _value;
}

module.exports = {
  isChange(key, value) {
    const _value = toString(value);
    const oldValue = cacheMap[key];
    return _value !== oldValue;
  },
  set(key, value) {
    if (this.isChange(key, value)) {
      cacheMap[key] = toString(value);
      return true;
    }
    return false;
  },
  get(key) {
    const value = cacheMap[key];
    return value ? JSON.parse(value) : undefined;
  },
};
