// 测试用户提供的代码是否能正常编译和运行
import { createComponentVNode, createElementVNode } from './example/src/utils/ReactiveVNode'
import { div, h1, p } from './example/src/utils/htmlElements'

console.log('━'.repeat(60))
console.log('测试用户提供的编译代码')
console.log('━'.repeat(60))

try {
  // 用户提供的编译后代码（略作调整以演示）
  const result = (function(){
    const children = [];
    const appName = 'Simple Test';
    const version = '1.0';
    
    children.push(console.log('Starting simple test...'));
    children.push(createComponentVNode(div,{},[
      createComponentVNode(h1,{},[appName]),
      createComponentVNode(p,{},[version])
    ]));
    children.push(console.log('Simple test complete!'));
    
    return children
  })()
  
  console.log('\n✅ 代码成功运行')
  console.log(`📊 返回的 children 数组长度: ${result.length}`)
  console.log(`📊 返回值类型: ${typeof result}`)
  
} catch (error) {
  console.log('\n❌ 代码运行失败')
  console.log(`❌ 错误信息: ${error}`)
  if (error instanceof Error) {
    console.log(`❌ 错误堆栈:\n${error.stack}`)
  }
}

console.log('\n' + '━'.repeat(60))
console.log('关键问题分析：')
console.log('━'.repeat(60))
console.log(`
用户提供的代码缺少了重要导入：

❌ 当前代码：
  import {createComponentVNode,createElementVNode} from '../utils/ReactiveVNode';
  // 使用 div, h1, p 但没有导入

✅ 应该是：
  import {createComponentVNode,createElementVNode} from '../utils/ReactiveVNode';
  import { div, h1, p } from '../utils/htmlElements';  // ← 缺少这行！

原因：
- createComponentVNode 是用来创建虚拟节点的函数
- 但 div, h1, p 是辅助函数，需要从 htmlElements 导入
- 没有这个导入，代码会报 ReferenceError: div is not defined
`)













