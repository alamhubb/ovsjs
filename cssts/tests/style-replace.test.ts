/**
 * 样式冲突替换功能测试
 */
import { describe, it, expect } from 'vitest'
import { 
  getCssProperty, 
  replaceConflictingStyles, 
  registerCssPropertyMap,
  camelToKebab,
  kebabToCamel
} from '../src/utils/cssUtils'
import { cssts } from '../src/runtime/index'

describe('getCssProperty', () => {
  it('should return correct property for color atoms', () => {
    expect(getCssProperty('colorRed')).toBe('color')
    expect(getCssProperty('colorWhite')).toBe('color')
    expect(getCssProperty('colorPrimary')).toBe('color')
  })

  it('should return correct property for background atoms', () => {
    expect(getCssProperty('bgPrimary')).toBe('background-color')
    expect(getCssProperty('bgSuccess')).toBe('background-color')
    expect(getCssProperty('bgWhite')).toBe('background-color')
  })

  it('should return correct property for font-size atoms', () => {
    expect(getCssProperty('fontSize12')).toBe('font-size')
    expect(getCssProperty('fontSize14')).toBe('font-size')
    expect(getCssProperty('fontSize16')).toBe('font-size')
  })

  it('should return correct property for padding atoms', () => {
    expect(getCssProperty('paddingSm')).toBe('padding')
    expect(getCssProperty('paddingMd')).toBe('padding')
    expect(getCssProperty('paddingLg')).toBe('padding')
  })

  it('should return undefined for unknown atoms', () => {
    expect(getCssProperty('unknownAtom')).toBeUndefined()
  })
})

describe('replaceConflictingStyles', () => {
  it('should replace color with new color', () => {
    const result = replaceConflictingStyles(
      ['color-red', 'font-bold', 'padding-sm'],
      ['color-green']
    )
    expect(result).toEqual(['font-bold', 'padding-sm', 'color-green'])
    expect(result).not.toContain('color-red')
  })

  it('should replace background-color with new background-color', () => {
    const result = replaceConflictingStyles(
      ['bg-primary', 'color-white', 'rounded'],
      ['bg-success']
    )
    expect(result).toEqual(['color-white', 'rounded', 'bg-success'])
    expect(result).not.toContain('bg-primary')
  })

  it('should replace multiple conflicting styles', () => {
    const result = replaceConflictingStyles(
      ['color-red', 'bg-primary', 'font-size-14'],
      ['color-white', 'bg-success']
    )
    expect(result).toEqual(['font-size-14', 'color-white', 'bg-success'])
  })

  it('should keep non-conflicting styles', () => {
    const result = replaceConflictingStyles(
      ['color-red', 'font-bold', 'padding-sm'],
      ['bg-primary']
    )
    expect(result).toEqual(['color-red', 'font-bold', 'padding-sm', 'bg-primary'])
  })

  it('should handle empty arrays', () => {
    expect(replaceConflictingStyles([], ['color-red'])).toEqual(['color-red'])
    expect(replaceConflictingStyles(['color-red'], [])).toEqual(['color-red'])
  })
})

describe('registerCssPropertyMap', () => {
  it('should register custom property mappings', () => {
    registerCssPropertyMap({
      myCustomRed: 'color',
      myCustomBlue: 'color',
    })
    
    expect(getCssProperty('myCustomRed')).toBe('color')
    expect(getCssProperty('myCustomBlue')).toBe('color')
  })
})

describe('camelToKebab and kebabToCamel', () => {
  it('should convert camelCase to kebab-case', () => {
    expect(camelToKebab('colorRed')).toBe('color-red')
    expect(camelToKebab('fontSize14')).toBe('font-size-14')
    expect(camelToKebab('bgPrimary')).toBe('bg-primary')
  })

  it('should convert kebab-case to camelCase', () => {
    expect(kebabToCamel('color-red')).toBe('colorRed')
    expect(kebabToCamel('font-size-14')).toBe('fontSize14')
    expect(kebabToCamel('bg-primary')).toBe('bgPrimary')
  })

  it('should be reversible', () => {
    const original = 'colorRed'
    expect(kebabToCamel(camelToKebab(original))).toBe(original)
  })
})


// ==================== 运行时 cssts.replace 测试 ====================

describe('cssts.replace - 原子类替换', () => {
  it('should replace atom with same property atom', () => {
    const style = 'bg-primary color-white padding-sm'
    const result = cssts.replace(style, 'bgPrimary', 'bgSuccess')
    expect(result).toBe('color-white padding-sm bg-success')
  })

  it('should replace color atom', () => {
    const style = 'bg-primary color-white font-size-14'
    const result = cssts.replace(style, 'colorWhite', 'colorBlack')
    expect(result).toBe('bg-primary font-size-14 color-black')
  })

  it('should handle multiple replacements with replaceAll', () => {
    const style = 'bg-primary color-white padding-sm'
    const result = cssts.replaceAll(style, {
      bgPrimary: 'bgSuccess',
      colorWhite: 'colorBlack'
    })
    expect(result).toContain('bg-success')
    expect(result).toContain('color-black')
    expect(result).toContain('padding-sm')
  })
})

describe('cssts.replace - CSS 属性名替换', () => {
  it('should replace by CSS property name (color)', () => {
    const style = 'bg-primary color-white font-size-14'
    const result = cssts.replace(style, 'color', 'colorRed')
    expect(result).toBe('bg-primary font-size-14 color-red')
    expect(result).not.toContain('color-white')
  })

  it('should replace by CSS property name (background-color)', () => {
    const style = 'bg-primary color-white padding-sm'
    const result = cssts.replace(style, 'backgroundColor', 'bgSuccess')
    expect(result).toBe('color-white padding-sm bg-success')
    expect(result).not.toContain('bg-primary')
  })

  it('should replace by CSS property name (font-size)', () => {
    const style = 'color-white font-size-14 padding-sm'
    const result = cssts.replace(style, 'fontSize', 'fontSize16')
    expect(result).toBe('color-white padding-sm font-size-16')
    expect(result).not.toContain('font-size-14')
  })

  it('should add new atom if property not found in style', () => {
    const style = 'bg-primary padding-sm'
    const result = cssts.replace(style, 'color', 'colorRed')
    expect(result).toContain('bg-primary')
    expect(result).toContain('padding-sm')
    expect(result).toContain('color-red')
  })
})

describe('cssts.registerProperty', () => {
  it('should register custom property mapping', () => {
    cssts.registerProperty('myCustomAtom', 'color')
    const style = 'color-white bg-primary'
    const result = cssts.replace(style, 'colorWhite', 'myCustomAtom')
    expect(result).toContain('my-custom-atom')
  })
})
