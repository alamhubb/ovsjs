/**
 * 规则测试：AwaitExpression
 * 
 * 位置：Es6Parser.ts Line 690
 * 分类：expressions
 * 编号：228
 * 
 * EBNF规则：
 *   AwaitExpression:
 *     await UnaryExpression
 * 
 * 规则特征：
 * ✓ await只在async函数中合法
 * ✓ 后面跟UnaryExpression
 * 
 * 测试目标：
 * - 测试await各种表达式形式
 * - 测试await的返回值使用
 * - 测试await在不同控制流中的使用
 * - 验证async/await的完整性
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：简单await表达式
async function simple() {
  await promise
}

// ✅ 测试2：await函数调用
async function awaitCall() {
  await fetch(url)
}

// ✅ 测试3：await赋值
async function awaitAssign() {
  const result = await getData()
}

// ✅ 测试4：await在条件表达式中
async function awaitCondition() {
  if (await isReady()) {
    console.log('ready')
  }
}

// ✅ 测试5：多个await顺序执行
async function awaitSequence() {
  const a = await getA()
  const b = await getB()
  return a + b
}

// ✅ 测试6：await promise链
async function awaitChain() {
  const data = await fetch(url).then(r => r.json())
}

// ✅ 测试7：await在循环中
async function awaitLoop() {
  for (const item of items) {
    await process(item)
  }
}

// ✅ 测试8：await一元表达式
async function awaitUnary() {
  const value = +await getNumber()
  const negated = !await isReady()
}

/* Es6Parser.ts: await UnaryExpression */
