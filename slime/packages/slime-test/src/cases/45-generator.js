// Generator函数
function* numbers() {
  yield 1
  yield 2
  yield 3
}

function* infinite() {
  let i = 0
  while (true) {
    yield i++
  }
}

function* fibonacci() {
  let a = 0, b = 1
  while (true) {
    yield a
    ;[a, b] = [b, a + b]
  }
}

