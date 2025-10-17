// Proxy基础
const obj = {x: 1};
const proxy = new Proxy(obj, {
  get(target, prop) {
    return target[prop];
  }
});
const val = proxy.x;






