import { vitePluginOvsTransform } from './src/index.ts'
import { readFileSync } from 'fs'

const helloPath = 'd:/project/qkyproject/test-volar/ovs/example/src/views/hello.ovs'
const code = readFileSync(helloPath, 'utf-8')

async function verify() {
  console.log('╔' + '═'.repeat(78) + '╗')
  console.log('║' + ' OVS 完整验证'.padEnd(78, ' ') + '║')
  console.log('╚' + '═'.repeat(78) + '╝')
  
  const result = await vitePluginOvsTransform(code, 'hello.ovs', true)
  
  console.log('\n✅ 编译成功！')
  console.log('\n📦 完整编译结果：')
  console.log('─'.repeat(80))
  console.log(result.code)
  
  console.log('\n🔍 关键代码片段分析：')
  console.log('─'.repeat(80))
  
  // 提取 for 循环部分
  const forLoopMatch = result.code.match(/for\s*\(let item of items\)\s*\{[\s\S]*?\}/m)
  if (forLoopMatch) {
    console.log('\n📌 For 循环部分：')
    console.log(forLoopMatch[0])
  }
  
  // 提取 if 语句部分
  const ifMatch = result.code.match(/if\s*\(showExtra\)\s*\{[\s\S]*?\}/m)
  if (ifMatch) {
    console.log('\n📌 If 条件部分：')
    console.log(ifMatch[0])
  }
  
  console.log('\n📊 验证检查：')
  console.log('─'.repeat(80))
  console.log(`✅ import OvsAPI: ${result.code.includes('import OvsAPI') ? '是' : '否'}`)
  console.log(`✅ export default: ${result.code.includes('export default') ? '是' : '否'}`)
  console.log(`✅ for 循环: ${result.code.includes('for (let item of items)') ? '是' : '否'}`)
  console.log(`✅ if 条件: ${result.code.includes('if (showExtra)') ? '是' : '否'}`)
  console.log(`✅ 简单视图优化: ${!result.code.includes('(() =>') ? '是' : '否'}`)
  
  const createVNodeCount = (result.code.match(/createVNode/g) || []).length
  console.log(`✅ createVNode 调用: ${createVNodeCount} 次`)
  
  console.log('\n🌐 访问浏览器：')
  console.log('─'.repeat(80))
  console.log('  URL: http://localhost:5174/')
  console.log('\n  预期显示：')
  console.log('    • Simple Views Test')
  console.log('      - All optimizations working!')
  console.log('      - Nested view')
  console.log('')
  console.log('    • Complex Views Test')
  console.log('      - apple')
  console.log('      - banana')
  console.log('      - cherry')
  console.log('')
  console.log('    • Conditional Test')
  console.log('      - Extra content shown!')
  console.log('')
  console.log('  💡 打开开发者工具查看 console.log 输出验证 createVNode 调用')
}

verify().catch(console.error)

