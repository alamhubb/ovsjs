import {traverseClearLoc, traverseClearTokens} from "../../slime/slime/src/index"
import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {objectScript6Tokens} from "./parser/ObjectScriptTokenConsumer";
import ObjectScriptParser from "./parser/ObjectScriptParser";
import {LogUtil} from "./logutil";
import {SubhutiUtil} from "subhuti/src/parser/SubhutiParser";
import JsonUtil from "subhuti/src/utils/JsonUtil";
import ObjectCstToSlimeAstUtil from "./factory/ObjectCstToSlimeAst";
import SlimeGenerator from "slime-generator/src/SlimeGenerator";


Error.stackTraceLimit = 50

console.log(SubhutiUtil.generateUUID())

class tempA{
}

const a = new tempA()



const code = `
object a {
  x = 1
  y = 2
  getName() {
    return "test"
  }
}
`

console.log('========== 1. Lexer (分词) ==========')
const lexer = new SubhutiLexer(objectScript6Tokens)
const tokens = lexer.lexer(code)
console.log('Tokens 数量:', tokens.length)
// LogUtil.log(tokens)

console.log('\n========== 2. Parser (解析 CST) ==========')
const parser = new ObjectScriptParser(tokens)
let curCst = parser.Program()

console.log('CST 生成成功')
const outCst = JsonUtil.cloneDeep(curCst)
const cstForAst = traverseClearTokens(outCst)
// 注意：不清空 loc，因为 SlimeGenerator 需要位置信息
// traverseClearLoc(outCst)
console.log('CST 结构（简化）:')
console.log(JSON.stringify(cstForAst, null, 2).substring(0, 1000))
// LogUtil.log(cstForAst)

console.log('\n========== 3. CST to AST (转换) ==========')
const ast = ObjectCstToSlimeAstUtil.toProgram(cstForAst)
console.log('AST 生成成功')
console.log('AST 类型:', ast.type)
console.log('AST body 数量:', ast.body?.length || 0)
if (ast.body && ast.body.length > 0) {
  console.log('第一个 body 节点:', ast.body[0].type)
  const firstBody = ast.body[0] as any
  if (firstBody.type === 'ClassDeclaration') {
    console.log('  - Class Name:', firstBody.id?.name)
    console.log('  - Class Body:', firstBody.body?.type)
    console.log('  - Methods 数量:', firstBody.body?.body?.length || 0)
  }
}
console.log('\n完整 AST:')
console.log(JSON.stringify(ast, null, 2))
// LogUtil.log(ast)

console.log('\n========== 4. AST to Code (生成代码) ==========')
const result = SlimeGenerator.generator(ast, tokens)
console.log('生成的代码:')
console.log('---')
console.log(result.code)
console.log('---')
console.log('\nMapping 数量:', result.mapping?.length || 0)

console.log('\n========== 测试完成 ✅ ==========')
console.log('原始代码 (ObjectScript):')
console.log(code)
console.log('\n生成代码 (ES6):')
console.log(result.code)


