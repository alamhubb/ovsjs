/**
 * CSS margin 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface MarginAtoms {
  // 数值 margin (px)
  margin0: StyleObject<'margin-0'>
  margin1: StyleObject<'margin-1'>
  margin2: StyleObject<'margin-2'>
  margin3: StyleObject<'margin-3'>
  margin4: StyleObject<'margin-4'>
  margin5: StyleObject<'margin-5'>
  margin6: StyleObject<'margin-6'>
  margin8: StyleObject<'margin-8'>
  margin10: StyleObject<'margin-10'>
  margin12: StyleObject<'margin-12'>
  margin14: StyleObject<'margin-14'>
  margin16: StyleObject<'margin-16'>
  margin20: StyleObject<'margin-20'>
  margin24: StyleObject<'margin-24'>
  margin28: StyleObject<'margin-28'>
  margin32: StyleObject<'margin-32'>
  margin40: StyleObject<'margin-40'>
  margin48: StyleObject<'margin-48'>
  marginAuto: StyleObject<'margin-auto'>
  
  // 语义化 margin
  marginXs: StyleObject<'margin-xs'>
  marginSm: StyleObject<'margin-sm'>
  marginMd: StyleObject<'margin-md'>
  marginLg: StyleObject<'margin-lg'>
  marginXl: StyleObject<'margin-xl'>
  margin2xl: StyleObject<'margin-2xl'>
}

export interface MarginXAtoms {
  marginX0: StyleObject<'margin-x-0'>
  marginX1: StyleObject<'margin-x-1'>
  marginX2: StyleObject<'margin-x-2'>
  marginX4: StyleObject<'margin-x-4'>
  marginX8: StyleObject<'margin-x-8'>
  marginX12: StyleObject<'margin-x-12'>
  marginX16: StyleObject<'margin-x-16'>
  marginX20: StyleObject<'margin-x-20'>
  marginX24: StyleObject<'margin-x-24'>
  marginX32: StyleObject<'margin-x-32'>
  marginXAuto: StyleObject<'margin-x-auto'>
  
  marginXXs: StyleObject<'margin-x-xs'>
  marginXSm: StyleObject<'margin-x-sm'>
  marginXMd: StyleObject<'margin-x-md'>
  marginXLg: StyleObject<'margin-x-lg'>
  marginXXl: StyleObject<'margin-x-xl'>
}

export interface MarginYAtoms {
  marginY0: StyleObject<'margin-y-0'>
  marginY1: StyleObject<'margin-y-1'>
  marginY2: StyleObject<'margin-y-2'>
  marginY4: StyleObject<'margin-y-4'>
  marginY8: StyleObject<'margin-y-8'>
  marginY12: StyleObject<'margin-y-12'>
  marginY16: StyleObject<'margin-y-16'>
  marginY20: StyleObject<'margin-y-20'>
  marginY24: StyleObject<'margin-y-24'>
  marginY32: StyleObject<'margin-y-32'>
  marginYAuto: StyleObject<'margin-y-auto'>
  
  marginYXs: StyleObject<'margin-y-xs'>
  marginYSm: StyleObject<'margin-y-sm'>
  marginYMd: StyleObject<'margin-y-md'>
  marginYLg: StyleObject<'margin-y-lg'>
  marginYXl: StyleObject<'margin-y-xl'>
}

export interface MarginSideAtoms {
  marginT0: StyleObject<'margin-t-0'>
  marginT4: StyleObject<'margin-t-4'>
  marginT8: StyleObject<'margin-t-8'>
  marginT16: StyleObject<'margin-t-16'>
  marginTAuto: StyleObject<'margin-t-auto'>
  
  marginR0: StyleObject<'margin-r-0'>
  marginR4: StyleObject<'margin-r-4'>
  marginR8: StyleObject<'margin-r-8'>
  marginR16: StyleObject<'margin-r-16'>
  marginRAuto: StyleObject<'margin-r-auto'>
  
  marginB0: StyleObject<'margin-b-0'>
  marginB4: StyleObject<'margin-b-4'>
  marginB8: StyleObject<'margin-b-8'>
  marginB16: StyleObject<'margin-b-16'>
  marginBAuto: StyleObject<'margin-b-auto'>
  
  marginL0: StyleObject<'margin-l-0'>
  marginL4: StyleObject<'margin-l-4'>
  marginL8: StyleObject<'margin-l-8'>
  marginL16: StyleObject<'margin-l-16'>
  marginLAuto: StyleObject<'margin-l-auto'>
}
