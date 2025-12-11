/**
 * Color Atomic Styles Type Definitions
 * 
 * 基于 Element Plus 设计规范的颜色系统
 */

/** Style object type */
type StyleObject<K extends string> = { [key in K]: true }

/** Color Atoms Interface */
export interface ColorAtoms {
  // ==================== 基础文字颜色 ====================
  colorRed: StyleObject<'color-red'>
  colorGreen: StyleObject<'color-green'>
  colorBlue: StyleObject<'color-blue'>
  colorYellow: StyleObject<'color-yellow'>
  colorOrange: StyleObject<'color-orange'>
  colorPurple: StyleObject<'color-purple'>
  colorPink: StyleObject<'color-pink'>
  colorCyan: StyleObject<'color-cyan'>
  colorWhite: StyleObject<'color-white'>
  colorBlack: StyleObject<'color-black'>
  colorGray: StyleObject<'color-gray'>
  colorTransparent: StyleObject<'color-transparent'>
  colorInherit: StyleObject<'color-inherit'>
  colorCurrentColor: StyleObject<'color-current'>
  
  // ==================== Element Plus 语义文字颜色 ====================
  colorPrimary: StyleObject<'color-primary'>
  colorPrimaryLight3: StyleObject<'color-primary-light-3'>
  colorPrimaryLight5: StyleObject<'color-primary-light-5'>
  colorPrimaryLight7: StyleObject<'color-primary-light-7'>
  colorPrimaryLight8: StyleObject<'color-primary-light-8'>
  colorPrimaryLight9: StyleObject<'color-primary-light-9'>
  colorPrimaryDark2: StyleObject<'color-primary-dark-2'>
  
  colorSuccess: StyleObject<'color-success'>
  colorSuccessLight3: StyleObject<'color-success-light-3'>
  colorSuccessLight5: StyleObject<'color-success-light-5'>
  colorSuccessLight7: StyleObject<'color-success-light-7'>
  colorSuccessLight8: StyleObject<'color-success-light-8'>
  colorSuccessLight9: StyleObject<'color-success-light-9'>
  colorSuccessDark2: StyleObject<'color-success-dark-2'>
  
  colorWarning: StyleObject<'color-warning'>
  colorWarningLight3: StyleObject<'color-warning-light-3'>
  colorWarningLight5: StyleObject<'color-warning-light-5'>
  colorWarningLight7: StyleObject<'color-warning-light-7'>
  colorWarningLight8: StyleObject<'color-warning-light-8'>
  colorWarningLight9: StyleObject<'color-warning-light-9'>
  colorWarningDark2: StyleObject<'color-warning-dark-2'>
  
  colorDanger: StyleObject<'color-danger'>
  colorDangerLight3: StyleObject<'color-danger-light-3'>
  colorDangerLight5: StyleObject<'color-danger-light-5'>
  colorDangerLight7: StyleObject<'color-danger-light-7'>
  colorDangerLight8: StyleObject<'color-danger-light-8'>
  colorDangerLight9: StyleObject<'color-danger-light-9'>
  colorDangerDark2: StyleObject<'color-danger-dark-2'>
  
  colorInfo: StyleObject<'color-info'>
  colorInfoLight3: StyleObject<'color-info-light-3'>
  colorInfoLight5: StyleObject<'color-info-light-5'>
  colorInfoLight7: StyleObject<'color-info-light-7'>
  colorInfoLight8: StyleObject<'color-info-light-8'>
  colorInfoLight9: StyleObject<'color-info-light-9'>
  colorInfoDark2: StyleObject<'color-info-dark-2'>
  
  // ==================== Element Plus 文字颜色层级 ====================
  colorTextPrimary: StyleObject<'color-text-primary'>
  colorTextRegular: StyleObject<'color-text-regular'>
  colorTextSecondary: StyleObject<'color-text-secondary'>
  colorTextPlaceholder: StyleObject<'color-text-placeholder'>
  colorTextDisabled: StyleObject<'color-text-disabled'>
  
  // ==================== 背景颜色 ====================
  bgPrimary: StyleObject<'bg-primary'>
  bgPrimaryLight3: StyleObject<'bg-primary-light-3'>
  bgPrimaryLight5: StyleObject<'bg-primary-light-5'>
  bgPrimaryLight7: StyleObject<'bg-primary-light-7'>
  bgPrimaryLight8: StyleObject<'bg-primary-light-8'>
  bgPrimaryLight9: StyleObject<'bg-primary-light-9'>
  bgPrimaryDark2: StyleObject<'bg-primary-dark-2'>
  
  bgSuccess: StyleObject<'bg-success'>
  bgSuccessLight3: StyleObject<'bg-success-light-3'>
  bgSuccessLight5: StyleObject<'bg-success-light-5'>
  bgSuccessLight7: StyleObject<'bg-success-light-7'>
  bgSuccessLight8: StyleObject<'bg-success-light-8'>
  bgSuccessLight9: StyleObject<'bg-success-light-9'>
  bgSuccessDark2: StyleObject<'bg-success-dark-2'>
  
  bgWarning: StyleObject<'bg-warning'>
  bgWarningLight3: StyleObject<'bg-warning-light-3'>
  bgWarningLight5: StyleObject<'bg-warning-light-5'>
  bgWarningLight7: StyleObject<'bg-warning-light-7'>
  bgWarningLight8: StyleObject<'bg-warning-light-8'>
  bgWarningLight9: StyleObject<'bg-warning-light-9'>
  bgWarningDark2: StyleObject<'bg-warning-dark-2'>
  
  bgDanger: StyleObject<'bg-danger'>
  bgDangerLight3: StyleObject<'bg-danger-light-3'>
  bgDangerLight5: StyleObject<'bg-danger-light-5'>
  bgDangerLight7: StyleObject<'bg-danger-light-7'>
  bgDangerLight8: StyleObject<'bg-danger-light-8'>
  bgDangerLight9: StyleObject<'bg-danger-light-9'>
  bgDangerDark2: StyleObject<'bg-danger-dark-2'>
  
  bgInfo: StyleObject<'bg-info'>
  bgInfoLight3: StyleObject<'bg-info-light-3'>
  bgInfoLight5: StyleObject<'bg-info-light-5'>
  bgInfoLight7: StyleObject<'bg-info-light-7'>
  bgInfoLight8: StyleObject<'bg-info-light-8'>
  bgInfoLight9: StyleObject<'bg-info-light-9'>
  bgInfoDark2: StyleObject<'bg-info-dark-2'>
  
  bgWhite: StyleObject<'bg-white'>
  bgBlack: StyleObject<'bg-black'>
  bgGray: StyleObject<'bg-gray'>
  bgTransparent: StyleObject<'bg-transparent'>
  bgLight: StyleObject<'bg-light'>
  bgDark: StyleObject<'bg-dark'>
  
  // Element Plus 背景层级
  bgPage: StyleObject<'bg-page'>
  bgBase: StyleObject<'bg-base'>
  bgOverlay: StyleObject<'bg-overlay'>
  
  // ==================== 边框颜色 ====================
  borderPrimary: StyleObject<'border-primary'>
  borderPrimaryLight: StyleObject<'border-primary-light'>
  borderSuccess: StyleObject<'border-success'>
  borderSuccessLight: StyleObject<'border-success-light'>
  borderWarning: StyleObject<'border-warning'>
  borderWarningLight: StyleObject<'border-warning-light'>
  borderDanger: StyleObject<'border-danger'>
  borderDangerLight: StyleObject<'border-danger-light'>
  borderInfo: StyleObject<'border-info'>
  borderInfoLight: StyleObject<'border-info-light'>
  
  // Element Plus 边框层级
  borderBase: StyleObject<'border-base'>
  borderLight: StyleObject<'border-light'>
  borderLighter: StyleObject<'border-lighter'>
  borderExtraLight: StyleObject<'border-extra-light'>
  borderDark: StyleObject<'border-dark'>
  borderDarker: StyleObject<'border-darker'>
  borderTransparent: StyleObject<'border-transparent'>
  
  // ==================== 填充颜色（用于组件内部） ====================
  fillBase: StyleObject<'fill-base'>
  fillLight: StyleObject<'fill-light'>
  fillLighter: StyleObject<'fill-lighter'>
  fillExtraLight: StyleObject<'fill-extra-light'>
  fillDark: StyleObject<'fill-dark'>
  fillDarker: StyleObject<'fill-darker'>
  fillBlank: StyleObject<'fill-blank'>
}
