/**
 * CSS border-radius 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface BorderRadiusAtoms {
  // 数值圆角 (px)
  borderRadius0: StyleObject<'border-radius-0'>
  borderRadius2: StyleObject<'border-radius-2'>
  borderRadius4: StyleObject<'border-radius-4'>
  borderRadius6: StyleObject<'border-radius-6'>
  borderRadius8: StyleObject<'border-radius-8'>
  borderRadius10: StyleObject<'border-radius-10'>
  borderRadius12: StyleObject<'border-radius-12'>
  borderRadius14: StyleObject<'border-radius-14'>
  borderRadius16: StyleObject<'border-radius-16'>
  borderRadius20: StyleObject<'border-radius-20'>
  borderRadius24: StyleObject<'border-radius-24'>
  borderRadius32: StyleObject<'border-radius-32'>
  borderRadiusFull: StyleObject<'border-radius-full'>
  
  // 语义化圆角
  roundedNone: StyleObject<'rounded-none'>
  roundedSm: StyleObject<'rounded-sm'>
  rounded: StyleObject<'rounded'>
  roundedMd: StyleObject<'rounded-md'>
  roundedLg: StyleObject<'rounded-lg'>
  roundedXl: StyleObject<'rounded-xl'>
  rounded2xl: StyleObject<'rounded-2xl'>
  rounded3xl: StyleObject<'rounded-3xl'>
  roundedFull: StyleObject<'rounded-full'>
}

export interface BorderRadiusSideAtoms {
  // 顶部圆角
  roundedTNone: StyleObject<'rounded-t-none'>
  roundedTSm: StyleObject<'rounded-t-sm'>
  roundedT: StyleObject<'rounded-t'>
  roundedTMd: StyleObject<'rounded-t-md'>
  roundedTLg: StyleObject<'rounded-t-lg'>
  roundedTXl: StyleObject<'rounded-t-xl'>
  roundedTFull: StyleObject<'rounded-t-full'>
  
  // 底部圆角
  roundedBNone: StyleObject<'rounded-b-none'>
  roundedBSm: StyleObject<'rounded-b-sm'>
  roundedB: StyleObject<'rounded-b'>
  roundedBMd: StyleObject<'rounded-b-md'>
  roundedBLg: StyleObject<'rounded-b-lg'>
  roundedBXl: StyleObject<'rounded-b-xl'>
  roundedBFull: StyleObject<'rounded-b-full'>
  
  // 左侧圆角
  roundedLNone: StyleObject<'rounded-l-none'>
  roundedLSm: StyleObject<'rounded-l-sm'>
  roundedL: StyleObject<'rounded-l'>
  roundedLMd: StyleObject<'rounded-l-md'>
  roundedLLg: StyleObject<'rounded-l-lg'>
  roundedLXl: StyleObject<'rounded-l-xl'>
  roundedLFull: StyleObject<'rounded-l-full'>
  
  // 右侧圆角
  roundedRNone: StyleObject<'rounded-r-none'>
  roundedRSm: StyleObject<'rounded-r-sm'>
  roundedR: StyleObject<'rounded-r'>
  roundedRMd: StyleObject<'rounded-r-md'>
  roundedRLg: StyleObject<'rounded-r-lg'>
  roundedRXl: StyleObject<'rounded-r-xl'>
  roundedRFull: StyleObject<'rounded-r-full'>
}
