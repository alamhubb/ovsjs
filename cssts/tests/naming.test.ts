/**
 * 运行时命名转换测试
 *
 * 验证运行时的反推逻辑与生成器的正向生成保持一致
 */
import { describe, test, expect } from 'vitest'
import { getCssProperty, getCssClassName } from '../src/runtime/index'

/**
 * 测试样本 - 从生成器输出中挑选的典型案例
 *
 * 覆盖场景：
 * - 基础关键字值 (flex, center, auto)
 * - 带单位数值 (16px, 1rem)
 * - 百分比 (50%)
 * - 小数 (1.5, 0.25)
 * - 负数 (-1, -100px)
 * - 复合属性名 (padding-top, z-index, line-height)
 */
const samples = [
  // 基础关键字
  { tsName: 'displayFlex', expectedProperty: 'display', expectedClassName: 'display_flex' },
  { tsName: 'displayBlock', expectedProperty: 'display', expectedClassName: 'display_block' },
  { tsName: 'displayNone', expectedProperty: 'display', expectedClassName: 'display_none' },
  { tsName: 'positionRelative', expectedProperty: 'position', expectedClassName: 'position_relative' },
  { tsName: 'positionAbsolute', expectedProperty: 'position', expectedClassName: 'position_absolute' },

  // Flex 相关
  { tsName: 'justifyContentCenter', expectedProperty: 'justify-content', expectedClassName: 'justify-content_center' },
  { tsName: 'alignItemsFlexStart', expectedProperty: 'align-items', expectedClassName: 'align-items_flex-start' },
  { tsName: 'flexDirectionColumn', expectedProperty: 'flex-direction', expectedClassName: 'flex-direction_column' },

  // 带单位数值
  { tsName: 'width100px', expectedProperty: 'width', expectedClassName: 'width_100px' },
  { tsName: 'height200px', expectedProperty: 'height', expectedClassName: 'height_200px' },
  { tsName: 'paddingTop16px', expectedProperty: 'padding-top', expectedClassName: 'padding-top_16px' },
  { tsName: 'marginBottom8px', expectedProperty: 'margin-bottom', expectedClassName: 'margin-bottom_8px' },
  { tsName: 'fontSize14px', expectedProperty: 'font-size', expectedClassName: 'font-size_14px' },

  // rem 单位
  { tsName: 'padding1rem', expectedProperty: 'padding', expectedClassName: 'padding_1rem' },
  { tsName: 'gap0p5rem', expectedProperty: 'gap', expectedClassName: 'gap_0\\.5rem' },

  // 百分比 (pct → %)
  { tsName: 'width50pct', expectedProperty: 'width', expectedClassName: 'width_50\\%' },
  { tsName: 'width100pct', expectedProperty: 'width', expectedClassName: 'width_100\\%' },
  { tsName: 'height33p33pct', expectedProperty: 'height', expectedClassName: 'height_33\\.33\\%' },

  // 小数 (p → .)
  { tsName: 'lineHeight1p5', expectedProperty: 'line-height', expectedClassName: 'line-height_1\\.5' },
  { tsName: 'opacity0p5', expectedProperty: 'opacity', expectedClassName: 'opacity_0\\.5' },
  { tsName: 'opacity0p25', expectedProperty: 'opacity', expectedClassName: 'opacity_0\\.25' },

  // 负数 (N → -)
  { tsName: 'zIndexN1', expectedProperty: 'z-index', expectedClassName: 'z-index_-1' },
  { tsName: 'marginTopN10px', expectedProperty: 'margin-top', expectedClassName: 'margin-top_-10px' },
  { tsName: 'translateN100px', expectedProperty: 'translate', expectedClassName: 'translate_-100px' },

  // 零值
  { tsName: 'margin0', expectedProperty: 'margin', expectedClassName: 'margin_0' },
  { tsName: 'padding0', expectedProperty: 'padding', expectedClassName: 'padding_0' },

  // 复合属性名
  { tsName: 'borderRadius8px', expectedProperty: 'border-radius', expectedClassName: 'border-radius_8px' },
  { tsName: 'boxSizingBorderBox', expectedProperty: 'box-sizing', expectedClassName: 'box-sizing_border-box' },
  { tsName: 'textAlignCenter', expectedProperty: 'text-align', expectedClassName: 'text-align_center' },
  { tsName: 'fontWeightBold', expectedProperty: 'font-weight', expectedClassName: 'font-weight_bold' },
  { tsName: 'fontWeight700', expectedProperty: 'font-weight', expectedClassName: 'font-weight_700' },

  // 特殊关键字
  { tsName: 'cursorPointer', expectedProperty: 'cursor', expectedClassName: 'cursor_pointer' },
  { tsName: 'overflowHidden', expectedProperty: 'overflow', expectedClassName: 'overflow_hidden' },
  { tsName: 'visibilityHidden', expectedProperty: 'visibility', expectedClassName: 'visibility_hidden' },
]

describe('运行时命名转换', () => {
  describe('getCssProperty - 从 TS 属性名解析 CSS 属性', () => {
    for (const { tsName, expectedProperty } of samples) {
      test(`${tsName} → ${expectedProperty}`, () => {
        expect(getCssProperty(tsName)).toBe(expectedProperty)
      })
    }
  })

  describe('getCssClassName - 从 TS 属性名生成 CSS 类名', () => {
    for (const { tsName, expectedClassName } of samples) {
      test(`${tsName} → ${expectedClassName}`, () => {
        expect(getCssClassName(tsName)).toBe(expectedClassName)
      })
    }
  })
})
