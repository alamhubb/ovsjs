import SubhutiLexer from "subhuti/src/parser/SubhutiLexer.ts";
import {ovs6Tokens} from "./src/parser/OvsConsumer.ts";
import OvsParser from "./src/parser/OvsParser.ts";
import OvsTokenConsumer from "./src/parser/OvsConsumer.ts";
import OvsCstToSlimeAstUtil from "./src/factory/OvsCstToSlimeAstUtil.ts";
import SlimeGenerator from "slime-generator/src/SlimeGenerator.ts";

const code = `
export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(console.log('Starting simple test...'));
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]));
  children.push(console.log('Simple test complete!'));
  return children})()
`

console.log('阶段1: 词法分析')
try {
  const lexer = new SubhutiLexer(ovs6Tokens)
  const tokens = lexer.lexer(code)
  console.log('✅ 词法分析成功, tokens数量:', tokens.length)
  
  console.log('\n阶段2: 语法分析 (Parser)')
  const parser = new OvsParser(tokens, OvsTokenConsumer)
  let cst = parser.Program()
  console.log('✅ 语法分析成功')
  
  console.log('\n阶段3: AST转换')
  // 这里可能是问题所在
  let timeout = setTimeout(() => {
    console.log('❌ AST转换超时！死循环在这里')
    process.exit(1)
  }, 5000)
  
  let ast = OvsCstToSlimeAstUtil.toProgram(cst)
  clearTimeout(timeout)
  console.log('✅ AST转换成功')
  
  console.log('\n阶段4: 代码生成')
  timeout = setTimeout(() => {
    console.log('❌ 代码生成超时！死循环在这里')
    process.exit(1)
  }, 5000)
  
  const result = SlimeGenerator.generator(ast, tokens)
  clearTimeout(timeout)
  console.log('✅ 代码生成成功')
  console.log('输出:', result.code.slice(0, 200))
  
} catch (e) {
  console.log('❌ 错误:', e.message)
  console.log(e.stack?.slice(0, 1000))
}

