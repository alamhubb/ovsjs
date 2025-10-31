import {ovsTransform} from "./src";

console.log('测试1：只有变量声明')
const code1 = `
const appName = 'Simple Test';
`

try {
  const res1 = ovsTransform(code1)
  console.log('✅ 测试1通过')
} catch (e) {
  console.log('❌ 测试1失败:', e.message)
}

console.log('\n测试2：变量声明 + children.push(console.log())')
const code2 = `
const children = [];
const appName = 'Simple Test';
children.push(console.log('test'));
`

try {
  const res2 = ovsTransform(code2)
  console.log('✅ 测试2通过')
} catch (e) {
  console.log('❌ 测试2失败:', e.message)
}

console.log('\n测试3：只有 children.push(console.log())')
const code3 = `
const children = [];
children.push(console.log('test'));
`

try {
  const res3 = ovsTransform(code3)
  console.log('✅ 测试3通过')
} catch (e) {
  console.log('❌ 测试3失败:', e.message)
}

console.log('\n测试4：ExpressionStatement')
const code4 = `
console.log('test');
`

try {
  const res4 = ovsTransform(code4)
  console.log('✅ 测试4通过')
  console.log('输出:', res4.code)
} catch (e) {
  console.log('❌ 测试4失败:', e.message)
}

