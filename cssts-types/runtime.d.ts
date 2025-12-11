/**
 * CssTs Runtime Type Definitions
 */

/** Style object - a record of class names to boolean values */
export type StyleObject = Record<string, boolean>

/** CssTs Runtime Interface */
export interface CsstsRuntime {
  /**
   * Merge multiple style objects into one
   * 
   * @example
   * const result = cssts.$cls(colorRed, fontBold, bgWhite)
   * // Result: { 'color-red': true, 'font-bold': true, 'bg-white': true }
   */
  $cls(...styles: (StyleObject | false | null | undefined)[]): StyleObject
  
  /**
   * Replace a CSS property value in a style object
   * 
   * @param target - The style object to modify
   * @param cssProperty - The CSS property name (e.g., 'color', 'backgroundColor')
   * @param newAtom - The new atom to apply
   * 
   * @example
   * const btn = cssts.$cls(colorRed, fontBold)
   * cssts.$replace(btn, 'color', colorGreen)
   * // btn is now: { 'color-green': true, 'font-bold': true }
   */
  $replace(target: StyleObject, cssProperty: string, newAtom: StyleObject): void
}

/** Export runtime type */
export type { CsstsRuntime }
