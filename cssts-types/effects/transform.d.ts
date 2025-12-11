/**
 * CSS transform 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface TransformAtoms {
  transformNone: StyleObject<'transform-none'>
  transformGpu: StyleObject<'transform-gpu'>
  transformCpu: StyleObject<'transform-cpu'>
}

export interface ScaleAtoms {
  scale0: StyleObject<'scale-0'>
  scale50: StyleObject<'scale-50'>
  scale75: StyleObject<'scale-75'>
  scale90: StyleObject<'scale-90'>
  scale95: StyleObject<'scale-95'>
  scale100: StyleObject<'scale-100'>
  scale105: StyleObject<'scale-105'>
  scale110: StyleObject<'scale-110'>
  scale125: StyleObject<'scale-125'>
  scale150: StyleObject<'scale-150'>
}

export interface RotateAtoms {
  rotate0: StyleObject<'rotate-0'>
  rotate1: StyleObject<'rotate-1'>
  rotate2: StyleObject<'rotate-2'>
  rotate3: StyleObject<'rotate-3'>
  rotate6: StyleObject<'rotate-6'>
  rotate12: StyleObject<'rotate-12'>
  rotate45: StyleObject<'rotate-45'>
  rotate90: StyleObject<'rotate-90'>
  rotate180: StyleObject<'rotate-180'>
}

export interface TranslateAtoms {
  translateX0: StyleObject<'translate-x-0'>
  translateX1: StyleObject<'translate-x-1'>
  translateX2: StyleObject<'translate-x-2'>
  translateX4: StyleObject<'translate-x-4'>
  translateX8: StyleObject<'translate-x-8'>
  translateXFull: StyleObject<'translate-x-full'>
  translateXHalf: StyleObject<'translate-x-half'>
  
  translateY0: StyleObject<'translate-y-0'>
  translateY1: StyleObject<'translate-y-1'>
  translateY2: StyleObject<'translate-y-2'>
  translateY4: StyleObject<'translate-y-4'>
  translateY8: StyleObject<'translate-y-8'>
  translateYFull: StyleObject<'translate-y-full'>
  translateYHalf: StyleObject<'translate-y-half'>
}

export interface TransformOriginAtoms {
  originCenter: StyleObject<'origin-center'>
  originTop: StyleObject<'origin-top'>
  originTopRight: StyleObject<'origin-top-right'>
  originRight: StyleObject<'origin-right'>
  originBottomRight: StyleObject<'origin-bottom-right'>
  originBottom: StyleObject<'origin-bottom'>
  originBottomLeft: StyleObject<'origin-bottom-left'>
  originLeft: StyleObject<'origin-left'>
  originTopLeft: StyleObject<'origin-top-left'>
}
