// 调试测试
import {vitePluginOvsTransform} from './src/index.ts'

async function test() {
  const code = `
const a = 10
const b = 20

div {
  name = a
  age = b
}
`

  console.log('输入代码:')
  console.log(code)
  console.log('\n' + '='.repeat(60) + '\n')

  const result = await vitePluginOvsTransform(code, 'test.ovs')

  console.log('输出代码:')
  console.log(result.code)
  console.log('\n' + '='.repeat(60) + '\n')

  console.log('期望看到:')
  console.log('children.push(a)')
  console.log('attrsObj.name = a')
  console.log('children.push(b)')
  console.log('attrsObj.age = b')
}

test().catch(console.error)

