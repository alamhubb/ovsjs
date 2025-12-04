import {vitePluginOvsTransform} from "ovsjs/src/index.ts"

Error.stackTraceLimit = 50

async function test() {
  // 测试 hello.ovs 文件的内容
  const code = `div {
    const abc = true
    if (abc) {
      123
    }
  }`

  // 测试：传递文件名生成组件
  const res = await vitePluginOvsTransform(code, 'views/hello.ovs', true)
  console.log('========== 生成的 Vue 组件 (hello.ovs) ==========')
  console.log(res.code)
  console.log('\n========== 验证：组件名称应该是 Hello ==========')
  console.log('包含 "export default function Hello":', res.code.includes('export default function Hello'))
}

test().catch(console.error)


