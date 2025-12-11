/**
 * CssTs 运行时
 * 
 * 提供 cssts.$cls() 函数，用于合并多个样式
 */

type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassObject
  | ClassValue[]

interface ClassObject {
  [key: string]: boolean | undefined | null | ClassObject
}

/**
 * 合并多个样式为 Vue :class 可用的对象
 * 
 * @example
 * // 基础用法
 * cssts.$cls(CssCls.card, CssCls.textCenter)
 * 
 * // 混合字符串
 * cssts.$cls('static-class', CssCls.card)
 * 
 * // 条件样式
 * cssts.$cls(isActive && CssCls.active, CssCls.base)
 */
function $cls(...args: ClassValue[]): Record<string, boolean> {
  const result: Record<string, boolean> = {}

  for (const arg of args) {
    processValue(arg, result)
  }

  return result
}

function processValue(value: ClassValue, result: Record<string, boolean>): void {
  if (!value) return

  if (typeof value === 'string') {
    result[value] = true
  } else if (typeof value === 'number') {
    result[String(value)] = true
  } else if (Array.isArray(value)) {
    for (const item of value) {
      processValue(item, result)
    }
  } else if (typeof value === 'object') {
    for (const [key, val] of Object.entries(value)) {
      if (val) {
        if (typeof val === 'object' && val !== null) {
          // 嵌套对象，递归处理
          processValue(val as ClassValue, result)
        } else {
          result[key] = true
        }
      }
    }
  }
}

/**
 * CssTs 命名空间
 */
export const cssts = {
  $cls,
  version: '0.1.0'
}

export default cssts
export { $cls }
