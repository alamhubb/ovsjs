/**
 * CSS vertical-align 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface VerticalAlignAtoms {
  alignBaseline: StyleObject<'align-baseline'>
  alignTop: StyleObject<'align-top'>
  alignMiddle: StyleObject<'align-middle'>
  alignBottom: StyleObject<'align-bottom'>
  alignTextTop: StyleObject<'align-text-top'>
  alignTextBottom: StyleObject<'align-text-bottom'>
  alignSub: StyleObject<'align-sub'>
  alignSuper: StyleObject<'align-super'>
}
