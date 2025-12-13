/**
 * TypeScript 类型定义生成器
 * 
 * 生成 .d.ts 文件
 */

import type { AtomDefinition } from './atom-generator.js'

/**
 * 生成 CsstsAtoms.d.ts 内容
 */
export function generateCsstsAtomsDts(atoms: AtomDefinition[]): string {
  const lines: string[] = [
    '/**',
    ' * CsstsAtoms 接口 - 原子类类型定义',
    ' *',
    ' * 自动生成，请勿手动修改',
    ' * 生成时间: ' + new Date().toISOString(),
    ' */',
    '',
    'export interface CsstsAtoms {',
  ]

  // 按属性分组
  const grouped = new Map<string, AtomDefinition[]>()
  for (const atom of atoms) {
    const group = atom.property
    if (!grouped.has(group)) {
      grouped.set(group, [])
    }
    grouped.get(group)!.push(atom)
  }

  // 生成每个分组
  for (const [property, groupAtoms] of grouped) {
    lines.push(`  // ==================== ${property} ====================`)
    for (const atom of groupAtoms) {
      lines.push(`  readonly ${atom.name}: { '${atom.className}': true }`)
    }
    lines.push('')
  }

  lines.push('  // 允许任意其他原子类')
  lines.push('  readonly [key: string]: { [className: string]: true }')
  lines.push('}')

  return lines.join('\n')
}

/**
 * 生成 global.d.ts 内容
 */
export function generateGlobalDts(atoms: AtomDefinition[]): string {
  const lines: string[] = [
    '/**',
    ' * CssTs Global Type Declarations',
    ' *',
    ' * 自动生成，请勿手动修改',
    ' * 生成时间: ' + new Date().toISOString(),
    ' */',
    '',
    "import type { CsstsAtoms } from './CsstsAtoms'",
    "import type { CsstsRuntime } from './runtime'",
    '',
    'declare global {',
    '  /** CssTs runtime */',
    '  const cssts: CsstsRuntime',
    '',
  ]

  // 按属性分组
  const grouped = new Map<string, AtomDefinition[]>()
  for (const atom of atoms) {
    const group = atom.property
    if (!grouped.has(group)) {
      grouped.set(group, [])
    }
    grouped.get(group)!.push(atom)
  }

  // 生成每个分组
  for (const [property, groupAtoms] of grouped) {
    lines.push(`  // ==================== ${property} ====================`)
    for (const atom of groupAtoms) {
      lines.push(`  const ${atom.name}: CsstsAtoms['${atom.name}']`)
    }
    lines.push('')
  }

  lines.push('}')
  lines.push('')
  lines.push('export {}')

  return lines.join('\n')
}

/**
 * 生成 runtime.d.ts 内容
 */
export function generateRuntimeDts(): string {
  return `/**
 * CssTs Runtime Type Definitions
 */

/** Style object - a record of class names to boolean values */
export type StyleObject = Record<string, boolean>

/** CssTs Runtime Interface */
export interface CsstsRuntime {
  /**
   * Merge multiple style objects into one
   */
  $cls(...styles: (StyleObject | false | null | undefined)[]): StyleObject
  
  /**
   * Replace a CSS property value in a style object
   */
  replace(target: string | StyleObject, oldAtomOrProp: string, newAtom: string): string | StyleObject
  
  /**
   * Batch replace CSS property values
   */
  replaceAll(target: string | StyleObject, replacements: Record<string, string>): string | StyleObject
  
  /**
   * Get CSS class name from atom name
   */
  getCssClassName(atomName: string): string
  
  /**
   * Get CSS property from atom name
   */
  getCssProperty(atomName: string): string | undefined
}

export type { CsstsRuntime }
`
}

/**
 * 生成 index.d.ts 内容
 */
export function generateIndexDts(): string {
  return `/**
 * CssTs Types
 */

export type { CsstsAtoms } from './CsstsAtoms'
export type { CsstsRuntime, StyleObject } from './runtime'

import './global'
`
}
