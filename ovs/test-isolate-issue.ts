/**
 * 逐步测试，隔离导致内存溢出的语法元素
 */

import {ovsTransform} from "./src/index.ts";

function testCode(name: string, code: string, timeoutMs = 3000) {
  console.log(`\n测试 ${name}:`)
  console.log(code.substring(0, 100) + '...')
  
  try {
    const timeout = setTimeout(() => {
      console.error('❌ 超时，可能陷入无限循环')
      process.exit(1)
    }, timeoutMs)
    
    const result = ovsTransform(code)
    clearTimeout(timeout)
    console.log('✅ 成功，输出长度:', result.code.length)
    return true
  } catch (e) {
    console.error('❌ 失败:', e.message)
    return false
  }
}

// 测试1：原始可用的代码
testCode('1 - 基础代码（无变量）', `
export default (function(){
  const children = [];
  children.push(createComponentVNode(div,{},[]))
  return children})()
`)

// 测试2：添加一个简单变量声明
testCode('2 - 添加一个变量声明', `
export default (function(){
  const children = [];
  const appName = 'Test';
  return children})()
`)

// 测试3：添加console.log
testCode('3 - 添加console.log（无赋值）', `
export default (function(){
  const children = [];
  console.log('test');
  return children})()
`)

// 测试4：push console.log的返回值
testCode('4 - push console.log返回值', `
export default (function(){
  const children = [];
  children.push(console.log('test'));
  return children})()
`)

// 测试5：完整问题代码
testCode('5 - 完整问题代码', `
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










