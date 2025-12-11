/**
 * Spacing Atomic Styles Type Definitions
 * 
 * Semantic spacing values (xs, sm, md, lg, xl)
 */

/** Style object type */
type StyleObject<K extends string> = { [key in K]: true }

/** Spacing Atoms Interface */
export interface SpacingAtoms {
  // Padding semantic
  paddingXs: StyleObject<'padding-xs'>
  paddingSm: StyleObject<'padding-sm'>
  paddingMd: StyleObject<'padding-md'>
  paddingLg: StyleObject<'padding-lg'>
  paddingXl: StyleObject<'padding-xl'>
  
  // Padding X (horizontal)
  paddingXXs: StyleObject<'padding-x-xs'>
  paddingXSm: StyleObject<'padding-x-sm'>
  paddingXMd: StyleObject<'padding-x-md'>
  paddingXLg: StyleObject<'padding-x-lg'>
  paddingXXl: StyleObject<'padding-x-xl'>
  
  // Padding Y (vertical)
  paddingYXs: StyleObject<'padding-y-xs'>
  paddingYSm: StyleObject<'padding-y-sm'>
  paddingYMd: StyleObject<'padding-y-md'>
  paddingYLg: StyleObject<'padding-y-lg'>
  paddingYXl: StyleObject<'padding-y-xl'>
  
  // Margin semantic
  marginXs: StyleObject<'margin-xs'>
  marginSm: StyleObject<'margin-sm'>
  marginMd: StyleObject<'margin-md'>
  marginLg: StyleObject<'margin-lg'>
  marginXl: StyleObject<'margin-xl'>
  
  // Margin X (horizontal)
  marginXXs: StyleObject<'margin-x-xs'>
  marginXSm: StyleObject<'margin-x-sm'>
  marginXMd: StyleObject<'margin-x-md'>
  marginXLg: StyleObject<'margin-x-lg'>
  marginXXl: StyleObject<'margin-x-xl'>
  
  // Margin Y (vertical)
  marginYXs: StyleObject<'margin-y-xs'>
  marginYSm: StyleObject<'margin-y-sm'>
  marginYMd: StyleObject<'margin-y-md'>
  marginYLg: StyleObject<'margin-y-lg'>
  marginYXl: StyleObject<'margin-y-xl'>
  
  // Gap (for flex/grid)
  gapXs: StyleObject<'gap-xs'>
  gapSm: StyleObject<'gap-sm'>
  gapMd: StyleObject<'gap-md'>
  gapLg: StyleObject<'gap-lg'>
  gapXl: StyleObject<'gap-xl'>
  
  // Gap X
  gapXXs: StyleObject<'gap-x-xs'>
  gapXSm: StyleObject<'gap-x-sm'>
  gapXMd: StyleObject<'gap-x-md'>
  gapXLg: StyleObject<'gap-x-lg'>
  gapXXl: StyleObject<'gap-x-xl'>
  
  // Gap Y
  gapYXs: StyleObject<'gap-y-xs'>
  gapYSm: StyleObject<'gap-y-sm'>
  gapYMd: StyleObject<'gap-y-md'>
  gapYLg: StyleObject<'gap-y-lg'>
  gapYXl: StyleObject<'gap-y-xl'>
}
