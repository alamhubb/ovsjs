// WeakMap/WeakSet
const wm = new WeakMap();
const obj = {};
wm.set(obj, 'value');
const ws = new WeakSet();
ws.add(obj);