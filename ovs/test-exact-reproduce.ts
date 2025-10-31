/**
 * 精确复现 ovsTransformBase 的逻辑
 */

import SubhutiLexer from "../subhuti/src/parser/SubhutiLexer.ts";
import { ovs6Tokens } from "./src/parser/OvsConsumer.ts";
import OvsParser from "./src/parser/OvsParser.ts";
import OvsTokenConsumer from "./src/parser/OvsConsumer.ts";
import OvsCstToSlimeAstUtil from "./src/factory/OvsCstToSlimeAstUtil.ts";

const problematicCode = `
export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(console.log('Starting simple test...'));
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]));
  children.push(console.log('Simple test complete!'));
  return children})()
`

console.log('精确复现 ovsTransformBase 逻辑...\n')

try {
  const timeout = setTimeout(() => {
    console.error('❌ 超时！')
    process.exit(1)
  }, 3000)
  
  // 1. 词法分析
  console.log('1. 词法分析')
  const lexer = new SubhutiLexer(ovs6Tokens)
  const tokens = lexer.lexer(problematicCode)
  console.log('Token数:', tokens.length)

  if (!tokens.length) {
    console.log('Token为空，退出')
    process.exit(0)
  }

  // 2. 语法分析
  console.log('\n2. 语法分析')
  const parser = new OvsParser(tokens, OvsTokenConsumer)
  let curCst = parser.Program()
  console.log('CST生成成功')

  // 3. 语法转换
  console.log('\n3. AST转换')
  let ast = OvsCstToSlimeAstUtil.toProgram(curCst)
  console.log('AST节点数:', ast?.body?.length)
  
  clearTimeout(timeout)
  console.log('\n✅ 全部成功！')
  
} catch (e) {
  console.error('❌ 错误:', e.message)
  console.error(e.stack)
}










