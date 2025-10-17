// undefined触发默认值
function test(a = 1, b = 2) {
  return a + b;
}
const r1 = test(undefined, 5);
const r2 = test(null, 5);




