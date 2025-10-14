// 测试for循环的AST生成

const items = [10, 20, 30]
let sum = 0

for (let i = 0; i < items.length; i++) {
  sum = sum + items[i]
}

console.log(sum)

