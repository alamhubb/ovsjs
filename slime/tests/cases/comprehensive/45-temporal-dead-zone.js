// 暂时性死区（TDZ）语法测试
function testTDZ() {
  let x = 10;
  const y = 20;
  return x + y;
}

function withParams(a = b, b = 1) {
  return a + b;
}


