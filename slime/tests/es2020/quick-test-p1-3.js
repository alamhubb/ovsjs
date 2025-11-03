// ES2020 P1-3 验证：ForAwaitOfStatement 分支顺序优化

async function testForAwaitOf() {
  // 测试1：let 声明（最常见，应该第一分支命中）
  for await (let x of items) {
    console.log(x)
  }
  
  for await (let {a, b} of items) {
    console.log(a, b)
  }
  
  // 测试2：const 声明（常见，应该第一分支命中）
  for await (const x of items) {
    console.log(x)
  }
  
  for await (const [a, b] of items) {
    console.log(a, b)
  }
  
  // 测试3：var 声明（较少见，应该第二分支命中）
  for await (var x of items) {
    console.log(x)
  }
  
  // 测试4：变量名为 let（边界情况，应该第三分支命中）
  const let = [1, 2, 3]
  for await (let of items) {
    console.log(let)
  }
  
  // 测试5：复杂表达式（应该第三分支命中）
  for await (obj.prop of items) {
    console.log(obj.prop)
  }
  
  for await (arr[0] of items) {
    console.log(arr[0])
  }
}

console.log('✅ ForAwaitOfStatement 分支顺序测试完成')







