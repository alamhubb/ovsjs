/**
 * 交互状态原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface InteractiveStateAtoms {
  // 禁用状态
  disabled: StyleObject<'is-disabled'>
  isDisabled: StyleObject<'is-disabled'>
  
  // 加载状态
  loading: StyleObject<'is-loading'>
  isLoading: StyleObject<'is-loading'>
  
  // 激活状态
  active: StyleObject<'is-active'>
  isActive: StyleObject<'is-active'>
  
  // 聚焦状态 (Note: 'focus' conflicts with global focus() function)
  isFocus: StyleObject<'is-focus'>
  
  // 悬停状态
  hover: StyleObject<'is-hover'>
  isHover: StyleObject<'is-hover'>
  
  // 选中状态
  selected: StyleObject<'is-selected'>
  isSelected: StyleObject<'is-selected'>
  
  // 勾选状态
  checked: StyleObject<'is-checked'>
  isChecked: StyleObject<'is-checked'>
  
  // 半选状态
  indeterminate: StyleObject<'is-indeterminate'>
  isIndeterminate: StyleObject<'is-indeterminate'>
  
  // 只读状态
  readonly: StyleObject<'is-readonly'>
  isReadonly: StyleObject<'is-readonly'>
  
  // 必填状态
  required: StyleObject<'is-required'>
  isRequired: StyleObject<'is-required'>
}
