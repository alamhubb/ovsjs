/**
 * ObjectScript 编译器
 *
 * 提供 ObjectScript 代码解析和转换功能
 *
 * @example
 * ```typescript
 * import { osTransform, ObjectScriptParser, ObjectCstToSlimeAst } from 'os-compiler'
 * ```
 */

import { SlimeGenerator, SlimeCodeMapping, type SlimeGeneratorResult } from "slime-generator";
import ObjectScriptParser from "./parser/ObjectScriptParser.ts";
import {ObjectCstToSlimeAst} from "./factory/ObjectCstToSlimeAst.ts";
import {
    type SlimeProgram,
    SlimeProgramSourceType,
    SlimeAstUtil
} from "slime-ast";
import { SubhutiMatchToken } from "subhuti";

// ==================== 导出的 API ====================

export interface OsTransformBaseResult {
    ast: SlimeProgram
    tokens: SubhutiMatchToken[]
}

/**
 * ObjectScript 代码转换基础函数
 * 返回 AST 和 tokens
 */
export function osTransformBase(code: string): OsTransformBaseResult {
    const parser = new ObjectScriptParser(code)
    let curCst = parser.Program()
    const tokens = parser.parsedTokens
    if (!tokens.length) return {ast: null as any, tokens: tokens}
    const converter = new ObjectCstToSlimeAst()
    let ast = converter.toProgram(curCst)
    return {ast, tokens}
}

/**
 * ObjectScript 代码转换（纯编译）
 * 返回编译后的代码和 source mapping
 */
export function osTransform(code: string): SlimeGeneratorResult {
    let codeResult = osTransformBase(code)
    return SlimeGenerator.generator(codeResult.ast, codeResult.tokens)
}

/**
 * Vite 插件专用的 ObjectScript 代码转换
 * 添加 osjs 运行时导入
 */
export function vitePluginOsTransform(code: string): SlimeGeneratorResult {
    let codeResult = osTransformBase(code)
    let ast = codeResult.ast
    if (!ast) return { code: '', mapping: [] }
    const result = SlimeGenerator.generator(ast, codeResult.tokens)
    result.mapping = result.mapping.filter(m => m.source && m.source.value && m.source.value !== '' && m.source.length > 0)
    return result
}

// 导出 Parser 和相关类型
export { ObjectScriptParser }
export { ObjectCstToSlimeAst }
export { objectScriptTokens, ObjectScriptContextualKeywords } from "./parser/ObjectScriptTokenConsumer.ts"
export { default as ObjectScriptTokenConsumer } from "./parser/ObjectScriptTokenConsumer.ts"

