// For-of generator iteration
function* gen() {
  yield 1;
  yield 2;
}
for (const val of gen()) {
  const x = val;
}