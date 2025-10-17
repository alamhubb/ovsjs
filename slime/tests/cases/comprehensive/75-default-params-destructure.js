// 解构默认值
function process({name = 'Guest', age = 18} = {}) {
  return name + age;
}
const r1 = process();
const r2 = process({name: 'Alice'});




