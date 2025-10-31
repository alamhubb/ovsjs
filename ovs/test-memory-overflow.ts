import {ovsTransform} from "./src";

console.log('测试1：简单代码（应该正常）')
const code1 = `
export default (function(){
  const children = [];
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]))
  return children})()
`

try {
  const res1 = ovsTransform(code1)
  console.log('✅ 测试1通过')
  console.log(res1.code)
} catch (e) {
  console.log('❌ 测试1失败:', e.message)
}

console.log('\n' + '='.repeat(80) + '\n')

console.log('测试2：带变量声明和console.log（会内存溢出）')
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

try {
  console.log('开始执行测试2...')
  const res2 = ovsTransform(code2)
  console.log('✅ 测试2通过')
  console.log(res2.code)
} catch (e) {
  console.log('❌ 测试2失败:', e.message)
  console.log('错误栈:', e.stack?.slice(0, 500))
}

