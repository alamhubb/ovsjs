/**
 * OVS 编译器
 *
 * 提供 OVS 代码解析和转换功能
 *
 * @example
 * ```typescript
 * import { ovsTransform, vitePluginOvsTransform, OvsParser } from 'ovs-compiler'
 * ```
 */

import SlimeGenerator from "slime-generator/src/SlimeGenerator.ts";
import OvsParser from "./parser/OvsParser.ts";
import OvsCstToSlimeAstUtil from "./factory/OvsCstToSlimeAstUtil.ts";
import type {SlimeGeneratorResult} from "slime-generator/src/SlimeCodeMapping.ts";
import SlimeCodeMapping from "slime-generator/src/SlimeCodeMapping.ts";
import {
    type SlimeProgram,
    type SlimeStatement,
    type SlimeExpressionStatement,
    type SlimeImportDeclaration,
    type SlimeImportSpecifier,
    SlimeProgramSourceType
} from "slime-ast/src/SlimeESTree.ts";
import SlimeAstUtil from "slime-ast/src/SlimeNodeCreate.ts";
import SlimeTokenCreate from "slime-ast/src/SlimeTokenCreate.ts";
import {SlimeNodeType} from "slime-ast/src/SlimeNodeType.ts";
import SubhutiMatchToken from "subhuti/src/struct/SubhutiMatchToken.ts";

// ==================== 内部工具函数 ====================

function hasReactiveExpression(sourceCode: string): boolean {
    return sourceCode.includes('#{')
}

function ensureDefineOvsComponentImport(imports: any[]): any[] {
    let reactiveVNodeImport: SlimeImportDeclaration | null = null
    for (const imp of imports) {
        if (imp.type === SlimeNodeType.ImportDeclaration) {
            const source = (imp as SlimeImportDeclaration).source
            if (source.value && (source.value.includes('ReactiveVNode') || source.value.includes('reactiveVNode'))) {
                reactiveVNodeImport = imp as SlimeImportDeclaration
                break
            }
        }
    }
    if (reactiveVNodeImport) {
        const specifiers = reactiveVNodeImport.specifiers || []
        const has = specifiers.some((s: any) => s.type === SlimeNodeType.ImportSpecifier &&
            (s.imported?.name === 'defineOvsComponent' || s.local?.name === 'defineOvsComponent'))
        if (!has) {
            specifiers.push({
                type: SlimeNodeType.ImportSpecifier,
                imported: SlimeAstUtil.createIdentifier('defineOvsComponent'),
                local: SlimeAstUtil.createIdentifier('defineOvsComponent')
            })
        }
        return imports
    }
    const newImport = SlimeAstUtil.createImportDeclaration(
        [{type: SlimeNodeType.ImportSpecifier, imported: SlimeAstUtil.createIdentifier('defineOvsComponent'),
          local: SlimeAstUtil.createIdentifier('defineOvsComponent')} as SlimeImportSpecifier],
        SlimeAstUtil.createStringLiteral('ovsjs'))
    return [newImport, ...imports]
}

function createFragmentWrapper(expressions: any[]): any {
    const arrayElements = expressions.map((expr, index) => {
        const isLast = index === expressions.length - 1
        return SlimeAstUtil.createArrayElement(expr, isLast ? undefined : SlimeTokenCreate.createCommaToken())
    })
    return SlimeAstUtil.createCallExpression(SlimeAstUtil.createIdentifier('h'),
        [SlimeAstUtil.createIdentifier('Fragment'), SlimeAstUtil.createNullLiteralToken(),
         SlimeAstUtil.createArrayExpression(arrayElements)])
}

function ensureFragmentImport(imports: any[]): any[] {
    let vueImport: SlimeImportDeclaration | null = null
    for (const imp of imports) {
        if (imp.type === SlimeNodeType.ImportDeclaration) {
            const source = (imp as SlimeImportDeclaration).source
            if (source.value === 'vue') { vueImport = imp as SlimeImportDeclaration; break }
        }
    }
    if (vueImport) {
        const specifiers = vueImport.specifiers || []
        const hasFragment = specifiers.some((s: any) => s.type === SlimeNodeType.ImportSpecifier &&
            (s.imported?.name === 'Fragment' || s.local?.name === 'Fragment'))
        const hasH = specifiers.some((s: any) => s.type === SlimeNodeType.ImportSpecifier &&
            (s.imported?.name === 'h' || s.local?.name === 'h'))
        if (!hasFragment) specifiers.push({type: SlimeNodeType.ImportSpecifier,
            imported: SlimeAstUtil.createIdentifier('Fragment'), local: SlimeAstUtil.createIdentifier('Fragment')})
        if (!hasH) specifiers.push({type: SlimeNodeType.ImportSpecifier,
            imported: SlimeAstUtil.createIdentifier('h'), local: SlimeAstUtil.createIdentifier('h')})
        return imports
    }
    const newImport = SlimeAstUtil.createImportDeclaration([
        {type: SlimeNodeType.ImportSpecifier, imported: SlimeAstUtil.createIdentifier('Fragment'),
         local: SlimeAstUtil.createIdentifier('Fragment')} as SlimeImportSpecifier,
        {type: SlimeNodeType.ImportSpecifier, imported: SlimeAstUtil.createIdentifier('h'),
         local: SlimeAstUtil.createIdentifier('h')} as SlimeImportSpecifier
    ], SlimeAstUtil.createStringLiteral('vue'))
    return [newImport, ...imports]
}

/** 检查 AST 中是否使用了 $OvsHtmlTag */
function usesOvsHtmlTag(ast: SlimeProgram): boolean {
    const code = JSON.stringify(ast)
    return code.includes('$OvsHtmlTag')
}

/** 确保有 $OvsHtmlTag 的导入 */
function ensureOvsHtmlTagImport(imports: any[]): any[] {
    // 检查是否已经有 ovsjs 的导入
    let ovsjsImport: SlimeImportDeclaration | null = null
    for (const imp of imports) {
        if (imp.type === SlimeNodeType.ImportDeclaration) {
            const source = (imp as SlimeImportDeclaration).source
            if (source.value === 'ovsjs') {
                ovsjsImport = imp as SlimeImportDeclaration
                break
            }
        }
    }
    if (ovsjsImport) {
        // 已有 ovsjs 导入，检查是否有 $OvsHtmlTag
        const specifiers = ovsjsImport.specifiers || []
        const has = specifiers.some((s: any) => s.type === SlimeNodeType.ImportSpecifier &&
            (s.imported?.name === '$OvsHtmlTag' || s.local?.name === '$OvsHtmlTag'))
        if (!has) {
            specifiers.push({
                type: SlimeNodeType.ImportSpecifier,
                imported: SlimeAstUtil.createIdentifier('$OvsHtmlTag'),
                local: SlimeAstUtil.createIdentifier('$OvsHtmlTag')
            })
        }
        return imports
    }
    // 没有 ovsjs 导入，创建新的
    const newImport = SlimeAstUtil.createImportDeclaration(
        [{type: SlimeNodeType.ImportSpecifier, imported: SlimeAstUtil.createIdentifier('$OvsHtmlTag'),
          local: SlimeAstUtil.createIdentifier('$OvsHtmlTag')} as SlimeImportSpecifier],
        SlimeAstUtil.createStringLiteral('ovsjs'))
    return [newImport, ...imports]
}

function wrapTopLevelExpressions(ast: SlimeProgram, sourceCode: string): SlimeProgram {
    let imports: any[] = [], declarations: any[] = [], expressions: SlimeStatement[] = [], hasAnyExport = false
    for (const statement of ast.body) {
        if (statement.type === SlimeNodeType.ImportDeclaration) imports.push(statement)
        else if (statement.type === SlimeNodeType.ExportDefaultDeclaration ||
                 statement.type === SlimeNodeType.ExportNamedDeclaration) hasAnyExport = true
        else if (statement.type === SlimeNodeType.VariableDeclaration ||
                 statement.type === SlimeNodeType.FunctionDeclaration ||
                 statement.type === SlimeNodeType.ClassDeclaration) declarations.push(statement)
        else expressions.push(statement as SlimeStatement)
    }

    // 检查是否使用了 $OvsHtmlTag，如果是则自动添加导入
    if (usesOvsHtmlTag(ast)) {
        imports = ensureOvsHtmlTagImport(imports)
    }

    if (hasAnyExport || expressions.length === 0) {
        // 即使有 export，也需要检查并添加 $OvsHtmlTag 导入
        if (usesOvsHtmlTag(ast)) {
            // 重建 AST，将新的 imports 放入
            const newBody = [...imports, ...ast.body.filter(s => s.type !== SlimeNodeType.ImportDeclaration)]
            return SlimeAstUtil.createProgram(newBody as any, SlimeProgramSourceType.Module)
        }
        return ast
    }
    const exprValues = expressions.map(e => e.type === SlimeNodeType.ExpressionStatement ?
        (e as SlimeExpressionStatement).expression : e)
    let finalExpr: any = exprValues.length === 1 ? exprValues[0] :
        (imports = ensureFragmentImport(imports), createFragmentWrapper(exprValues))

    // 最外层始终使用 defineOvsComponent 包裹，确保每个组件实例有独立的状态
    imports = ensureDefineOvsComponentImport(imports)
    const returnStmt = SlimeAstUtil.createReturnStatement(finalExpr)
    const blockStatement = SlimeAstUtil.createBlockStatement([...declarations, returnStmt])
    const arrowFunction = SlimeAstUtil.createArrowFunctionExpression(blockStatement,
        [SlimeAstUtil.createIdentifier('props')], false, false)
    const defineOvsCall = SlimeAstUtil.createCallExpression(
        SlimeAstUtil.createIdentifier('defineOvsComponent'), [arrowFunction])
    return SlimeAstUtil.createProgram([...imports,
        SlimeAstUtil.createExportDefaultDeclaration(defineOvsCall)] as any, SlimeProgramSourceType.Module)
}

// ==================== 导出的 API ====================

export interface ovsTransformBaseResult {
    ast: SlimeProgram
    tokens: SubhutiMatchToken[]
}

/** OVS 代码转换基础函数 */
export function ovsTransformBase(code: string): ovsTransformBaseResult {
    const parser = new OvsParser(code)
    let curCst = parser.Program()
    const tokens = parser.parsedTokens
    if (!tokens.length) return {ast: null, tokens: tokens}
    let ast = OvsCstToSlimeAstUtil.toProgram(curCst)
    return {ast, tokens}
}

/** OVS 代码转换（纯编译） */
export function ovsTransform(code: string): SlimeGeneratorResult {
    let codeResult = ovsTransformBase(code)
    return SlimeGenerator.generator(codeResult.ast, codeResult.tokens)
}

/** Vite 插件专用的 OVS 代码转换 */
export function vitePluginOvsTransform(code: string): SlimeGeneratorResult {
    let codeResult = ovsTransformBase(code)
    let ast = codeResult.ast
    if (!ast) return { code: '', mapping: [] }
    ast = wrapTopLevelExpressions(ast, code)
    const result = SlimeGenerator.generator(ast, codeResult.tokens)
    result.mapping = result.mapping.filter(m => m.source && m.source.value && m.source.value !== '' && m.source.length > 0)
    return result
}

/** @deprecated 已废弃 */
export function simpleFormatWithMapping(code: string, mapping: SlimeCodeMapping[]): { code: string; mapping: SlimeCodeMapping[] } {
    const insertPositions: number[] = []
    for (let i = 0; i < code.length; i++) {
        if (code[i] === ';' && code[i + 1] !== '\n') insertPositions.push(i + 1)
    }
    if (insertPositions.length === 0) return {code, mapping}
    let formatted = code
    for (let i = insertPositions.length - 1; i >= 0; i--) {
        const pos = insertPositions[i]
        formatted = formatted.slice(0, pos) + '\n' + formatted.slice(pos)
    }
    const newMapping = mapping.map(map => {
        if (!map.generate) return map
        const newMap = new SlimeCodeMapping()
        newMap.source = map.source
        newMap.generate = {...map.generate}
        let offsetCount = 0
        for (const insertPos of insertPositions) {
            if (insertPos <= map.generate.index) offsetCount++
        }
        newMap.generate.index += offsetCount
        return newMap
    })
    return {code: formatted, mapping: newMapping}
}

// 导出 Parser 和相关类型
export { OvsParser }
export { OvsCstToSlimeAstUtil }

