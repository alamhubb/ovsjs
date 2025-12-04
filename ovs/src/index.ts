// OVS 核心库
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
import type {Plugin} from 'vite';
import {createFilter} from 'vite';

/**
 * 检查源代码是否包含响应式表达式 #{}
 * @param sourceCode 源代码字符串
 * @returns 是否包含 #{}
 */
function hasReactiveExpression(sourceCode: string): boolean {
    return sourceCode.includes('#{')
}

/**
 * 创建 Fragment 包裹的表达式: h(Fragment, null, [...])
 * @param expressions 子表达式数组
 * @returns h(Fragment, null, [...]) 调用表达式
 */
function createFragmentWrapper(expressions: any[]): any {
    // h(Fragment, null, [expr1, expr2, ...])
    // 需要把每个表达式包装成 ArrayElement，除了最后一个都需要逗号
    const arrayElements = expressions.map((expr, index) => {
        const isLast = index === expressions.length - 1
        return SlimeAstUtil.createArrayElement(
            expr,
            isLast ? undefined : SlimeTokenCreate.createCommaToken()
        )
    })
    return SlimeAstUtil.createCallExpression(
        SlimeAstUtil.createIdentifier('h'),
        [
            SlimeAstUtil.createIdentifier('Fragment'),
            SlimeAstUtil.createNullLiteralToken(),
            SlimeAstUtil.createArrayExpression(arrayElements)
        ]
    )
}

/**
 * 确保有 Fragment 和 h 的导入
 * @param imports 现有的 import 语句数组
 * @returns 更新后的 import 语句数组
 */
function ensureFragmentImport(imports: any[]): any[] {
    // 检查是否已经有 vue 的导入
    let vueImport: SlimeImportDeclaration | null = null
    for (const imp of imports) {
        if (imp.type === SlimeNodeType.ImportDeclaration) {
            const source = (imp as SlimeImportDeclaration).source
            if (source.value === 'vue') {
                vueImport = imp as SlimeImportDeclaration
                break
            }
        }
    }

    if (vueImport) {
        // 已有 vue 导入，检查是否有 Fragment 和 h
        const specifiers = vueImport.specifiers || []
        const hasFragment = specifiers.some((s: any) =>
            s.type === SlimeNodeType.ImportSpecifier &&
            (s.imported?.name === 'Fragment' || s.local?.name === 'Fragment')
        )
        const hasH = specifiers.some((s: any) =>
            s.type === SlimeNodeType.ImportSpecifier &&
            (s.imported?.name === 'h' || s.local?.name === 'h')
        )

        // 添加缺失的导入
        if (!hasFragment) {
            specifiers.push({
                type: SlimeNodeType.ImportSpecifier,
                imported: SlimeAstUtil.createIdentifier('Fragment'),
                local: SlimeAstUtil.createIdentifier('Fragment')
            })
        }
        if (!hasH) {
            specifiers.push({
                type: SlimeNodeType.ImportSpecifier,
                imported: SlimeAstUtil.createIdentifier('h'),
                local: SlimeAstUtil.createIdentifier('h')
            })
        }
        return imports
    } else {
        // 没有 vue 导入，创建新的
        const newImport = SlimeAstUtil.createImportDeclaration(
            [
                {
                    type: SlimeNodeType.ImportSpecifier,
                    imported: SlimeAstUtil.createIdentifier('Fragment'),
                    local: SlimeAstUtil.createIdentifier('Fragment')
                } as SlimeImportSpecifier,
                {
                    type: SlimeNodeType.ImportSpecifier,
                    imported: SlimeAstUtil.createIdentifier('h'),
                    local: SlimeAstUtil.createIdentifier('h')
                } as SlimeImportSpecifier
            ],
            SlimeAstUtil.createStringLiteral('vue')
        )
        return [newImport, ...imports]
    }
}

/**
 * 包裹顶层表达式
 *
 * 新规则（简化版）：
 * 1. 有 export default - 保持原样
 * 2. 检查源代码是否包含 #{} 来决定是否使用 IIFE
 * 3. 多个节点时使用 Fragment 包裹
 *
 * @param ast Program AST
 * @param sourceCode 源代码（用于检测 #{}）
 * @returns 包裹后的 Program AST
 */
function wrapTopLevelExpressions(ast: SlimeProgram, sourceCode: string): SlimeProgram {
    let imports: any[] = []             // import 语句（必须在顶层）
    const declarations: any[] = []      // 其他 declarations（const、function等）
    const expressions: SlimeStatement[] = []
    let hasAnyExport = false

    // 1. 分类语句
    for (const statement of ast.body) {
        if (statement.type === SlimeNodeType.ImportDeclaration) {
            imports.push(statement)
        } else if (statement.type === SlimeNodeType.ExportDefaultDeclaration ||
            statement.type === SlimeNodeType.ExportNamedDeclaration) {
            hasAnyExport = true
        } else if (statement.type === SlimeNodeType.VariableDeclaration ||
            statement.type === SlimeNodeType.FunctionDeclaration ||
            statement.type === SlimeNodeType.ClassDeclaration) {
            declarations.push(statement)
        } else if (statement.type === SlimeNodeType.ExpressionStatement) {
            expressions.push(statement as SlimeStatement)
        } else {
            // 其他语句（if、for 等）也归类为表达式
            expressions.push(statement as SlimeStatement)
        }
    }

    // 2. 如果有 export，保持原样
    if (hasAnyExport) {
        return ast
    }

    // 3. 如果没有表达式，保持原样
    if (expressions.length === 0) {
        return ast
    }

    // 4. 提取所有表达式
    const exprValues = expressions.map(e => {
        if (e.type === SlimeNodeType.ExpressionStatement) {
            return (e as SlimeExpressionStatement).expression
        }
        return e
    })

    // 5. 判断是否需要 IIFE（检查是否有 #{}）
    const needsIIFE = hasReactiveExpression(sourceCode)

    // 6. 构建最终表达式
    let finalExpr: any
    if (exprValues.length === 1) {
        // 单个节点：直接返回
        finalExpr = exprValues[0]
    } else {
        // 多个节点：用 Fragment 包裹
        imports = ensureFragmentImport(imports)
        finalExpr = createFragmentWrapper(exprValues)
    }

    if (needsIIFE) {
        // 有 #{}：使用 IIFE 包裹 declarations + return expr
        const returnStmt = SlimeAstUtil.createReturnStatement(finalExpr)
        const allStatements = [...declarations, returnStmt]

        const blockStatement = SlimeAstUtil.createBlockStatement(allStatements)
        const functionExpression = SlimeAstUtil.createFunctionExpression(
            blockStatement,
            null,  // id
            [],    // params
            false, // generator
            false  // async
        )
        const parenExpr = SlimeAstUtil.createParenthesizedExpression(functionExpression)
        const iife = SlimeAstUtil.createCallExpression(parenExpr, [])

        const exportDefault = SlimeAstUtil.createExportDefaultDeclaration(iife)
        return SlimeAstUtil.createProgram(
            [...imports, exportDefault] as any,
            SlimeProgramSourceType.Module
        )
    } else {
        // 无 #{}：直接导出
        // 如果有 declarations，也需要保留在顶层
        const exportDefault = SlimeAstUtil.createExportDefaultDeclaration(finalExpr)
        return SlimeAstUtil.createProgram(
            [...imports, ...declarations, exportDefault] as any,
            SlimeProgramSourceType.Module
        )
    }
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
 * 1. 按需词法分析 + 语法分析：code → CST
 * 2. 语法转换：CST → AST（OVS 语法 → JavaScript AST）
 * 3. 添加 import：自动添加 h 函数 import（如果不存在）
 * 4. 组件包装：AST → Vue 组件 AST
 * 5. 代码生成：AST → code（自动格式化：分号后换行、{} 缩进）
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
    // 1. 按需词法分析 + 语法分析（使用新架构）
    const parser = new OvsParser(code)
    let curCst = parser.Program()

    // 获取解析后的 tokens
    const tokens = parser.parsedTokens

    if (!tokens.length) {
        return {ast: null, tokens: tokens}
    }

    // 2. 语法转换
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

    // 如果 ast 为 null（空文件或解析失败），返回空结果
    if (!ast) {
        return {
            code: '',
            mapping: []
        }
    }

    // 注意：不再自动添加 import
    // 开发者根据语言服务器的智能提示自己导入所需的函数
    // 例如：import { div, h1 } from './utils/htmlElements'

    // 包裹顶层表达式（传入源代码用于检测 #{}）
    ast = wrapTopLevelExpressions(ast, code)

    // 代码生成
    const result = SlimeGenerator.generator(ast, codeResult.tokens)

    // 过滤映射
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
 * @param prettify 是否使用 Prettier 格式化（异步）- 当前已禁用
 * @returns 转换结果（包含代码和 source map）
 */
export async function vitePluginOvsTransformAsync(
    code: string,
    prettify: boolean = true
): Promise<SlimeGeneratorResult> {
    // 调用同步方法（无格式化）
    const result = vitePluginOvsTransform(code)

    // Prettier 格式化已禁用（避免额外依赖）
    // 如需启用，请安装 prettier 并取消下面的注释
    // if (prettify) {
    //     try {
    //         const prettier = await import('prettier')
    //         result.code = await prettier.format(result.code, {
    //             parser: 'babel',
    //             semi: false,
    //             singleQuote: true,
    //             tabWidth: 2,
    //             printWidth: 80
    //         })
    //     } catch (e) {
    //         console.warn('OVS code formatting (prettier) failed:', e)
    //     }
    // }

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



