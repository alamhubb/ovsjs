/**
 * CSS flex 相关属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface FlexWrapAtoms {
  flexWrap: StyleObject<'flex-wrap'>
  flexWrapReverse: StyleObject<'flex-wrap-reverse'>
  flexNowrap: StyleObject<'flex-nowrap'>
}

export interface FlexGrowShrinkAtoms {
  flexGrow: StyleObject<'flex-grow'>
  flexGrow0: StyleObject<'flex-grow-0'>
  flexShrink: StyleObject<'flex-shrink'>
  flexShrink0: StyleObject<'flex-shrink-0'>
}

export interface FlexAtoms {
  flex1: StyleObject<'flex-1'>
  flexAuto: StyleObject<'flex-auto'>
  flexInitial: StyleObject<'flex-initial'>
  flexNone: StyleObject<'flex-none'>
}

/** 组合工具类 */
export interface FlexUtilityAtoms {
  flexCenter: StyleObject<'flex-center'>
  flexAlignCenter: StyleObject<'flex-align-center'>
  flexJustifyCenter: StyleObject<'flex-justify-center'>
  inlineFlexCenter: StyleObject<'inline-flex-center'>
}
