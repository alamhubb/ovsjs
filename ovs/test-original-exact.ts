/**
 * 使用用户提供的原始代码进行测试
 */

import {ovsTransform} from "./src/index.ts";

console.log('测试用户原始代码...\n')

// 用户说这个会成功
const code1 = `
export default (function(){
  const children = [];
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]))
  return children})()
`

console.log('代码1（用户说成功）:')
try {
  const timeout1 = setTimeout(() => {
    console.error('❌ 超时!')
    process.exit(1)
  }, 5000)
  
  const res1 = ovsTransform(code1)
  clearTimeout(timeout1)
  console.log('✅ 成功')
  console.log('结果:', res1.code)
} catch (e) {
  console.error('❌ 失败:', e.message)
}

// 用户说这个会内存溢出
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

console.log('\n代码2（用户说会内存溢出）:')
try {
  const timeout2 = setTimeout(() => {
    console.error('❌ 超时! 内存溢出!')
    process.exit(1)
  }, 5000)
  
  const res2 = ovsTransform(code2)
  clearTimeout(timeout2)
  console.log('✅ 成功')
  console.log('结果:', res2.code.substring(0, 200))
} catch (e) {
  console.error('❌ 失败:', e.message)
}



















