/**
 * 调试编译后的 Parser
 */
import * as fs from 'fs'

// 读取编译后的代码
const code = fs.readFileSync('./dist/index.mjs', 'utf-8')

// 动态执行来获取内部的 OvsParser
// 在 export 前添加赋值
const insertBefore = 'export { ovsTransform'
const insertCode = `
globalThis.__OvsParser = OvsParser;
globalThis.__SlimeParser = SlimeParser_default;
globalThis.__OvsParser_default = OvsParser_default;
globalThis.__SlimeParser_class = SlimeParser;
`
const evalCode = code.replace(insertBefore, insertCode + insertBefore)

// 写入临时文件
fs.writeFileSync('./dist/index-debug.mjs', evalCode)

// 动态导入
const debugModule = await import('./dist/index-debug.mjs')

const OvsParser = globalThis.__OvsParser
const SlimeParser = globalThis.__SlimeParser
const OvsParser_default = globalThis.__OvsParser_default
const SlimeParser_class = globalThis.__SlimeParser_class

console.log('OvsParser:', OvsParser ? 'found' : 'not found')
console.log('SlimeParser:', SlimeParser ? 'found' : 'not found')
console.log('OvsParser_default:', OvsParser_default ? 'found' : 'not found')
console.log('SlimeParser_class:', SlimeParser_class ? 'found' : 'not found')

// 检查 Program 方法是否被正确装饰
if (SlimeParser_class) {
  console.log('\n--- Checking SlimeParser.prototype.Program ---')
  const programMethod = SlimeParser_class.prototype.Program
  console.log('Program method:', typeof programMethod)
  console.log('Program.__isSubhutiRule__:', programMethod?.__isSubhutiRule__)
  console.log('Program.__originalFunction__:', programMethod?.__originalFunction__ ? 'exists' : 'not found')
  console.log('Program.name:', programMethod?.name)

  // 打印方法的源代码
  console.log('\nProgram method source:')
  console.log(programMethod?.toString().slice(0, 300))
}

if (OvsParser_default) {
  console.log('\n--- Testing with OvsParser_default ---')
  const parser = new OvsParser_default('const x = 1')
  console.log('Parser created')
  console.log('parser.cstStack:', parser.cstStack)

  const result = parser.Program()
  console.log('Program() result:', result)
  console.log('parser.curCst:', parser.curCst)
  console.log('parser.parsedTokens.length:', parser.parsedTokens?.length)
}

// 清理
fs.unlinkSync('./dist/index-debug.mjs')

