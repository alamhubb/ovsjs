// throw异常
function* gen() {
  try {
    yield 1;
  } catch (e) {
    yield 'error';
  }
}





