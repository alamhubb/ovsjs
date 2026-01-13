/**
 * OvsCstToSlimeAstUtils - Re-export from new architecture
 * 
 * 此文件已重构为分层架构，原代码已拆分到以下文件：
 * - OvsCstToSlimeAst/OvsCstToSlimeAst.Helpers.ts
 * - OvsCstToSlimeAst/OvsCstToSlimeAst.Judgement.ts
 * - OvsCstToSlimeAst/OvsCstToSlimeAst.IIFE.ts
 * - OvsCstToSlimeAst/OvsCstToSlimeAst.View.ts
 * - OvsCstToSlimeAst/OvsCstToSlimeAst.Property.ts
 * - OvsCstToSlimeAst/OvsCstToSlimeAst.Statement.ts
 * - OvsCstToSlimeAst/OvsCstToSlimeAst.Import.ts
 * - OvsCstToSlimeAst/OvsCstToSlimeAst.ts (主类)
 */

// Re-export all from the new architecture
export { OvsCstToSlimeAstUtils, registerOvsCstToSlimeAst } from './OvsCstToSlimeAst/OvsCstToSlimeAst'

// Export utility functions for backward compatibility
import { SubhutiCst } from 'subhuti'

export function checkCstName(cst: SubhutiCst, expectedName: string): void {
  if (cst.name !== expectedName) {
    throw new Error(`Expected CST name "${expectedName}", but got "${cst.name}"`)
  }
}

export function throwNewError(message: string): never {
  throw new Error(message)
}