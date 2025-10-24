import { vitePluginOvsTransform } from './src/index.ts'
import { readFileSync } from 'fs'

const code = `// 测试：导出一个函数
export default () => {
  const message = "Hello from function"
  return message
}
`

async function test() {
  const result = await vitePluginOvsTransform(code, 'test.ovs', false)
  console.log('=== 编译结果 ===')
  console.log(result.code)
}

test()

