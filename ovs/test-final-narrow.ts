/**
 * 精确定位：问题是由"最后的console.log"触发的
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
    console.log('输出:', result.code.substring(0, 200))
    return true
  } catch (e) {
    console.error('❌ 失败:', e.message)
    return false
  }
}

// 测试11：console.log + createComponentVNode + console.log
testCode('11 - console.log + createComponentVNode + console.log', `
export default (function(){
  const children = [];
  children.push(console.log('First'));
  children.push(createComponentVNode(div,{},[appName,]));
  children.push(console.log('Last'));
  return children})()
`)

// 测试12：两个createComponentVNode + console.log
testCode('12 - createComponentVNode + createComponentVNode + console.log', `
export default (function(){
  const children = [];
  children.push(createComponentVNode(div,{},[appName,]));
  children.push(createComponentVNode(p,{},[version,]));
  children.push(console.log('Last'));
  return children})()
`)

// 测试13：简化的完整问题代码（最小复现）
testCode('13 - 最小复现', `
export default (function(){
  const children = [];
  children.push(console.log('a'));
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[x,]),]));
  children.push(console.log('b'));
  return children})()
`)

console.log('\n所有测试完成')




















