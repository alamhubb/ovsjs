/**
 * 测试 ObjectScript 编译和 source mapping
 */
import { osTransform, vitePluginOsTransform, osTransformBase } from '../../objectScript/os-compiler/src/index.ts'

const testCases = [
  {
    name: '类和变量',
    code: `class Dog { }
const dog = new Dog()`
  },
  {
    name: '两个类',
    code: `class A { foo() { return 1 } }
class B { bar() { return 2 } }`
  },
  {
    name: '多继承（ObjectScript）',
    code: `class A { foo() { return 1 } }
class B { bar() { return 2 } }
class C extends A, B { baz() { return super.foo() + super.bar() } }`
  },
  {
    name: '简单类',
    code: `class Hello {
  greet() { return "hello" }
}`
  }
]

console.log('='.repeat(60))
console.log('ObjectScript Source Mapping 测试')
console.log('='.repeat(60))

for (const tc of testCases) {
  console.log('\n--- ' + tc.name + ' ---')
  console.log('源代码:')
  console.log(tc.code)
  
  try {
    // 使用 osTransform（带完整 mapping）
    const result = osTransform(tc.code)
    console.log('\n生成代码:')
    console.log(result.code)
    
    console.log('\n原始 Mapping 数量:', result.mapping.length)
    if (result.mapping.length > 0) {
      console.log('前 5 个 mapping:')
      result.mapping.slice(0, 5).forEach((m, i) => {
        console.log(`  ${i}: source=[${m.source?.index}, ${m.source?.length}] → gen=[${m.generate?.index}, ${m.generate?.length}]`)
      })
    }
    
    // 使用 vitePluginOsTransform（过滤后的 mapping）
    const viteResult = vitePluginOsTransform(tc.code)
    console.log('\nVite 插件 Mapping 数量:', viteResult.mapping.length)
    
    // 检查代码是否相同
    if (result.code === tc.code) {
      console.log('⚠️ 代码未变化（可能没有需要转换的内容）')
    } else {
      console.log('✅ 代码已转换')
    }
  } catch (e: any) {
    console.log('❌ 错误:', e.message)
  }
}

console.log('\n' + '='.repeat(60))
console.log('测试完成')
console.log('='.repeat(60))

