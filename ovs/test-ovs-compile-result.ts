// 测试使用OVS编译器编译用户提供的代码

import OvsCompiler from './src/index'

const ovsCode = `const appName = "Simple Test"
const version = "1.0"

console.log("Starting simple test...")

div {
  h1 { appName }
  p { version }
}

console.log("Simple test complete!")`

console.log('━'.repeat(70))
console.log('OVS 编译器编译测试')
console.log('━'.repeat(70))

console.log('\n📝 OVS 源码：')
console.log('─'.repeat(70))
console.log(ovsCode)
console.log('─'.repeat(70))

try {
  const result = OvsCompiler.compile(ovsCode)
  
  console.log('\n✅ 编译成功！')
  console.log('\n📊 编译结果：')
  console.log('─'.repeat(70))
  console.log(result.code)
  console.log('─'.repeat(70))
  
  console.log('\n📋 分析编译结果：')
  console.log(`
✅ 是否包含 createComponentVNode 导入：${result.code.includes('createComponentVNode') ? '是' : '否'}
✅ 是否包含 createElementVNode 导入：${result.code.includes('createElementVNode') ? '是' : '否'}
✅ 是否包含 div 导入：${result.code.includes("from '../utils/htmlElements'") ? '是' : '否'}
✅ 是否使用了 div：${result.code.includes('div') ? '是' : '否'}
✅ 是否使用了 h1：${result.code.includes('h1') ? '是' : '否'}
✅ 是否使用了 p：${result.code.includes('p') ? '是' : '否'}
✅ 源码映射数：${result.mapping?.length || 0} 个
  `)
  
  // 检查关键问题
  const hasDivUsage = result.code.includes('div')
  const hasDivImport = result.code.includes("from '../utils/htmlElements'")
  
  if (hasDivUsage && !hasDivImport) {
    console.log('⚠️  问题发现：')
    console.log('   代码使用了 div 但没有导入它')
    console.log('   这会导致 ReferenceError: div is not defined')
  } else if (hasDivUsage && hasDivImport) {
    console.log('✅ 完美：')
    console.log('   代码使用了 div 并且已导入')
  }
  
} catch (error: any) {
  console.log('\n❌ 编译失败！')
  console.log(`错误：${error.message}`)
  if (error.stack) {
    console.log(`堆栈：${error.stack}`)
  }
}
















