import {ovsTransform} from "./src";

// 用户的问题代码
const code = `
export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(console.log('Starting simple test...'));
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]));
  children.push(console.log('Simple test complete!'));
  return children})()
`

console.log('测试用户的问题代码...')
console.log('如果10秒没有响应，说明进入死循环')

let timeout = setTimeout(() => {
  console.log('⏱️ 超时！进入死循环')
  process.exit(1)
}, 10000)

try {
  const res = ovsTransform(code)
  clearTimeout(timeout)
  console.log('✅ 测试通过')
  console.log('输出:', res.code.slice(0, 200) + '...')
} catch (e) {
  clearTimeout(timeout)
  console.log('❌ 测试失败:', e.message)
}

