/**
 * 验证 Source Mapping 正确性测试
 * 
 * 目的：检查格式化修改后源码映射是否正确
 */
import { osTransform } from '../../objectScript/os-compiler/src/index.ts'

const testCode = `class A { foo() { return 1 } }
class B { bar() { return 2 } }
class C extends A, B { baz() { return super.foo() + super.bar() } }`

console.log('='.repeat(60))
console.log('Source Mapping 验证测试')
console.log('='.repeat(60))

console.log('\n源代码:')
console.log(testCode)
console.log('\n源代码长度:', testCode.length)

const result = osTransform(testCode)

console.log('\n生成代码:')
console.log(result.code)
console.log('\n生成代码长度:', result.code.length)

console.log('\n' + '-'.repeat(60))
console.log('详细 Mapping 分析')
console.log('-'.repeat(60))

result.mapping.forEach((m, i) => {
  const srcVal = m.source?.value || '(无)'
  const genVal = m.generate?.value || '(无)'
  
  // 从源代码和生成代码中提取实际内容
  const srcActual = testCode.substring(m.source?.index || 0, (m.source?.index || 0) + (m.source?.length || 0))
  const genActual = result.code.substring(m.generate?.index || 0, (m.generate?.index || 0) + (m.generate?.length || 0))
  
  const match = srcActual === genActual ? '✅' : '⚠️'
  
  console.log(`\n${i}. ${match} 映射 "${srcVal}"`)
  console.log(`   源码位置: [${m.source?.index}, len=${m.source?.length}] → "${srcActual}"`)
  console.log(`   生成位置: [${m.generate?.index}, len=${m.generate?.length}] → "${genActual}"`)
  
  if (srcActual !== genActual) {
    console.log(`   ⚠️ 内容不匹配!`)
  }
})

console.log('\n' + '-'.repeat(60))
console.log('验证结论')
console.log('-'.repeat(60))

// 验证每个映射的内容是否匹配
let allMatch = true
for (const m of result.mapping) {
  const srcActual = testCode.substring(m.source?.index || 0, (m.source?.index || 0) + (m.source?.length || 0))
  const genActual = result.code.substring(m.generate?.index || 0, (m.generate?.index || 0) + (m.generate?.length || 0))
  if (srcActual !== genActual) {
    allMatch = false
    break
  }
}

if (allMatch) {
  console.log('✅ 所有映射的内容都正确匹配')
} else {
  console.log('❌ 存在映射内容不匹配的问题')
}

console.log('\n' + '='.repeat(60))

