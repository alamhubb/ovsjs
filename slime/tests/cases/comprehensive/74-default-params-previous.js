// 引用前面参数
function test(a, b = a + 1, c = b + 1) {
  return a + b + c;
}
const result = test(1);




