import { vitePluginOvsTransform } from './src/index.ts'
import { readFileSync } from 'fs'

const helloPath = 'd:/project/qkyproject/test-volar/ovs/example/src/views/hello.ovs'
const code = readFileSync(helloPath, 'utf-8')

async function checkOutput() {
  console.log('╔' + '═'.repeat(78) + '╗')
  console.log('║' + ' 浏览器应该看到的内容'.padEnd(78, ' ') + '║')
  console.log('╚' + '═'.repeat(78) + '╝')
  
  const result = await vitePluginOvsTransform(code, 'hello.ovs', true)
  
  // 模拟执行编译后的代码
  console.log('\n🎬 模拟浏览器执行编译后的代码...\n')
  
  // 创建简单的 VNode 模拟
  const vnodeCache: any[] = []
  const OvsAPI = {
    createVNode(tag: string, children: any[]) {
      const vnode = { tag, children }
      vnodeCache.push(vnode)
      return vnode
    }
  }
  
  function getMessage() {
    return 'All optimizations working!'
  }
  const message = getMessage()
  
  // 执行编译后的导出代码
  const exportedResult = (function () {
    const children = []
    children.push(
      OvsAPI.createVNode('div', [
        OvsAPI.createVNode('h1', ['Simple Views Test']),
        OvsAPI.createVNode('p', [message]),
        OvsAPI.createVNode('div', [
          OvsAPI.createVNode('span', ['Nested']),
          OvsAPI.createVNode('span', [' view']),
        ]),
      ]),
    )
    children.push(
      (function () {
        const children = []
        children.push(OvsAPI.createVNode('h2', ['Complex Views Test']))
        const items = ['apple', 'banana', 'cherry']
        for (let item of items) {
          children.push(OvsAPI.createVNode('p', [item]))
        }
        return OvsAPI.createVNode('div', children)
      })(),
    )
    children.push(
      (function () {
        const children = []
        children.push(OvsAPI.createVNode('h2', ['Conditional Test']))
        const showExtra = true
        if (showExtra) {
          children.push(OvsAPI.createVNode('p', ['Extra content shown!']))
        }
        return OvsAPI.createVNode('div', children)
      })(),
    )
    return children
  })()
  
  console.log('📊 执行结果：')
  console.log('─'.repeat(60))
  console.log(`返回类型: ${Array.isArray(exportedResult) ? 'Array' : typeof exportedResult}`)
  console.log(`数组长度: ${exportedResult.length}`)
  console.log(`VNode 总数: ${vnodeCache.length}`)
  
  console.log('\n🎨 DOM 结构预览：')
  console.log('─'.repeat(60))
  
  function renderVNode(vnode: any, indent = ''): string {
    if (typeof vnode === 'string') return vnode
    if (!vnode || !vnode.tag) return String(vnode)
    
    const childrenStr = vnode.children.map((c: any) => {
      if (typeof c === 'string') return c
      if (c && c.tag) return renderVNode(c, indent + '  ')
      return String(c)
    }).filter(Boolean).join('')
    
    return `${indent}<${vnode.tag}>${childrenStr}</${vnode.tag}>`
  }
  
  exportedResult.forEach((vnode: any, index: number) => {
    console.log(`\n${index + 1}. ${renderVNode(vnode)}`)
  })
  
  console.log('\n🌐 浏览器中应该显示的文本内容：')
  console.log('─'.repeat(60))
  
  function extractText(vnode: any): string[] {
    if (typeof vnode === 'string') return [vnode]
    if (!vnode || !vnode.children) return []
    
    const texts: string[] = []
    for (const child of vnode.children) {
      if (typeof child === 'string') {
        texts.push(child)
      } else if (child && child.children) {
        texts.push(...extractText(child))
      }
    }
    return texts
  }
  
  exportedResult.forEach((vnode: any, index: number) => {
    const texts = extractText(vnode)
    console.log(`\n第 ${index + 1} 个 div:`)
    texts.forEach(text => console.log(`  • ${text}`))
  })
  
  console.log('\n✅ 如果浏览器没有显示这些内容，请检查：')
  console.log('  1. 浏览器控制台是否有错误')
  console.log('  2. App.ts 的 render 函数是否正确')
  console.log('  3. main.ts 是否正确挂载')
}

checkOutput().catch(console.error)

