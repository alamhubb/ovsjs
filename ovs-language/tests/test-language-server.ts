/**
 * Language Server 模拟测试
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
  ? path.join(__dirname, '../ovs-language-server/src/index.ts')
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
    // Windows 下使用 cmd 来启动，避免 spawn 问题
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
      }, 10000)
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
  console.log('Language Server 模拟测试')
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
      capabilities: { textDocument: { completion: {}, hover: {}, definition: {} } },
      rootUri: 'file://' + path.resolve(__dirname, '../../create-ovs/template'),
      initializationOptions: { typescript: { tsdk: tsPath } }
    })
    
    if (initResult?.capabilities) {
      console.log('✅ initialize 成功')
      console.log('   能力:', Object.keys(initResult.capabilities).slice(0, 5).join(', '), '...')
      passed++
    } else {
      console.log('❌ initialize 失败'); failed++
    }

    client.sendNotification('initialized', {})
    console.log('✅ initialized 通知已发送'); passed++

    // 2. 打开文档
    console.log('\n--- 文档操作 ---')
    const uri = 'file://' + path.resolve(__dirname, '../../create-ovs/template/src/test.ovs')
    client.sendNotification('textDocument/didOpen', {
      textDocument: { uri, languageId: 'ovs', version: 1, text: `div { h1 { 'Hello' } }` }
    })
    console.log('✅ textDocument/didOpen'); passed++
    await new Promise(r => setTimeout(r, 500))

    // 3. Shutdown
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

