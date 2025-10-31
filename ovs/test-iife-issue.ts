import {ovsTransform} from "./src";

console.log('测试1：简单的 IIFE（不执行）')
const code1 = `
export default (function(){
  const children = [];
  return children
})
`

try {
  const res1 = ovsTransform(code1)
  console.log('✅ 测试1通过')
  console.log(res1.code.slice(0, 150))
} catch (e) {
  console.log('❌ 测试1失败:', e.message)
}

console.log('\n' + '='.repeat(80) + '\n')

console.log('测试2：IIFE 立即执行')
const code2 = `
export default (function(){
  const children = [];
  return children
})()
`

let timeout = setTimeout(() => {
  console.log('⏱️ 超时！IIFE() 有问题')
  process.exit(1)
}, 5000)

try {
  const res2 = ovsTransform(code2)
  clearTimeout(timeout)
  console.log('✅ 测试2通过')
  console.log(res2.code.slice(0, 150))
} catch (e) {
  clearTimeout(timeout)
  console.log('❌ 测试2失败:', e.message)
}

console.log('\n' + '='.repeat(80) + '\n')

console.log('测试3：IIFE() 里有 children.push')
const code3 = `
export default (function(){
  const children = [];
  children.push(123);
  return children
})()
`

timeout = setTimeout(() => {
  console.log('⏱️ 超时！children.push 导致问题')
  process.exit(1)
}, 5000)

try {
  const res3 = ovsTransform(code3)
  clearTimeout(timeout)
  console.log('✅ 测试3通过')
  console.log(res3.code.slice(0, 150))
} catch (e) {
  clearTimeout(timeout)
  console.log('❌ 测试3失败:', e.message)
}

