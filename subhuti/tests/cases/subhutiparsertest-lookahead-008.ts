/**
 * SubhutiParser 测试 008：前瞻（Lookahead）功能测试
 * 
 * 测试目标：
 * 1. lookaheadAfter.not - 字符串形式（后面不能是特定字符串）
 * 2. lookaheadAfter.not - 正则形式（后面不能匹配正则）
 * 3. 换行符处理
 * 4. 特殊字符处理
 * 5. 实际应用场景（如可选链 ?. vs 三元运算符 ?）
 */

import SubhutiLexer from "../../src/SubhutiLexer.ts"
import { createRegToken, createValueRegToken } from "../../src/struct/SubhutiCreateToken.ts"

// ============================================
// 测试场景1：区分可选链 ?. 和三元运算符 ?
// ============================================

console.log('='.repeat(70))
console.log('SubhutiParser 测试 008：前瞻（Lookahead）功能测试')
console.log('='.repeat(70))

let passed = 0
let failed = 0

console.log('\n【场景1】区分可选链 ?. 和三元运算符 ?')
console.log('-'.repeat(70))

const testTokens1 = [
  // 可选链：? 后面不能是 .
  createValueRegToken('Question', /\?/, '?', false, { not: '.' }),
  
  // 可选链操作符：必须是 ?.
  createValueRegToken('OptionalChaining', /\?\./, '?.'),
  
  createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
  createValueRegToken('Colon', /:/, ':'),
  createValueRegToken('Number', /[0-9]+/, '0'),
  createValueRegToken('WhiteSpace', /[ \t\r\n]+/, '', true),
]

// 测试1.1：匹配可选链 ?.
console.log('\n[测试1.1] 匹配可选链: "a?.b"')
try {
  const lexer1_1 = new SubhutiLexer(testTokens1)
  const tokens1_1 = lexer1_1.tokenize('a?.b')
  
  console.log('  Tokens:', tokens1_1.map(t => `${t.tokenName}(${t.tokenValue})`).join(' '))
  
  if (tokens1_1.length === 3 && 
      tokens1_1[0].tokenName === 'Identifier' &&
      tokens1_1[1].tokenName === 'OptionalChaining' &&
      tokens1_1[2].tokenName === 'Identifier') {
    console.log('  ✅ 成功：正确识别为 Identifier + OptionalChaining + Identifier')
    passed++
  } else {
    console.log('  ❌ 失败：Token识别错误')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试1.2：匹配三元运算符 ?
console.log('\n[测试1.2] 匹配三元运算符: "a ? b : c"')
try {
  const lexer1_2 = new SubhutiLexer(testTokens1)
  const tokens1_2 = lexer1_2.tokenize('a ? b : c')
  
  console.log('  Tokens:', tokens1_2.map(t => `${t.tokenName}(${t.tokenValue})`).join(' '))
  
  if (tokens1_2.length === 5 && 
      tokens1_2[1].tokenName === 'Question' &&
      tokens1_2[3].tokenName === 'Colon') {
    console.log('  ✅ 成功：正确识别为三元运算符')
    console.log('  验证：Question token 后面不是 "."，前瞻生效')
    passed++
  } else {
    console.log('  ❌ 失败：Token识别错误')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// ============================================
// 测试场景2：换行符前瞻（正则形式）
// ============================================

console.log('\n\n【场景2】换行符前瞻（正则形式）')
console.log('-'.repeat(70))

const testTokens2 = [
  // 分号：后面不能紧跟换行符（测试用例）
  // ⚠️ 使用 ^ 锚点匹配字符串开头
  createValueRegToken('SemicolonNoNewline', /;/, ';', false, { not: /^[\r\n]/ }),
  
  // 普通分号（会被上面的规则优先匹配）
  createValueRegToken('Semicolon', /;/, ';'),
  
  createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
  createValueRegToken('WhiteSpace', /[ \t]+/, '', true),  // 不包含换行符
  createValueRegToken('LineBreak', /[\r\n]+/, '\n', true),  // 单独处理换行符
]

// 测试2.1：分号后面是空格（非换行符）
console.log('\n[测试2.1] 分号后面是空格: "a; b"')
try {
  const lexer2_1 = new SubhutiLexer(testTokens2)
  const tokens2_1 = lexer2_1.tokenize('a; b')
  
  console.log('  Tokens:', tokens2_1.map(t => `${t.tokenName}(${t.tokenValue})`).join(' '))
  
  if (tokens2_1.length === 3 && tokens2_1[1].tokenName === 'SemicolonNoNewline') {
    console.log('  ✅ 成功：分号后面不是换行符，匹配 SemicolonNoNewline')
    passed++
  } else {
    console.log('  ❌ 失败：应该匹配 SemicolonNoNewline')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试2.2：分号后面是换行符
console.log('\n[测试2.2] 分号后面是换行符: "a;\\nb"')
try {
  const lexer2_2 = new SubhutiLexer(testTokens2)
  const tokens2_2 = lexer2_2.tokenize('a;\nb')
  
  console.log('  Tokens:', tokens2_2.map(t => `${t.tokenName}(${t.tokenValue})`).join(' '))
  
  if (tokens2_2.length === 3 && tokens2_2[1].tokenName === 'Semicolon') {
    console.log('  ✅ 成功：分号后面是换行符，跳过 SemicolonNoNewline，匹配普通 Semicolon')
    console.log('  验证：正则前瞻生效（not: /[\\r\\n]/）')
    passed++
  } else {
    console.log('  ❌ 失败：应该匹配普通 Semicolon，实际:', tokens2_2[1]?.tokenName)
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// ============================================
// 测试场景3：数字后缀前瞻
// ============================================

console.log('\n\n【场景3】数字后缀前瞻')
console.log('-'.repeat(70))

const testTokens3 = [
  // 整数：后面不能是小数点或字母（避免匹配到 123.45 或 123n）
  // ⚠️ 使用 ^ 锚点匹配字符串开头
  createValueRegToken('Integer', /[0-9]+/, '0', false, { not: /^[.a-zA-Z]/ }),
  
  // 浮点数
  createValueRegToken('Float', /[0-9]+\.[0-9]+/, '0.0'),
  
  // BigInt（数字 + n）
  createValueRegToken('BigInt', /[0-9]+n/, '0n'),
  
  createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
  createValueRegToken('WhiteSpace', /[ \t\r\n]+/, '', true),
]

// 测试3.1：纯整数
console.log('\n[测试3.1] 纯整数: "123"')
try {
  const lexer3_1 = new SubhutiLexer(testTokens3)
  const tokens3_1 = lexer3_1.tokenize('123')
  
  console.log('  Tokens:', tokens3_1.map(t => `${t.tokenName}(${t.tokenValue})`).join(' '))
  
  if (tokens3_1.length === 1 && tokens3_1[0].tokenName === 'Integer') {
    console.log('  ✅ 成功：识别为 Integer')
    passed++
  } else {
    console.log('  ❌ 失败')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试3.2：浮点数（前瞻阻止Integer匹配）
console.log('\n[测试3.2] 浮点数: "123.45"')
try {
  const lexer3_2 = new SubhutiLexer(testTokens3)
  const tokens3_2 = lexer3_2.tokenize('123.45')
  
  console.log('  Tokens:', tokens3_2.map(t => `${t.tokenName}(${t.tokenValue})`).join(' '))
  
  if (tokens3_2.length === 1 && tokens3_2[0].tokenName === 'Float') {
    console.log('  ✅ 成功：Integer 被前瞻阻止，正确匹配 Float')
    console.log('  验证：Integer 的 not: /[.a-zA-Z]/ 生效')
    passed++
  } else {
    console.log('  ❌ 失败：应该匹配 Float，实际:', tokens3_2[0]?.tokenName)
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试3.3：BigInt（前瞻阻止Integer匹配）
console.log('\n[测试3.3] BigInt: "123n"')
try {
  const lexer3_3 = new SubhutiLexer(testTokens3)
  const tokens3_3 = lexer3_3.tokenize('123n')
  
  console.log('  Tokens:', tokens3_3.map(t => `${t.tokenName}(${t.tokenValue})`).join(' '))
  
  if (tokens3_3.length === 1 && tokens3_3[0].tokenName === 'BigInt') {
    console.log('  ✅ 成功：Integer 被前瞻阻止，正确匹配 BigInt')
    passed++
  } else {
    console.log('  ❌ 失败：应该匹配 BigInt，实际:', tokens3_3[0]?.tokenName)
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// ============================================
// 测试场景4：关键字边界前瞻
// ============================================

console.log('\n\n【场景4】关键字边界前瞻')
console.log('-'.repeat(70))

const testTokens4 = [
  // ⚠️ 重要：关键字必须放在 Identifier 之前！
  // ⚠️ 前瞻正则必须使用 ^ 锚点，否则会匹配字符串中任意位置
  // 关键字 "in"：后面不能是字母或数字（避免匹配到 index、int 等）
  createValueRegToken('InKeyword', /in/, 'in', false, { not: /^[a-zA-Z0-9_]/ }),
  
  // 关键字 "if"
  createValueRegToken('IfKeyword', /if/, 'if', false, { not: /^[a-zA-Z0-9_]/ }),
  
  // Identifier 放在关键字之后
  createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
  createValueRegToken('WhiteSpace', /[ \t\r\n]+/, '', true),
]

// 测试4.1：关键字 in（独立）
console.log('\n[测试4.1] 关键字 in: "x in array"')
try {
  const lexer4_1 = new SubhutiLexer(testTokens4)
  const tokens4_1 = lexer4_1.tokenize('x in array')
  
  console.log('  Tokens:', tokens4_1.map(t => `${t.tokenName}(${t.tokenValue})`).join(' '))
  
  if (tokens4_1.length === 3 && tokens4_1[1].tokenName === 'InKeyword') {
    console.log('  ✅ 成功：识别为关键字 InKeyword')
    passed++
  } else {
    console.log('  ❌ 失败')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试4.2：标识符 index（前瞻阻止InKeyword）
console.log('\n[测试4.2] 标识符 index: "index"')
try {
  const lexer4_2 = new SubhutiLexer(testTokens4)
  const tokens4_2 = lexer4_2.tokenize('index')
  
  console.log('  Tokens:', tokens4_2.map(t => `${t.tokenName}(${t.tokenValue})`).join(' '))
  
  if (tokens4_2.length === 1 && tokens4_2[0].tokenName === 'Identifier') {
    console.log('  ✅ 成功：InKeyword 被前瞻阻止，识别为完整的 Identifier')
    console.log('  验证：InKeyword 的 not: /[a-zA-Z0-9_]/ 生效')
    passed++
  } else {
    console.log('  ❌ 失败：应该匹配 Identifier，实际:', tokens4_2[0]?.tokenName)
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试4.3：标识符 iffy
console.log('\n[测试4.3] 标识符 iffy: "iffy"')
try {
  const lexer4_3 = new SubhutiLexer(testTokens4)
  const tokens4_3 = lexer4_3.tokenize('iffy')
  
  console.log('  Tokens:', tokens4_3.map(t => `${t.tokenName}(${t.tokenValue})`).join(' '))
  
  if (tokens4_3.length === 1 && tokens4_3[0].tokenName === 'Identifier') {
    console.log('  ✅ 成功：IfKeyword 被前瞻阻止，识别为完整的 Identifier')
    passed++
  } else {
    console.log('  ❌ 失败')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// ============================================
// 测试场景5：特殊字符前瞻
// ============================================

console.log('\n\n【场景5】特殊字符前瞻')
console.log('-'.repeat(70))

const testTokens5 = [
  // 减号：后面不是 > （避免匹配箭头函数 ->）
  createValueRegToken('Minus', /-/, '-', false, { not: '>' }),
  
  // 箭头函数
  createValueRegToken('Arrow', /->/, '->'),
  
  // 加号：后面不是 + （避免匹配 ++）
  createValueRegToken('Plus', /\+/, '+', false, { not: '+' }),
  
  // 自增
  createValueRegToken('PlusPlus', /\+\+/, '++'),
  
  createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
  createValueRegToken('WhiteSpace', /[ \t\r\n]+/, '', true),
]

// 测试5.1：箭头函数 ->
console.log('\n[测试5.1] 箭头函数: "a -> b"')
try {
  const lexer5_1 = new SubhutiLexer(testTokens5)
  const tokens5_1 = lexer5_1.tokenize('a -> b')
  
  console.log('  Tokens:', tokens5_1.map(t => `${t.tokenName}(${t.tokenValue})`).join(' '))
  
  if (tokens5_1.length === 3 && tokens5_1[1].tokenName === 'Arrow') {
    console.log('  ✅ 成功：Minus 被前瞻阻止，正确匹配 Arrow')
    passed++
  } else {
    console.log('  ❌ 失败')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试5.2：减法运算 -
console.log('\n[测试5.2] 减法运算: "a - b"')
try {
  const lexer5_2 = new SubhutiLexer(testTokens5)
  const tokens5_2 = lexer5_2.tokenize('a - b')
  
  console.log('  Tokens:', tokens5_2.map(t => `${t.tokenName}(${t.tokenValue})`).join(' '))
  
  if (tokens5_2.length === 3 && tokens5_2[1].tokenName === 'Minus') {
    console.log('  ✅ 成功：识别为 Minus（后面不是 >）')
    passed++
  } else {
    console.log('  ❌ 失败')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试5.3：自增运算 ++
console.log('\n[测试5.3] 自增运算: "a++"')
try {
  const lexer5_3 = new SubhutiLexer(testTokens5)
  const tokens5_3 = lexer5_3.tokenize('a++')
  
  console.log('  Tokens:', tokens5_3.map(t => `${t.tokenName}(${t.tokenValue})`).join(' '))
  
  if (tokens5_3.length === 2 && tokens5_3[1].tokenName === 'PlusPlus') {
    console.log('  ✅ 成功：Plus 被前瞻阻止，正确匹配 PlusPlus')
    passed++
  } else {
    console.log('  ❌ 失败')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// 测试5.4：加法运算 +
console.log('\n[测试5.4] 加法运算: "a + b"')
try {
  const lexer5_4 = new SubhutiLexer(testTokens5)
  const tokens5_4 = lexer5_4.tokenize('a + b')
  
  console.log('  Tokens:', tokens5_4.map(t => `${t.tokenName}(${t.tokenValue})`).join(' '))
  
  if (tokens5_4.length === 3 && tokens5_4[1].tokenName === 'Plus') {
    console.log('  ✅ 成功：识别为 Plus（后面不是 +）')
    passed++
  } else {
    console.log('  ❌ 失败')
    failed++
  }
} catch (e: any) {
  console.log('  ❌ 异常:', e.message)
  failed++
}

// ============================================
// 测试总结
// ============================================

console.log('\n' + '='.repeat(70))
console.log('测试总结')
console.log('='.repeat(70))
console.log(`通过: ${passed}/${passed + failed}`)
console.log(`失败: ${failed}/${passed + failed}`)
console.log('='.repeat(70))

console.log('\n📋 前瞻（Lookahead）功能要点：')
console.log('1. lookaheadAfter.not 支持字符串和正则表达式')
console.log('2. 用于区分易混淆的 token（如 ?. vs ?，-> vs -）')
console.log('3. 可处理换行符、字母、数字等各种字符')
console.log('4. 主要用于词法分析层面的歧义消除')
console.log('5. 实际应用：可选链、关键字边界、数字后缀等')

console.log('\n⚠️  当前实现状态：')
console.log('✅ 已实现：lookaheadAfter.not（字符串和正则）')
console.log('❌ 未实现：lookaheadAfter.is')
console.log('❌ 未实现：lookaheadAfter.in')
console.log('❌ 未实现：lookaheadAfter.notIn')

if (failed === 0) {
  console.log('\n✅ 所有测试通过！')
  process.exit(0)
} else {
  console.log('\n❌ 有测试失败')
  process.exit(1)
}

