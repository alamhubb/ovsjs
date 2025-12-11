/**
 * 测试 cssts-ui 组件的 OVS 语法解析
 */
import OvsParser from '../src/parser/OvsParser.ts'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ES Module 中获取 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const componentFiles = [
  '../../../cssts-ui/packages/cssts-components/src/components/button/Button.ovs',
  '../../../cssts-ui/packages/cssts-components/src/components/icon/Icon.ovs',
  '../../../cssts-ui/packages/cssts-components/src/components/input/Input.ovs',
]

console.log('╔' + '═'.repeat(78) + '╗')
console.log('║' + ' cssts-ui 组件 OVS 语法解析测试'.padEnd(78, ' ') + '║')
console.log('╚' + '═'.repeat(78) + '╝')
console.log()

let passed = 0
let failed = 0

for (const file of componentFiles) {
  const filePath = resolve(__dirname, file)
  const componentName = file.split('/').pop()?.replace('.ovs', '') || file
  
  try {
    const code = readFileSync(filePath, 'utf-8')
    const parser = new OvsParser(code)
    const result = parser.Program()
    
    if (result && result.name === 'Program') {
      console.log(`✅ ${componentName}`)
      console.log(`   文件: ${file}`)
      console.log(`   Tokens 数量: ${parser.parsedTokens.length}`)
      passed++
    } else {
      console.log(`❌ ${componentName} - 解析结果无效`)
      failed++
    }
  } catch (error: any) {
    console.log(`❌ ${componentName} - 解析失败`)
    console.log(`   文件: ${file}`)
    console.log(`   错误: ${error.message}`)
    failed++
  }
  console.log()
}

console.log('─'.repeat(80))
console.log(`结果: ${passed} 通过, ${failed} 失败`)
