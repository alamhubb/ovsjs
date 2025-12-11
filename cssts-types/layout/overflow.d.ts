/**
 * CSS overflow 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface OverflowAtoms {
  overflowAuto: StyleObject<'overflow-auto'>
  overflowHidden: StyleObject<'overflow-hidden'>
  overflowVisible: StyleObject<'overflow-visible'>
  overflowScroll: StyleObject<'overflow-scroll'>
  overflowClip: StyleObject<'overflow-clip'>
  
  overflowXAuto: StyleObject<'overflow-x-auto'>
  overflowXHidden: StyleObject<'overflow-x-hidden'>
  overflowXVisible: StyleObject<'overflow-x-visible'>
  overflowXScroll: StyleObject<'overflow-x-scroll'>
  overflowXClip: StyleObject<'overflow-x-clip'>
  
  overflowYAuto: StyleObject<'overflow-y-auto'>
  overflowYHidden: StyleObject<'overflow-y-hidden'>
  overflowYVisible: StyleObject<'overflow-y-visible'>
  overflowYScroll: StyleObject<'overflow-y-scroll'>
  overflowYClip: StyleObject<'overflow-y-clip'>
}
