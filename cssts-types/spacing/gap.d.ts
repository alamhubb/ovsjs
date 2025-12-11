/**
 * CSS gap 属性原子类 (flex/grid)
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface GapAtoms {
  gap0: StyleObject<'gap-0'>
  gap1: StyleObject<'gap-1'>
  gap2: StyleObject<'gap-2'>
  gap4: StyleObject<'gap-4'>
  gap6: StyleObject<'gap-6'>
  gap8: StyleObject<'gap-8'>
  gap10: StyleObject<'gap-10'>
  gap12: StyleObject<'gap-12'>
  gap16: StyleObject<'gap-16'>
  gap20: StyleObject<'gap-20'>
  gap24: StyleObject<'gap-24'>
  gap32: StyleObject<'gap-32'>
  
  gapXs: StyleObject<'gap-xs'>
  gapSm: StyleObject<'gap-sm'>
  gapMd: StyleObject<'gap-md'>
  gapLg: StyleObject<'gap-lg'>
  gapXl: StyleObject<'gap-xl'>
}

export interface GapXAtoms {
  gapX0: StyleObject<'gap-x-0'>
  gapX1: StyleObject<'gap-x-1'>
  gapX2: StyleObject<'gap-x-2'>
  gapX4: StyleObject<'gap-x-4'>
  gapX8: StyleObject<'gap-x-8'>
  gapX12: StyleObject<'gap-x-12'>
  gapX16: StyleObject<'gap-x-16'>
  gapX24: StyleObject<'gap-x-24'>
  
  gapXXs: StyleObject<'gap-x-xs'>
  gapXSm: StyleObject<'gap-x-sm'>
  gapXMd: StyleObject<'gap-x-md'>
  gapXLg: StyleObject<'gap-x-lg'>
  gapXXl: StyleObject<'gap-x-xl'>
}

export interface GapYAtoms {
  gapY0: StyleObject<'gap-y-0'>
  gapY1: StyleObject<'gap-y-1'>
  gapY2: StyleObject<'gap-y-2'>
  gapY4: StyleObject<'gap-y-4'>
  gapY8: StyleObject<'gap-y-8'>
  gapY12: StyleObject<'gap-y-12'>
  gapY16: StyleObject<'gap-y-16'>
  gapY24: StyleObject<'gap-y-24'>
  
  gapYXs: StyleObject<'gap-y-xs'>
  gapYSm: StyleObject<'gap-y-sm'>
  gapYMd: StyleObject<'gap-y-md'>
  gapYLg: StyleObject<'gap-y-lg'>
  gapYXl: StyleObject<'gap-y-xl'>
}
