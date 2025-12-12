/**
 * CssTs 运行时命名空间
 *
 * 提供 cssts.$cls() 函数，用于合并多个样式
 * 使用 properties.json 做最长前缀匹配来解析属性名
 */

// @ts-ignore - JSON import
import propertiesData from 'cssts-types/dist/properties.json' with { type: 'json' }

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

// ==================== 属性名数据 ====================

/**
 * properties.json 格式: { camelCase: "kebab-case" }
 * 例如: { "paddingTop": "padding-top", "zIndex": "z-index" }
 */
const properties: Record<string, string> = propertiesData as Record<string, string>

/**
 * 按长度降序排列的属性名列表（用于最长前缀匹配）
 */
const sortedPropertyNames = Object.keys(properties).sort((a, b) => b.length - a.length)

// ==================== 命名转换算法 ====================

/**
 * CSS 类名中需要转义的符号
 */
const symbolToEscape: Record<string, string> = {
  '.': '\\.',
  '%': '\\%',
  '/': '\\/',
}

/**
 * 从 TS 属性名解析出 CSS 属性名和值（最长前缀匹配）
 *
 * 例如:
 * - displayFlex → { property: 'display', value: 'flex' }
 * - paddingTop16px → { property: 'padding-top', value: '16px' }
 * - zIndexN1 → { property: 'z-index', value: '-1' }
 * - width50pct → { property: 'width', value: '50%' }
 * - lineHeight1p5 → { property: 'line-height', value: '1.5' }
 */
function parseTsAtomName(tsName: string): { property: string; value: string } | null {
  // 最长前缀匹配：找到最长的属性名前缀
  for (const propName of sortedPropertyNames) {
    if (tsName.startsWith(propName) && tsName.length > propName.length) {
      const valuePart = tsName.slice(propName.length)
      // 值部分必须以大写字母、数字或 N(负数) 开头
      // 注意：属性名是 camelCase，所以如果值以小写开头说明还是属性名的一部分
      if (/^[A-Z0-9]/.test(valuePart) || /^N[0-9]/.test(valuePart)) {
        const property = properties[propName]
        const value = tsValueToCSS(valuePart)
        return { property, value }
      }
    }
  }

  return null
}

/**
 * 将 TS 值部分转换为 CSS 值
 *
 * - Flex → flex
 * - 16px → 16px
 * - N1 → -1
 * - 50pct → 50%
 * - 1p5 → 1.5
 */
function tsValueToCSS(tsValue: string): string {
  let result = tsValue

  // 处理负数前缀 N → -
  if (result.startsWith('N') && result.length > 1 && /[0-9]/.test(result[1])) {
    result = '-' + result.slice(1)
  }

  // 处理百分号 pct → %
  result = result.replace(/pct/g, '%')

  // 处理小数点 p → . (仅在数字上下文中)
  // 例如: 1p5 → 1.5, 0p25 → 0.25
  result = result.replace(/(\d)p(\d)/g, '$1.$2')

  // 处理斜杠 s → / (仅在数字上下文中)
  // 例如: 16s9 → 16/9
  result = result.replace(/(\d)s(\d)/g, '$1/$2')

  // 转换为 kebab-case（处理驼峰值如 FlexStart → flex-start）
  result = camelToKebab(result)

  return result
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
 * 生成 CSS 类名
 *
 * 格式: property_value（特殊字符转义）
 */
function generateClassName(property: string, value: string): string {
  let escapedValue = value

  // 转义特殊字符
  for (const [symbol, escaped] of Object.entries(symbolToEscape)) {
    escapedValue = escapedValue.split(symbol).join(escaped)
  }

  return `${property}_${escapedValue}`
}

/**
 * 从 TS 属性名获取 CSS 类名
 */
function getCssClassName(atomName: string): string {
  const parsed = parseTsAtomName(atomName)
  if (parsed) {
    return generateClassName(parsed.property, parsed.value)
  }
  // 无法解析时，直接转换为 kebab-case
  return camelToKebab(atomName)
}

/**
 * 从 TS 属性名获取 CSS 属性名
 */
function getCssProperty(atomName: string): string | undefined {
  const parsed = parseTsAtomName(atomName)
  return parsed?.property
}

// ==================== 样式合并 ====================

/**
 * 合并多个样式为 Vue :class 可用的对象
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
          processValue(val as ClassValue, result)
        } else {
          result[key] = true
        }
      }
    }
  }
}

// ==================== 样式替换 ====================

/**
 * 样式替换：用新原子类替换旧原子类（基于 CSS 属性冲突检测）
 */
function replace(style: string | ClassObject, oldAtomOrProp: string, newAtom: string): string | ClassObject {
  const newClassName = getCssClassName(newAtom)
  const newProp = getCssProperty(newAtom)
  const oldProp = getCssProperty(oldAtomOrProp) || camelToKebab(oldAtomOrProp)

  if (typeof style === 'string') {
    const classes = style.split(' ').filter(Boolean)

    if (newProp && newProp === oldProp) {
      const result = classes.filter((cls) => {
        const underscoreIndex = cls.indexOf('_')
        if (underscoreIndex > 0) {
          const clsProp = cls.slice(0, underscoreIndex)
          return clsProp !== oldProp
        }
        return true
      })
      result.push(newClassName)
      return result.join(' ')
    }

    const oldClassName = getCssClassName(oldAtomOrProp)
    return classes.map((cls) => (cls === oldClassName ? newClassName : cls)).join(' ')
  }

  const result: ClassObject = {}
  for (const [cls, val] of Object.entries(style)) {
    if (!val) continue

    const underscoreIndex = cls.indexOf('_')
    const clsProp = underscoreIndex > 0 ? cls.slice(0, underscoreIndex) : null

    if (clsProp && clsProp === oldProp && newProp === oldProp) {
      continue
    }

    result[cls] = true
  }

  result[newClassName] = true
  return result
}

/**
 * 批量样式替换
 */
function replaceAll(
  style: string | ClassObject,
  replacements: Record<string, string>,
): string | ClassObject {
  let result = style
  for (const [oldAtom, newAtom] of Object.entries(replacements)) {
    result = replace(result, oldAtom, newAtom)
  }
  return result
}

// ==================== 导出 ====================

export const cssts = {
  $cls,
  replace,
  replaceAll,
  getCssProperty,
  getCssClassName,
  version: '0.1.0',
}

export default cssts
export { $cls, replace, replaceAll, getCssProperty, getCssClassName }
