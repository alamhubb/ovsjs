/**
 * CssTs 运行时命名空间
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
  [key: string]: boolean | undefined | null
}

/**
 * 合并多个样式为 Vue :class 可用的对象
 * 
 * 支持的输入类型：
 * - 字符串: 'class-name' → { 'class-name': true }
 * - 数组: ['class1', 'class2'] → { 'class1': true, 'class2': true }
 * - 对象: { 'class-name': true } → 直接合并
 * - 嵌套对象: 递归解包
 * - falsy 值: 忽略 (null, undefined, false, 0, '')
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
 * 
 * // 数组
 * cssts.$cls(['class1', 'class2'], CssCls.card)
 */
function $cls(...args: ClassValue[]): ClassObject {
  const result: ClassObject = {}
  
  for (const arg of args) {
    processValue(arg, result)
  }
  
  return result
}

/**
 * 递归处理单个值
 */
function processValue(value: ClassValue, result: ClassObject): void {
  // 忽略 falsy 值
  if (!value) return
  
  if (typeof value === 'string') {
    // 字符串：直接添加
    result[value] = true
  } else if (typeof value === 'number') {
    // 数字：转为字符串
    result[String(value)] = true
  } else if (Array.isArray(value)) {
    // 数组：递归处理每个元素
    for (const item of value) {
      processValue(item, result)
    }
  } else if (typeof value === 'object') {
    // 对象：合并，递归处理嵌套对象
    for (const [key, val] of Object.entries(value)) {
      if (val) {
        // 检查 val 是否是嵌套的样式对象（值为 true 的对象）
        if (typeof val === 'object' && val !== null) {
          // 嵌套对象，递归处理
          processValue(val as ClassValue, result)
        } else {
          // 普通的 { 'class-name': true }
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
  /**
   * 合并多个样式
   * @see $cls
   */
  $cls,
  
  /**
   * 版本号
   */
  version: '0.1.0'
}

export default cssts
export { $cls }
