/**
 * CSS height 属性原子类
 */

type StyleObject<K extends string> = { [key in K]: true }

export interface HeightAtoms {
  // 数值 height (px)
  height0: StyleObject<'height-0'>
  height1: StyleObject<'height-1'>
  height2: StyleObject<'height-2'>
  height4: StyleObject<'height-4'>
  height8: StyleObject<'height-8'>
  height12: StyleObject<'height-12'>
  height16: StyleObject<'height-16'>
  height20: StyleObject<'height-20'>
  height24: StyleObject<'height-24'>
  height32: StyleObject<'height-32'>
  height40: StyleObject<'height-40'>
  height48: StyleObject<'height-48'>
  height56: StyleObject<'height-56'>
  height64: StyleObject<'height-64'>
  height80: StyleObject<'height-80'>
  height96: StyleObject<'height-96'>
  height100: StyleObject<'height-100'>
  height120: StyleObject<'height-120'>
  height160: StyleObject<'height-160'>
  height200: StyleObject<'height-200'>
  height240: StyleObject<'height-240'>
  height280: StyleObject<'height-280'>
  height320: StyleObject<'height-320'>
  height400: StyleObject<'height-400'>
  height480: StyleObject<'height-480'>
  height560: StyleObject<'height-560'>
  height640: StyleObject<'height-640'>
  
  // 百分比/关键字 height
  heightFull: StyleObject<'height-full'>
  heightHalf: StyleObject<'height-half'>
  heightThird: StyleObject<'height-third'>
  heightQuarter: StyleObject<'height-quarter'>
  heightScreen: StyleObject<'height-screen'>
  heightMin: StyleObject<'height-min'>
  heightMax: StyleObject<'height-max'>
  heightFit: StyleObject<'height-fit'>
  heightAuto: StyleObject<'height-auto'>
}

export interface MinHeightAtoms {
  minHeight0: StyleObject<'min-height-0'>
  minHeightFull: StyleObject<'min-height-full'>
  minHeightScreen: StyleObject<'min-height-screen'>
  minHeightMin: StyleObject<'min-height-min'>
  minHeightMax: StyleObject<'min-height-max'>
  minHeightFit: StyleObject<'min-height-fit'>
}

export interface MaxHeightAtoms {
  maxHeightNone: StyleObject<'max-height-none'>
  maxHeightFull: StyleObject<'max-height-full'>
  maxHeightScreen: StyleObject<'max-height-screen'>
  maxHeightMin: StyleObject<'max-height-min'>
  maxHeightMax: StyleObject<'max-height-max'>
  maxHeightFit: StyleObject<'max-height-fit'>
}
