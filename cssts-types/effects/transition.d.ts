/**
 * CSS transition 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface TransitionAtoms {
  transition: StyleObject<'transition'>
  transitionNone: StyleObject<'transition-none'>
  transitionAll: StyleObject<'transition-all'>
  transitionColors: StyleObject<'transition-colors'>
  transitionOpacity: StyleObject<'transition-opacity'>
  transitionShadow: StyleObject<'transition-shadow'>
  transitionTransform: StyleObject<'transition-transform'>
}

export interface TransitionDurationAtoms {
  duration75: StyleObject<'duration-75'>
  duration100: StyleObject<'duration-100'>
  duration150: StyleObject<'duration-150'>
  duration200: StyleObject<'duration-200'>
  duration300: StyleObject<'duration-300'>
  duration500: StyleObject<'duration-500'>
  duration700: StyleObject<'duration-700'>
  duration1000: StyleObject<'duration-1000'>
  
  // 语义化
  transitionFast: StyleObject<'transition-fast'>
  transitionSlow: StyleObject<'transition-slow'>
}

export interface TransitionTimingAtoms {
  easeLinear: StyleObject<'ease-linear'>
  easeIn: StyleObject<'ease-in'>
  easeOut: StyleObject<'ease-out'>
  easeInOut: StyleObject<'ease-in-out'>
}

export interface TransitionDelayAtoms {
  delay75: StyleObject<'delay-75'>
  delay100: StyleObject<'delay-100'>
  delay150: StyleObject<'delay-150'>
  delay200: StyleObject<'delay-200'>
  delay300: StyleObject<'delay-300'>
  delay500: StyleObject<'delay-500'>
  delay700: StyleObject<'delay-700'>
  delay1000: StyleObject<'delay-1000'>
}
