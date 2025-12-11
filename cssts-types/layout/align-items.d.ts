/**
 * CSS align-items 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface AlignItemsAtoms {
  itemsStart: StyleObject<'items-start'>
  itemsEnd: StyleObject<'items-end'>
  itemsCenter: StyleObject<'items-center'>
  itemsBaseline: StyleObject<'items-baseline'>
  itemsStretch: StyleObject<'items-stretch'>
}

export interface AlignSelfAtoms {
  selfAuto: StyleObject<'self-auto'>
  selfStart: StyleObject<'self-start'>
  selfEnd: StyleObject<'self-end'>
  selfCenter: StyleObject<'self-center'>
  selfStretch: StyleObject<'self-stretch'>
  selfBaseline: StyleObject<'self-baseline'>
}

export interface AlignContentAtoms {
  contentStart: StyleObject<'content-start'>
  contentEnd: StyleObject<'content-end'>
  contentCenter: StyleObject<'content-center'>
  contentBetween: StyleObject<'content-between'>
  contentAround: StyleObject<'content-around'>
  contentEvenly: StyleObject<'content-evenly'>
  contentStretch: StyleObject<'content-stretch'>
}
