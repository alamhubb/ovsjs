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

export function checkCstName(cst: SubhutiCst, cstName: string) {
    if (cst.name !== cstName) {
        console.log(cst)
        throwNewError(cst.name)
    }
    return cstName
}

export function throwNewError(errorMsg: string = 'syntax error') {
    throw new Error(errorMsg)
}