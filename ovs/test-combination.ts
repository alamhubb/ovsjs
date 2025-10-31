/**
 * 测试不同元素的组合，找出具体触发条件
 */

import {ovsTransform} from "./src/index.ts";

function testCode(name: string, code: string, timeoutMs = 3000) {
  console.log(`\n测试 ${name}:`)
  
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

// 测试6：两个变量 + 一个console.log
testCode('6 - 两个变量 + 一个console.log', `
export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(console.log('Starting simple test...'));
  return children})()
`)

// 测试7：一个变量 + 两个console.log
testCode('7 - 一个变量 + 两个console.log', `
export default (function(){
  const children = [];
  const appName = 'Simple Test';
  children.push(console.log('Starting simple test...'));
  children.push(console.log('Simple test complete!'));
  return children})()
`)

// 测试8：两个变量 + 一个console.log + 一个createComponentVNode
testCode('8 - 两个变量 + console.log + createComponentVNode', `
export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(console.log('Starting simple test...'));
  children.push(createComponentVNode(div,{},[appName,]));
  return children})()
`)

// 测试9：简化的嵌套createComponentVNode
testCode('9 - 两个变量 + 嵌套createComponentVNode', `
export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]));
  return children})()
`)

// 测试10：完整代码但去掉最后的console.log
testCode('10 - 完整代码去掉最后console.log', `
export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(console.log('Starting simple test...'));
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]));
  return children})()
`)

console.log('\n所有测试完成')










