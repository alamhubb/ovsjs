import CssTsParser from '../src/parser/CssTsParser.ts'
import cssTsCstToAst from '../src/factory/CssTsCstToAst.ts'
import { generateCssClsInterface, generateCssClsStyles } from '../src/utils/cssUtils.ts'

// 测试用例
const testCases = [
  // 原子样式
  'css colorRed',
  'css fontBold',
  'css bgBlue',
  
  // 组合样式
  'css buttonBase = { colorRed, fontBold }',
  
  // 嵌套组合
  'css primaryButton = { buttonBase, bgBlue }',
  
  // 多个声明
  `css colorRed
   css fontBold
   css buttonBase = { colorRed, fontBold }`,
  
  // 混合普通 JS 代码
  `const x = 1
   css colorRed
   css buttonBase = { colorRed }
   const y = 2`,
]

console.log('=== 测试 CssTs Parser ===\n')

for (const code of testCases) {
  console.log(`输入:\n${code}`)
  console.log('---')
  
  try {
    const parser = new CssTsParser(code)
    const cst = parser.Program()
    console.log('CST 解析: ✅ 成功')
    
    // 清空之前收集的样式
    cssTsCstToAst.clearCssStyles()
    
    // 转换为 AST
    const ast = cssTsCstToAst.toProgram(cst)
    console.log('AST 转换: ✅ 成功')
    
    // 获取收集的样式
    const styles = cssTsCstToAst.getCssStyles()
    console.log(`收集的样式: ${styles.size} 个`)
    
    for (const [name, info] of styles) {
      if (info.isAtomic) {
        console.log(`  - ${name} (原子) → '${info.cssClassName}'`)
      } else {
        console.log(`  - ${name} (组合) → { ${info.dependencies.join(', ')} }`)
      }
    }
    
  } catch (e: any) {
    console.log(`❌ 失败: ${e.message}`)
    console.log(e.stack)
  }
  
  console.log('\n')
}

// 测试生成功能
console.log('=== 测试代码生成 ===\n')

const fullCode = `
css colorRed
css fontBold
css bgBlue
css marginTop
css buttonBase = { colorRed, fontBold }
css primaryButton = { buttonBase, bgBlue }
css card = { marginTop, primaryButton }
`

console.log('输入代码:')
console.log(fullCode)
console.log('---')

try {
  const parser = new CssTsParser(fullCode)
  const cst = parser.Program()
  
  cssTsCstToAst.clearCssStyles()
  cssTsCstToAst.toProgram(cst)
  
  const styles = cssTsCstToAst.getCssStyles()
  
  console.log('\n生成的 CssCls.d.ts:')
  console.log('```typescript')
  console.log(generateCssClsInterface(styles))
  console.log('```')
  
  console.log('\n生成的 CssCls.styles.ts:')
  console.log('```typescript')
  console.log(generateCssClsStyles(styles))
  console.log('```')
  
} catch (e: any) {
  console.log(`❌ 失败: ${e.message}`)
  console.log(e.stack)
}
