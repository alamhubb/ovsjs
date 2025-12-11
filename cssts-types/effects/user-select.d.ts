/**
 * CSS user-select 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface UserSelectAtoms {
  userSelectNone: StyleObject<'user-select-none'>
  userSelectText: StyleObject<'user-select-text'>
  userSelectAll: StyleObject<'user-select-all'>
  userSelectAuto: StyleObject<'user-select-auto'>
  selectNone: StyleObject<'select-none'>
  selectText: StyleObject<'select-text'>
  selectAll: StyleObject<'select-all'>
  selectAuto: StyleObject<'select-auto'>
}
