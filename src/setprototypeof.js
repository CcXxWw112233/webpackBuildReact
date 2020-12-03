module.exports =
  Object.setPrototypeOf ||
  ({ __proto__: [] } instanceof Array ? setProtoOf : mixinProperties)

function setProtoOf(obj, proto) {
  obj.__proto__ = proto
  return obj
}

function mixinProperties(obj, proto) {
  // make getPrototypeOf helper work
  Object.defineProperty(obj, '__proto__', {
    value: proto
  })

  for (var prop in proto) {
    if (!obj.hasOwnProperty(prop)) {
      obj[prop] = proto[prop]
    }
  }
  return obj
}
// 原文：https://blog.csdn.net/yede0632/article/details/80746264
