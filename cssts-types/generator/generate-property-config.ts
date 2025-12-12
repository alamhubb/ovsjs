/**
 * 从 csstree-numeric-analysis.json 生成 propertyNumericTypes 配置
 * 只生成标准属性（排除 deprecated），按分类分组
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

interface PropertyInfo {
  property: string
  numericTypes: string[]
  deprecated?: boolean
  colorProperty?: boolean
  complexOnly?: boolean
  category?: string
}

interface AnalysisData {
  propertiesWithNumeric: PropertyInfo[]
}

async function main() {
  // 读取 JSON 文件
  const jsonPath = path.join(__dirname, 'csstree-numeric-analysis.json')
  const data: AnalysisData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  
  // 过滤掉 deprecated、colorProperty 和 complexOnly 属性，按 category 分组
  const standardProps = data.propertiesWithNumeric.filter(p => !p.deprecated && !p.colorProperty && !p.complexOnly)
  
  // 按 category 分组
  const byCategory: Record<string, PropertyInfo[]> = {}
  for (const prop of standardProps) {
    const cat = prop.category || 'other'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(prop)
  }
  
  // 生成代码
  let code = `/**
 * 属性到数值类型的映射配置
 * 自动生成自 csstree-numeric-analysis.json
 * 
 * 每个属性对应一个 NumericType[] 数组，需要手动填充
 */

export const propertyNumericTypes = {
`

  // 按分类顺序输出
  const categoryOrder = ['sizing', 'spacing', 'positioning', 'layout', 'typography', 'border', 'background', 'opacity', 'transform', 'animation', 'scroll', 'other']
  
  for (const category of categoryOrder) {
    const props = byCategory[category]
    if (!props || props.length === 0) continue
    
    code += `  // ========== ${category} ==========\n`
    
    for (const prop of props) {
      code += `  '${prop.property}': [],\n`
    }
    code += '\n'
  }
  
  code += `}
`

  // 输出到控制台
  console.log(code)
  
  // 也可以保存到文件
  const outputPath = path.join(__dirname, 'property-numeric-types-generated.js')
  fs.writeFileSync(outputPath, code)
  console.log(`\n✅ 已保存到 ${outputPath}`)
}

main().catch(console.error)
