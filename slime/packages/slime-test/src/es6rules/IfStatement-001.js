/**
 * 规则测试：IfStatement
 * 
 * 位置：Es2025Parser.ts Line 1256
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


/* Es2025Parser.ts: if (Expression) Statement (else Statement)? */

/**
 * 规则测试：IfStatement
 * 
 * 位置：Es2025Parser.ts Line 1126
 * 分类：statements
 * 编号：405
 * 
 * 规则特征：
 * ✓ 包含Option（1处）- else 分支可选
 * 
 * 规则语法：
 *   IfStatement:
 *     if ( Expression ) Statement
 *     if ( Expression ) Statement else Statement
 * 
 * 测试目标：
 * - 覆盖Option无：if语句（无else）
 * - 覆盖Option有：if-else语句（有else）
 * - 验证各种条件表达式
 * - 验证嵌套if语句
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Option无 - 纯 if 语句
if (true) {
    console.log('always')
}

// ✅ 测试2：Option无 - if 带简单条件
const x = 5
if (x > 0) {
    console.log('positive')
}

// ✅ 测试3：Option无 - if 带复杂条件
if (x > 0 && x < 10) {
    console.log('in range')
}

// ✅ 测试4：Option有 - 基础 if-else
if (x > 0) {
    console.log('positive')
} else {
    console.log('non-positive')
}

// ✅ 测试5：Option有 - if-else else
if (x > 0) {
    console.log('positive')
} else if (x === 0) {
    console.log('zero')
} else {
    console.log('negative')
}

// ✅ 测试6：Option无 - 单行 if
if (x > 0) console.log('positive')

// ✅ 测试7：Option有 - 单行 if-else
if (x > 0) console.log('yes')
else console.log('no')

// ✅ 测试8：嵌套 if 语句
if (x > 0) {
    if (x < 10) {
        console.log('small positive')
    }
}

// ✅ 测试9：嵌套 if-else
if (x > 0) {
    if (x < 10) {
        console.log('small positive')
    } else {
        console.log('large positive')
    }
} else {
    console.log('non-positive')
}

// ✅ 测试10：条件表达式中的赋值
let result
if (x > 0) {
    result = 'positive'
} else {
    result = 'non-positive'
}

// ✅ 测试11：在循环中的 if 语句
for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) {
        console.log(i)
    }
}

// ✅ 测试12：在函数中的 if 语句
function checkValue(v) {
    if (v > 0) {
        return 'positive'
    } else {
        return 'non-positive'
    }
}

// ✅ 测试13：多个 else if
if (x === 1) {
    console.log('one')
} else if (x === 2) {
    console.log('two')
} else if (x === 3) {
    console.log('three')
} else {
    console.log('other')
}

// ✅ 测试14：复杂条件
if (x > 0 && (y < 10 || z === 0)) {
    console.log('complex')
} else {
    console.log('simple')
}

// ✅ 测试15：方法调用在条件中
const str = 'hello'
if (str.length > 0) {
    console.log('not empty')
}

/* Es2025Parser.ts: IfStatement: if ( Expression ) Statement else? Statement */
