/**
 * CSS z-index 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface ZIndexAtoms {
  z0: StyleObject<'z-0'>
  z10: StyleObject<'z-10'>
  z20: StyleObject<'z-20'>
  z30: StyleObject<'z-30'>
  z40: StyleObject<'z-40'>
  z50: StyleObject<'z-50'>
  z100: StyleObject<'z-100'>
  z200: StyleObject<'z-200'>
  z500: StyleObject<'z-500'>
  z1000: StyleObject<'z-1000'>
  z2000: StyleObject<'z-2000'>
  zAuto: StyleObject<'z-auto'>
  zNegative: StyleObject<'z-negative'>
}
