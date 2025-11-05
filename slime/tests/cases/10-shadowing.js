// 变量遮蔽
const x = 1
function test() {
  const x = 2
  {
    const x = 3
    return x
  }
}

