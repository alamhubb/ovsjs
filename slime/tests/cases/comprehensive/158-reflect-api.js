// Reflect API
const obj = {x: 1};
const val = Reflect.get(obj, 'x');
Reflect.set(obj, 'y', 2);
const has = Reflect.has(obj, 'x');


