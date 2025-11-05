/**
 * SubhutiTokenHelper 测试
 * 
 * 验证所有前瞻方法的正确性（现在作为实例方法）
 */

import SubhutiParser from '../src/SubhutiParser.ts'
import type SubhutiMatchToken from '../src/struct/SubhutiMatchToken.ts'

// 创建测试 tokens
function createToken(name: string, value: string, row: number = 1): SubhutiMatchToken {
  return {
    tokenName: name,
    tokenValue: value,
    rowNum: row,
    columnStartNum: 0,
    columnEndNum: value.length,
    index: 0
  } as SubhutiMatchToken
}

// 创建 Parser 实例用于测试
function createParser(tokens: SubhutiMatchToken[]): SubhutiParser {
  return new SubhutiParser(tokens)
}

// ============================================
// 测试 1：基础方法
// ============================================

console.log('测试 1：peek() 方法')
const tokens1 = [
  createToken('LetTok', 'let'),
  createToken('Identifier', 'x'),
  createToken('Equal', '='),
  createToken('Number', '1')
]
const parser1 = createParser(tokens1)

const t1 = parser1.tokenHelper.peek(1)
console.log('  peek(1) =', t1?.tokenName, '(期望: LetTok)', t1?.tokenName === 'LetTok' ? '✅' : '❌')

const t2 = parser1.tokenHelper.peek(2)
console.log('  peek(2) =', t2?.tokenName, '(期望: Identifier)', t2?.tokenName === 'Identifier' ? '✅' : '❌')

const t5 = parser1.tokenHelper.peek(10)
console.log('  peek(10) =', t5, '(期望: undefined)', t5 === undefined ? '✅' : '❌')

// ============================================
// 测试 2：is/isNot 方法
// ============================================

console.log('\n测试 2：is/isNot() 方法')
const tokens2 = [
  createToken('LBrace', '{'),
  createToken('Identifier', 'x'),
  createToken('RBrace', '}')
]
const parser2 = createParser(tokens2)

const isLBrace = parser2.tokenHelper.is('LBrace')
console.log('  is(LBrace) =', isLBrace, '(期望: true)', isLBrace === true ? '✅' : '❌')

const isNotRBrace = parser2.tokenHelper.isNot('RBrace')
console.log('  isNot(RBrace) =', isNotRBrace, '(期望: true)', isNotRBrace === true ? '✅' : '❌')

const isNotLBrace = parser2.tokenHelper.isNot('LBrace')
console.log('  isNot(LBrace) =', isNotLBrace, '(期望: false)', isNotLBrace === false ? '✅' : '❌')

// EOF 测试（需要先移动 tokenIndex 到末尾）
const parser2eof = new SubhutiParser(tokens2)
;(parser2eof as any).tokenIndex = 3  // 移动到 EOF
const isNotAtEOF = parser2eof.tokenHelper.isNot('LBrace')
console.log('  isNot(EOF, LBrace) =', isNotAtEOF, '(期望: true)', isNotAtEOF === true ? '✅' : '❌')

// ============================================
// 测试 3：isIn/isNotIn 方法
// ============================================

console.log('\n测试 3：isIn/isNotIn() 方法')
const tokens3 = [
  createToken('FunctionTok', 'function'),
  createToken('Identifier', 'test')
]
const parser3 = createParser(tokens3)

const isInSet = parser3.tokenHelper.isIn(['LBrace', 'FunctionTok', 'ClassTok'])
console.log('  isIn([LBrace, FunctionTok, ClassTok]) =', isInSet, '(期望: true)', isInSet === true ? '✅' : '❌')

const isNotInSet = parser3.tokenHelper.isNotIn(['LBrace', 'ClassTok'])
console.log('  isNotIn([LBrace, ClassTok]) =', isNotInSet, '(期望: true)', isNotInSet === true ? '✅' : '❌')

// ============================================
// 测试 4：matchSequence/notMatchSequence 方法
// ============================================

console.log('\n测试 4：matchSequence() 方法')
const tokens4 = [
  createToken('LetTok', 'let'),
  createToken('LBracket', '['),
  createToken('Identifier', 'x')
]
const parser4 = createParser(tokens4)

const matchesLetBracket = parser4.tokenHelper.matchSequence(['LetTok', 'LBracket'])
console.log('  matchSequence([LetTok, LBracket]) =', matchesLetBracket, '(期望: true)', matchesLetBracket === true ? '✅' : '❌')

const notMatchesLetEqual = parser4.tokenHelper.notMatchSequence(['LetTok', 'Equal'])
console.log('  notMatchSequence([LetTok, Equal]) =', notMatchesLetEqual, '(期望: true)', notMatchesLetEqual === true ? '✅' : '❌')

// ============================================
// 测试 5：isAsyncFunctionWithoutLineTerminator
// ============================================

console.log('\n测试 5：isAsyncFunctionWithoutLineTerminator()')

// 情况 1：async function（同一行）
const tokens5a = [
  createToken('AsyncTok', 'async', 1),
  createToken('FunctionTok', 'function', 1),  // 同一行
  createToken('Identifier', 'test', 1)
]
const parser5a = createParser(tokens5a)
const isAsyncFunc1 = parser5a.tokenHelper.isAsyncFunctionWithoutLineTerminator()
console.log('  async function (同一行) =', isAsyncFunc1, '(期望: true)', isAsyncFunc1 === true ? '✅' : '❌')

// 情况 2：async function（不同行）
const tokens5b = [
  createToken('AsyncTok', 'async', 1),
  createToken('FunctionTok', 'function', 2),  // 不同行
  createToken('Identifier', 'test', 2)
]
const parser5b = createParser(tokens5b)
const isAsyncFunc2 = parser5b.tokenHelper.isAsyncFunctionWithoutLineTerminator()
console.log('  async function (不同行) =', isAsyncFunc2, '(期望: false)', isAsyncFunc2 === false ? '✅' : '❌')

// 情况 3：async 后不是 function
const tokens5c = [
  createToken('AsyncTok', 'async', 1),
  createToken('Identifier', 'foo', 1),
  createToken('Arrow', '=>', 1)
]
const parser5c = createParser(tokens5c)
const isAsyncFunc3 = parser5c.tokenHelper.isAsyncFunctionWithoutLineTerminator()
console.log('  async foo => (不是 function) =', isAsyncFunc3, '(期望: false)', isAsyncFunc3 === false ? '✅' : '❌')

// ============================================
// 测试 6：isAsyncGeneratorWithoutLineTerminator
// ============================================

console.log('\n测试 6：isAsyncGeneratorWithoutLineTerminator()')

// 情况 1：async *（同一行）
const tokens6a = [
  createToken('AsyncTok', 'async', 1),
  createToken('Asterisk', '*', 1),  // 同一行
  createToken('Identifier', 'gen', 1)
]
const parser6a = createParser(tokens6a)
const isAsyncGen1 = parser6a.tokenHelper.isAsyncGeneratorWithoutLineTerminator()
console.log('  async * (同一行) =', isAsyncGen1, '(期望: true)', isAsyncGen1 === true ? '✅' : '❌')

// 情况 2：async *（不同行）
const tokens6b = [
  createToken('AsyncTok', 'async', 1),
  createToken('Asterisk', '*', 2),  // 不同行
  createToken('Identifier', 'gen', 2)
]
const parser6b = createParser(tokens6b)
const isAsyncGen2 = parser6b.tokenHelper.isAsyncGeneratorWithoutLineTerminator()
console.log('  async * (不同行) =', isAsyncGen2, '(期望: false)', isAsyncGen2 === false ? '✅' : '❌')

// ============================================
// 测试 7：isLetBracket
// ============================================

console.log('\n测试 7：isLetBracket()')

const tokens7a = [
  createToken('LetTok', 'let'),
  createToken('LBracket', '['),
  createToken('Identifier', 'x')
]
const parser7a = createParser(tokens7a)
const isLetBracket1 = parser7a.tokenHelper.isLetBracket()
console.log('  let [ =', isLetBracket1, '(期望: true)', isLetBracket1 === true ? '✅' : '❌')

const tokens7b = [
  createToken('LetTok', 'let'),
  createToken('Identifier', 'x'),
  createToken('Equal', '=')
]
const parser7b = createParser(tokens7b)
const isLetBracket2 = parser7b.tokenHelper.isLetBracket()
console.log('  let x = =', isLetBracket2, '(期望: false)', isLetBracket2 === false ? '✅' : '❌')

// ============================================
// 测试 8：peekSequence
// ============================================

console.log('\n测试 8：peekSequence()')

const tokens8 = [
  createToken('AsyncTok', 'async'),
  createToken('FunctionTok', 'function'),
  createToken('Identifier', 'test')
]
const parser8 = createParser(tokens8)

const seq2 = parser8.tokenHelper.peekSequence(2)
console.log('  peekSequence(2) 长度 =', seq2.length, '(期望: 2)', seq2.length === 2 ? '✅' : '❌')
console.log('  peekSequence(2)[0] =', seq2[0]?.tokenName, '(期望: AsyncTok)', seq2[0]?.tokenName === 'AsyncTok' ? '✅' : '❌')
console.log('  peekSequence(2)[1] =', seq2[1]?.tokenName, '(期望: FunctionTok)', seq2[1]?.tokenName === 'FunctionTok' ? '✅' : '❌')

const seq10 = parser8.tokenHelper.peekSequence(10)
console.log('  peekSequence(10) 长度 =', seq10.length, '(期望: 3)', seq10.length === 3 ? '✅' : '❌')

// ============================================
// 测试 9：hasLineTerminatorBefore
// ============================================

console.log('\n测试 9：hasLineTerminatorBefore()')

const tokens9a = [
  { ...createToken('AsyncTok', 'async', 1), hasLineBreakBefore: false },
  { ...createToken('FunctionTok', 'function', 1), hasLineBreakBefore: false }
]
const parser9a = createParser(tokens9a)
const hasLT1 = parser9a.tokenHelper.hasLineTerminatorBefore()
console.log('  hasLineTerminatorBefore (无换行) =', hasLT1, '(期望: false)', hasLT1 === false ? '✅' : '❌')

const tokens9b = [
  { ...createToken('AsyncTok', 'async', 1), hasLineBreakBefore: false },
  { ...createToken('FunctionTok', 'function', 2), hasLineBreakBefore: true }
]
const parser9b = createParser(tokens9b)
const hasLT2 = parser9b.tokenHelper.hasLineTerminatorBefore()
console.log('  hasLineTerminatorBefore (有换行) =', hasLT2, '(期望: false - 因为 currentIndex=0)', hasLT2 === false ? '✅' : '❌')

// 测试第二个 token
;(parser9b as any).tokenIndex = 1
const hasLT3 = parser9b.tokenHelper.hasLineTerminatorBefore()
console.log('  hasLineTerminatorBefore (第2个token有换行) =', hasLT3, '(期望: true)', hasLT3 === true ? '✅' : '❌')

// ============================================
// 总结
// ============================================

console.log('\n✅ 所有测试完成！')
console.log('执行命令：npx tsx subhuti/tests/test-lookahead.ts')
