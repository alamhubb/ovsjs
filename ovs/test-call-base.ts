/**
 * 直接调用 ovsTransformBase
 */

import { ovsTransformBase } from "./src/index.ts";

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

console.log('直接调用 ovsTransformBase...\n')

try {
  const timeout = setTimeout(() => {
    console.error('❌ 超时！无限循环发生在 ovsTransformBase')
    process.exit(1)
  }, 3000)
  
  const result = ovsTransformBase(problematicCode)
  clearTimeout(timeout)
  
  console.log('✅ ovsTransformBase 成功！')
  console.log('AST节点数:', result.ast?.body?.length)
  console.log('Token数:', result.tokens?.length)
  
} catch (e) {
  console.error('❌ 错误:', e.message)
  console.error(e.stack)
}







