import type { CssStyleInfo } from '../factory/CssTsCstToAst.ts'

/**
 * 驼峰命名转 kebab-case
 * colorRed → color-red
 * fontBold → font-bold
 * 
 * @param str 驼峰命名字符串
 * @param prefix 可选的类名前缀，如 'cu-'
 */
export function camelToKebab(str: string, prefix: string = ''): string {
  const kebab = str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .toLowerCase()
  return prefix + kebab
}

// ==================== 样式属性映射 ====================

/**
 * 原子类名 → CSS 属性类别的映射
 * 用于检测样式冲突和替换
 * 
 * 例如：
 * - colorRed, colorWhite, colorPrimary → 'color'
 * - bgPrimary, bgSuccess, bgWhite → 'background-color'
 * - fontSize12, fontSize14 → 'font-size'
 */
const CSS_PROPERTY_MAP: Record<string, string> = {
  // 颜色
  colorRed: 'color',
  colorWhite: 'color',
  colorBlack: 'color',
  colorRegular: 'color',
  colorPrimary: 'color',
  colorSuccess: 'color',
  colorWarning: 'color',
  colorDanger: 'color',
  colorInfo: 'color',
  
  // 背景色
  bgPrimary: 'background-color',
  bgSuccess: 'background-color',
  bgWarning: 'background-color',
  bgDanger: 'background-color',
  bgInfo: 'background-color',
  bgWhite: 'background-color',
  bgBlack: 'background-color',
  
  // 边框颜色
  borderBase: 'border-color',
  borderPrimary: 'border-color',
  borderSuccess: 'border-color',
  borderWarning: 'border-color',
  borderDanger: 'border-color',
  borderInfo: 'border-color',
  
  // 字体大小
  fontSize12: 'font-size',
  fontSize14: 'font-size',
  fontSize16: 'font-size',
  fontSize18: 'font-size',
  fontSize20: 'font-size',
  
  // 字体粗细
  fontNormal: 'font-weight',
  fontMedium: 'font-weight',
  fontBold: 'font-weight',
  
  // 圆角
  rounded: 'border-radius',
  roundedFull: 'border-radius',
  roundedNone: 'border-radius',
  
  // 内边距
  paddingXs: 'padding',
  paddingSm: 'padding',
  paddingMd: 'padding',
  paddingLg: 'padding',
  
  // 高度
  height32: 'height',
  height40: 'height',
  height48: 'height',
  
  // 光标
  cursorPointer: 'cursor',
  cursorNotAllowed: 'cursor',
  cursorDefault: 'cursor',
  
  // display
  flex: 'display',
  inlineFlex: 'display',
  block: 'display',
  inlineBlock: 'display',
  hidden: 'display',
}

/**
 * 获取原子类对应的 CSS 属性类别
 * 
 * @param atomName 原子类名（驼峰）
 * @returns CSS 属性类别，如 'color', 'background-color'
 */
export function getCssProperty(atomName: string): string | undefined {
  // 先查找精确匹配
  if (CSS_PROPERTY_MAP[atomName]) {
    return CSS_PROPERTY_MAP[atomName]
  }
  
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
 * 注册自定义的原子类 → CSS 属性映射
 * 
 * @param mappings 映射对象 { atomName: cssProperty }
 */
export function registerCssPropertyMap(mappings: Record<string, string>): void {
  Object.assign(CSS_PROPERTY_MAP, mappings)
}

/**
 * 样式替换：根据 CSS 属性冲突进行替换
 * 
 * 当新样式和旧样式属于同一 CSS 属性类别时，删除旧样式，使用新样式
 * 
 * @param currentClasses 当前的类名数组
 * @param newClasses 要添加的新类名数组
 * @returns 替换后的类名数组
 * 
 * @example
 * replaceConflictingStyles(['color-red', 'font-bold'], ['color-green'])
 * // → ['font-bold', 'color-green']  // color-red 被 color-green 替换
 */
export function replaceConflictingStyles(
  currentClasses: string[],
  newClasses: string[]
): string[] {
  // 构建新类的属性集合
  const newProperties = new Map<string, string>()
  for (const cls of newClasses) {
    // 将 kebab-case 转回驼峰以查找属性
    const camelName = kebabToCamel(cls)
    const prop = getCssProperty(camelName)
    if (prop) {
      newProperties.set(prop, cls)
    }
  }
  
  // 过滤掉冲突的旧类
  const filtered = currentClasses.filter(cls => {
    const camelName = kebabToCamel(cls)
    const prop = getCssProperty(camelName)
    // 如果旧类的属性在新类中存在，则删除旧类
    return !prop || !newProperties.has(prop)
  })
  
  // 添加新类
  return [...filtered, ...newClasses]
}

/**
 * kebab-case 转驼峰
 * color-red → colorRed
 */
export function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * 递归收集所有原子 CSS class
 * 
 * 给定一个样式名称，递归展开所有依赖，返回最终的原子 class 列表
 * 
 * @param styleName 样式名称
 * @param styles 所有样式声明的 Map
 * @param visited 已访问的样式（防止循环引用）
 * @param prefix 可选的类名前缀
 * @returns 原子 CSS class 名称数组
 */
export function collectAllCssClasses(
  styleName: string,
  styles: Map<string, CssStyleInfo>,
  visited: Set<string> = new Set(),
  prefix: string = ''
): string[] {
  // 防止循环引用
  if (visited.has(styleName)) {
    console.warn(`Circular reference detected: ${styleName}`)
    return []
  }
  visited.add(styleName)

  const style = styles.get(styleName)
  if (!style) {
    // 未声明的样式，假设是原子样式
    return [camelToKebab(styleName, prefix)]
  }

  if (style.isAtomic) {
    // 原子样式，添加前缀
    return [prefix + style.cssClassName]
  }

  // 组合样式，递归展开
  const classes: string[] = []
  for (const dep of style.dependencies) {
    classes.push(...collectAllCssClasses(dep, styles, new Set(visited), prefix))
  }
  return classes
}

/**
 * 生成 CssCls TypeScript interface（对象格式）
 * 
 * @param styles 所有样式声明
 * @param prefix 可选的类名前缀
 * @returns TypeScript interface 代码
 */
export function generateCssClsInterface(styles: Map<string, CssStyleInfo>, prefix: string = ''): string {
  const lines: string[] = [
    '// Auto-generated by cssts',
    '// Do not edit manually',
    '',
    '/** CSS class 对象类型 */',
    'type CssClassObj = { readonly [key: string]: true }',
    '',
    'export interface CssCls {'
  ]

  for (const [name, info] of styles) {
    if (info.isAtomic) {
      const className = prefix + info.cssClassName
      lines.push(`  /** CSS class: '${className}' */`)
      lines.push(`  readonly ${name}: { readonly '${className}': true }`)
    } else {
      const deps = info.dependencies.join(', ')
      const allClasses = collectAllCssClasses(name, styles, new Set(), prefix)
      const classesType = allClasses.map(c => `'${c}': true`).join(', ')
      lines.push(`  /** Composed from: { ${deps} } */`)
      lines.push(`  readonly ${name}: { readonly ${classesType} }`)
    }
  }

  lines.push('}')
  lines.push('')
  lines.push('declare const CssCls: CssCls')
  lines.push('export default CssCls')

  return lines.join('\n')
}

/**
 * 生成 CssCls 实际值对象（对象格式，适用于 Vue :class 绑定）
 * 
 * 生成格式：
 * - 原子样式: { 'color-red': true }
 * - 组合样式: { 'color-red': true, 'font-bold': true, ... }
 * 
 * 使用方式：
 * <div :class="CssCls.primaryButton">
 * <div :class="{ ...CssCls.card, ...CssCls.textCenter }">
 * 
 * @param styles 所有样式声明
 * @param prefix 可选的类名前缀
 * @returns JavaScript/TypeScript 代码
 */
export function generateCssClsStyles(styles: Map<string, CssStyleInfo>, prefix: string = ''): string {
  const lines: string[] = [
    '// Auto-generated by cssts',
    '// Do not edit manually',
    '',
    'export const CssCls = {'
  ]

  const entries = Array.from(styles.entries())
  for (let i = 0; i < entries.length; i++) {
    const [name, info] = entries[i]
    const comma = i < entries.length - 1 ? ',' : ''

    if (info.isAtomic) {
      // 原子样式：{ 'cu-color-red': true }
      const className = prefix + info.cssClassName
      lines.push(`  ${name}: { '${className}': true }${comma}`)
    } else {
      // 组合样式：递归展开为对象
      const allClasses = collectAllCssClasses(name, styles, new Set(), prefix)
      const classesObj = allClasses.map(c => `'${c}': true`).join(', ')
      lines.push(`  ${name}: { ${classesObj} }${comma}`)
    }
  }

  lines.push('} as const')
  lines.push('')
  lines.push('export default CssCls')
  lines.push('')
  lines.push('// 类型定义')
  lines.push('export type CssClsKey = keyof typeof CssCls')
  lines.push('export type CssClsValue = typeof CssCls[CssClsKey]')

  return lines.join('\n')
}

/**
 * 分析使用的样式，返回需要生成的原子 class 集合
 * 
 * @param usedStyles 使用的样式名称数组
 * @param styles 所有样式声明
 * @param prefix 可选的类名前缀
 * @returns 需要生成的原子 CSS class 集合
 */
export function analyzeUsedClasses(
  usedStyles: string[],
  styles: Map<string, CssStyleInfo>,
  prefix: string = ''
): Set<string> {
  const result = new Set<string>()

  for (const styleName of usedStyles) {
    const classes = collectAllCssClasses(styleName, styles, new Set(), prefix)
    for (const cls of classes) {
      result.add(cls)
    }
  }

  return result
}
