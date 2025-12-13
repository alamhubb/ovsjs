/**
 * CssTs Generator - On-demand CSS generation
 * 
 * This module provides tools for scanning source code and
 * generating CSS only for the atomic styles that are used.
 */

export * from './atom-scanner'
export * from './css-generator'

import { scanFilesForAtoms, atomToCssPropertyMap } from './atom-scanner'
import { generateCssFromUsage, generateAllCss } from './css-generator'
import type { CssGeneratorOptions } from './css-generator'

/**
 * Generate on-demand CSS from source files
 * 
 * @param patterns - Glob patterns for source files to scan
 * @param options - CSS generation options
 * @returns Generated CSS string
 * 
 * @example
 * const css = await generateOnDemandCss(['src/**\/*.ts', 'src/**\/*.ovs'])
 * console.log(css)
 */
export async function generateOnDemandCss(
  patterns: string[],
  options: CssGeneratorOptions = {}
): Promise<string> {
  const usageMap = await scanFilesForAtoms(patterns)
  return generateCssFromUsage(usageMap, options)
}

/**
 * Get the atom to CSS property mapping table
 */
export function getAtomMappingTable(): Record<string, { property: string; value: string }> {
  return { ...atomToCssPropertyMap }
}

export default {
  generateOnDemandCss,
  generateAllCss,
  getAtomMappingTable,
}
