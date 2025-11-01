import { vitePluginOvsTransform } from './src/index'

console.log('=== 测试: 嵌套createComponentVNode ===\n')

const code = `export default (function(){
  const children = [];
  const appName = 'Simple Test';
  const version = '1.0';
  children.push(createComponentVNode(div,{},[createComponentVNode(h1,{},[appName,]),createComponentVNode(p,{},[version,]),]));
  return children
})()`

console.log('代码长度:', code.length)
console.log('代码预览:', code.substring(0, 80) + '...\n')

try {
  console.log('⚠️  开始编译（可能卡死）...')
  console.time('compile')
  const result = vitePluginOvsTransform(code)
  console.timeEnd('compile')
  console.log('✅ 编译成功！')
  console.log('输出代码长度:', result.code.length)
} catch (e) {
  console.log('❌ 编译失败:', (e as Error).message)
}














