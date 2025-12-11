/**
 * Typography Atomic Styles Type Definitions
 */

/** Style object type */
type StyleObject<K extends string> = { [key in K]: true }

/** Typography Atoms Interface */
export interface TypographyAtoms {
  // Font weight
  fontThin: StyleObject<'font-thin'>
  fontLight: StyleObject<'font-light'>
  fontNormal: StyleObject<'font-normal'>
  fontMedium: StyleObject<'font-medium'>
  fontSemibold: StyleObject<'font-semibold'>
  fontBold: StyleObject<'font-bold'>
  fontExtrabold: StyleObject<'font-extrabold'>
  fontBlack: StyleObject<'font-black'>
  
  // Font style
  fontItalic: StyleObject<'font-italic'>
  fontNotItalic: StyleObject<'font-not-italic'>
  
  // Text alignment
  textLeft: StyleObject<'text-left'>
  textCenter: StyleObject<'text-center'>
  textRight: StyleObject<'text-right'>
  textJustify: StyleObject<'text-justify'>
  
  // Text decoration
  underline: StyleObject<'underline'>
  lineThrough: StyleObject<'line-through'>
  noUnderline: StyleObject<'no-underline'>
  
  // Text transform
  uppercase: StyleObject<'uppercase'>
  lowercase: StyleObject<'lowercase'>
  capitalize: StyleObject<'capitalize'>
  normalCase: StyleObject<'normal-case'>
  
  // Line height
  lineHeightNone: StyleObject<'line-height-none'>
  lineHeightTight: StyleObject<'line-height-tight'>
  lineHeightSnug: StyleObject<'line-height-snug'>
  lineHeightNormal: StyleObject<'line-height-normal'>
  lineHeightRelaxed: StyleObject<'line-height-relaxed'>
  lineHeightLoose: StyleObject<'line-height-loose'>
  
  // Letter spacing
  trackingTighter: StyleObject<'tracking-tighter'>
  trackingTight: StyleObject<'tracking-tight'>
  trackingNormal: StyleObject<'tracking-normal'>
  trackingWide: StyleObject<'tracking-wide'>
  trackingWider: StyleObject<'tracking-wider'>
  trackingWidest: StyleObject<'tracking-widest'>
  
  // Word break
  breakNormal: StyleObject<'break-normal'>
  breakWords: StyleObject<'break-words'>
  breakAll: StyleObject<'break-all'>
  
  // Whitespace
  whitespaceNormal: StyleObject<'whitespace-normal'>
  whitespaceNowrap: StyleObject<'whitespace-nowrap'>
  whitespacePre: StyleObject<'whitespace-pre'>
  whitespacePreLine: StyleObject<'whitespace-pre-line'>
  whitespacePreWrap: StyleObject<'whitespace-pre-wrap'>
  
  // Text overflow
  truncate: StyleObject<'truncate'>
  textEllipsis: StyleObject<'text-ellipsis'>
  textClip: StyleObject<'text-clip'>
}
