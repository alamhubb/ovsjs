/**
 * CSS justify-content 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface JustifyContentAtoms {
  justifyStart: StyleObject<'justify-start'>
  justifyEnd: StyleObject<'justify-end'>
  justifyCenter: StyleObject<'justify-center'>
  justifyBetween: StyleObject<'justify-between'>
  justifyAround: StyleObject<'justify-around'>
  justifyEvenly: StyleObject<'justify-evenly'>
  justifyStretch: StyleObject<'justify-stretch'>
  justifyNormal: StyleObject<'justify-normal'>
}
