/**
 * 测试 TypeScript 语法支持
 */
import { osTransform } from '../../objectScript/os-compiler/src/index.ts'

const testCases = [
  {
    name: '无类型注解',
    code: `class Animal {
  name = "animal"
  speak() { return "..." }
}`
  },
  {
    name: '有类型注解（TypeScript）',
    code: `class Animal {
  name: string = "animal"
  speak() { return "..." }
}`
  },
]

console.log('='.repeat(60))
console.log('TypeScript 语法测试')
console.log('='.repeat(60))

for (const tc of testCases) {
  console.log('\n--- ' + tc.name + ' ---')
  console.log('代码:')
  console.log(tc.code)
  
  try {
    const result = osTransform(tc.code)
    console.log('✅ 编译成功')
    console.log('生成代码:')
    console.log(result.code)
  } catch (e: any) {
    console.log('❌ 编译失败:', e.message)
  }
}

console.log('\n' + '='.repeat(60))

