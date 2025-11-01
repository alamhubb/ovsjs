// 使用OVS编译器正确编译用户提供的代码

import { vitePluginOvsTransform } from './src/index'

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
  const result = vitePluginOvsTransform(ovsCode)
  
  console.log('\n✅ 编译成功！')
  console.log('\n📊 编译结果：')
  console.log('─'.repeat(70))
  console.log(result.code)
  console.log('─'.repeat(70))
  
  console.log('\n📋 分析编译结果：')
  const checks = {
    'createComponentVNode 导入': result.code.includes('createComponentVNode'),
    'createElementVNode 导入': result.code.includes('createElementVNode'),
    '来自 ReactiveVNode': result.code.includes("from '../utils/ReactiveVNode'"),
    'div 导入': result.code.includes("from '../utils/htmlElements'"),
    '使用了 div': result.code.includes('div'),
    '使用了 h1': result.code.includes('h1'),
    '使用了 p': result.code.includes('p'),
    '源码映射': result.mapping?.length || 0
  }
  
  Object.entries(checks).forEach(([key, value]) => {
    const icon = typeof value === 'boolean' ? (value ? '✅' : '❌') : '📊'
    console.log(`${icon} ${key}: ${value}`)
  })
  
  console.log('\n📝 关键问题检查：')
  const hasDivUsage = result.code.includes('div')
  const hasDivImport = result.code.includes("from '../utils/htmlElements'")
  
  if (hasDivUsage && !hasDivImport) {
    console.log('⚠️  【问题】代码使用了 div 但没有导入它')
    console.log('   → 会导致 ReferenceError: div is not defined')
  } else if (hasDivUsage && hasDivImport) {
    console.log('✅ 【完美】代码使用了 div 并且已导入')
  } else if (!hasDivUsage) {
    console.log('✅ 【正常】代码没有使用 div 标签')
  }
  
} catch (error: any) {
  console.log('\n❌ 编译失败！')
  console.log(`错误：${error.message}`)
  if (error.stack) {
    console.log(`堆栈：${error.stack}`)
  }
}















