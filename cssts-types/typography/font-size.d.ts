/**
 * CSS font-size 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface FontSizeAtoms {
  // 数值字号 (px)
  fontSize10: StyleObject<'font-size-10'>
  fontSize11: StyleObject<'font-size-11'>
  fontSize12: StyleObject<'font-size-12'>
  fontSize13: StyleObject<'font-size-13'>
  fontSize14: StyleObject<'font-size-14'>
  fontSize15: StyleObject<'font-size-15'>
  fontSize16: StyleObject<'font-size-16'>
  fontSize18: StyleObject<'font-size-18'>
  fontSize20: StyleObject<'font-size-20'>
  fontSize22: StyleObject<'font-size-22'>
  fontSize24: StyleObject<'font-size-24'>
  fontSize26: StyleObject<'font-size-26'>
  fontSize28: StyleObject<'font-size-28'>
  fontSize30: StyleObject<'font-size-30'>
  fontSize32: StyleObject<'font-size-32'>
  fontSize36: StyleObject<'font-size-36'>
  fontSize40: StyleObject<'font-size-40'>
  fontSize48: StyleObject<'font-size-48'>
  fontSize56: StyleObject<'font-size-56'>
  fontSize64: StyleObject<'font-size-64'>
  
  // 语义化字号
  fontSizeXs: StyleObject<'font-size-xs'>
  fontSizeSm: StyleObject<'font-size-sm'>
  fontSizeBase: StyleObject<'font-size-base'>
  fontSizeMd: StyleObject<'font-size-md'>
  fontSizeLg: StyleObject<'font-size-lg'>
  fontSizeXl: StyleObject<'font-size-xl'>
  fontSize2xl: StyleObject<'font-size-2xl'>
  fontSize3xl: StyleObject<'font-size-3xl'>
  fontSize4xl: StyleObject<'font-size-4xl'>
}
