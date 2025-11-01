/**
 * 最小复现：内存溢出 Bug
 * 运行: npx tsx test-minimal-repro-clean.ts
 */

import {ovsTransform} from "./src/index.ts";

console.log('===== 内存溢出 Bug 最小复现 =====\n')

// ✅ 简单代码：成功
console.log('测试1: 简单代码（成功）')
const simple = `
export default (function(){
  const children = [];
  children.push(createComponentVNode(div,{},[]))
  return children})()
`

try {
  const result1 = ovsTransform(simple)
  console.log('✅ 成功\n')
} catch (e) {
  console.error('❌ 失败:', e.message, '\n')
}

// ❌ 复杂代码：内存溢出
console.log('测试2: 复杂代码（会内存溢出）')
console.log('提示: 等待30-40秒后进程会崩溃...\n')

const complex = `
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
  console.error('⏰ 30秒超时 - 即将内存溢出...')
}, 30000)

try {
  const result2 = ovsTransform(complex)
  clearTimeout(timeout)
  console.log('✅ 成功（不应该到这里）')
} catch (e) {
  clearTimeout(timeout)
  console.error('❌ 失败:', e.message)
}











