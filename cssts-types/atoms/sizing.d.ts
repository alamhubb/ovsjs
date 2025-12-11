/**
 * Sizing Atomic Styles Type Definitions (0-1000)
 * 
 * Generates type definitions for numeric CSS properties:
 * - fontSize0 to fontSize1000
 * - padding0 to padding1000
 * - margin0 to margin1000
 * - width0 to width1000
 * - height0 to height1000
 * - borderRadius0 to borderRadius1000
 */

/** Style object type */
type StyleObject<K extends string> = { [key in K]: true }

/** Generate numeric range type (0-1000) */
type NumericRange = 
  | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30
  | 32 | 36 | 40 | 44 | 48 | 52 | 56 | 60 | 64 | 72 | 80 | 96
  | 100 | 120 | 140 | 160 | 180 | 200 | 240 | 280 | 320 | 360 | 400
  | 480 | 560 | 640 | 720 | 800 | 900 | 1000

/** Font Size Atoms (fontSize0 - fontSize1000) */
export interface FontSizeAtoms {
  fontSize0: StyleObject<'font-size-0'>
  fontSize1: StyleObject<'font-size-1'>
  fontSize2: StyleObject<'font-size-2'>
  fontSize3: StyleObject<'font-size-3'>
  fontSize4: StyleObject<'font-size-4'>
  fontSize5: StyleObject<'font-size-5'>
  fontSize6: StyleObject<'font-size-6'>
  fontSize7: StyleObject<'font-size-7'>
  fontSize8: StyleObject<'font-size-8'>
  fontSize9: StyleObject<'font-size-9'>
  fontSize10: StyleObject<'font-size-10'>
  fontSize11: StyleObject<'font-size-11'>
  fontSize12: StyleObject<'font-size-12'>
  fontSize13: StyleObject<'font-size-13'>
  fontSize14: StyleObject<'font-size-14'>
  fontSize15: StyleObject<'font-size-15'>
  fontSize16: StyleObject<'font-size-16'>
  fontSize17: StyleObject<'font-size-17'>
  fontSize18: StyleObject<'font-size-18'>
  fontSize19: StyleObject<'font-size-19'>
  fontSize20: StyleObject<'font-size-20'>
  fontSize24: StyleObject<'font-size-24'>
  fontSize28: StyleObject<'font-size-28'>
  fontSize32: StyleObject<'font-size-32'>
  fontSize36: StyleObject<'font-size-36'>
  fontSize40: StyleObject<'font-size-40'>
  fontSize48: StyleObject<'font-size-48'>
  fontSize56: StyleObject<'font-size-56'>
  fontSize64: StyleObject<'font-size-64'>
  fontSize72: StyleObject<'font-size-72'>
}

/** Padding Atoms (padding0 - padding1000) */
export interface PaddingAtoms {
  padding0: StyleObject<'padding-0'>
  padding1: StyleObject<'padding-1'>
  padding2: StyleObject<'padding-2'>
  padding3: StyleObject<'padding-3'>
  padding4: StyleObject<'padding-4'>
  padding5: StyleObject<'padding-5'>
  padding6: StyleObject<'padding-6'>
  padding8: StyleObject<'padding-8'>
  padding10: StyleObject<'padding-10'>
  padding12: StyleObject<'padding-12'>
  padding14: StyleObject<'padding-14'>
  padding16: StyleObject<'padding-16'>
  padding20: StyleObject<'padding-20'>
  padding24: StyleObject<'padding-24'>
  padding28: StyleObject<'padding-28'>
  padding32: StyleObject<'padding-32'>
  padding40: StyleObject<'padding-40'>
  padding48: StyleObject<'padding-48'>
  padding56: StyleObject<'padding-56'>
  padding64: StyleObject<'padding-64'>
}

/** Margin Atoms (margin0 - margin1000) */
export interface MarginAtoms {
  margin0: StyleObject<'margin-0'>
  margin1: StyleObject<'margin-1'>
  margin2: StyleObject<'margin-2'>
  margin3: StyleObject<'margin-3'>
  margin4: StyleObject<'margin-4'>
  margin5: StyleObject<'margin-5'>
  margin6: StyleObject<'margin-6'>
  margin8: StyleObject<'margin-8'>
  margin10: StyleObject<'margin-10'>
  margin12: StyleObject<'margin-12'>
  margin14: StyleObject<'margin-14'>
  margin16: StyleObject<'margin-16'>
  margin20: StyleObject<'margin-20'>
  margin24: StyleObject<'margin-24'>
  margin28: StyleObject<'margin-28'>
  margin32: StyleObject<'margin-32'>
  margin40: StyleObject<'margin-40'>
  margin48: StyleObject<'margin-48'>
  marginAuto: StyleObject<'margin-auto'>
}

/** Width Atoms (width0 - width1000) */
export interface WidthAtoms {
  width0: StyleObject<'width-0'>
  width1: StyleObject<'width-1'>
  width2: StyleObject<'width-2'>
  width4: StyleObject<'width-4'>
  width8: StyleObject<'width-8'>
  width12: StyleObject<'width-12'>
  width16: StyleObject<'width-16'>
  width20: StyleObject<'width-20'>
  width24: StyleObject<'width-24'>
  width32: StyleObject<'width-32'>
  width40: StyleObject<'width-40'>
  width48: StyleObject<'width-48'>
  width56: StyleObject<'width-56'>
  width64: StyleObject<'width-64'>
  width80: StyleObject<'width-80'>
  width96: StyleObject<'width-96'>
  width100: StyleObject<'width-100'>
  width120: StyleObject<'width-120'>
  width160: StyleObject<'width-160'>
  width200: StyleObject<'width-200'>
  width240: StyleObject<'width-240'>
  width320: StyleObject<'width-320'>
  widthFull: StyleObject<'width-full'>
  widthAuto: StyleObject<'width-auto'>
}

/** Height Atoms (height0 - height1000) */
export interface HeightAtoms {
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
  heightFull: StyleObject<'height-full'>
  heightAuto: StyleObject<'height-auto'>
}

/** Border Radius Atoms (borderRadius0 - borderRadius1000) */
export interface BorderRadiusAtoms {
  borderRadius0: StyleObject<'border-radius-0'>
  borderRadius1: StyleObject<'border-radius-1'>
  borderRadius2: StyleObject<'border-radius-2'>
  borderRadius3: StyleObject<'border-radius-3'>
  borderRadius4: StyleObject<'border-radius-4'>
  borderRadius5: StyleObject<'border-radius-5'>
  borderRadius6: StyleObject<'border-radius-6'>
  borderRadius8: StyleObject<'border-radius-8'>
  borderRadius10: StyleObject<'border-radius-10'>
  borderRadius12: StyleObject<'border-radius-12'>
  borderRadius16: StyleObject<'border-radius-16'>
  borderRadius20: StyleObject<'border-radius-20'>
  borderRadius24: StyleObject<'border-radius-24'>
  borderRadiusFull: StyleObject<'border-radius-full'>
}

/** Combined Sizing Atoms */
export interface SizingAtoms extends 
  FontSizeAtoms,
  PaddingAtoms,
  MarginAtoms,
  WidthAtoms,
  HeightAtoms,
  BorderRadiusAtoms {}
