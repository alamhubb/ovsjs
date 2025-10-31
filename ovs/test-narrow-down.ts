import {ovsTransform} from "./src";

function test(name: string, code: string) {
  console.log(`测试: ${name}`)
  let timeout = setTimeout(() => {
    console.log('❌ 超时！这段代码有问题')
    process.exit(1)
  }, 3000)
  
  try {
    const res = ovsTransform(code)
    clearTimeout(timeout)
    console.log('✅ 通过')
    console.log(res.code.slice(0, 100) + '...\n')
  } catch (e) {
    clearTimeout(timeout)
    console.log('❌ 失败:', e.message, '\n')
  }
}

test('1. IIFE + children + const声明', `
export default (function(){
  const children = [];
  const appName = 'test';
  return children
})()
`)

test('2. IIFE + children + push(literal)', `
export default (function(){
  const children = [];
  children.push(123);
  return children
})()
`)

test('3. IIFE + children + push(console.log)', `
export default (function(){
  const children = [];
  children.push(console.log('test'));
  return children
})()
`)

test('4. IIFE + children + push(createComponentVNode)', `
export default (function(){
  const children = [];
  children.push(createComponentVNode(div,{},[123]));
  return children
})()
`)

test('5. IIFE + 完整嵌套的 createComponentVNode', `
export default (function(){
  const children = [];
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[123])]));
  return children
})()
`)

test('6. 用户的完整代码', `
export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(console.log('Starting simple test...'));
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]));
  children.push(console.log('Simple test complete!'));
  return children})()
`)

console.log('所有测试完成！')

