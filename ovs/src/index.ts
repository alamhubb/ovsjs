// Vite 插件
import {createFilter, type Plugin} from "vite"
import SubhutiLexer from 'subhuti/src/parser/SubhutiLexer.ts'
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import SlimeGenerator from "slime-generator/src/SlimeGenerator.ts";
import {ovs6Tokens} from "./parser/OvsConsumer.ts";
import OvsTokenConsumer from "./parser/OvsConsumer.ts";
import OvsParser from "./parser/OvsParser.ts";
import OvsCstToSlimeAstUtil from "./factory/OvsCstToSlimeAstUtil.ts";
import type {SlimeGeneratorResult} from "slime-generator/src/SlimeCodeMapping.ts";
import SlimeCodeMapping from "slime-generator/src/SlimeCodeMapping.ts";
import prettier from 'prettier';
// beautify 已不再使用（格式化已融入 SlimeGenerator）
// import beautify from 'js-beautify';
import {
    type SlimeProgram,
    type SlimeStatement,
    type SlimeExpressionStatement,
    type SlimeCallExpression,
    type SlimeImportDeclaration,
    type SlimeImportSpecifier,
    SlimeProgramSourceType,
    SlimeVariableDeclarationKindValue
} from "slime-ast/src/SlimeAstInterface.ts";
import SlimeAstUtil from "slime-ast/src/SlimeAst.ts";
import {SlimeAstType} from "slime-ast/src/SlimeAstType.ts";
import SubhutiMatchToken from "subhuti/src/struct/SubhutiMatchToken.ts";

export interface SourceMapSourceGenerateIndexLength {
    source: number[]
    generate: number[]
    length: number[]
    generateLength: number[]
}

/**
 * 判断 statement 是否是声明语句
 * @param node AST 节点
 * @returns 是否是声明
 */
function isDeclaration(node: any): boolean {
    return [
        SlimeAstType.VariableDeclaration,    // const/let/var
        SlimeAstType.FunctionDeclaration,
        SlimeAstType.ClassDeclaration,
        SlimeAstType.ImportDeclaration,
        SlimeAstType.ExportNamedDeclaration,
        SlimeAstType.ExportDefaultDeclaration,
    ].includes(node.type)
}

/**
 * 判断语句列表中是否有非渲染语句（复用 OvsRenderFunction 的判断逻辑）
 *
 * 复杂情况（需要 IIFE）：
 * - 有 Declaration（const、function、class）
 * - 有控制流语句（if、for、while）
 * - 有非 children.push 的 ExpressionStatement
 *
 * 简单情况（直接导出）：
 * - 只有 children.push 语句
 *
 * @param statements 语句数组
 * @returns 是否有非渲染语句
 */
function hasNonRenderStatements(statements: SlimeStatement[]): boolean {
    return statements.some(stmt => {
        // Declaration（如 const x = 1）→ 复杂
        if (stmt.type === SlimeAstType.VariableDeclaration ||
            stmt.type === SlimeAstType.FunctionDeclaration ||
            stmt.type === SlimeAstType.ClassDeclaration) {
            return true
        }

        // IfStatement、ForStatement 等 → 复杂
        if (stmt.type === SlimeAstType.IfStatement ||
            stmt.type === SlimeAstType.ForStatement ||
            stmt.type === SlimeAstType.WhileStatement) {
            return true
        }

        // ExpressionStatement 但不是 children.push → 复杂
        if (stmt.type === SlimeAstType.ExpressionStatement) {
            const exprStmt = stmt as SlimeExpressionStatement
            if (exprStmt.expression.type !== SlimeAstType.CallExpression) {
                return true
            }
            const callExpr = exprStmt.expression as SlimeCallExpression
            if (callExpr.callee.type === 'MemberExpression') {
                const memberExpr = callExpr.callee as any
                return !(memberExpr.object?.name === 'children' && memberExpr.property?.name === 'push')
            }
            return true
        }

        return false
    })
}

/**
 * 判断 statement 是否是 OVS 视图（简单视图或复杂视图）
 * @param statement 语句节点
 * @returns 是否是 OVS 视图
 */
function isOvsRenderDomView(statement: SlimeStatement): boolean {
    if (statement.type !== SlimeAstType.ExpressionStatement) return false
    const expr = (statement as SlimeExpressionStatement).expression

    // 复杂视图：IIFE 形式
    if (expr.type === SlimeAstType.CallExpression && expr.callee.type === SlimeAstType.FunctionExpression) {
        return true
    }

    // 简单视图：直接的 createReactiveVNode() 调用
    if (expr.type === SlimeAstType.CallExpression) {
        const callExpr = expr as SlimeCallExpression

        // 检查 createReactiveVNode() 函数调用
        if (callExpr.callee.type === SlimeAstType.Identifier) {
            const identifier = callExpr.callee as any
            if (identifier.name === 'createReactiveVNode') {
                return true
            }
        }
    }

    return false
}

/**
 * 包裹顶层表达式
 *
 * 规则：
 * 1. Declaration 始终保持顶层
 * 2. 有 export default - 不做包裹，但需要检查是否需要转换为函数
 * 3. 没有 export default - 用 IIFE 包裹所有表达式
 *
 * @param ast Program AST
 * @returns 包裹后的 Program AST
 */
function wrapTopLevelExpressions(ast: SlimeProgram): SlimeProgram {
    const imports: any[] = []           // import 语句（必须在顶层）
    const exports: any[] = []           // export 语句
    const declarations: any[] = []      // 其他 declarations（const、function等）
    const expressions: SlimeStatement[] = []
    let hasAnyExport = false  // 检查是否有任何导出

    // 1. 分类
    for (const statement of ast.body) {
        // Import 语句必须在模块顶层
        if (statement.type === SlimeAstType.ImportDeclaration) {
            imports.push(statement)
        }
        // 检查是否有任何导出（export default 或 export named）
        else if (statement.type === SlimeAstType.ExportDefaultDeclaration ||
            statement.type === SlimeAstType.ExportNamedDeclaration) {
            hasAnyExport = true
            exports.push(statement)
        } else if (isDeclaration(statement)) {
            declarations.push(statement)
        } else if (statement.type === SlimeAstType.ExpressionStatement) {
            expressions.push(statement as SlimeStatement)
        } else {
            // 其他类型的语句（如 if、for 等）也归类为表达式
            expressions.push(statement as SlimeStatement)
        }
    }

    // 2. 如果有任何导出（export default 或 export const 等），保持原样
    if (hasAnyExport) {
        return ast
    }

    // 3. 如果没有表达式，保持原样
    if (expressions.length === 0) {
        return ast
    }

    // 4. 判断简单还是复杂（复用 OvsRenderFunction 的判断逻辑）
    const ovsViews = expressions.filter(e => isOvsRenderDomView(e))

    // 合并所有语句用于判断
    const checkStatements = [...declarations, ...expressions]

    // 简单条件：只有一个 view，且没有其他非渲染语句
    if (ovsViews.length === 1 && expressions.length === 1 && !hasNonRenderStatements(checkStatements)) {
        // 简单情况：直接导出这个 view
        const viewExpr = (ovsViews[0] as SlimeExpressionStatement).expression
        const exportDefault = SlimeAstUtil.createExportDefaultDeclaration(viewExpr)

        return SlimeAstUtil.createProgram(
            [...imports, exportDefault] as any,  // import 必须在最前面
            SlimeProgramSourceType.module
        )
    }

    // 5. 复杂情况：用 IIFE 包裹所有内容（declarations + expressions）
    // 先构建 expressions 对应的语句列表（包含 push 逻辑）
    const expressionStatements: SlimeStatement[] = []

    // 处理所有 expressions，生成 children.push(...) 语句
    for (const expr of expressions) {
        if (isOvsRenderDomView(expr)) {
            // OVS 视图（简单或复杂）→ children.push(vnode)
            const vnodeExpr = (expr as SlimeExpressionStatement).expression
            const pushCall = SlimeAstUtil.createCallExpression(
                SlimeAstUtil.createMemberExpression(
                    SlimeAstUtil.createIdentifier('children'),
                    SlimeAstUtil.createDotOperator(),
                    SlimeAstUtil.createIdentifier('push')
                ),
                [vnodeExpr]
            )
            expressionStatements.push({
                type: SlimeAstType.ExpressionStatement,
                expression: pushCall
            } as SlimeExpressionStatement)
        } else {
            // 其他表达式：也应该 push 到 children（规则4的完整实现）
            // 如果是 ExpressionStatement，提取 expression 并 push
            if (expr.type === SlimeAstType.ExpressionStatement) {
                const exprStmt = expr as SlimeExpressionStatement
                const pushCall = SlimeAstUtil.createCallExpression(
                    SlimeAstUtil.createMemberExpression(
                        SlimeAstUtil.createIdentifier('children'),
                        SlimeAstUtil.createDotOperator(),
                        SlimeAstUtil.createIdentifier('push')
                    ),
                    [exprStmt.expression]
                )
                expressionStatements.push({
                    type: SlimeAstType.ExpressionStatement,
                    expression: pushCall
                } as SlimeExpressionStatement)
            } else {
                // 其他语句（if、for 等）保持原样，不 push
                expressionStatements.push(expr)
            }
        }
    }

    // 合并 declarations + expressions
    const allStatements = [...declarations, ...expressionStatements]

    // 调用 OvsCstToSlimeAstUtil 的 createBaseIIFE 方法生成 IIFE
    // 这样就能复用 OVS 核心编译的 IIFE 生成逻辑
    const iife = OvsCstToSlimeAstUtil.createBaseIIFE(allStatements)

    const exportDefault = SlimeAstUtil.createExportDefaultDeclaration(iife)

    // 返回新的 Program（import 必须在最前面）
    return SlimeAstUtil.createProgram(
        [...imports, exportDefault] as any,
        SlimeProgramSourceType.module
    )
}

/**
 * 自动添加 createReactiveVNode 函数的 import 语句
 * @param ast Program AST
 * @returns 添加了 import 的 Program AST
 */
function ensureOvsAPIImport(ast: SlimeProgram): SlimeProgram {
    let hasImport = false

    // 检查是否已经有了所需的导入
    for (const statement of ast.body) {
        if (statement.type === SlimeAstType.ImportDeclaration) {
            const importDecl = statement as SlimeImportDeclaration
            if (importDecl.source.value === '../utils/ReactiveVNode') {
                // 检查是否已导入 createComponentVNode
                const specs = importDecl.specifiers || []
                const hasCreateComponentVNode = specs.some(spec =>
                    spec.type === SlimeAstType.ImportSpecifier &&
                    spec.imported.name === 'createComponentVNode'
                )
                if (hasCreateComponentVNode) {
                    hasImport = true
                    break
                }
            }
        }
    }

    // 如果没有导入，添加 import { createComponentVNode, createElementVNode } from '../utils/ReactiveVNode'
    if (!hasImport) {
        // 手动创建 ImportSpecifier
        const specifier1: SlimeImportSpecifier = {
            type: SlimeAstType.ImportSpecifier,
            local: SlimeAstUtil.createIdentifier('createComponentVNode'),
            imported: SlimeAstUtil.createIdentifier('createComponentVNode')
        }

        const specifier2: SlimeImportSpecifier = {
            type: SlimeAstType.ImportSpecifier,
            local: SlimeAstUtil.createIdentifier('createElementVNode'),
            imported: SlimeAstUtil.createIdentifier('createElementVNode')
        }

        const importDecl = SlimeAstUtil.createImportDeclaration(
            [specifier1, specifier2],
            SlimeAstUtil.createFromKeyword(),
            SlimeAstUtil.createStringLiteral('../utils/ReactiveVNode')
        )

        // 设置换行标记
        if (importDecl.loc) {
            importDecl.loc.newLine = true
        }

        // 添加到 body 最前面
        ast.body.unshift(importDecl)
    }

    return ast
}

/**
 * @deprecated 已废弃：格式化功能已融入 SlimeGenerator 代码生成阶段
 * @see SlimeGenerator.generatorBlockStatement - 代码生成时就完成格式化
 * @see SlimeGenerator.addIndent - 缩进管理
 *
 * 简单格式化：在语句后添加换行，并更新 mapping
 *
 * **保留原因：** 作为备选方案，适用于需要后处理已生成代码的特殊场景
 *
 * @param code 原始代码
 * @param mapping 原始 mapping
 * @returns 格式化后的代码和更新后的 mapping
 */
export function simpleFormatWithMapping(
    code: string,
    mapping: SlimeCodeMapping[]
): { code: string; mapping: SlimeCodeMapping[] } {
    // 1. 找出所有需要插入换行的位置（在 ; 后面）
    const insertPositions: number[] = [];
    for (let i = 0; i < code.length; i++) {
        if (code[i] === ';' && code[i + 1] !== '\n') {
            insertPositions.push(i + 1);
        }
    }

    if (insertPositions.length === 0) {
        return {code, mapping};
    }

    // 2. 从后往前插入换行（避免位置变化影响）
    let formatted = code;
    for (let i = insertPositions.length - 1; i >= 0; i--) {
        const pos = insertPositions[i];
        formatted = formatted.slice(0, pos) + '\n' + formatted.slice(pos);
    }

    // 3. 更新 mapping：对每个 mapping，计算它前面有多少个插入点
    const newMapping = mapping.map(map => {
        if (!map.generate) {
            return map;
        }

        // 深拷贝 mapping
        const newMap = new SlimeCodeMapping();
        newMap.source = map.source;
        newMap.generate = {...map.generate};

        // 计算这个 mapping 前面有多少个插入点
        let offsetCount = 0;
        for (const insertPos of insertPositions) {
            if (insertPos <= map.generate.index) {
                offsetCount++;
            }
        }

        // 更新 generated index
        newMap.generate.index += offsetCount;

        return newMap;
    });

    return {code: formatted, mapping: newMapping};
}


export interface ovsTransformBaseResult {
    ast: SlimeProgram
    tokens: SubhutiMatchToken[]
}

/**
 * OVS 代码转换主函数（同步，自带格式化）
 * @param code OVS 源代码
 * @returns 转换结果（包含格式化后的代码和准确的 source map）
 *
 * 转换流程：
 * 1. 词法分析：code → tokens
 * 2. 语法分析：tokens → CST
 * 3. 语法转换：CST → AST（OVS 语法 → JavaScript AST）
 * 4. 添加 import：自动添加 h 函数 import（如果不存在）
 * 5. 组件包装：AST → Vue 组件 AST
 * 6. 代码生成：AST → code（自动格式化：分号后换行、{} 缩进）
 *
 * **格式化特性：**
 * - ✅ 分号后自动换行
 * - ✅ {} 块自动缩进（2个空格/层）
 * - ✅ Source map 100% 准确
 * - ✅ 零后处理成本（代码生成时完成）
 */
export function ovsTransformBase(
    code: string
): ovsTransformBaseResult {
    // 1. 词法分析
    const lexer = new SubhutiLexer(ovs6Tokens)
    const tokens = lexer.tokenize(code)

    if (!tokens.length) {
        return {ast: null, tokens: tokens}
    }

    // 2. 语法分析
    const parser = new OvsParser(tokens, OvsTokenConsumer)
    let curCst = parser.Program()

    // 3. 语法转换
    let ast = OvsCstToSlimeAstUtil.toProgram(curCst)

    return {ast, tokens}
}

//纯测试代码编译，不包含插件导出ovs文件的功能
export function ovsTransform(
    code: string
): SlimeGeneratorResult {
    let codeResult: ovsTransformBaseResult = ovsTransformBase(code)

    const result = SlimeGenerator.generator(codeResult.ast, codeResult.tokens)

    return result
}

export function vitePluginOvsTransform(
    code: string
): SlimeGeneratorResult {
    let codeResult = ovsTransformBase(code)
    let ast = codeResult.ast

    // 4. 添加 import
    ast = ensureOvsAPIImport(ast)

    // 5. 包裹顶层表达式
    ast = wrapTopLevelExpressions(ast)

    // 6. 代码生成
    const result = SlimeGenerator.generator(ast, codeResult.tokens)

    // 7. 过滤映射
    result.mapping = result.mapping.filter(m =>
        m.source &&
        m.source.value &&
        m.source.value !== '' &&
        m.source.length > 0
    )
    return result
}

/**
 * @deprecated 已废弃：不再使用后处理格式化，改用 vitePluginOvsTransform
 * @see vitePluginOvsTransform - 直接使用此方法，SlimeGenerator 已自带格式化
 * @see vitePluginOvs - Vite 插件已改用 vitePluginOvsTransform
 *
 * OVS 代码转换主函数（同步，带格式化）
 *
 * **保留原因：** 历史兼容性，展示后处理格式化方案
 *
 * @param code OVS 源代码
 * @returns 转换结果（包含代码和 source map）
 */
export function vitePluginOvsTransformWithBeautify(
    code: string
): SlimeGeneratorResult {
    // 先进行标准转换
    const result = vitePluginOvsTransform(code);

    // 使用简单格式化并更新 mapping（保持 source map 准确）
    try {
        const formatted = simpleFormatWithMapping(result.code, result.mapping);
        return {
            code: formatted.code,
            mapping: formatted.mapping
        };
    } catch (e) {
        console.warn('OVS code formatting (simple) failed:', e);
        return result;
    }
}

/**
 * OVS 代码转换主函数（异步，支持 Prettier）
 * @param code OVS 源代码
 * @param prettify 是否使用 Prettier 格式化（异步）
 * @returns 转换结果（包含代码和 source map）
 */
export async function vitePluginOvsTransformAsync(
    code: string,
    prettify: boolean = true
): Promise<SlimeGeneratorResult> {
    // 调用同步方法（无格式化）
    const result = vitePluginOvsTransform(code)

    // 使用 Prettier 异步格式化（可选）
    if (prettify) {
        try {
            result.code = await prettier.format(result.code, {
                parser: 'babel',
                semi: false,
                singleQuote: true,
                tabWidth: 2,
                printWidth: 80
            })
        } catch (e) {
            console.warn('OVS code formatting (prettier) failed:', e)
        }
    }

    return result
}

/**
 * Vite 插件：处理 .ovs 文件
 * @returns Vite 插件配置
 *
 * 功能：
 * - 拦截 .ovs 文件
 * - 转换为 Vue 函数组件
 * - 自动格式化生成的代码（分号后换行、{} 缩进）
 *
 * **格式化方案：**
 * - 使用 `vitePluginOvsTransform`，内部由 SlimeGenerator 在代码生成时完成格式化
 * - 不再使用后处理方案（`simpleFormatWithMapping` 已废弃）
 * - Source map 保持 100% 准确
 */
export default function vitePluginOvs(): Plugin {
    // 创建文件过滤器：只处理 .ovs 文件
    const filter = createFilter(/\.ovs$/, null)

    return {
        name: 'vite-plugin-ovs',
        enforce: 'pre',  // 在其他插件之前执行

        transform(code, id) {
            // 只处理 .ovs 文件
            if (!filter(id)) {
                return
            }

            // 转换 OVS 代码（SlimeGenerator 已自带格式化：分号后换行 + {} 缩进）
            const res = vitePluginOvsTransform(code)

            return {
                code: res.code,
                map: null  // TODO: 支持 source map
            }
        }
    }
}

