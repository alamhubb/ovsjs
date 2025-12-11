import type { Plugin } from 'vite'
// Development imports - use relative paths in monorepo
import CssTsParser from '../../cssts/src/parser/CssTsParser.ts'
import { CssTsCstToAst, type CssStyleInfo } from '../../cssts/src/factory/CssTsCstToAst.ts'
import { generateCssClsInterface, generateCssClsStyles } from '../../cssts/src/utils/cssUtils.ts'
import SlimeGenerator from '../../slime/packages/slime-generator/src/SlimeGenerator.ts'
import * as fs from 'node:fs'
import * as path from 'node:path'

export interface CssTsPluginOptions {
  /** 
   * 生成的类型文件路径
   * @default 'src/cssts/CssCls.d.ts'
   */
  dtsOutput?: string
  
  /**
   * 生成的样式文件路径
   * @default 'src/cssts/CssCls.styles.ts'
   */
  stylesOutput?: string
  
  /**
   * 是否在开发模式下自动生成文件
   * @default true
   */
  autoGenerate?: boolean
  
  /**
   * 是否自动转换 Vue template 中的 :class 语法
   * @default true
   */
  transformClass?: boolean
  
  /**
   * cssts runtime 的导入路径
   * @default './cssts/runtime'
   */
  runtimeImport?: string
  
  /**
   * CSS 类名前缀
   * 例如: 'cu-' 会生成 'cu-flex', 'cu-color-red' 等
   * @default '' (无前缀)
   */
  classPrefix?: string
}

/**
 * 全局样式收集器
 */
const globalStyles = new Map<string, CssStyleInfo>()

/**
 * 转换 .cssts 文件
 */
function transformCssTs(code: string, _id: string): { code: string; styles: Map<string, CssStyleInfo> } {
  const parser = new CssTsParser(code)
  const cst = parser.Program()
  
  const transformer = new CssTsCstToAst()
  const ast = transformer.toProgram(cst)
  
  // 获取收集的样式
  const styles = transformer.getCssStyles()
  
  // 生成 JavaScript 代码
  const tokens = parser.parsedTokens
  const result = SlimeGenerator.generator(ast, tokens)
  
  return {
    code: result.code,
    styles
  }
}

/**
 * 生成输出文件
 */
function generateOutputFiles(
  styles: Map<string, CssStyleInfo>,
  root: string,
  options: CssTsPluginOptions
) {
  const dtsPath = path.resolve(root, options.dtsOutput || 'src/cssts/CssCls.d.ts')
  const stylesPath = path.resolve(root, options.stylesOutput || 'src/cssts/CssCls.styles.ts')
  const prefix = options.classPrefix || ''
  
  // 确保目录存在
  const dtsDir = path.dirname(dtsPath)
  const stylesDir = path.dirname(stylesPath)
  
  if (!fs.existsSync(dtsDir)) {
    fs.mkdirSync(dtsDir, { recursive: true })
  }
  if (!fs.existsSync(stylesDir)) {
    fs.mkdirSync(stylesDir, { recursive: true })
  }
  
  // 生成文件（传入前缀配置）
  const dtsContent = generateCssClsInterface(styles, prefix)
  const stylesContent = generateCssClsStyles(styles, prefix)
  
  fs.writeFileSync(dtsPath, dtsContent, 'utf-8')
  fs.writeFileSync(stylesPath, stylesContent, 'utf-8')
  
  console.log(`[cssts] Generated ${dtsPath}`)
  console.log(`[cssts] Generated ${stylesPath}`)
}

/**
 * 转换 Vue template 中的 :class 语法
 * 
 * 检测模式: :class="expr1, expr2, expr3"
 * 转换为:   :class="cssts.$cls(expr1, expr2, expr3)"
 * 
 * 同时自动注入 cssts 的 import
 */
function transformVueTemplate(code: string, runtimeImport: string): { code: string; transformed: boolean } {
  let transformed = false
  
  // 匹配 :class="..." 或 v-bind:class="..."
  // 需要处理引号内包含逗号的情况
  const classBindingRegex = /(:class|v-bind:class)="([^"]+)"/g
  
  let newCode = code.replace(classBindingRegex, (match, attr, expr) => {
    // 检查是否包含逗号分隔的多个表达式
    // 排除已经是 cssts.$cls() 的情况
    if (expr.includes('cssts.$cls')) {
      return match
    }
    
    // 排除对象字面量 { } 和数组字面量 [ ]
    // 这些是 Vue 原生支持的语法
    const trimmedExpr = expr.trim()
    if (trimmedExpr.startsWith('{') || trimmedExpr.startsWith('[')) {
      return match
    }
    
    // 检查是否有顶层逗号（不在括号内的逗号）
    if (hasTopLevelComma(expr)) {
      transformed = true
      return `${attr}="cssts.$cls(${expr})"`
    }
    
    return match
  })
  
  // 如果有转换，需要注入 cssts import
  if (transformed) {
    newCode = injectCsstsImport(newCode, runtimeImport)
  }
  
  return { code: newCode, transformed }
}

/**
 * 检查表达式是否有顶层逗号（不在括号内）
 */
function hasTopLevelComma(expr: string): boolean {
  let depth = 0
  let inString = false
  let stringChar = ''
  
  for (let i = 0; i < expr.length; i++) {
    const char = expr[i]
    const prevChar = i > 0 ? expr[i - 1] : ''
    
    // 处理字符串
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true
        stringChar = char
      } else if (char === stringChar) {
        inString = false
      }
      continue
    }
    
    if (inString) continue
    
    // 处理括号深度
    if (char === '(' || char === '[' || char === '{') {
      depth++
    } else if (char === ')' || char === ']' || char === '}') {
      depth--
    } else if (char === ',' && depth === 0) {
      return true
    }
  }
  
  return false
}

/**
 * 注入 cssts import 到 <script setup> 中
 */
function injectCsstsImport(code: string, runtimeImport: string): string {
  // 检查是否已经有 cssts import（精确匹配 runtime 路径）
  if (code.includes(`from '${runtimeImport}'`) || code.includes(`from "${runtimeImport}"`)) {
    return code
  }
  
  // 查找 <script setup> 标签
  const scriptSetupMatch = code.match(/<script\s+setup[^>]*>/i)
  if (scriptSetupMatch) {
    const insertPos = scriptSetupMatch.index! + scriptSetupMatch[0].length
    const importStatement = `\nimport { cssts } from '${runtimeImport}'`
    return code.slice(0, insertPos) + importStatement + code.slice(insertPos)
  }
  
  // 查找普通 <script> 标签
  const scriptMatch = code.match(/<script[^>]*>/i)
  if (scriptMatch) {
    const insertPos = scriptMatch.index! + scriptMatch[0].length
    const importStatement = `\nimport { cssts } from '${runtimeImport}'`
    return code.slice(0, insertPos) + importStatement + code.slice(insertPos)
  }
  
  return code
}

/**
 * Vite Plugin for CssTs
 */
export default function cssTsPlugin(options: CssTsPluginOptions = {}): Plugin {
  let root = ''
  let isDev = false
  const runtimeImport = options.runtimeImport || './cssts/runtime'
  
  return {
    name: 'vite-plugin-cssts',
    
    // 确保在 vue 插件之前执行
    enforce: 'pre',
    
    configResolved(config) {
      root = config.root
      isDev = config.command === 'serve'
    },
    
    transform(code, id) {
      // 处理 .vue 文件的 :class 转换
      if (id.endsWith('.vue') && options.transformClass !== false) {
        const result = transformVueTemplate(code, runtimeImport)
        if (result.transformed) {
          return {
            code: result.code,
            map: null
          }
        }
      }
      
      // 处理 .cssts 文件
      if (id.endsWith('.cssts')) {
        try {
          const result = transformCssTs(code, id)
          
          // 合并到全局样式
          for (const [name, info] of result.styles) {
            globalStyles.set(name, info)
          }
          
          // 在开发模式下自动生成文件
          if (isDev && options.autoGenerate !== false) {
            generateOutputFiles(globalStyles, root, options)
          }
          
          return {
            code: result.code,
            map: null
          }
        } catch (e: any) {
          console.error(`[cssts] Error transforming ${id}:`, e.message)
          throw e
        }
      }
      
      return null
    },
    
    buildEnd() {
      // 构建结束时生成文件
      if (globalStyles.size > 0) {
        generateOutputFiles(globalStyles, root, options)
      }
    }
  }
}

export { transformCssTs, transformVueTemplate, generateOutputFiles, globalStyles }
