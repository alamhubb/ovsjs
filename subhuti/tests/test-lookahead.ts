/**
 * SubhutiLookahead 测试
 * 
 * 验证所有静态方法的正确性
 */

import SubhutiLookahead from '../src/SubhutiLookahead.ts'
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

const t1 = SubhutiLookahead.peek(tokens1, 0, 1)
console.log('  peek(0, 1) =', t1?.tokenName, '(期望: LetTok)', t1?.tokenName === 'LetTok' ? '✅' : '❌')

const t2 = SubhutiLookahead.peek(tokens1, 0, 2)
console.log('  peek(0, 2) =', t2?.tokenName, '(期望: Identifier)', t2?.tokenName === 'Identifier' ? '✅' : '❌')

const t5 = SubhutiLookahead.peek(tokens1, 0, 10)
console.log('  peek(0, 10) =', t5, '(期望: undefined)', t5 === undefined ? '✅' : '❌')

// ============================================
// 测试 2：is/isNot 方法
// ============================================

console.log('\n测试 2：is/isNot() 方法')
const tokens2 = [
  createToken('LBrace', '{'),
  createToken('Identifier', 'x'),
  createToken('RBrace', '}')
]

const isLBrace = SubhutiLookahead.is(tokens2, 0, 'LBrace')
console.log('  is(0, LBrace) =', isLBrace, '(期望: true)', isLBrace === true ? '✅' : '❌')

const isNotRBrace = SubhutiLookahead.isNot(tokens2, 0, 'RBrace')
console.log('  isNot(0, RBrace) =', isNotRBrace, '(期望: true)', isNotRBrace === true ? '✅' : '❌')

const isNotLBrace = SubhutiLookahead.isNot(tokens2, 0, 'LBrace')
console.log('  isNot(0, LBrace) =', isNotLBrace, '(期望: false)', isNotLBrace === false ? '✅' : '❌')

// EOF 测试
const isNotAtEOF = SubhutiLookahead.isNot(tokens2, 3, 'LBrace')
console.log('  isNot(EOF, LBrace) =', isNotAtEOF, '(期望: true)', isNotAtEOF === true ? '✅' : '❌')

// ============================================
// 测试 3：isIn/isNotIn 方法
// ============================================

console.log('\n测试 3：isIn/isNotIn() 方法')
const tokens3 = [
  createToken('FunctionTok', 'function'),
  createToken('Identifier', 'test')
]

const isInSet = SubhutiLookahead.isIn(tokens3, 0, ['LBrace', 'FunctionTok', 'ClassTok'])
console.log('  isIn([LBrace, FunctionTok, ClassTok]) =', isInSet, '(期望: true)', isInSet === true ? '✅' : '❌')

const isNotInSet = SubhutiLookahead.isNotIn(tokens3, 0, ['LBrace', 'ClassTok'])
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

const matchesLetBracket = SubhutiLookahead.matchSequence(tokens4, 0, ['LetTok', 'LBracket'])
console.log('  matchSequence([LetTok, LBracket]) =', matchesLetBracket, '(期望: true)', matchesLetBracket === true ? '✅' : '❌')

const notMatchesLetEqual = SubhutiLookahead.notMatchSequence(tokens4, 0, ['LetTok', 'Equal'])
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
const isAsyncFunc1 = SubhutiLookahead.isAsyncFunctionWithoutLineTerminator(tokens5a, 0)
console.log('  async function (同一行) =', isAsyncFunc1, '(期望: true)', isAsyncFunc1 === true ? '✅' : '❌')

// 情况 2：async function（不同行）
const tokens5b = [
  createToken('AsyncTok', 'async', 1),
  createToken('FunctionTok', 'function', 2),  // 不同行
  createToken('Identifier', 'test', 2)
]
const isAsyncFunc2 = SubhutiLookahead.isAsyncFunctionWithoutLineTerminator(tokens5b, 0)
console.log('  async function (不同行) =', isAsyncFunc2, '(期望: false)', isAsyncFunc2 === false ? '✅' : '❌')

// 情况 3：async 后不是 function
const tokens5c = [
  createToken('AsyncTok', 'async', 1),
  createToken('Identifier', 'foo', 1),
  createToken('Arrow', '=>', 1)
]
const isAsyncFunc3 = SubhutiLookahead.isAsyncFunctionWithoutLineTerminator(tokens5c, 0)
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
const isAsyncGen1 = SubhutiLookahead.isAsyncGeneratorWithoutLineTerminator(tokens6a, 0)
console.log('  async * (同一行) =', isAsyncGen1, '(期望: true)', isAsyncGen1 === true ? '✅' : '❌')

// 情况 2：async *（不同行）
const tokens6b = [
  createToken('AsyncTok', 'async', 1),
  createToken('Asterisk', '*', 2),  // 不同行
  createToken('Identifier', 'gen', 2)
]
const isAsyncGen2 = SubhutiLookahead.isAsyncGeneratorWithoutLineTerminator(tokens6b, 0)
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
const isLetBracket1 = SubhutiLookahead.isLetBracket(tokens7a, 0)
console.log('  let [ =', isLetBracket1, '(期望: true)', isLetBracket1 === true ? '✅' : '❌')

const tokens7b = [
  createToken('LetTok', 'let'),
  createToken('Identifier', 'x'),
  createToken('Equal', '=')
]
const isLetBracket2 = SubhutiLookahead.isLetBracket(tokens7b, 0)
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

const seq2 = SubhutiLookahead.peekSequence(tokens8, 0, 2)
console.log('  peekSequence(2) 长度 =', seq2.length, '(期望: 2)', seq2.length === 2 ? '✅' : '❌')
console.log('  peekSequence(2)[0] =', seq2[0]?.tokenName, '(期望: AsyncTok)', seq2[0]?.tokenName === 'AsyncTok' ? '✅' : '❌')
console.log('  peekSequence(2)[1] =', seq2[1]?.tokenName, '(期望: FunctionTok)', seq2[1]?.tokenName === 'FunctionTok' ? '✅' : '❌')

const seq10 = SubhutiLookahead.peekSequence(tokens8, 0, 10)
console.log('  peekSequence(10) 长度 =', seq10.length, '(期望: 3)', seq10.length === 3 ? '✅' : '❌')

// ============================================
// 总结
// ============================================

console.log('\n✅ 所有测试完成！')
console.log('执行命令：npx tsx subhuti/tests/test-lookahead.ts')

