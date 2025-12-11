/**
 * CSS opacity 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface OpacityAtoms {
  opacity0: StyleObject<'opacity-0'>
  opacity5: StyleObject<'opacity-5'>
  opacity10: StyleObject<'opacity-10'>
  opacity15: StyleObject<'opacity-15'>
  opacity20: StyleObject<'opacity-20'>
  opacity25: StyleObject<'opacity-25'>
  opacity30: StyleObject<'opacity-30'>
  opacity35: StyleObject<'opacity-35'>
  opacity40: StyleObject<'opacity-40'>
  opacity45: StyleObject<'opacity-45'>
  opacity50: StyleObject<'opacity-50'>
  opacity55: StyleObject<'opacity-55'>
  opacity60: StyleObject<'opacity-60'>
  opacity65: StyleObject<'opacity-65'>
  opacity70: StyleObject<'opacity-70'>
  opacity75: StyleObject<'opacity-75'>
  opacity80: StyleObject<'opacity-80'>
  opacity85: StyleObject<'opacity-85'>
  opacity90: StyleObject<'opacity-90'>
  opacity95: StyleObject<'opacity-95'>
  opacity100: StyleObject<'opacity-100'>
}
