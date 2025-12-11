/**
 * CSS width 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface WidthAtoms {
  // 数值 width (px)
  width0: StyleObject<'width-0'>
  width1: StyleObject<'width-1'>
  width2: StyleObject<'width-2'>
  width4: StyleObject<'width-4'>
  width8: StyleObject<'width-8'>
  width12: StyleObject<'width-12'>
  width16: StyleObject<'width-16'>
  width20: StyleObject<'width-20'>
  width24: StyleObject<'width-24'>
  width32: StyleObject<'width-32'>
  width40: StyleObject<'width-40'>
  width48: StyleObject<'width-48'>
  width56: StyleObject<'width-56'>
  width64: StyleObject<'width-64'>
  width80: StyleObject<'width-80'>
  width96: StyleObject<'width-96'>
  width100: StyleObject<'width-100'>
  width120: StyleObject<'width-120'>
  width160: StyleObject<'width-160'>
  width200: StyleObject<'width-200'>
  width240: StyleObject<'width-240'>
  width280: StyleObject<'width-280'>
  width320: StyleObject<'width-320'>
  width400: StyleObject<'width-400'>
  width480: StyleObject<'width-480'>
  width560: StyleObject<'width-560'>
  width640: StyleObject<'width-640'>
  
  // 百分比 width
  widthFull: StyleObject<'width-full'>
  widthHalf: StyleObject<'width-half'>
  widthThird: StyleObject<'width-third'>
  widthQuarter: StyleObject<'width-quarter'>
  widthScreen: StyleObject<'width-screen'>
  widthMin: StyleObject<'width-min'>
  widthMax: StyleObject<'width-max'>
  widthFit: StyleObject<'width-fit'>
  widthAuto: StyleObject<'width-auto'>
}

export interface MinWidthAtoms {
  minWidth0: StyleObject<'min-width-0'>
  minWidthFull: StyleObject<'min-width-full'>
  minWidthMin: StyleObject<'min-width-min'>
  minWidthMax: StyleObject<'min-width-max'>
  minWidthFit: StyleObject<'min-width-fit'>
}

export interface MaxWidthAtoms {
  maxWidthNone: StyleObject<'max-width-none'>
  maxWidthFull: StyleObject<'max-width-full'>
  maxWidthMin: StyleObject<'max-width-min'>
  maxWidthMax: StyleObject<'max-width-max'>
  maxWidthFit: StyleObject<'max-width-fit'>
  maxWidthXs: StyleObject<'max-width-xs'>
  maxWidthSm: StyleObject<'max-width-sm'>
  maxWidthMd: StyleObject<'max-width-md'>
  maxWidthLg: StyleObject<'max-width-lg'>
  maxWidthXl: StyleObject<'max-width-xl'>
  maxWidth2xl: StyleObject<'max-width-2xl'>
}
