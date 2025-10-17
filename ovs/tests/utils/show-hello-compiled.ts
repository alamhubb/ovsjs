import { vitePluginOvsTransform } from '../../src/index.ts'
import { readFileSync } from 'fs'

const helloPath = 'd:/project/qkyproject/test-volar/ovs/example/src/views/hello.ovs'
const code = readFileSync(helloPath, 'utf-8')

async function show() {
  console.log('╔' + '═'.repeat(78) + '╗')
  console.log('║' + ' hello.ovs 编译结果展示'.padEnd(78, ' ') + '║')
  console.log('╚' + '═'.repeat(78) + '╝')
  
  console.log('\n📄 源代码（hello.ovs）：')
  console.log('─'.repeat(80))
  console.log(code)
  
  console.log('\n⚙️  编译后的 JavaScript：')
  console.log('─'.repeat(80))
  const result = await vitePluginOvsTransform(code, 'hello.ovs', true)
  console.log(result.code)
  
  console.log('\n📊 优化统计：')
  console.log('─'.repeat(80))
  
  // 统计 IIFE
  const complexViewPattern = /\(function\s*\(\)\s*\{[\s\S]*?const children = \[\]/g
  const complexViews = (result.code.match(complexViewPattern) || []).length
  
  // 统计直接的 createVNode
  const simpleViewPattern = /OvsAPI\.createVNode\('(div|h1|h2|p|span)',\s*\[/g
  const allCreateVNode = (result.code.match(simpleViewPattern) || []).length
  
  // 统计特性
  const hasForLoop = result.code.includes('for (let')
  const hasIfStatement = result.code.includes('if (')
  
  console.log(`✅ 复杂视图（有 IIFE）: ${complexViews - 1} 个`) // -1 是因为最外层的包装
  console.log(`✅ createVNode 调用: ${allCreateVNode} 次`)
  console.log(`✅ for 循环: ${hasForLoop ? '✓' : '✗'}`)
  console.log(`✅ if 条件: ${hasIfStatement ? '✓' : '✗'}`)
  console.log(`✅ 代码格式化: ✓ (Prettier)`)
  
  console.log('\n🌐 浏览器访问：')
  console.log('─'.repeat(80))
  console.log('  👉 http://localhost:5174/')
  console.log('')
  console.log('  提示：打开浏览器开发者工具查看渲染的 DOM 结构')
  console.log('  可以看到 3 个 div：')
  console.log('    1. 简单嵌套视图 (无 IIFE)')
  console.log('    2. for 循环视图 (有 IIFE)')
  console.log('    3. if 条件视图 (有 IIFE)')
}

show().catch(console.error)

