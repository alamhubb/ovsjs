/**
 * Element Plus 主题背景颜色
 * 语义化颜色 - bgPrimary, bgSuccess 等
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface ThemeBackgroundColorAtoms {
  // Primary 主色背景
  bgPrimary: StyleObject<'bg-primary'>
  bgPrimaryLight3: StyleObject<'bg-primary-light-3'>
  bgPrimaryLight5: StyleObject<'bg-primary-light-5'>
  bgPrimaryLight9: StyleObject<'bg-primary-light-9'>
  bgPrimaryDark2: StyleObject<'bg-primary-dark-2'>
  
  // Success 成功色背景
  bgSuccess: StyleObject<'bg-success'>
  bgSuccessLight9: StyleObject<'bg-success-light-9'>
  bgSuccessDark2: StyleObject<'bg-success-dark-2'>
  
  // Warning 警告色背景
  bgWarning: StyleObject<'bg-warning'>
  bgWarningLight9: StyleObject<'bg-warning-light-9'>
  bgWarningDark2: StyleObject<'bg-warning-dark-2'>
  
  // Danger 危险色背景
  bgDanger: StyleObject<'bg-danger'>
  bgDangerLight9: StyleObject<'bg-danger-light-9'>
  bgDangerDark2: StyleObject<'bg-danger-dark-2'>
  
  // Info 信息色背景
  bgInfo: StyleObject<'bg-info'>
  bgInfoLight9: StyleObject<'bg-info-light-9'>
  bgInfoDark2: StyleObject<'bg-info-dark-2'>
}

export interface ThemeBackgroundUtilityAtoms {
  // 背景工具类
  bgLight: StyleObject<'bg-light'>
  bgDark: StyleObject<'bg-dark'>
  bgPage: StyleObject<'bg-page'>
  bgBase: StyleObject<'bg-base'>
  bgOverlay: StyleObject<'bg-overlay'>
}

export interface ThemeFillAtoms {
  // 填充颜色
  fillBase: StyleObject<'fill-base'>
  fillLight: StyleObject<'fill-light'>
  fillLighter: StyleObject<'fill-lighter'>
  fillExtraLight: StyleObject<'fill-extra-light'>
  fillDark: StyleObject<'fill-dark'>
  fillBlank: StyleObject<'fill-blank'>
}
