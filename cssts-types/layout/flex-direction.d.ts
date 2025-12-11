/**
 * CSS flex-direction 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface FlexDirectionAtoms {
  flexRow: StyleObject<'flex-row'>
  flexRowReverse: StyleObject<'flex-row-reverse'>
  flexCol: StyleObject<'flex-col'>
  flexColReverse: StyleObject<'flex-col-reverse'>
}
