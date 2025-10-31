/**
 * 调试各个编译阶段，找出无限循环发生在哪里
 */

import { ovsTransformBase } from "./src/index.ts";
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

console.log('开始测试...')
console.log('代码长度:', problematicCode.length)

try {
  console.log('\n阶段1: 词法分析 + 语法分析 + AST转换')
  const baseResult = ovsTransformBase(problematicCode)
  console.log('✅ 阶段1成功')
  console.log('AST节点数:', baseResult.ast?.body?.length)
  console.log('Token数:', baseResult.tokens?.length)
  
  console.log('\n阶段2: 代码生成（这里可能陷入无限循环）')
  console.log('开始调用 SlimeGenerator.generator...')
  
  // 设置超时
  const timeout = setTimeout(() => {
    console.error('❌ 代码生成阶段超时！无限循环发生在 SlimeGenerator.generator')
    process.exit(1)
  }, 3000)
  
  const result = SlimeGenerator.generator(baseResult.ast, baseResult.tokens)
  clearTimeout(timeout)
  
  console.log('✅ 阶段2成功')
  console.log('生成代码长度:', result.code.length)
  
} catch (e) {
  console.error('❌ 错误:', e.message)
  console.error('堆栈:', e.stack)
}






