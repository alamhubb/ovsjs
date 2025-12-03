import {readFileSync} from 'fs'
import OvsCstToSlimeNodeCreate from '../../src/factory/OvsCstToSlimeAstUtil'
import OvsParser from '../../src/parser/OvsParser'
import SlimeGenerator from 'slime-generator/src/SlimeGenerator'

const code = readFileSync('./example/src/views/hello.ovs', 'utf-8')
console.log('源代码:')
console.log(code)
console.log('---')

const parser = new OvsParser(code)
const cst = parser.Program()

console.log('CST 解析成功')

const ast = OvsCstToSlimeNodeCreate.toProgram(cst)
console.log('AST 转换成功')
console.log('AST body 长度:', ast.body.length)

// 检查 div 的子元素
const divStmt = ast.body[2] as any
console.log('div children 元素数量:', divStmt.expression.arguments[2].elements.length)

// 代码生成
const result = SlimeGenerator.generator(ast, [])
console.log('---')
console.log('生成的代码:')
console.log(result.code)

