import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es2020Tokens} from "../../packages/slime-parser/src/language/es2020/Es2020Tokens";
import Es2020Parser from "../../packages/slime-parser/src/language/es2020/Es2020Parser";

// 测试1：最简单的表达式
console.log('=== 测试1：单个标识符 ===')
try {
  const code1 = `Math`
  const lexer1 = new SubhutiLexer(es2020Tokens)
  const tokens1 = lexer1.lexer(code1)
  console.log('Tokens:', tokens1.map(t => t.tokenValue).join(', '))
  const parser1 = new Es2020Parser(tokens1)
  const cst1 = parser1.Program()
  console.log('CST children:', cst1.children.length)
  if (cst1.children.length > 0) {
    console.log('✅ 测试1通过')
  } else {
    console.log('❌ 测试1失败')
  }
} catch (e: any) {
  console.log('❌ 测试1异常:', e.message)
}

// 测试2：成员访问
console.log('\n=== 测试2：成员访问 ===')
try {
  const code2 = `Math.max`
  const lexer2 = new SubhutiLexer(es2020Tokens)
  const tokens2 = lexer2.lexer(code2)
  console.log('Tokens:', tokens2.map(t => t.tokenValue).join(', '))
  const parser2 = new Es2020Parser(tokens2)
  const cst2 = parser2.Program()
  console.log('CST children:', cst2.children.length)
  if (cst2.children.length > 0) {
    console.log('✅ 测试2通过')
  } else {
    console.log('❌ 测试2失败')
  }
} catch (e: any) {
  console.log('❌ 测试2异常:', e.message)
}

// 测试3：函数调用
console.log('\n=== 测试3：函数调用 ===')
try {
  const code3 = `Math.max(1)`
  const lexer3 = new SubhutiLexer(es2020Tokens)
  const tokens3 = lexer3.lexer(code3)
  console.log('Tokens:', tokens3.map(t => t.tokenValue).join(', '))
  const parser3 = new Es2020Parser(tokens3)
  const cst3 = parser3.Program()
  console.log('CST children:', cst3.children.length)
  if (cst3.children.length > 0) {
    console.log('✅ 测试3通过')
  } else {
    console.log('❌ 测试3失败')
  }
} catch (e: any) {
  console.log('❌ 测试3异常:', e.message)
}

// 测试4：加法表达式
console.log('\n=== 测试4：加法表达式 ===')
try {
  const code4 = `1 + 2`
  const lexer4 = new SubhutiLexer(es2020Tokens)
  const tokens4 = lexer4.lexer(code4)
  console.log('Tokens:', tokens4.map(t => t.tokenValue).join(', '))
  const parser4 = new Es2020Parser(tokens4)
  const cst4 = parser4.Program()
  console.log('CST children:', cst4.children.length)
  if (cst4.children.length > 0) {
    console.log('✅ 测试4通过')
  } else {
    console.log('❌ 测试4失败')
  }
} catch (e: any) {
  console.log('❌ 测试4异常:', e.message)
}

// 测试5：完整表达式（原始测试）
console.log('\n=== 测试5：完整表达式 ===')
try {
  const code5 = `Math.max(1, 2) + Math.min(5, 3)`
  const lexer5 = new SubhutiLexer(es2020Tokens)
  const tokens5 = lexer5.lexer(code5)
  console.log('Tokens:', tokens5.map(t => t.tokenValue).join(', '))
  const parser5 = new Es2020Parser(tokens5)
  const cst5 = parser5.Program()
  console.log('CST children:', cst5.children.length)
  if (cst5.children.length > 0) {
    console.log('✅ 测试5通过')
  } else {
    console.log('❌ 测试5失败')
  }
} catch (e: any) {
  console.log('❌ 测试5异常:', e.message)
}










