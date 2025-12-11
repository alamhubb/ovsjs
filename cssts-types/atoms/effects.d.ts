/**
 * Effects Atomic Styles Type Definitions
 */

/** Style object type */
type StyleObject<K extends string> = { [key in K]: true }

/** Effects Atoms Interface */
export interface EffectsAtoms {
  // Box shadow
  shadowNone: StyleObject<'shadow-none'>
  shadowSm: StyleObject<'shadow-sm'>
  shadow: StyleObject<'shadow'>
  shadowMd: StyleObject<'shadow-md'>
  shadowLg: StyleObject<'shadow-lg'>
  shadowXl: StyleObject<'shadow-xl'>
  shadow2xl: StyleObject<'shadow-2xl'>
  shadowInner: StyleObject<'shadow-inner'>
  
  // Opacity
  opacity0: StyleObject<'opacity-0'>
  opacity5: StyleObject<'opacity-5'>
  opacity10: StyleObject<'opacity-10'>
  opacity20: StyleObject<'opacity-20'>
  opacity25: StyleObject<'opacity-25'>
  opacity30: StyleObject<'opacity-30'>
  opacity40: StyleObject<'opacity-40'>
  opacity50: StyleObject<'opacity-50'>
  opacity60: StyleObject<'opacity-60'>
  opacity70: StyleObject<'opacity-70'>
  opacity75: StyleObject<'opacity-75'>
  opacity80: StyleObject<'opacity-80'>
  opacity90: StyleObject<'opacity-90'>
  opacity95: StyleObject<'opacity-95'>
  opacity100: StyleObject<'opacity-100'>
  
  // Transition
  transition: StyleObject<'transition'>
  transitionNone: StyleObject<'transition-none'>
  transitionAll: StyleObject<'transition-all'>
  transitionColors: StyleObject<'transition-colors'>
  transitionOpacity: StyleObject<'transition-opacity'>
  transitionShadow: StyleObject<'transition-shadow'>
  transitionTransform: StyleObject<'transition-transform'>
  transitionFast: StyleObject<'transition-fast'>
  transitionSlow: StyleObject<'transition-slow'>
  
  // Duration
  duration75: StyleObject<'duration-75'>
  duration100: StyleObject<'duration-100'>
  duration150: StyleObject<'duration-150'>
  duration200: StyleObject<'duration-200'>
  duration300: StyleObject<'duration-300'>
  duration500: StyleObject<'duration-500'>
  duration700: StyleObject<'duration-700'>
  duration1000: StyleObject<'duration-1000'>
  
  // Ease
  easeLinear: StyleObject<'ease-linear'>
  easeIn: StyleObject<'ease-in'>
  easeOut: StyleObject<'ease-out'>
  easeInOut: StyleObject<'ease-in-out'>
  
  // Cursor
  cursorAuto: StyleObject<'cursor-auto'>
  cursorDefault: StyleObject<'cursor-default'>
  cursorPointer: StyleObject<'cursor-pointer'>
  cursorWait: StyleObject<'cursor-wait'>
  cursorText: StyleObject<'cursor-text'>
  cursorMove: StyleObject<'cursor-move'>
  cursorNotAllowed: StyleObject<'cursor-not-allowed'>
  cursorGrab: StyleObject<'cursor-grab'>
  cursorGrabbing: StyleObject<'cursor-grabbing'>
  
  // Pointer events
  pointerEventsNone: StyleObject<'pointer-events-none'>
  pointerEventsAuto: StyleObject<'pointer-events-auto'>
  
  // User select
  userSelectNone: StyleObject<'user-select-none'>
  userSelectText: StyleObject<'user-select-text'>
  userSelectAll: StyleObject<'user-select-all'>
  userSelectAuto: StyleObject<'user-select-auto'>
  
  // Border
  border: StyleObject<'border'>
  borderNone: StyleObject<'border-none'>
  border0: StyleObject<'border-0'>
  border2: StyleObject<'border-2'>
  border4: StyleObject<'border-4'>
  border8: StyleObject<'border-8'>
  borderT: StyleObject<'border-t'>
  borderR: StyleObject<'border-r'>
  borderB: StyleObject<'border-b'>
  borderL: StyleObject<'border-l'>
  
  // Border style
  borderSolid: StyleObject<'border-solid'>
  borderDashed: StyleObject<'border-dashed'>
  borderDotted: StyleObject<'border-dotted'>
  borderDouble: StyleObject<'border-double'>
  
  // Border radius semantic
  roundedNone: StyleObject<'rounded-none'>
  roundedSm: StyleObject<'rounded-sm'>
  rounded: StyleObject<'rounded'>
  roundedMd: StyleObject<'rounded-md'>
  roundedLg: StyleObject<'rounded-lg'>
  roundedXl: StyleObject<'rounded-xl'>
  rounded2xl: StyleObject<'rounded-2xl'>
  rounded3xl: StyleObject<'rounded-3xl'>
  roundedFull: StyleObject<'rounded-full'>
  roundedBase: StyleObject<'rounded-base'>
  roundedSmall: StyleObject<'rounded-small'>
  roundedRound: StyleObject<'rounded-round'>
  roundedCircle: StyleObject<'rounded-circle'>
}
