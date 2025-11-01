import { vitePluginOvsTransform } from './src/index'

const tests = [
  {
    name: '测试1: 简单IIFE',
    code: `export default (function(){
  const children = [];
  return children
})()`
  },
  {
    name: '测试2: 带变量声明',
    code: `export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  return children
})()`
  },
  {
    name: '测试3: 带console.log',
    code: `export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(console.log('Starting simple test...'));
  return children
})()`
  },
  {
    name: '测试4: 简单createComponentVNode',
    code: `export default (function(){
  const children = [];
  const appName = 'Simple Test';
  children.push(createComponentVNode(div,{},[appName]));
  return children
})()`
  },
  {
    name: '测试5: 嵌套createComponentVNode',
    code: `export default (function(){
  const children = [];
  const appName = 'Simple Test';
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName])]));
  return children
})()`
  }
]

for (const test of tests) {
  console.log(`\n=== ${test.name} ===`)
  console.log('代码:', test.code.substring(0, 50) + '...')
  
  try {
    console.time('compile')
    const result = vitePluginOvsTransform(test.code)
    console.timeEnd('compile')
    console.log('✅ 编译成功')
  } catch (e) {
    console.log('❌ 编译失败:', (e as Error).message.substring(0, 100))
  }
}





















