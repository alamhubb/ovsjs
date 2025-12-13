/**
 * 在 vite-plugin-ovs 目录测试解析
 */
import { vitePluginOvsTransform } from '../ovs/ovs-compiler/src/index.ts'

const code = `import {  ref  } from 'vue';


// 定义一个小组件，接收 count 并显示
// view 是软关键字，可以在其他地方作为变量名使用
view CountDisplay(props) {
}`

console.log('vite-plugin-ovs 目录测试')
console.log('─'.repeat(60))
console.log('代码:')
console.log(code)
console.log('─'.repeat(60))

try {
  const result = vitePluginOvsTransform(code)
  console.log('✅ 解析成功')
  console.log('生成代码:', result.code)
} catch (error: any) {
  console.log('❌ 解析失败:', error.message)
}
