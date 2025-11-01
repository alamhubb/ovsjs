/**
 * 最小复现：为什么某些JavaScript代码会导致内存溢出
 */

import { ovsTransform } from "./src/index.ts";

console.log('=' .repeat(60))
console.log('最小复现测试：ovsTransform 只能处理 OVS 源代码，不能处理已编译的 JavaScript')
console.log('='.repeat(60))

// ✅ 测试1：简单的已编译JavaScript（成功）
console.log('\n✅ 测试1：简单的已编译JavaScript（成功）')
const simpleJS = `
export default (function(){
  const children = [];
  children.push(createComponentVNode(div,{},[]))
  return children})()
`
try {
  const result1 = ovsTransform(simpleJS)
  console.log('成功！输出长度:', result1.code.length)
} catch (e) {
  console.error('失败:', e.message)
}

// ❌ 测试2：复杂的已编译JavaScript（失败 - 内存溢出）
console.log('\n❌ 测试2：复杂的已编译JavaScript（会超时/内存溢出）')
const complexJS = `
export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(console.log('Starting'));
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),]));
  children.push(console.log('Complete'));
  return children})()
`

const timeout = setTimeout(() => {
  console.error('⏰ 超时！陷入无限循环/内存溢出')
  console.log('\n' + '='.repeat(60))
  console.log('问题根因：')
  console.log('='.repeat(60))
  console.log('1. ovsTransform 设计用于编译 OVS 源代码，不是 JavaScript')
  console.log('2. 代码中的裸标识符 "div" 会被 OvsParser.AssignmentExpression 误匹配')
  console.log('3. Parser 尝试匹配为 OvsRenderFunction: div { ... }')
  console.log('4. 匹配失败后不断回溯，导致指数级复杂度')
  console.log('5. 复杂代码触发更多回溯 → 内存溢出')
  process.exit(1)
}, 3000)

try {
  const result2 = ovsTransform(complexJS)
  clearTimeout(timeout)
  console.log('成功！输出长度:', result2.code.length)
} catch (e) {
  clearTimeout(timeout)
  console.error('失败:', e.message)
}

console.log('\n' + '='.repeat(60))
console.log('✅ 正确用法：应该编译 OVS 源代码')
console.log('='.repeat(60))

const correctOVS = `
export default div {
  const appName = 'Simple Test';
  const version = '1.0';
  h1 { appName }
  p { version }
}
`

try {
  const result3 = ovsTransform(correctOVS)
  console.log('✅ 成功！这才是正确的用法')
  console.log('输出长度:', result3.code.length)
  console.log('输出代码:')
  console.log(result3.code)
} catch (e) {
  console.error('失败:', e.message)
}



















