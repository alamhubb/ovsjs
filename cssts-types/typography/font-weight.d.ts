/**
 * CSS font-weight 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface FontWeightAtoms {
  // 数值字重
  fontWeight100: StyleObject<'font-weight-100'>
  fontWeight200: StyleObject<'font-weight-200'>
  fontWeight300: StyleObject<'font-weight-300'>
  fontWeight400: StyleObject<'font-weight-400'>
  fontWeight500: StyleObject<'font-weight-500'>
  fontWeight600: StyleObject<'font-weight-600'>
  fontWeight700: StyleObject<'font-weight-700'>
  fontWeight800: StyleObject<'font-weight-800'>
  fontWeight900: StyleObject<'font-weight-900'>
  
  // 语义化字重
  fontThin: StyleObject<'font-thin'>
  fontExtralight: StyleObject<'font-extralight'>
  fontLight: StyleObject<'font-light'>
  fontNormal: StyleObject<'font-normal'>
  fontMedium: StyleObject<'font-medium'>
  fontSemibold: StyleObject<'font-semibold'>
  fontBold: StyleObject<'font-bold'>
  fontExtrabold: StyleObject<'font-extrabold'>
  fontBlack: StyleObject<'font-black'>
}
