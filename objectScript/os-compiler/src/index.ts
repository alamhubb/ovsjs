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

import SlimeGenerator from "slime-generator/src/SlimeGenerator.ts";
import ObjectScriptParser from "./parser/ObjectScriptParser.ts";
import {ObjectCstToSlimeAst} from "./factory/ObjectCstToSlimeAst.ts";
import type {SlimeGeneratorResult} from "slime-generator/src/SlimeCodeMapping.ts";
import SlimeCodeMapping from "slime-generator/src/SlimeCodeMapping.ts";
import {
    type SlimeProgram,
    SlimeProgramSourceType
} from "slime-ast/src/SlimeESTree.ts";
import SlimeAstUtil from "slime-ast/src/SlimeNodeCreate.ts";
import SubhutiMatchToken from "subhuti/src/struct/SubhutiMatchToken.ts";

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

