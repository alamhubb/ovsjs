import { vitePluginOvsTransform } from './src/index.ts'
import { readFileSync } from 'fs'

const helloPath = 'd:/project/qkyproject/test-volar/ovs/example/src/views/hello.ovs'
const code = readFileSync(helloPath, 'utf-8')

async function test() {
  try {
    console.log('编译中...')
    const result = await vitePluginOvsTransform(code, 'hello.ovs', false)
    console.log('✅ 编译成功！')
    console.log('\n编译结果：')
    console.log(result.code)
  } catch (e) {
    console.error('❌ 编译失败：', e)
  }
}

test()
