/**
 * Element Plus 主题边框颜色
 * 语义化颜色 - borderPrimary, borderSuccess 等
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface ThemeBorderColorAtoms {
  // 主题边框色
  borderPrimary: StyleObject<'border-primary'>
  borderPrimaryLight: StyleObject<'border-primary-light'>
  borderSuccess: StyleObject<'border-success'>
  borderWarning: StyleObject<'border-warning'>
  borderDanger: StyleObject<'border-danger'>
  borderInfo: StyleObject<'border-info'>
  
  // 层级边框色
  borderBase: StyleObject<'border-base'>
  borderLight: StyleObject<'border-light'>
  borderLighter: StyleObject<'border-lighter'>
  borderExtraLight: StyleObject<'border-extra-light'>
  borderDark: StyleObject<'border-dark'>
}
