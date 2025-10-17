// 作为迭代器
function* gen() {
  yield 1;
  yield 2;
}
for (let val of gen()) {
  const x = val;
}





