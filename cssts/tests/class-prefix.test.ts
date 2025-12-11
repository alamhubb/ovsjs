/**
 * 测试 CSS 类名前缀功能
 * 
 * 验证:
 * 1. 无前缀时生成正确的类名
 * 2. 有前缀时生成正确的类名
 */

import { describe, it, expect } from 'vitest'
import { 
  camelToKebab, 
  collectAllCssClasses, 
  generateCssClsStyles,
  generateCssClsInterface
} from '../src/utils/cssUtils.ts'
import type { CssStyleInfo } from '../src/factory/CssTsCstToAst.ts'

describe('CSS Class Prefix', () => {
  
  describe('camelToKebab', () => {
    it('无前缀时正确转换', () => {
      expect(camelToKebab('colorRed')).toBe('color-red')
      expect(camelToKebab('fontBold')).toBe('font-bold')
      expect(camelToKebab('flexCenter')).toBe('flex-center')
    })
    
    it('有前缀时正确转换', () => {
      expect(camelToKebab('colorRed', 'cu-')).toBe('cu-color-red')
      expect(camelToKebab('fontBold', 'cu-')).toBe('cu-font-bold')
      expect(camelToKebab('flexCenter', 'el-')).toBe('el-flex-center')
    })
  })
  
  describe('collectAllCssClasses', () => {
    const mockStyles: Map<string, CssStyleInfo> = new Map([
      ['colorRed', { isAtomic: true, cssClassName: 'color-red', dependencies: [] }],
      ['fontBold', { isAtomic: true, cssClassName: 'font-bold', dependencies: [] }],
      ['primaryText', { isAtomic: false, cssClassName: '', dependencies: ['colorRed', 'fontBold'] }]
    ])
    
    it('无前缀 - 原子样式', () => {
      const classes = collectAllCssClasses('colorRed', mockStyles, new Set(), '')
      expect(classes).toEqual(['color-red'])
    })
    
    it('有前缀 - 原子样式', () => {
      const classes = collectAllCssClasses('colorRed', mockStyles, new Set(), 'cu-')
      expect(classes).toEqual(['cu-color-red'])
    })
    
    it('无前缀 - 组合样式', () => {
      const classes = collectAllCssClasses('primaryText', mockStyles, new Set(), '')
      expect(classes).toEqual(['color-red', 'font-bold'])
    })
    
    it('有前缀 - 组合样式', () => {
      const classes = collectAllCssClasses('primaryText', mockStyles, new Set(), 'cu-')
      expect(classes).toEqual(['cu-color-red', 'cu-font-bold'])
    })
  })
  
  describe('generateCssClsStyles', () => {
    const mockStyles: Map<string, CssStyleInfo> = new Map([
      ['colorRed', { isAtomic: true, cssClassName: 'color-red', dependencies: [] }],
      ['fontBold', { isAtomic: true, cssClassName: 'font-bold', dependencies: [] }]
    ])
    
    it('无前缀生成正确的样式对象', () => {
      const result = generateCssClsStyles(mockStyles, '')
      expect(result).toContain("colorRed: { 'color-red': true }")
      expect(result).toContain("fontBold: { 'font-bold': true }")
      expect(result).not.toContain('cu-')
    })
    
    it('有前缀生成正确的样式对象', () => {
      const result = generateCssClsStyles(mockStyles, 'cu-')
      expect(result).toContain("colorRed: { 'cu-color-red': true }")
      expect(result).toContain("fontBold: { 'cu-font-bold': true }")
    })
    
    it('el- 前缀生成正确的样式对象', () => {
      const result = generateCssClsStyles(mockStyles, 'el-')
      expect(result).toContain("colorRed: { 'el-color-red': true }")
      expect(result).toContain("fontBold: { 'el-font-bold': true }")
    })
  })
  
  describe('generateCssClsInterface', () => {
    const mockStyles: Map<string, CssStyleInfo> = new Map([
      ['colorRed', { isAtomic: true, cssClassName: 'color-red', dependencies: [] }]
    ])
    
    it('无前缀生成正确的类型定义', () => {
      const result = generateCssClsInterface(mockStyles, '')
      expect(result).toContain("readonly 'color-red': true")
      expect(result).not.toContain('cu-')
    })
    
    it('有前缀生成正确的类型定义', () => {
      const result = generateCssClsInterface(mockStyles, 'cu-')
      expect(result).toContain("readonly 'cu-color-red': true")
    })
  })
})

console.log('✅ CSS Class Prefix tests defined')
