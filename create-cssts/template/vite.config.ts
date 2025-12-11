import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

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
  // 检查是否已经有 cssts import
  if (code.includes("from './cssts/runtime'") || code.includes('from "./cssts/runtime"')) {
    return code
  }

  const scriptSetupMatch = code.match(/<script\s+setup[^>]*>/i)
  if (scriptSetupMatch) {
    const insertPos = scriptSetupMatch.index! + scriptSetupMatch[0].length
    const importStatement = `\nimport { cssts } from '${runtimeImport}'`
    return code.slice(0, insertPos) + importStatement + code.slice(insertPos)
  }

  const scriptMatch = code.match(/<script[^>]*>/i)
  if (scriptMatch) {
    const insertPos = scriptMatch.index! + scriptMatch[0].length
    const importStatement = `\nimport { cssts } from '${runtimeImport}'`
    return code.slice(0, insertPos) + importStatement + code.slice(insertPos)
  }

  return code
}

/**
 * 转换 Vue template 中的 :class 语法
 */
function transformVueTemplate(code: string, runtimeImport: string): { code: string; transformed: boolean } {
  let transformed = false
  const classBindingRegex = /(:class|v-bind:class)="([^"]+)"/g

  let newCode = code.replace(classBindingRegex, (match, attr, expr) => {
    if (expr.includes('cssts.$cls')) {
      return match
    }

    const trimmedExpr = expr.trim()
    if (trimmedExpr.startsWith('{') || trimmedExpr.startsWith('[')) {
      return match
    }

    if (hasTopLevelComma(expr)) {
      transformed = true
      return `${attr}="cssts.$cls(${expr})"`
    }

    return match
  })

  if (transformed) {
    newCode = injectCsstsImport(newCode, runtimeImport)
  }

  return { code: newCode, transformed }
}

/**
 * CssTs Vite Plugin - 内联版本用于测试
 */
function cssTsPlugin(): Plugin {
  const runtimeImport = './cssts/runtime'

  return {
    name: 'vite-plugin-cssts',
    enforce: 'pre',

    transform(code, id) {
      if (id.endsWith('.vue')) {
        const result = transformVueTemplate(code, runtimeImport)
        if (result.transformed) {
          return {
            code: result.code,
            map: null
          }
        }
      }
      return null
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    cssTsPlugin(),  // 自动转换 :class="a, b" 为 :class="cssts.$cls(a, b)"
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
