// 测试用户提供的代码（不导入 div/h1/p）是否能运行
import { createComponentVNode, createElementVNode } from './example/src/utils/ReactiveVNode'
// ❌ 注意：没有导入 div, h1, p

console.log('━'.repeat(60))
console.log('测试用户提供的代码（不导入div/h1/p）')
console.log('━'.repeat(60))

try {
  // 用户提供的编译后代码（完全按原样复制）
  const result = (function(){
    const children = [];
    const appName = 'Simple Test';
    const version = '1.0';
    
    children.push(console.log('Starting simple test...'));
    
    // ❌ 这里会出错：div 未定义
    children.push(createComponentVNode(div,{},[
      createComponentVNode(h1,{},[appName]),
      createComponentVNode(p,{},[version])
    ]));
    
    children.push(console.log('Simple test complete!'));
    
    return children
  })()
  
  console.log('\n✅ 代码成功运行')
  console.log(`📊 返回的 children 数组长度: ${result.length}`)
  
} catch (error: any) {
  console.log('\n❌ 代码运行失败！')
  console.log(`❌ 错误类型: ${error.name}`)
  console.log(`❌ 错误信息: ${error.message}`)
  
  // 分析错误
  if (error.message.includes('div is not defined')) {
    console.log(`\n💡 根本原因：div 未定义`)
  }
}











