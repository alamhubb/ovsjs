/**
 * 测试 ObjectScript Parser 多语句解析
 */
import ObjectScriptParser from '../../objectScript/os-compiler/src/parser/ObjectScriptParser.ts'

const testCases = [
  {
    name: '单个类',
    code: `class Hello { greet() { return "hello" } }`
  },
  {
    name: '两个类',
    code: `class A { foo() { return 1 } }
class B { bar() { return 2 } }`
  },
  {
    name: '类和变量',
    code: `class Dog { }
const dog = new Dog()`
  },
  {
    name: '多继承',
    code: `class A { foo() { return 1 } }
class B { bar() { return 2 } }
class C extends A, B { baz() { return super.foo() + super.bar() } }`
  }
]

console.log('='.repeat(60))
console.log('ObjectScript Parser 多语句测试')
console.log('='.repeat(60))

for (const tc of testCases) {
  console.log('\n--- ' + tc.name + ' ---')
  console.log('代码:')
  console.log(tc.code)
  
  try {
    const parser = new ObjectScriptParser(tc.code)
    const cst = parser.Program()
    console.log('✅ 解析成功')
    console.log('   tokens 数量:', parser.parsedTokens.length)

    // 打印前几个 tokens
    console.log('   前 3 个 tokens:')
    parser.parsedTokens.slice(0, 3).forEach((t, i) => {
      console.log(`     ${i}: ${JSON.stringify(t)}`)
    })

    // 打印最后几个 tokens
    console.log('   后 3 个 tokens:')
    parser.parsedTokens.slice(-3).forEach((t, i) => {
      console.log(`     ${i}: ${JSON.stringify(t)}`)
    })
  } catch (e: any) {
    console.log('❌ 解析失败:', e.message)
  }
}

console.log('\n' + '='.repeat(60))
console.log('测试完成')
console.log('='.repeat(60))

