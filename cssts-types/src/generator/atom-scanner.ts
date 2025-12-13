/**
 * Atom Scanner - Scans source code for used atomic styles
 * 
 * This module scans TypeScript/JavaScript source files to find
 * which atomic styles are being used, enabling on-demand CSS generation.
 */

import { readFileSync } from 'fs'
import { glob } from 'fast-glob'

/** Atom usage record */
export interface AtomUsage {
  /** Atom name (e.g., 'colorRed', 'fontSize14') */
  name: string
  /** CSS class name (e.g., 'color-red', 'font-size-14') */
  className: string
  /** CSS property (e.g., 'color', 'font-size') */
  cssProperty: string
  /** CSS value (e.g., 'red', '14px') */
  cssValue: string
  /** Files where this atom is used */
  usedIn: string[]
}

/** Atom to CSS property mapping */
export const atomToCssPropertyMap: Record<string, { property: string; value: string }> = {
  // Colors
  colorRed: { property: 'color', value: 'red' },
  colorGreen: { property: 'color', value: 'green' },
  colorBlue: { property: 'color', value: 'blue' },
  colorWhite: { property: 'color', value: '#ffffff' },
  colorBlack: { property: 'color', value: '#000000' },
  colorPrimary: { property: 'color', value: '#409eff' },
  colorSuccess: { property: 'color', value: '#67c23a' },
  colorWarning: { property: 'color', value: '#e6a23c' },
  colorDanger: { property: 'color', value: '#f56c6c' },
  colorInfo: { property: 'color', value: '#909399' },
  
  // Background colors
  bgPrimary: { property: 'background-color', value: '#409eff' },
  bgSuccess: { property: 'background-color', value: '#67c23a' },
  bgWarning: { property: 'background-color', value: '#e6a23c' },
  bgDanger: { property: 'background-color', value: '#f56c6c' },
  bgInfo: { property: 'background-color', value: '#909399' },
  bgWhite: { property: 'background-color', value: '#ffffff' },
  bgTransparent: { property: 'background-color', value: 'transparent' },
  
  // Font weights
  fontBold: { property: 'font-weight', value: 'bold' },
  fontNormal: { property: 'font-weight', value: 'normal' },
  fontMedium: { property: 'font-weight', value: '500' },
  fontSemibold: { property: 'font-weight', value: '600' },
  
  // Font sizes (common values)
  fontSize12: { property: 'font-size', value: '12px' },
  fontSize14: { property: 'font-size', value: '14px' },
  fontSize16: { property: 'font-size', value: '16px' },
  fontSize18: { property: 'font-size', value: '18px' },
  fontSize20: { property: 'font-size', value: '20px' },
  fontSize24: { property: 'font-size', value: '24px' },
  
  // Layout
  flex: { property: 'display', value: 'flex' },
  inlineFlex: { property: 'display', value: 'inline-flex' },
  block: { property: 'display', value: 'block' },
  inlineBlock: { property: 'display', value: 'inline-block' },
  hidden: { property: 'display', value: 'none' },
  
  // Cursor
  cursorPointer: { property: 'cursor', value: 'pointer' },
  cursorNotAllowed: { property: 'cursor', value: 'not-allowed' },
  
  // User select
  userSelectNone: { property: 'user-select', value: 'none' },
  
  // Transition
  transition: { property: 'transition', value: 'all 0.3s' },
  transitionFast: { property: 'transition', value: 'all 0.15s' },
  
  // Border radius
  roundedBase: { property: 'border-radius', value: '4px' },
  roundedSmall: { property: 'border-radius', value: '2px' },
  roundedRound: { property: 'border-radius', value: '20px' },
  roundedCircle: { property: 'border-radius', value: '50%' },
}

/** Convert camelCase to kebab-case */
function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

/** Scan a single file for atom usage */
export function scanFileForAtoms(filePath: string, content?: string): string[] {
  const code = content ?? readFileSync(filePath, 'utf-8')
  const usedAtoms: string[] = []
  
  // Match atom names in the code
  for (const atomName of Object.keys(atomToCssPropertyMap)) {
    // Match as identifier (word boundary)
    const regex = new RegExp(`\\b${atomName}\\b`, 'g')
    if (regex.test(code)) {
      usedAtoms.push(atomName)
    }
  }
  
  return usedAtoms
}

/** Scan multiple files for atom usage */
export async function scanFilesForAtoms(patterns: string[]): Promise<Map<string, AtomUsage>> {
  const files = await glob(patterns, { ignore: ['**/node_modules/**'] })
  const atomUsageMap = new Map<string, AtomUsage>()
  
  for (const file of files) {
    const usedAtoms = scanFileForAtoms(file)
    
    for (const atomName of usedAtoms) {
      const mapping = atomToCssPropertyMap[atomName]
      if (!mapping) continue
      
      const className = toKebabCase(atomName)
      
      if (atomUsageMap.has(atomName)) {
        atomUsageMap.get(atomName)!.usedIn.push(file)
      } else {
        atomUsageMap.set(atomName, {
          name: atomName,
          className,
          cssProperty: mapping.property,
          cssValue: mapping.value,
          usedIn: [file],
        })
      }
    }
  }
  
  return atomUsageMap
}

export default { scanFileForAtoms, scanFilesForAtoms, atomToCssPropertyMap }
