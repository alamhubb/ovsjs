/**
 * Element Plus 主题文字颜色
 * 语义化颜色 - colorPrimary, colorSuccess 等
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface ThemeColorAtoms {
  // Primary 主色
  colorPrimary: StyleObject<'color-primary'>
  colorPrimaryLight3: StyleObject<'color-primary-light-3'>
  colorPrimaryLight5: StyleObject<'color-primary-light-5'>
  colorPrimaryLight7: StyleObject<'color-primary-light-7'>
  colorPrimaryLight8: StyleObject<'color-primary-light-8'>
  colorPrimaryLight9: StyleObject<'color-primary-light-9'>
  colorPrimaryDark2: StyleObject<'color-primary-dark-2'>
  
  // Success 成功色
  colorSuccess: StyleObject<'color-success'>
  colorSuccessLight3: StyleObject<'color-success-light-3'>
  colorSuccessLight5: StyleObject<'color-success-light-5'>
  colorSuccessLight9: StyleObject<'color-success-light-9'>
  colorSuccessDark2: StyleObject<'color-success-dark-2'>
  
  // Warning 警告色
  colorWarning: StyleObject<'color-warning'>
  colorWarningLight3: StyleObject<'color-warning-light-3'>
  colorWarningLight5: StyleObject<'color-warning-light-5'>
  colorWarningLight9: StyleObject<'color-warning-light-9'>
  colorWarningDark2: StyleObject<'color-warning-dark-2'>
  
  // Danger 危险色
  colorDanger: StyleObject<'color-danger'>
  colorDangerLight3: StyleObject<'color-danger-light-3'>
  colorDangerLight5: StyleObject<'color-danger-light-5'>
  colorDangerLight9: StyleObject<'color-danger-light-9'>
  colorDangerDark2: StyleObject<'color-danger-dark-2'>
  
  // Info 信息色
  colorInfo: StyleObject<'color-info'>
  colorInfoLight3: StyleObject<'color-info-light-3'>
  colorInfoLight5: StyleObject<'color-info-light-5'>
  colorInfoLight9: StyleObject<'color-info-light-9'>
  colorInfoDark2: StyleObject<'color-info-dark-2'>
}

export interface ThemeTextColorAtoms {
  // 文字颜色层级
  colorTextPrimary: StyleObject<'color-text-primary'>
  colorTextRegular: StyleObject<'color-text-regular'>
  colorTextSecondary: StyleObject<'color-text-secondary'>
  colorTextPlaceholder: StyleObject<'color-text-placeholder'>
  colorTextDisabled: StyleObject<'color-text-disabled'>
}
