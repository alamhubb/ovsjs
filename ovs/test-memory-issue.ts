/**
 * 测试内存溢出问题
 */

import {ovsTransform} from "./src/index.ts";

console.log('测试1: 正常的代码')
try {
  const code1 = `
export default (function(){
  const children = [];
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]))
  return children})()
`
  const result1 = ovsTransform(code1)
  console.log('✅ 测试1成功')
  console.log('输出长度:', result1.code.length)
} catch (e) {
  console.error('❌ 测试1失败:', e.message)
}

console.log('\n测试2: 包含变量声明和console.log的代码（应该会内存溢出）')
try {
  const code2 = `
export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(console.log('Starting simple test...'));
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]));
  children.push(console.log('Simple test complete!'));
  return children})()
`
  
  // 设置超时保护
  const timeout = setTimeout(() => {
    console.error('❌ 测试2超时，可能陷入无限循环')
    process.exit(1)
  }, 5000) // 5秒超时
  
  const result2 = ovsTransform(code2)
  clearTimeout(timeout)
  console.log('✅ 测试2成功')
  console.log('输出长度:', result2.code.length)
} catch (e) {
  console.error('❌ 测试2失败:', e.message)
  console.error('错误堆栈:', e.stack)
}















