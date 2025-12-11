/**
 * CSS visibility 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface VisibilityAtoms {
  visible: StyleObject<'visible'>
  invisible: StyleObject<'invisible'>
  collapse: StyleObject<'collapse'>
}
