/**
 * 规则测试：StatementList
 * 
 * 位置：Es6Parser.ts Line 1325
 * 规则结构：StatementList -> this.Many(() => this.StatementListItem())
 * 
 * 规则语法：
 *   StatementList:
 *     this.Many(() => {
 *       this.StatementListItem()  // 可以匹配多次（0次、1次、多次）
 *     })
 * 
 * 测试覆盖：
 * - ✅ Many分支1：0个语句（空）（测试1）
 * - ✅ Many分支2：1个语句（测试2）
 * - ✅ Many分支3：多个语句（测试3-10）
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：空语句列表    StatementList -> this.Many() (Many分支1-0个语句)
{
  // 空块
}

// ✅ 测试2：单个语句    StatementList -> this.Many() (Many分支2-1个语句)
{
  const x = 1
}

// ✅ 测试3：两个语句    StatementList -> this.Many() (Many分支3-多个语句)
{
  const x = 1
  const y = 2
}

// ✅ 测试4：多个声明语句    StatementList -> this.Many() (Many分支3-多个语句)
{
  let a = 1
  const b = 2
  var c = 3
}

// ✅ 测试5：多个控制流语句    StatementList -> this.Many() (Many分支3-多个语句)
{
  if (true) x = 1
  while (y < 10) y++
  for (let i = 0; i < 3; i++) console.log(i)
}

// ✅ 测试6：混合语句    StatementList -> this.Many() (Many分支3-多个语句)
{
  const data = [1, 2, 3]
  data.forEach(item => console.log(item))
  const result = data.map(x => x * 2)
  return result
}

// ✅ 测试7：函数/类声明    StatementList -> this.Many() (Many分支3-多个语句)
{
  function helper() { return 42 }
  class MyClass { constructor() { this.value = 1 } }
  const result = helper()
}

// ✅ 测试8：复杂嵌套    StatementList -> this.Many() (Many分支3-多个语句)
{
  if (condition) {
    try {
      doSomething()
    } catch (e) {
      handleError(e)
    }
  }
  
  while (hasMore) {
    processItem()
  }
}

// ✅ 测试9：try-catch-finally    StatementList -> this.Many() (Many分支3-多个语句)
{
  const x = 1
  try {
    riskyOperation()
  } catch (err) {
    logError(err)
  } finally {
    cleanup()
  }
  const y = 2
}

// ✅ 测试10：多分支语句    StatementList -> this.Many() (Many分支3-多个语句)
{
  switch (value) {
    case 1:
      handleOne()
      break
    case 2:
      handleTwo()
      break
    default:
      handleDefault()
  }
  
  for (let key in obj) {
    process(obj[key])
  }
  
  return result
}

/* 
 * 规则验证小结：
 * - StatementList规则包含1个Many（可重复匹配StatementListItem）
 * - Many分支1（0个）：已覆盖（测试1）
 * - Many分支2（1个）：已覆盖（测试2）
 * - Many分支3（多个）：已覆盖（测试3-10）
 * - 所有Many的情况都已测试
 */

/**
 * 规则测试：StatementList
 * 
 * 位置：Es6Parser.ts Line 1726
 * 分类：statements
 * 编号：424
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * 
 * 测试目标：
 * - 验证规则的基本功能


 * - 测试Many的0/1/多种情况
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（基础测试）
 */

const x = 1
const y = 2
console.log(x + y)

/* Es6Parser.ts: StatementList */
