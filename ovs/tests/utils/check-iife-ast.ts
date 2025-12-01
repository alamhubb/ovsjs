import SlimeAstUtil from "slime/packages/slime-ast/src/SlimeAstCreate.ts"
import {SlimeNodeType} from "slime-ast/src/SlimeNodeType.ts"

// 检查我们创建 IIFE 时的 AST 结构

// 创建一个简单的 IIFE
const body = SlimeAstUtil.createBlockStatement(
  SlimeAstUtil.creatLBrace(),
  SlimeAstUtil.createRBrace(),
  []
)

const params = SlimeAstUtil.createFunctionParams(
  SlimeAstUtil.createLParen(),
  SlimeAstUtil.createRParen()
)

const funcExpr = SlimeAstUtil.createFunctionExpression(body, null, params)
const iife = SlimeAstUtil.createCallExpression(funcExpr, [])

console.log('IIFE AST 结构：')
console.log(JSON.stringify(iife, null, 2))

console.log('\n问题：')
console.log('  CallExpression 的 AST 中没有"括号包裹"的信息')
console.log('  只有 callee (FunctionExpression) 和 arguments')
console.log('  所以代码生成器必须自己判断是否需要添加括号')
console.log('')
console.log('这是因为：')
console.log('  (function(){})() 在 AST 层面就是 CallExpression')
console.log('  括号是 JavaScript 语法要求，不是语义信息')

