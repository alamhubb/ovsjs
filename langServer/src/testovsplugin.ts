import {vitePluginOvsTransform} from "ovsjs/src"

Error.stackTraceLimit = 50

async function test() {
  const code = `div { 
    const abc = true
    if (abc) {
      123
    }
  }`

  // 测试：传递文件名生成组件
  const res = await vitePluginOvsTransform(code, 'src/components/hello-world.ovs', true)
  console.log('========== 生成的 Vue 组件 ==========')
  console.log('代码长度:', res.code?.length)
  console.log('代码内容:')
  console.log(res.code)
  console.log('========== 结束 ==========')
}

test().catch(console.error)


