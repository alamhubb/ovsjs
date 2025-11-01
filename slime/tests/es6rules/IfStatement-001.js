/**
 * 规则测试：IfStatement
 * 
 * 位置：Es6Parser.ts Line 1256
 * 规则结构：IfStatement -> (tokens) + Expression + Statement + this.Option(ElseStatement)
 * 
 * 规则语法：
 *   IfStatement:
 *     this.tokenConsumer.IfTok()
 *     this.tokenConsumer.LParen()
 *     this.Expression()
 *     this.tokenConsumer.RParen()
 *     this.Statement()
 *     this.Option(() => {
 *       this.tokenConsumer.ElseTok()
 *       this.Statement()
 *     })
 * 
 * 测试覆盖：
 * - ✅ Option分支1：if语句（不带else）（测试1-3）
 * - ✅ Option分支2：if-else语句（带else）（测试4-6）
 * - ✅ 综合场景（嵌套、复杂条件）（测试7-10）
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：简单if语句    IfStatement -> if(condition) { statement } (Option分支1-无else)
if (true) {
  const x = 1
}

// ✅ 测试2：if带条件表达式    IfStatement -> if(expression) { statement } (Option分支1-无else)
if (x > 5 && y < 10) {
  console.log('condition met')
}

// ✅ 测试3：if单语句    IfStatement -> if(condition) statement (Option分支1-无else)
if (a === b) x = 1

// ✅ 测试4：if-else语句    IfStatement -> if(condition) { statement } else { statement } (Option分支2-有else)
if (value === 0) {
  console.log('zero')
} else {
  console.log('not zero')
}

// ✅ 测试5：if-else嵌套语句    IfStatement -> if(condition) statement else statement (Option分支2-有else)
if (age >= 18) 
  status = 'adult'
else 
  status = 'minor'

// ✅ 测试6：if-else复杂条件    IfStatement -> if(condition) statement else statement (Option分支2-有else)
if (status === 'active' || status === 'pending') {
  processUser()
} else if (status === 'inactive') {
  deactivateUser()
} else {
  archiveUser()
}

// ✅ 测试7：嵌套if-else    IfStatement -> 多层嵌套if-else (Option分支1和2混合)
if (x > 0) {
  if (x > 10) {
    console.log('x > 10')
  } else {
    console.log('0 < x <= 10')
  }
} else {
  console.log('x <= 0')
}

// ✅ 测试8：if-else链    IfStatement -> if-else if-else if (Option分支2重复)
if (score >= 90) {
  grade = 'A'
} else if (score >= 80) {
  grade = 'B'
} else if (score >= 70) {
  grade = 'C'
} else {
  grade = 'F'
}

// ✅ 测试9：if-else块语句    IfStatement -> if-else with block statements (Option分支1和2)
if (user.isAdmin) {
  showAdminPanel()
  logAccess()
} else {
  showUserPanel()
}

// ✅ 测试10：复杂条件表达式    IfStatement -> if(complexExpression) (Option分支1和2)
if (condition1 && (condition2 || condition3) && !condition4) {
  executeAction()
} else if (alternativeCondition) {
  executeAlternative()
} else {
  executeDefault()
}

/* 
 * 规则验证小结：
 * - IfStatement规则包含1个Option（else分支）
 * - Option分支1（无else）：已覆盖（测试1-3）
 * - Option分支2（有else）：已覆盖（测试4-10）
 * - 所有可能的组合都有测试
 */
