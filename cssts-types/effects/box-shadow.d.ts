/**
 * CSS box-shadow 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface BoxShadowAtoms {
  shadowNone: StyleObject<'shadow-none'>
  shadowSm: StyleObject<'shadow-sm'>
  shadow: StyleObject<'shadow'>
  shadowMd: StyleObject<'shadow-md'>
  shadowLg: StyleObject<'shadow-lg'>
  shadowXl: StyleObject<'shadow-xl'>
  shadow2xl: StyleObject<'shadow-2xl'>
  shadowInner: StyleObject<'shadow-inner'>
}
