import { vitePluginOvsTransform } from 'ovs-compiler'
import fs from 'fs'
import path from 'path'

// 读取 HelloWorldOvs.ovs 文件
const ovsFilePath = path.join(import.meta.dirname, 'src/components/HelloWorldOvs.ovs')
const code = fs.readFileSync(ovsFilePath, 'utf-8')

console.log('=== 编译 HelloWorldOvs.ovs ===\n')

// 编译
const result = vitePluginOvsTransform(code).code

// 输出到文件
const outputPath = path.join(import.meta.dirname, 'HelloWorldOvs-compiled.js')
fs.writeFileSync(outputPath, `// 编译自: ${ovsFilePath}\n// 编译时间: ${new Date().toLocaleString()}\n\n${result}`)

console.log(`✅ 编译成功！输出文件: ${outputPath}`)
console.log(`\n文件大小: ${result.length} 字符`)
