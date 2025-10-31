/**
 * 细分阶段1，找出具体是哪个步骤陷入无限循环
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

console.log('开始细分测试...\n')

try {
  // 步骤1: 词法分析
  console.log('步骤1: 词法分析')
  const timeout1 = setTimeout(() => {
    console.error('❌ 词法分析超时！')
    process.exit(1)
  }, 3000)
  
  const lexer = new SubhutiLexer(ovs6Tokens)
  const tokens = lexer.lexer(problematicCode)
  clearTimeout(timeout1)
  console.log('✅ 词法分析成功，Token数:', tokens.length)
  
  // 步骤2: 语法分析
  console.log('\n步骤2: 语法分析')
  const timeout2 = setTimeout(() => {
    console.error('❌ 语法分析超时！')
    process.exit(1)
  }, 3000)
  
  const parser = new OvsParser(tokens, OvsTokenConsumer)
  const cst = parser.Program()
  clearTimeout(timeout2)
  console.log('✅ 语法分析成功')
  
  // 步骤3: AST转换
  console.log('\n步骤3: AST转换')
  const timeout3 = setTimeout(() => {
    console.error('❌ AST转换超时！无限循环发生在 OvsCstToSlimeAstUtil.toProgram')
    process.exit(1)
  }, 3000)
  
  const ast = OvsCstToSlimeAstUtil.toProgram(cst)
  clearTimeout(timeout3)
  console.log('✅ AST转换成功')
  console.log('AST节点数:', ast?.body?.length)
  
  console.log('\n🎉 所有步骤完成！')
  
} catch (e) {
  console.error('❌ 错误:', e.message)
}

