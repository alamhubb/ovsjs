/**
 * Layout Atomic Styles Type Definitions
 */

/** Style object type */
type StyleObject<K extends string> = { [key in K]: true }

/** Layout Atoms Interface */
export interface LayoutAtoms {
  // Display
  block: StyleObject<'block'>
  inlineBlock: StyleObject<'inline-block'>
  inline: StyleObject<'inline'>
  flex: StyleObject<'flex'>
  inlineFlex: StyleObject<'inline-flex'>
  grid: StyleObject<'grid'>
  inlineGrid: StyleObject<'inline-grid'>
  hidden: StyleObject<'hidden'>
  
  // Flex direction
  flexRow: StyleObject<'flex-row'>
  flexRowReverse: StyleObject<'flex-row-reverse'>
  flexCol: StyleObject<'flex-col'>
  flexColReverse: StyleObject<'flex-col-reverse'>
  
  // Flex wrap
  flexWrap: StyleObject<'flex-wrap'>
  flexWrapReverse: StyleObject<'flex-wrap-reverse'>
  flexNowrap: StyleObject<'flex-nowrap'>
  
  // Flex grow/shrink
  flexGrow: StyleObject<'flex-grow'>
  flexGrow0: StyleObject<'flex-grow-0'>
  flexShrink: StyleObject<'flex-shrink'>
  flexShrink0: StyleObject<'flex-shrink-0'>
  
  // Flex utilities
  flex1: StyleObject<'flex-1'>
  flexAuto: StyleObject<'flex-auto'>
  flexInitial: StyleObject<'flex-initial'>
  flexNone: StyleObject<'flex-none'>
  
  // Justify content
  justifyStart: StyleObject<'justify-start'>
  justifyEnd: StyleObject<'justify-end'>
  justifyCenter: StyleObject<'justify-center'>
  justifyBetween: StyleObject<'justify-between'>
  justifyAround: StyleObject<'justify-around'>
  justifyEvenly: StyleObject<'justify-evenly'>
  
  // Align items
  itemsStart: StyleObject<'items-start'>
  itemsEnd: StyleObject<'items-end'>
  itemsCenter: StyleObject<'items-center'>
  itemsBaseline: StyleObject<'items-baseline'>
  itemsStretch: StyleObject<'items-stretch'>
  
  // Align self
  selfAuto: StyleObject<'self-auto'>
  selfStart: StyleObject<'self-start'>
  selfEnd: StyleObject<'self-end'>
  selfCenter: StyleObject<'self-center'>
  selfStretch: StyleObject<'self-stretch'>
  
  // Align content
  contentStart: StyleObject<'content-start'>
  contentEnd: StyleObject<'content-end'>
  contentCenter: StyleObject<'content-center'>
  contentBetween: StyleObject<'content-between'>
  contentAround: StyleObject<'content-around'>
  contentEvenly: StyleObject<'content-evenly'>
  
  // Combined flex utilities
  flexCenter: StyleObject<'flex-center'>
  flexAlignCenter: StyleObject<'flex-align-center'>
  flexJustifyCenter: StyleObject<'flex-justify-center'>
  
  // Position
  static: StyleObject<'static'>
  fixed: StyleObject<'fixed'>
  absolute: StyleObject<'absolute'>
  relative: StyleObject<'relative'>
  sticky: StyleObject<'sticky'>
  
  // Position values
  inset0: StyleObject<'inset-0'>
  insetAuto: StyleObject<'inset-auto'>
  top0: StyleObject<'top-0'>
  right0: StyleObject<'right-0'>
  bottom0: StyleObject<'bottom-0'>
  left0: StyleObject<'left-0'>
  
  // Z-index
  z0: StyleObject<'z-0'>
  z10: StyleObject<'z-10'>
  z20: StyleObject<'z-20'>
  z30: StyleObject<'z-30'>
  z40: StyleObject<'z-40'>
  z50: StyleObject<'z-50'>
  zAuto: StyleObject<'z-auto'>
  
  // Overflow
  overflowAuto: StyleObject<'overflow-auto'>
  overflowHidden: StyleObject<'overflow-hidden'>
  overflowVisible: StyleObject<'overflow-visible'>
  overflowScroll: StyleObject<'overflow-scroll'>
  overflowXAuto: StyleObject<'overflow-x-auto'>
  overflowYAuto: StyleObject<'overflow-y-auto'>
  overflowXHidden: StyleObject<'overflow-x-hidden'>
  overflowYHidden: StyleObject<'overflow-y-hidden'>
}
