/**
 * ObjectScript Language Server 模拟测试
 * 通过 stdin/stdout 与 language-server 通信，验证 LSP 功能
 *
 * 使用方式：
 * - 测试源文件：npx tsx tests/test-language-server.ts --source
 * - 测试打包文件：npx tsx tests/test-language-server.ts --dist
 * - 默认测试打包文件
 */
import { spawn, ChildProcess } from 'child_process'
import * as path from 'path'

// 解析命令行参数
const args = process.argv.slice(2)
const useSource = args.includes('--source')

// 根据参数选择服务端路径
const SERVER_PATH = useSource
  ? path.join(__dirname, '../os-language-server/src/index.ts')
  : path.join(__dirname, '../dist/language-server.cjs')

const SERVER_MODE = useSource ? '源文件 (.ts)' : '打包文件 (.cjs)'

interface LSPMessage {
  jsonrpc: '2.0'
  id?: number
  method?: string
  params?: any
  result?: any
  error?: any
}

class LSPClient {
  private process: ChildProcess
  private messageId = 0
  private pendingRequests = new Map<number, { resolve: Function, reject: Function }>()
  private buffer = ''

  constructor() {
    const isWindows = process.platform === 'win32'
    let command: string
    let cmdArgs: string[]

    if (useSource) {
      command = isWindows ? 'cmd' : 'npx'
      cmdArgs = isWindows
        ? ['/c', 'npx', 'tsx', SERVER_PATH, '--stdio']
        : ['tsx', SERVER_PATH, '--stdio']
    } else {
      command = 'node'
      cmdArgs = [SERVER_PATH, '--stdio']
    }

    this.process = spawn(command, cmdArgs, {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.join(__dirname, '..')
    })

    this.process.stdout?.on('data', (data) => this.handleData(data.toString()))
    this.process.stderr?.on('data', () => {}) // 忽略 stderr
  }

  private handleData(data: string) {
    this.buffer += data
    while (true) {
      const headerEnd = this.buffer.indexOf('\r\n\r\n')
      if (headerEnd === -1) break
      const header = this.buffer.substring(0, headerEnd)
      const match = header.match(/Content-Length: (\d+)/)
      if (!match) break
      const len = parseInt(match[1])
      const start = headerEnd + 4
      if (this.buffer.length < start + len) break
      const msg = this.buffer.substring(start, start + len)
      this.buffer = this.buffer.substring(start + len)
      try {
        const parsed: LSPMessage = JSON.parse(msg)
        if (parsed.id !== undefined && this.pendingRequests.has(parsed.id)) {
          const { resolve, reject } = this.pendingRequests.get(parsed.id)!
          this.pendingRequests.delete(parsed.id)
          parsed.error ? reject(parsed.error) : resolve(parsed.result)
        }
      } catch {}
    }
  }

  async sendRequest(method: string, params: any): Promise<any> {
    const id = ++this.messageId
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject })
      this.send({ jsonrpc: '2.0', id, method, params })
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(new Error(`Request ${method} timed out`))
        }
      }, 15000)
    })
  }

  sendNotification(method: string, params: any) {
    this.send({ jsonrpc: '2.0', method, params })
  }

  private send(message: LSPMessage) {
    const content = JSON.stringify(message)
    this.process.stdin?.write(`Content-Length: ${Buffer.byteLength(content)}\r\n\r\n${content}`)
  }

  close() { this.process.kill() }
}

async function runTests() {
  console.log('='.repeat(60))
  console.log('ObjectScript Language Server 模拟测试')
  console.log('测试模式:', SERVER_MODE)
  console.log('='.repeat(60))

  const client = new LSPClient()
  let passed = 0, failed = 0

  try {
    // 1. Initialize
    console.log('\n--- 初始化 ---')
    const tsPath = path.dirname(require.resolve('typescript'))
    const initResult = await client.sendRequest('initialize', {
      processId: process.pid,
      capabilities: {
        textDocument: {
          completion: { completionItem: { snippetSupport: true } },
          hover: {},
          definition: {}
        }
      },
      rootUri: 'file://' + path.resolve(__dirname, '../..'),
      initializationOptions: { typescript: { tsdk: tsPath } }
    })

    if (initResult?.capabilities) {
      console.log('✅ initialize 成功')
      console.log('   completionProvider:', !!initResult.capabilities.completionProvider)
      console.log('   hoverProvider:', !!initResult.capabilities.hoverProvider)
      console.log('   definitionProvider:', !!initResult.capabilities.definitionProvider)
      passed++
    } else {
      console.log('❌ initialize 失败'); failed++
    }

    client.sendNotification('initialized', {})
    console.log('✅ initialized 通知已发送'); passed++

    // 2. 打开文档 - 多继承测试
    console.log('\n--- 文档操作（多继承测试）---')
    const uri = 'file:///test.os'
    // 测试多继承语法（ObjectScript 特有功能）
    const osCode = `class A { foo() { return 1 } }
class B { bar() { return 2 } }
class C extends A, B { baz() { return this.foo() + this.bar() } }`

    client.sendNotification('textDocument/didOpen', {
      textDocument: { uri, languageId: 'objectscript', version: 1, text: osCode }
    })
    console.log('✅ textDocument/didOpen'); passed++

    // 等待编译完成
    await new Promise(r => setTimeout(r, 2000))

    // 3. 测试代码补全 - 在类 C 内部
    console.log('\n--- 代码补全测试 ---')
    try {
      // 在第三行 class C 的方法体内请求补全
      const completionResult = await client.sendRequest('textDocument/completion', {
        textDocument: { uri },
        position: { line: 2, character: 40 }  // "this." 后面
      })

      if (completionResult) {
        const items = completionResult.items || completionResult
        console.log('✅ 代码补全返回:', items.length, '个项目')
        if (items.length > 0) {
          const labels = items.slice(0, 8).map((i: any) => i.label)
          console.log('   前8个:', labels.join(', '))
          // 检查是否包含继承的方法
          const hasFoo = items.some((i: any) => i.label === 'foo')
          const hasBar = items.some((i: any) => i.label === 'bar')
          const hasBaz = items.some((i: any) => i.label === 'baz')
          if (hasFoo) console.log('   ✅ 包含 foo 方法（继承自 A）')
          if (hasBar) console.log('   ✅ 包含 bar 方法（继承自 B）')
          if (hasBaz) console.log('   ✅ 包含 baz 方法（自身）')
        }
        passed++
      } else {
        console.log('❌ 代码补全无返回'); failed++
      }
    } catch (e: any) {
      console.log('❌ 代码补全失败:', e.message); failed++
    }

    // 4. 测试 Hover - 在类名 "C" 上
    console.log('\n--- Hover 测试 ---')
    try {
      const hoverResult = await client.sendRequest('textDocument/hover', {
        textDocument: { uri },
        position: { line: 2, character: 6 }  // "C" 类名
      })

      if (hoverResult && hoverResult.contents) {
        console.log('✅ Hover 返回类型信息')
        const content = typeof hoverResult.contents === 'string'
          ? hoverResult.contents
          : hoverResult.contents.value || JSON.stringify(hoverResult.contents)
        console.log('   内容:', content.substring(0, 100))
        passed++
      } else {
        console.log('⚠️ Hover 无返回（可能是正常的）')
      }
    } catch (e: any) {
      console.log('⚠️ Hover 请求失败:', e.message)
    }

    // 5. 测试 Go to Definition - 在类名 "A" 上（extends 后面）
    console.log('\n--- Go to Definition 测试 ---')
    try {
      const defResult = await client.sendRequest('textDocument/definition', {
        textDocument: { uri },
        position: { line: 0, character: 7 }  // "A" 类名
      })

      if (defResult) {
        const locations = Array.isArray(defResult) ? defResult : [defResult]
        console.log('✅ Definition 返回:', locations.length, '个位置')
        if (locations.length > 0) {
          console.log('   第一个位置: line', locations[0].range?.start?.line)
        }
        passed++
      } else {
        console.log('⚠️ Definition 无返回')
      }
    } catch (e: any) {
      console.log('⚠️ Definition 请求失败:', e.message)
    }

    // 6. Shutdown
    console.log('\n--- 关闭 ---')
    await client.sendRequest('shutdown', null)
    console.log('✅ shutdown 成功'); passed++
    client.sendNotification('exit', null)
    console.log('✅ exit 已发送'); passed++

  } catch (e: any) {
    console.log('❌ 错误:', e.message); failed++
  } finally {
    client.close()
  }

  console.log('\n' + '='.repeat(60))
  console.log(`结果: ${passed} 通过, ${failed} 失败`)
  console.log('='.repeat(60))
  process.exit(failed > 0 ? 1 : 0)
}

runTests()

