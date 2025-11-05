/**
 * 快速测试：验证 ShortCircuitExpression 和 ImportClause
 */
import Es2025Parser from './Es2025Parser.ts'
import { es2025Tokens } from './Es2025Tokens.ts'
import SubhutiLexer from 'subhuti/src/parser/SubhutiLexer.ts'

const lexer = new SubhutiLexer(es2025Tokens)

// 测试1：Nullish Coalescing（??）
console.log('🧪 测试1：Nullish Coalescing')
const code1 = 'const x = a ?? b'
const tokens1 = lexer.lexer(code1)
const parser1 = new Es2025Parser(tokens1)
const cst1 = parser1.Script()
console.log(cst1 ? '✅ 解析成功' : '❌ 解析失败')

// 测试2：Logical OR（||）
console.log('\n🧪 测试2：Logical OR')
const code2 = 'const x = a || b'
const tokens2 = lexer.lexer(code2)
const parser2 = new Es2025Parser(tokens2)
const cst2 = parser2.Script()
console.log(cst2 ? '✅ 解析成功' : '❌ 解析失败')

// 测试3：混合 import
console.log('\n🧪 测试3：混合 import')
const code3 = 'import React, { useState } from "react"'
const tokens3 = lexer.lexer(code3)
const parser3 = new Es2025Parser(tokens3)
const cst3 = parser3.Module()
console.log(cst3 ? '✅ 解析成功' : '❌ 解析失败')

// 测试4：单独 import
console.log('\n🧪 测试4：单独 import')
const code4 = 'import React from "react"'
const tokens4 = lexer.lexer(code4)
const parser4 = new Es2025Parser(tokens4)
const cst4 = parser4.Module()
console.log(cst4 ? '✅ 解析成功' : '❌ 解析失败')

console.log('\n🎉 所有测试完成')


