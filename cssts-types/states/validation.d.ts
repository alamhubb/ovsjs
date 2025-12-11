/**
 * 验证状态原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface ValidationStateAtoms {
  // 错误状态
  error: StyleObject<'is-error'>
  isError: StyleObject<'is-error'>
  
  // 成功状态
  success: StyleObject<'is-success'>
  isSuccess: StyleObject<'is-success'>
  
  // 警告状态
  warning: StyleObject<'is-warning'>
  isWarning: StyleObject<'is-warning'>
  
  // 信息状态
  info: StyleObject<'is-info'>
  isInfo: StyleObject<'is-info'>
}
