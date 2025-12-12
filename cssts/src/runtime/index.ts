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

// ==================== 全局属性映射 ====================

/**
 * 原子类名 → CSS 属性类别的全局映射
 */
const CSS_PROPERTY_MAP: Record<string, string> = {
  // 颜色
  colorRed: 'color', colorWhite: 'color', colorBlack: 'color',
  colorRegular: 'color', colorPrimary: 'color', colorSuccess: 'color',
  colorWarning: 'color', colorDanger: 'color', colorInfo: 'color',
  
  // 背景色
  bgPrimary: 'background-color', bgSuccess: 'background-color',
  bgWarning: 'background-color', bgDanger: 'background-color',
  bgInfo: 'background-color', bgWhite: 'background-color', bgBlack: 'background-color',
  
  // 边框颜色
  borderBase: 'border-color', borderPrimary: 'border-color',
  borderSuccess: 'border-color', borderWarning: 'border-color',
  borderDanger: 'border-color', borderInfo: 'border-color',
  
  // 字体
  fontSize12: 'font-size', fontSize14: 'font-size', fontSize16: 'font-size',
  fontNormal: 'font-weight', fontMedium: 'font-weight', fontBold: 'font-weight',
  
  // 布局
  rounded: 'border-radius', roundedFull: 'border-radius', roundedNone: 'border-radius',
  paddingXs: 'padding', paddingSm: 'padding', paddingMd: 'padding', paddingLg: 'padding',
  height32: 'height', height40: 'height', height48: 'height',
  cursorPointer: 'cursor', cursorNotAllowed: 'cursor', cursorDefault: 'cursor',
  flex: 'display', inlineFlex: 'display', block: 'display', hidden: 'display',
}

/**
 * 驼峰转 kebab-case
 */
function camelToKebab(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .toLowerCase()
}

/**
 * kebab-case 转驼峰
 */
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase())
}

/**
 * 已知的 CSS 属性名集合（用于判断是否是属性名而非原子类名）
 */
const CSS_PROPERTIES = new Set([
  'color', 'background-color', 'border-color', 'font-size', 'font-weight',
  'padding', 'margin', 'height', 'width', 'border-radius', 'cursor', 'display',
  'background', 'border', 'opacity', 'transform', 'transition'
])

/**
 * 获取原子类对应的 CSS 属性
 */
function getCssProperty(atomName: string): string | undefined {
  if (CSS_PROPERTY_MAP[atomName]) return CSS_PROPERTY_MAP[atomName]
  
  // 根据前缀推断
  if (atomName.startsWith('color')) return 'color'
  if (atomName.startsWith('bg')) return 'background-color'
  if (atomName.startsWith('border')) return 'border-color'
  if (atomName.startsWith('fontSize')) return 'font-size'
  if (atomName.startsWith('font')) return 'font-weight'
  if (atomName.startsWith('padding')) return 'padding'
  if (atomName.startsWith('margin')) return 'margin'
  if (atomName.startsWith('height')) return 'height'
  if (atomName.startsWith('width')) return 'width'
  if (atomName.startsWith('rounded')) return 'border-radius'
  if (atomName.startsWith('cursor')) return 'cursor'
  
  return undefined
}

/**
 * 判断是否是 CSS 属性名（而非原子类名）
 */
function isCssPropertyName(name: string): boolean {
  // 检查 kebab-case 格式
  if (CSS_PROPERTIES.has(name)) return true
  // 检查驼峰格式转换后
  if (CSS_PROPERTIES.has(camelToKebab(name))) return true
  return false
}

/**
 * 样式替换：用新原子类替换旧原子类（基于 CSS 属性冲突检测）
 * 
 * 支持两种模式：
 * 1. 原子类替换：style.bgPrimary = css bgSuccess
 *    → cssts.replace(style, "bgPrimary", "bgSuccess")
 * 2. 属性名替换：style.color = css colorRed
 *    → cssts.replace(style, "color", "colorRed")
 *    删除所有 color 属性的原子类，添加 colorRed
 * 
 * @param style 当前样式字符串，如 "bg-primary color-white padding-sm"
 * @param oldAtomOrProp 要替换的原子类名或 CSS 属性名（驼峰）
 * @param newAtom 新的原子类名（驼峰），如 "bgSuccess"
 * @returns 替换后的样式字符串
 * 
 * @example
 * // 原子类替换
 * cssts.replace("bg-primary color-white", "bgPrimary", "bgSuccess")
 * // → "bg-success color-white"
 * 
 * // 属性名替换
 * cssts.replace("bg-primary color-white", "color", "colorRed")
 * // → "bg-primary color-red"
 */
function replace(style: string, oldAtomOrProp: string, newAtom: string): string {
  const newKebab = camelToKebab(newAtom)
  const newProp = getCssProperty(newAtom)
  const classes = style.split(' ').filter(Boolean)
  
  // 检查 oldAtomOrProp 是否是 CSS 属性名
  if (isCssPropertyName(oldAtomOrProp)) {
    const targetProp = camelToKebab(oldAtomOrProp)
    
    // 验证新原子类是否属于该 CSS 属性
    if (newProp && newProp === targetProp) {
      // 删除所有属于该 CSS 属性的原子类
      const result = classes.filter(cls => {
        const atomName = kebabToCamel(cls)
        const prop = getCssProperty(atomName)
        return prop !== targetProp
      })
      // 添加新原子类
      result.push(newKebab)
      return result.join(' ')
    }
    
    // 属性不匹配，直接添加新原子类
    return [...classes, newKebab].join(' ')
  }
  
  // 原子类替换模式
  const oldKebab = camelToKebab(oldAtomOrProp)
  const oldProp = getCssProperty(oldAtomOrProp)
  
  // 如果新旧原子类属于同一 CSS 属性，直接替换
  if (oldProp && newProp && oldProp === newProp) {
    const result = classes.filter(cls => cls !== oldKebab)
    result.push(newKebab)
    return result.join(' ')
  }
  
  // 否则只替换精确匹配的类名
  return classes.map(cls => cls === oldKebab ? newKebab : cls).join(' ')
}

/**
 * 批量样式替换
 * 
 * @param style 当前样式字符串
 * @param replacements 替换映射 { oldAtom: newAtom }
 * @returns 替换后的样式字符串
 * 
 * @example
 * cssts.replaceAll("bg-primary color-white", { bgPrimary: "bgSuccess", colorWhite: "colorBlack" })
 * // → "bg-success color-black"
 */
function replaceAll(style: string, replacements: Record<string, string>): string {
  let result = style
  for (const [oldAtom, newAtom] of Object.entries(replacements)) {
    result = replace(result, oldAtom, newAtom)
  }
  return result
}

/**
 * 注册自定义属性映射
 */
function registerProperty(atomName: string, cssProperty: string): void {
  CSS_PROPERTY_MAP[atomName] = cssProperty
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
   * 样式替换
   * @see replace
   */
  replace,
  
  /**
   * 批量样式替换
   * @see replaceAll
   */
  replaceAll,
  
  /**
   * 注册自定义属性映射
   */
  registerProperty,
  
  /**
   * 版本号
   */
  version: '0.1.0'
}

export default cssts
export { $cls, replace, replaceAll, registerProperty }
