/**
 * CssTs 运行时
 *
 * 提供样式合并和替换功能
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

// ==================== 属性名数据 ====================

let properties: Record<string, string> = {}
let sortedPropertyNames: string[] = []

/**
 * 初始化属性映射表
 * 
 * 由 vite-plugin-cssts 在启动时调用，传入生成的 properties.json 数据
 */
export function initProperties(data: Record<string, string>): void {
  properties = data
  sortedPropertyNames = Object.keys(properties).sort((a, b) => b.length - a.length)
}

// ==================== 命名转换算法 ====================

const symbolToEscape: Record<string, string> = {
  '.': '\\.',
  '%': '\\%',
  '/': '\\/',
}

function parseTsAtomName(tsName: string): { property: string; value: string } | null {
  for (const propName of sortedPropertyNames) {
    if (tsName.startsWith(propName) && tsName.length > propName.length) {
      const valuePart = tsName.slice(propName.length)
      if (/^[A-Z0-9]/.test(valuePart) || /^N[0-9]/.test(valuePart)) {
        const property = properties[propName]
        const value = tsValueToCSS(valuePart)
        return { property, value }
      }
    }
  }
  return null
}

function tsValueToCSS(tsValue: string): string {
  let result = tsValue

  if (result.startsWith('N') && result.length > 1 && /[0-9]/.test(result[1])) {
    result = '-' + result.slice(1)
  }

  result = result.replace(/pct/g, '%')
  result = result.replace(/(\d)p(\d)/g, '$1.$2')
  result = result.replace(/(\d)s(\d)/g, '$1/$2')
  result = camelToKebab(result)

  return result
}

function camelToKebab(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .toLowerCase()
}

function generateClassName(property: string, value: string): string {
  let escapedValue = value
  for (const [symbol, escaped] of Object.entries(symbolToEscape)) {
    escapedValue = escapedValue.split(symbol).join(escaped)
  }
  return `${property}_${escapedValue}`
}

export function getCssClassName(atomName: string): string {
  const parsed = parseTsAtomName(atomName)
  if (parsed) {
    return generateClassName(parsed.property, parsed.value)
  }
  return camelToKebab(atomName)
}

export function getCssProperty(atomName: string): string | undefined {
  const parsed = parseTsAtomName(atomName)
  return parsed?.property
}

// ==================== 样式合并 ====================

export function $cls(...args: ClassValue[]): ClassObject {
  const result: ClassObject = {}
  for (const arg of args) {
    processValue(arg, result)
  }
  return result
}

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

export function replace(style: string | ClassObject, oldAtomOrProp: string, newAtom: string): string | ClassObject {
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

export function replaceAll(
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
  initProperties,
  version: '0.1.0',
}

export default cssts
