/**
 * 从 css-tree 提取所有数值类型信息
 * 
 * 用于分析 css-tree 中有哪些数值类型，以及它们的 min/max 等信息
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as csstree from 'css-tree'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

interface TypeRange {
  min?: number
  max?: number | null
}

interface PropertyNumericInfo {
  property: string
  numericTypes: string[]
}

/**
 * 递归提取语法中的数值类型
 */
function extractNumericTypes(syntax: any, visited: Set<string> = new Set()): string[] {
  const types: string[] = []
  if (!syntax) return types
  
  const lexer = (csstree as any).lexer
  
  if (syntax.type === 'Type' && syntax.name) {
    const numericTypeNames = [
      'length', 'percentage', 'number', 'integer', 'angle', 'time',
      'length-percentage', 'alpha-value', 'flex', 'font-weight-absolute',
      'line-width', 'border-width'
    ]
    
    if (numericTypeNames.includes(syntax.name)) {
      types.push(syntax.name)
      
      // 检查是否有 opts（min/max）
      if (syntax.opts) {
        types.push(`${syntax.name}[${syntax.opts.min ?? '-∞'},${syntax.opts.max ?? '∞'}]`)
      }
    }
    
    // 递归展开类型
    if (!visited.has(syntax.name)) {
      visited.add(syntax.name)
      const typeData = lexer.types[syntax.name]
      if (typeData && typeData.syntax) {
        types.push(...extractNumericTypes(typeData.syntax, visited))
      }
    }
  } else if (syntax.type === 'Group' && syntax.terms) {
    for (const term of syntax.terms) {
      types.push(...extractNumericTypes(term, visited))
    }
  } else if (syntax.type === 'Multiplier' && syntax.term) {
    types.push(...extractNumericTypes(syntax.term, visited))
  }
  
  return types
}

/**
 * 获取所有 css-tree 中的数值相关类型（只保留有 min/max 的）
 */
function getTypesWithRange(): Record<string, { min: number | null; max: number | null }> {
  const lexer = (csstree as any).lexer
  const result: Record<string, { min: number | null; max: number | null }> = {}
  
  // 遍历所有类型，只保留有 opts（min/max）的
  for (const [name, data] of Object.entries(lexer.types as Record<string, any>)) {
    if (data.syntax && data.syntax.opts) {
      const opts = data.syntax.opts
      if (opts.min !== undefined || opts.max !== undefined) {
        result[name] = {
          min: opts.min ?? null,
          max: opts.max ?? null,
        }
      }
    }
  }
  
  return result
}

/**
 * 获取所有属性的数值类型信息
 */
function getPropertyNumericInfo(): PropertyNumericInfo[] {
  const lexer = (csstree as any).lexer
  const result: PropertyNumericInfo[] = []
  
  for (const [property, data] of Object.entries(lexer.properties as Record<string, any>)) {
    if (!data.syntax) continue
    
    const numericTypes = [...new Set(extractNumericTypes(data.syntax))]
    
    if (numericTypes.length > 0) {
      result.push({
        property,
        numericTypes,
      })
    }
  }
  
  return result
}

/**
 * 递归查找 opts
 */
function findOpts(syntax: any): any {
  if (!syntax) return null
  
  if (syntax.opts) {
    return { min: syntax.opts.min, max: syntax.opts.max }
  }
  
  if (syntax.type === 'Group' && syntax.terms) {
    for (const term of syntax.terms) {
      const opts = findOpts(term)
      if (opts) return opts
    }
  }
  
  if (syntax.type === 'Multiplier' && syntax.term) {
    return findOpts(syntax.term)
  }
  
  return null
}

/**
 * 深度递归查找所有 opts
 */
function findAllOptsInTypes(): Record<string, { min: number | null; max: number | null }> {
  const lexer = (csstree as any).lexer
  const result: Record<string, { min: number | null; max: number | null }> = {}
  
  for (const [name, data] of Object.entries(lexer.types as Record<string, any>)) {
    if (data.syntax) {
      const opts = findOpts(data.syntax)
      if (opts && (opts.min !== undefined || opts.max !== undefined)) {
        result[name] = {
          min: opts.min ?? null,
          max: opts.max ?? null,
        }
      }
    }
  }
  
  return result
}

/**
 * 主函数
 */
async function main() {
  console.log('🔍 从 css-tree 提取数值类型信息...\n')
  
  // 1. 获取有 min/max 范围的类型（深度递归查找）
  const typesWithRange = findAllOptsInTypes()
  console.log(`📊 找到 ${Object.keys(typesWithRange).length} 个有 min/max 的类型`)
  
  // 2. 获取所有属性的数值类型信息
  const propertyInfo = getPropertyNumericInfo()
  console.log(`📊 找到 ${propertyInfo.length} 个有数值类型的属性`)
  
  // 3. 生成 JSON 文件（精简版）
  const output = {
    generatedAt: new Date().toISOString(),
    source: 'css-tree',
    
    // 有 min/max 范围的类型（css-tree 提供的）
    typesWithRange,
    
    // 所有有数值类型的属性
    propertiesWithNumeric: propertyInfo,
    
    // 统计
    stats: {
      typesWithRange: Object.keys(typesWithRange).length,
      propertiesWithNumeric: propertyInfo.length,
    }
  }
  
  // 保存到文件
  const outputPath = path.join(__dirname, 'csstree-numeric-analysis.json')
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))
  console.log(`\n✅ 已保存到 ${outputPath}`)
  
  // 打印有 min/max 的类型
  console.log('\n📋 有 min/max 的类型:')
  for (const [name, range] of Object.entries(typesWithRange)) {
    console.log(`   ${name}: [${range.min ?? '-∞'}, ${range.max ?? '∞'}]`)
  }
  
  // 打印统计
  console.log('\n📊 统计:')
  console.log(`   有数值类型的属性: ${output.stats.propertiesWithNumeric}`)
}

main().catch(console.error)
