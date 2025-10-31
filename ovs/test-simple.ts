import { vitePluginOvsTransform } from './src/index'

console.log('=== 测试1: 最简单的代码 ===')
const code1 = `const a = 1`
console.log('代码:', code1)

try {
  console.log('开始编译...')
  console.time('compile')
  const result = vitePluginOvsTransform(code1)
  console.timeEnd('compile')
  console.log('✅ 测试1通过')
} catch (e) {
  console.log('❌ 测试1失败:', (e as Error).message)
}

console.log('\n=== 测试2: 带export default ===')
const code2 = `export default 123`
console.log('代码:', code2)

try {
  console.log('开始编译...')
  console.time('compile')
  const result = vitePluginOvsTransform(code2)
  console.timeEnd('compile')
  console.log('✅ 测试2通过')
} catch (e) {
  console.log('❌ 测试2失败:', (e as Error).message)
}

console.log('\n=== 测试3: IIFE但无createComponentVNode ===')
const code3 = `export default (function(){
  const children = [];
  return children
})()`
console.log('代码:', code3.substring(0, 50) + '...')

try {
  console.log('开始编译...')
  console.time('compile')
  const result = vitePluginOvsTransform(code3)
  console.timeEnd('compile')
  console.log('✅ 测试3通过')
} catch (e) {
  console.log('❌ 测试3失败:', (e as Error).message)
}

console.log('\n=== 测试4: 加上createComponentVNode（危险！）===')
const code4 = `export default (function(){
  const children = [];
  children.push(createComponentVNode(div,{},[123]));
  return children
})()`
console.log('代码:', code4.substring(0, 50) + '...')
console.log('⚠️  这个测试可能卡死...')

try {
  console.log('开始编译...')
  console.time('compile')
  const result = vitePluginOvsTransform(code4)
  console.timeEnd('compile')
  console.log('✅ 测试4通过（奇迹！）')
} catch (e) {
  console.log('❌ 测试4失败:', (e as Error).message)
}

console.log('\n所有测试完成')












