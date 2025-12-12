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
 * 原子类信息结构（来自 atoms.json）
 */
interface AtomInfo {
  property: string   // CSS 属性名，用于同属性去重
  className: string  // CSS 类名
}

/**
 * atoms.json 数据类型
 */
type AtomsData = Record<string, AtomInfo>

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
 * 原子类数据（从 atoms.json 加载）
 * 
 * 结构：{ tsIdentifier: { property: 'css-property', className: 'css-class-name' } }
 * 
 * 初始化方式：
 * 1. 编译时由 vite-plugin-cssts 注入
 * 2. 或运行时调用 cssts.loadAtoms() 加载
 */
let atomsData: AtomsData = {}

/**
 * 加载原子类数据
 * 
 * @param data atoms.json 数据
 */
function loadAtoms(data: AtomsData): void {
  atomsData = data
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
 * 获取原子类对应的 CSS 属性（从 atoms.json 查询）
 */
function getCssProperty(atomName: string): string | undefined {
  return atomsData[atomName]?.property
}

/**
 * 获取原子类对应的 CSS 类名（从 atoms.json 查询）
 */
function getCssClassName(atomName: string): string | undefined {
  return atomsData[atomName]?.className
}

/**
 * 判断是否是 CSS 属性名（而非原子类名）
 * 
 * 通过检查 atomsData 中是否有该属性名对应的原子类来判断
 */
function isCssPropertyName(name: string): boolean {
  const kebabName = camelToKebab(name)
  // 如果在 atomsData 中找到任何原子类的 property 等于该名称，则是 CSS 属性名
  for (const atomInfo of Object.values(atomsData)) {
    if (atomInfo.property === name || atomInfo.property === kebabName) {
      return true
    }
  }
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
  const newClassName = getCssClassName(newAtom) || camelToKebab(newAtom)
  const newProp = getCssProperty(newAtom)
  const classes = style.split(' ').filter(Boolean)
  
  // 检查 oldAtomOrProp 是否是 CSS 属性名
  if (isCssPropertyName(oldAtomOrProp)) {
    const targetProp = camelToKebab(oldAtomOrProp)
    
    // 验证新原子类是否属于该 CSS 属性
    if (newProp && newProp === targetProp) {
      // 删除所有属于该 CSS 属性的原子类
      const result = classes.filter(cls => {
        // 通过类名反查原子类名，获取其 property
        const atomEntry = Object.entries(atomsData).find(([_, info]) => info.className === cls)
        if (atomEntry) {
          return atomEntry[1].property !== targetProp
        }
        return true
      })
      // 添加新原子类的类名
      result.push(newClassName)
      return result.join(' ')
    }
    
    // 属性不匹配，直接添加新原子类
    return [...classes, newClassName].join(' ')
  }
  
  // 原子类替换模式
  const oldClassName = getCssClassName(oldAtomOrProp) || camelToKebab(oldAtomOrProp)
  const oldProp = getCssProperty(oldAtomOrProp)
  
  // 如果新旧原子类属于同一 CSS 属性，直接替换
  if (oldProp && newProp && oldProp === newProp) {
    const result = classes.filter(cls => cls !== oldClassName)
    result.push(newClassName)
    return result.join(' ')
  }
  
  // 否则只替换精确匹配的类名
  return classes.map(cls => cls === oldClassName ? newClassName : cls).join(' ')
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
 * 注册自定义原子类
 * 
 * @param atomName 原子类名（驼峰）
 * @param property CSS 属性名
 * @param className CSS 类名（可选，默认从 atomName 转换）
 */
function registerAtom(atomName: string, property: string, className?: string): void {
  atomsData[atomName] = {
    property,
    className: className || camelToKebab(atomName)
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
   * 加载原子类数据（从 atoms.json）
   * @see loadAtoms
   */
  loadAtoms,
  
  /**
   * 注册自定义原子类
   * @see registerAtom
   */
  registerAtom,
  
  /**
   * 获取原子类的 CSS 属性
   * @see getCssProperty
   */
  getCssProperty,
  
  /**
   * 获取原子类的 CSS 类名
   * @see getCssClassName
   */
  getCssClassName,
  
  /**
   * 版本号
   */
  version: '0.1.0'
}

export default cssts
export { $cls, replace, replaceAll, loadAtoms, registerAtom, getCssProperty, getCssClassName }
