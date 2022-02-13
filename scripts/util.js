export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge of objects. Scalar values are replaced. 
 * Arrays are also replaced, they are NOT concatenated.
 * @param {Object} target 
 * @param {Object} source 
 * @see https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
 * @returns {Object}
 */
export function mergeDeep(target, source) {
  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

/**
 * Get directory from the file path
 * 
 * @param {String} absolutePath Absolute path to a file 
 * @see https://stackoverflow.com/a/818619
 * @returns {String}
 */
export function dirname(absolutePath) {
  return absolutePath.substring(0, Math.max(absolutePath.lastIndexOf("/"), absolutePath.lastIndexOf("\\")));
}