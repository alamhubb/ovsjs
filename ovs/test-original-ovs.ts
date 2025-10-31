import {ovsTransform} from "./src";

console.log('测试1：原始 OVS 代码（应该正常）')
const code1 = `
div {
  h1 { "Hello" }
  p { "World" }
}
`

try {
  const res1 = ovsTransform(code1)
  console.log('✅ 测试1通过')
  console.log(res1.code)
} catch (e) {
  console.log('❌ 测试1失败:', e.message)
}

console.log('\n' + '='.repeat(80) + '\n')

console.log('测试2：带变量声明的 OVS 代码')
const code2 = `
const appName = 'Simple Test';
const version = '1.0';

div {
  h1 { appName }
  p { version }
}
`

try {
  const res2 = ovsTransform(code2)
  console.log('✅ 测试2通过')
  console.log(res2.code)
} catch (e) {
  console.log('❌ 测试2失败:', e.message)
}

console.log('\n' + '='.repeat(80) + '\n')

console.log('测试3：带 console.log 的 OVS 代码')
const code3 = `
div {
  console.log('test')
  h1 { "Hello" }
}
`

let timeout = setTimeout(() => {
  console.log('⏱️ 超时！这段代码有问题')
  process.exit(1)
}, 5000)

try {
  const res3 = ovsTransform(code3)
  clearTimeout(timeout)
  console.log('✅ 测试3通过')
  console.log(res3.code)
} catch (e) {
  clearTimeout(timeout)
  console.log('❌ 测试3失败:', e.message)
}

