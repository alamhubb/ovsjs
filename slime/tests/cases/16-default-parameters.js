// 默认参数
function greet(name = "Guest") {
  return "Hello " + name
}

const add = (a, b = 0) => a + b

function multi(x = 1, y = 2, z = 3) {
  return x + y + z
}

