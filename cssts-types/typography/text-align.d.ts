/**
 * CSS text-align 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface TextAlignAtoms {
  textLeft: StyleObject<'text-left'>
  textCenter: StyleObject<'text-center'>
  textRight: StyleObject<'text-right'>
  textJustify: StyleObject<'text-justify'>
  textStart: StyleObject<'text-start'>
  textEnd: StyleObject<'text-end'>
}
