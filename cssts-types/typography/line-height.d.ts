/**
 * CSS line-height 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface LineHeightAtoms {
  // 数值行高 (px)
  lineHeight12: StyleObject<'line-height-12'>
  lineHeight14: StyleObject<'line-height-14'>
  lineHeight16: StyleObject<'line-height-16'>
  lineHeight18: StyleObject<'line-height-18'>
  lineHeight20: StyleObject<'line-height-20'>
  lineHeight22: StyleObject<'line-height-22'>
  lineHeight24: StyleObject<'line-height-24'>
  lineHeight28: StyleObject<'line-height-28'>
  lineHeight32: StyleObject<'line-height-32'>
  lineHeight36: StyleObject<'line-height-36'>
  lineHeight40: StyleObject<'line-height-40'>
  lineHeight48: StyleObject<'line-height-48'>
  
  // 倍数行高
  lineHeightNone: StyleObject<'line-height-none'>
  lineHeightTight: StyleObject<'line-height-tight'>
  lineHeightSnug: StyleObject<'line-height-snug'>
  lineHeightNormal: StyleObject<'line-height-normal'>
  lineHeightRelaxed: StyleObject<'line-height-relaxed'>
  lineHeightLoose: StyleObject<'line-height-loose'>
}
