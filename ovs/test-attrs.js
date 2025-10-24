// 测试 name = a 的功能
import {vitePluginOvsTransform} from './src/index.ts'

async function test() {
  const code = `
const a = 10

div {
  let b = 5
  name = a
  title = "hello"
  h1 { "Title" }
  p { b }
}
`

  console.log('输入代码:')
  console.log(code)
  console.log('\n' + '='.repeat(60) + '\n')

  const result = await vitePluginOvsTransform(code, 'test.ovs')

  console.log('输出代码:')
  console.log(result)
  console.log('\n' + '='.repeat(60) + '\n')

  console.log('期望效果:')
  console.log('1. ✅ children.push(a) - 渲染a的值')
  console.log('2. ✅ attrsObj.name = a - 作为属性')
  console.log('3. ✅ children.push("hello") - 渲染title的值')
  console.log('4. ✅ attrsObj.title = "hello" - 作为属性')
  console.log('5. ✅ 最外层createVNode第三个参数: { $ovs: { attrs: attrsObj } }')
}

test().catch(console.error)

