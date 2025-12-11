/**
 * CSS padding 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface PaddingAtoms {
  // 数值 padding (px)
  padding0: StyleObject<'padding-0'>
  padding1: StyleObject<'padding-1'>
  padding2: StyleObject<'padding-2'>
  padding3: StyleObject<'padding-3'>
  padding4: StyleObject<'padding-4'>
  padding5: StyleObject<'padding-5'>
  padding6: StyleObject<'padding-6'>
  padding8: StyleObject<'padding-8'>
  padding10: StyleObject<'padding-10'>
  padding12: StyleObject<'padding-12'>
  padding14: StyleObject<'padding-14'>
  padding16: StyleObject<'padding-16'>
  padding20: StyleObject<'padding-20'>
  padding24: StyleObject<'padding-24'>
  padding28: StyleObject<'padding-28'>
  padding32: StyleObject<'padding-32'>
  padding40: StyleObject<'padding-40'>
  padding48: StyleObject<'padding-48'>
  padding56: StyleObject<'padding-56'>
  padding64: StyleObject<'padding-64'>
  
  // 语义化 padding
  paddingXs: StyleObject<'padding-xs'>
  paddingSm: StyleObject<'padding-sm'>
  paddingMd: StyleObject<'padding-md'>
  paddingLg: StyleObject<'padding-lg'>
  paddingXl: StyleObject<'padding-xl'>
  padding2xl: StyleObject<'padding-2xl'>
}

export interface PaddingXAtoms {
  paddingX0: StyleObject<'padding-x-0'>
  paddingX1: StyleObject<'padding-x-1'>
  paddingX2: StyleObject<'padding-x-2'>
  paddingX4: StyleObject<'padding-x-4'>
  paddingX8: StyleObject<'padding-x-8'>
  paddingX12: StyleObject<'padding-x-12'>
  paddingX16: StyleObject<'padding-x-16'>
  paddingX20: StyleObject<'padding-x-20'>
  paddingX24: StyleObject<'padding-x-24'>
  paddingX32: StyleObject<'padding-x-32'>
  
  paddingXXs: StyleObject<'padding-x-xs'>
  paddingXSm: StyleObject<'padding-x-sm'>
  paddingXMd: StyleObject<'padding-x-md'>
  paddingXLg: StyleObject<'padding-x-lg'>
  paddingXXl: StyleObject<'padding-x-xl'>
}

export interface PaddingYAtoms {
  paddingY0: StyleObject<'padding-y-0'>
  paddingY1: StyleObject<'padding-y-1'>
  paddingY2: StyleObject<'padding-y-2'>
  paddingY4: StyleObject<'padding-y-4'>
  paddingY8: StyleObject<'padding-y-8'>
  paddingY12: StyleObject<'padding-y-12'>
  paddingY16: StyleObject<'padding-y-16'>
  paddingY20: StyleObject<'padding-y-20'>
  paddingY24: StyleObject<'padding-y-24'>
  paddingY32: StyleObject<'padding-y-32'>
  
  paddingYXs: StyleObject<'padding-y-xs'>
  paddingYSm: StyleObject<'padding-y-sm'>
  paddingYMd: StyleObject<'padding-y-md'>
  paddingYLg: StyleObject<'padding-y-lg'>
  paddingYXl: StyleObject<'padding-y-xl'>
}

export interface PaddingSideAtoms {
  paddingT0: StyleObject<'padding-t-0'>
  paddingT4: StyleObject<'padding-t-4'>
  paddingT8: StyleObject<'padding-t-8'>
  paddingT16: StyleObject<'padding-t-16'>
  
  paddingR0: StyleObject<'padding-r-0'>
  paddingR4: StyleObject<'padding-r-4'>
  paddingR8: StyleObject<'padding-r-8'>
  paddingR16: StyleObject<'padding-r-16'>
  
  paddingB0: StyleObject<'padding-b-0'>
  paddingB4: StyleObject<'padding-b-4'>
  paddingB8: StyleObject<'padding-b-8'>
  paddingB16: StyleObject<'padding-b-16'>
  
  paddingL0: StyleObject<'padding-l-0'>
  paddingL4: StyleObject<'padding-l-4'>
  paddingL8: StyleObject<'padding-l-8'>
  paddingL16: StyleObject<'padding-l-16'>
}
