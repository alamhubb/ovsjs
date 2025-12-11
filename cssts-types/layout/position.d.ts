/**
 * CSS position 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface PositionAtoms {
  static: StyleObject<'static'>
  fixed: StyleObject<'fixed'>
  absolute: StyleObject<'absolute'>
  relative: StyleObject<'relative'>
  sticky: StyleObject<'sticky'>
}

export interface InsetAtoms {
  inset0: StyleObject<'inset-0'>
  insetAuto: StyleObject<'inset-auto'>
  insetX0: StyleObject<'inset-x-0'>
  insetY0: StyleObject<'inset-y-0'>
  top0: StyleObject<'top-0'>
  top1: StyleObject<'top-1'>
  top2: StyleObject<'top-2'>
  top4: StyleObject<'top-4'>
  topAuto: StyleObject<'top-auto'>
  topFull: StyleObject<'top-full'>
  right0: StyleObject<'right-0'>
  right1: StyleObject<'right-1'>
  right2: StyleObject<'right-2'>
  right4: StyleObject<'right-4'>
  rightAuto: StyleObject<'right-auto'>
  rightFull: StyleObject<'right-full'>
  bottom0: StyleObject<'bottom-0'>
  bottom1: StyleObject<'bottom-1'>
  bottom2: StyleObject<'bottom-2'>
  bottom4: StyleObject<'bottom-4'>
  bottomAuto: StyleObject<'bottom-auto'>
  bottomFull: StyleObject<'bottom-full'>
  left0: StyleObject<'left-0'>
  left1: StyleObject<'left-1'>
  left2: StyleObject<'left-2'>
  left4: StyleObject<'left-4'>
  leftAuto: StyleObject<'left-auto'>
  leftFull: StyleObject<'left-full'>
}
