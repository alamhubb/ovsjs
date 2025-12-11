/**
 * CSS border 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface BorderWidthAtoms {
  border: StyleObject<'border'>
  border0: StyleObject<'border-0'>
  border1: StyleObject<'border-1'>
  border2: StyleObject<'border-2'>
  border4: StyleObject<'border-4'>
  border8: StyleObject<'border-8'>
  borderNone: StyleObject<'border-none'>
  
  // 单边边框
  borderT: StyleObject<'border-t'>
  borderT0: StyleObject<'border-t-0'>
  borderT2: StyleObject<'border-t-2'>
  borderT4: StyleObject<'border-t-4'>
  
  borderR: StyleObject<'border-r'>
  borderR0: StyleObject<'border-r-0'>
  borderR2: StyleObject<'border-r-2'>
  borderR4: StyleObject<'border-r-4'>
  
  borderB: StyleObject<'border-b'>
  borderB0: StyleObject<'border-b-0'>
  borderB2: StyleObject<'border-b-2'>
  borderB4: StyleObject<'border-b-4'>
  
  borderL: StyleObject<'border-l'>
  borderL0: StyleObject<'border-l-0'>
  borderL2: StyleObject<'border-l-2'>
  borderL4: StyleObject<'border-l-4'>
  
  // X/Y 轴边框
  borderX: StyleObject<'border-x'>
  borderX0: StyleObject<'border-x-0'>
  borderX2: StyleObject<'border-x-2'>
  
  borderY: StyleObject<'border-y'>
  borderY0: StyleObject<'border-y-0'>
  borderY2: StyleObject<'border-y-2'>
}

export interface BorderStyleAtoms {
  borderSolid: StyleObject<'border-solid'>
  borderDashed: StyleObject<'border-dashed'>
  borderDotted: StyleObject<'border-dotted'>
  borderDouble: StyleObject<'border-double'>
  borderHidden: StyleObject<'border-hidden'>
  borderStyleNone: StyleObject<'border-style-none'>
}

export interface BorderCollapseAtoms {
  borderCollapse: StyleObject<'border-collapse'>
  borderSeparate: StyleObject<'border-separate'>
}
