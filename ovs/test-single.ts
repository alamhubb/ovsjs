import {ovsTransform} from "./src";

// 测试：只有一个 console.log 语句
const code = `
console.log('test');
`

console.log('开始测试...')
try {
  const res = ovsTransform(code)
  console.log('✅ 测试通过')
  console.log('输出:', res.code)
} catch (e) {
  console.log('❌ 测试失败:', e.message)
  console.log(e.stack?.slice(0, 1000))
}

