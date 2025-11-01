/**
 * 测试完全一致的原始代码
 */

import {ovsTransform} from "./src/index.ts";

function testCode(name: string, code: string, timeoutMs = 3000) {
  console.log(`\n测试 ${name}:`)
  console.log('代码长度:', code.length)
  
  try {
    const timeout = setTimeout(() => {
      console.error('❌ 超时，可能陷入无限循环')
      process.exit(1)
    }, timeoutMs)
    
    const result = ovsTransform(code)
    clearTimeout(timeout)
    console.log('✅ 成功')
    return true
  } catch (e) {
    console.error('❌ 失败:', e.message)
    return false
  }
}

// 用户提供的完全一致的原始代码
const originalCode = `
export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(console.log('Starting simple test...'));
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]));
  children.push(console.log('Simple test complete!'));
  return children})()
`

testCode('原始完整代码', originalCode)

// 测试14：逐步还原到原始代码
testCode('14 - 使用真实变量名', `
export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(console.log('Starting simple test...'));
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]));
  children.push(console.log('Simple test complete!'));
  return children})()
`)

console.log('\n所有测试完成')



















