/**
 * 对比测试：手动实现 vs 调用函数
 */

import SubhutiLexer from "../subhuti/src/parser/SubhutiLexer.ts";
import { ovs6Tokens } from "./src/parser/OvsConsumer.ts";
import OvsParser from "./src/parser/OvsParser.ts";
import OvsTokenConsumer from "./src/parser/OvsConsumer.ts";
import OvsCstToSlimeAstUtil from "./src/factory/OvsCstToSlimeAstUtil.ts";
import SlimeGenerator from "../slime/packages/slime-generator/src/SlimeGenerator.ts";

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

console.log('方式1：手动步骤（之前测试成功）')
try {
  const lexer = new SubhutiLexer(ovs6Tokens)
  const tokens = lexer.lexer(problematicCode)
  const parser = new OvsParser(tokens, OvsTokenConsumer)
  const cst = parser.Program()
  const ast = OvsCstToSlimeAstUtil.toProgram(cst)
  console.log('✅ AST转换成功')
  
  // 现在尝试代码生成
  console.log('开始代码生成...')
  const timeout = setTimeout(() => {
    console.error('❌ 代码生成超时！无限循环发生在 SlimeGenerator.generator')
    process.exit(1)
  }, 3000)
  
  const result = SlimeGenerator.generator(ast, tokens)
  clearTimeout(timeout)
  console.log('✅ 代码生成成功')
  console.log('代码长度:', result.code.length)
  
} catch (e) {
  console.error('❌ 错误:', e.message)
}















