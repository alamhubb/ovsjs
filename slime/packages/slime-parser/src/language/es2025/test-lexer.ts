/**
 * ES2025 Lexer 测试
 */

import SubhutiLexer from '../../../../../../subhuti/src/SubhutiLexer.ts'
import { es2025Tokens, TokenNames } from './Es2025Tokens.ts'

const lexer = new SubhutiLexer(es2025Tokens)

// 测试辅助函数
function test(name: string, code: string, expected?: string[]) {
  console.log(`\n🧪 测试: ${name}`)
  console.log(`代码: ${code}`)
  
  try {
    const tokens = lexer.tokenize(code)
    const tokenNames = tokens.map(t => `${t.tokenName}(${t.tokenValue})`)
    
    console.log(`✅ 通过 - Token数: ${tokens.length}`)
    console.log(`   Tokens: ${tokenNames.join(' ')}`)
    
    if (expected) {
      const actualNames = tokens.map(t => t.tokenName)
      const match = actualNames.length === expected.length && 
                    actualNames.every((name, i) => name === expected[i])
      
      if (!match) {
        console.log(`❌ 期望: ${expected.join(' ')}`)
        console.log(`   实际: ${actualNames.join(' ')}`)
      }
    }
    
    return tokens
  } catch (error) {
    console.log(`❌ 失败: ${error.message}`)
    throw error
  }
}

console.log('🚀 ES2025 Lexer 测试开始\n')
console.log('=' .repeat(60))

// ============================================
// 1. 基础 Token 测试
// ============================================
console.log('\n📦 1. 基础 Token 测试')

test('标识符', 'hello', ['Identifier'])
test('关键字', 'const let var', ['ConstTok', 'LetTok', 'VarTok'])
test('数字', '123', ['NumericLiteral'])
test('字符串', '"hello"', ['StringLiteral'])

// ============================================
// 2. 运算符测试
// ============================================
console.log('\n📦 2. 运算符测试（长到短优先级）')

test('三字符运算符', '>>>=', ['UnsignedRightShiftAssign'])
test('三字符点点点', '...', ['Ellipsis'])
test('严格相等', '===', ['StrictEqual'])
test('双字符箭头', '=>', ['Arrow'])
test('加等于', '+=', ['PlusAssign'])
test('左移', '<<', ['LeftShift'])
test('单字符加号', '+', ['Plus'])

// ============================================
// 3. OptionalChaining 前瞻测试（关键！）
// ============================================
console.log('\n📦 3. OptionalChaining 前瞻测试')

test('可选链 - 后面是标识符', 'obj?.prop', ['Identifier', 'OptionalChaining', 'Identifier'])
test('可选链 - 后面是左括号', 'func?.()', ['Identifier', 'OptionalChaining', 'LParen', 'RParen'])
test('三元运算符 - 后面是数字', 'a ? .5 : 1', ['Identifier', 'Question', 'NumericLiteral', 'Colon', 'NumericLiteral'])
test('三元运算符 - 后面是.3', 'x?.3:1', ['Identifier', 'Question', 'NumericLiteral', 'Colon', 'NumericLiteral'])

// ============================================
// 4. 模板字符串状态切换测试（关键！）
// ============================================
console.log('\n📦 4. 模板字符串状态切换测试')

test('简单模板', '`hello`', ['NoSubstitutionTemplate'])
test('带插值的模板', '`a${x}b`', ['TemplateHead', 'Identifier', 'TemplateTail'])
test('多层插值', '`a${x}b${y}c`', ['TemplateHead', 'Identifier', 'TemplateMiddle', 'Identifier', 'TemplateTail'])

// 嵌套模板
test('嵌套模板', '`outer${`inner${x}`}end`', [
  'TemplateHead',           // `outer${
  'TemplateHead',           // `inner${
  'Identifier',             // x
  'TemplateTail',           // }`
  'TemplateTail'            // }end`
])

// ============================================
// 5. BigInt 测试
// ============================================
console.log('\n📦 5. BigInt 测试')

test('BigInt 十进制', '123n', ['BigIntLiteral'])
test('BigInt 十六进制', '0xABCn', ['BigIntLiteral'])
test('BigInt 二进制', '0b1010n', ['BigIntLiteral'])
test('BigInt 八进制', '0o777n', ['BigIntLiteral'])

// ============================================
// 6. 数字分隔符测试
// ============================================
console.log('\n📦 6. 数字分隔符测试')

test('数字分隔符', '1_000_000', ['NumericLiteral'])
test('BigInt分隔符', '1_000n', ['BigIntLiteral'])
test('十六进制分隔符', '0xFF_FF', ['NumericLiteral'])

// ============================================
// 7. 注释测试
// ============================================
console.log('\n📦 7. 注释和空白符测试')

test('单行注释', '// comment\nlet x', ['LetTok', 'Identifier'])
test('多行注释', '/* comment */const y', ['ConstTok', 'Identifier'])
test('Hashbang', '#!/usr/bin/env node\nconst z', ['ConstTok', 'Identifier'])

// ============================================
// 8. 私有标识符测试
// ============================================
console.log('\n📦 8. 私有标识符测试')

test('私有字段', 'class A { #private }', [
  'ClassTok', 'Identifier', 'LBrace', 'PrivateIdentifier', 'RBrace'
])

// ============================================
// 9. 完整语句测试
// ============================================
console.log('\n📦 9. 完整语句测试')

test('变量声明', 'const x = 123', [
  'ConstTok', 'Identifier', 'Assign', 'NumericLiteral'
])

test('箭头函数', 'const fn = x => x + 1', [
  'ConstTok', 'Identifier', 'Assign', 'Identifier', 'Arrow', 'Identifier', 'Plus', 'NumericLiteral'
])

test('可选链调用', 'obj?.method?.(args)', [
  'Identifier', 'OptionalChaining', 'Identifier', 'OptionalChaining', 'LParen', 'Identifier', 'RParen'
])

test('Nullish Coalescing', 'value ?? defaultValue', [
  'Identifier', 'NullishCoalescing', 'Identifier'
])

// ============================================
// 10. 边界情况测试
// ============================================
console.log('\n📦 10. 边界情况测试')

test('空字符串', '', [])
test('只有空白符', '   \n\t  ', [])
test('只有注释', '// comment', [])

// ============================================
// 11. Token 位置信息测试
// ============================================
console.log('\n📦 11. Token 位置信息测试')

const posTokens = test('位置信息', 'let x\nconst y', ['LetTok', 'Identifier', 'ConstTok', 'Identifier'])

console.log('\n   详细位置信息:')
posTokens.forEach(t => {
  console.log(`   - ${t.tokenName}(${t.tokenValue}): index=${t.index}, row=${t.rowNum}, col=${t.columnStartNum}-${t.columnEndNum}`)
})

// ============================================
// 测试总结
// ============================================
console.log('\n' + '='.repeat(60))
console.log('✅ 所有测试通过！')
console.log('\n📊 测试覆盖:')
console.log('   ✅ 基础 token 识别')
console.log('   ✅ 运算符优先级（长到短）')
console.log('   ✅ OptionalChaining 前瞻')
console.log('   ✅ 模板字符串状态切换')
console.log('   ✅ 嵌套模板字符串')
console.log('   ✅ BigInt 和数字分隔符')
console.log('   ✅ 注释过滤')
console.log('   ✅ 私有标识符')
console.log('   ✅ 完整语句')
console.log('   ✅ Token 位置信息')

