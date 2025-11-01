/**
 * 直接从index.ts导入ovsTransform
 */

import { ovsTransform } from "./src/index.ts";

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

console.log('从index.ts导入ovsTransform并调用...\n')

try {
  const timeout = setTimeout(() => {
    console.error('❌ 超时！')
    process.exit(1)
  }, 3000)
  
  const result = ovsTransform(problematicCode)
  clearTimeout(timeout)
  
  console.log('✅ 成功！')
  console.log('代码长度:', result.code.length)
  console.log('代码:', result.code.substring(0, 200))
  
} catch (e) {
  console.error('❌ 错误:', e.message)
}



















