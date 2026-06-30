import { SubhutiCst } from "subhuti"
import OvsParser from "../../parser/OvsParser"
import {
    SlimeAstTypeName,
    type SlimeExpression,
    type SlimeExpressionStatement,
    type SlimeStatement,
    SlimeAstCreateUtils,
    SlimeTokenCreateUtils
} from "slime-ast"
import { QinParser as SlimeParser } from "@qin/generated-qin-parser-ts"
import { OvsCstToSlimeAstProperty } from "./OvsCstToSlimeAst.Property"
import { checkCstName } from "../OvsCstToSlimeAstUtils"

/**
 * OVS 语句转换层
 * 
 * 负责转换各种语句类型：
 * - createStatementListAst: 语句列表转换
 * - createStatementListItemAst: 语句项转换
 * - createExpressionStatementAst: 表达式语句转换
 * - createPrimaryExpressionAst: 主表达式转换（支持OvsRenderFunction）
 */
export abstract class OvsCstToSlimeAstStatement extends OvsCstToSlimeAstProperty {

    // 需要从主类访问的状态变量（声明为abstract）
    protected abstract hasOvsSyntax: boolean
    protected abstract ovsRenderDomViewDepth: number
    protected abstract noRenderDepth: number

    // 需要从主类访问的抽象方法
    protected abstract createOvsRenderDomViewDeclarationAst(cst: SubhutiCst): SlimeExpression
    protected abstract findOvsRenderFunction(cst: SubhutiCst): boolean
    protected abstract isSideEffectExpression(expr: SlimeExpression): boolean
    protected abstract needsReactiveWrap(stmt: SlimeStatement): boolean
    protected abstract wrapStatementWithReactiveExpression(stmt: SlimeStatement, _unused?: any, loc?: any): SlimeStatement

    private cstName(cst: SubhutiCst | undefined): string | undefined {
        if (!cst) return undefined
        return typeof (cst as any).getName === 'function' ? (cst as any).getName() : (cst as any).name
    }

    private cstChildren(cst: SubhutiCst | undefined): SubhutiCst[] {
        if (!cst) return []
        const children = typeof (cst as any).getChildren === 'function'
            ? (cst as any).getChildren()
            : (cst as any).children
        if (Array.isArray(children)) return children
        if (Array.isArray((children as any)?.__items)) return (children as any).__items
        return []
    }

    private isCst(cst: SubhutiCst | undefined, name: string): boolean {
        return this.cstName(cst) === name
    }

    // ==================== 语句转换方法 ====================

    /**
     * 重写 createExpressionAst 处理
     * 
     * 添加对 OvsRenderFunction 的支持
     */
    createExpressionAst(cst: SubhutiCst): SlimeExpression {
        const astName = this.cstName(cst)
        let left
        if (astName === 'OvsRenderFunction') {
            left = this.createOvsRenderDomViewDeclarationAst(cst)
        } else {
            left = super.createExpressionAst(cst)
        }
        return left
    }

    /**
     * Override: 处理 StatementList，支持 NoRenderBlock
     */
    createStatementListAst(cst: SubhutiCst): SlimeStatement[] {
        checkCstName(cst, SlimeParser.prototype.StatementList.name)

        const statements: SlimeStatement[] = []

        const children = this.cstChildren(cst)
        if (children.length === 0) return statements

        for (const child of children) {
            // StatementListItem 包裹了 Statement 或 Declaration
            const stmts = this.createStatementListItemAst(child)

            // 展开数组
            if (Array.isArray(stmts)) {
                statements.push(...stmts)
            } else {
                statements.push(stmts as any)
            }
        }

        return statements
    }

    /**
     * Override: 处理 StatementListItem，支持 OvsRenderStatement 和 NoRenderBlock
     */
    createStatementListItemAst(cst: SubhutiCst): SlimeStatement[] {
        checkCstName(cst, SlimeParser.prototype.StatementListItem.name)

        const children = this.cstChildren(cst)
        if (children.length === 0) {
            return []
        }

        const child = children[0]

        // 检查是否是 Statement
        if (this.isCst(child, 'Statement')) {
            const statementChild = this.cstChildren(child)[0]

            // 处理 OvsRenderStatement - 语句版本的 OVS 渲染
            if (this.isCst(statementChild, 'OvsRenderStatement')) {
                // OvsRenderStatement 和 OvsRenderFunction 的 CST 结构相同，复用转换逻辑
                const expr = this.createOvsRenderDomViewDeclarationAst(statementChild)

                // 在 OVS 渲染上下文中，需要包装成 children.push()
                if (this.ovsRenderDomViewDepth > 0) {
                    const pushCall = SlimeAstCreateUtils.createCallExpression(
                        SlimeAstCreateUtils.createMemberExpression(
                            SlimeAstCreateUtils.createIdentifier('children'),
                            SlimeTokenCreateUtils.createDotToken(cst.loc),
                            SlimeAstCreateUtils.createIdentifier('push')
                        ),
                        [expr]
                    )
                    if (cst.loc) {
                        pushCall.loc = cst.loc
                    }
                    return [{
                        type: SlimeAstTypeName.ExpressionStatement,
                        expression: pushCall,
                        loc: cst.loc
                    } as SlimeExpressionStatement]
                }

                // 不在渲染上下文中，直接作为表达式语句
                return [{
                    type: SlimeAstTypeName.ExpressionStatement,
                    expression: expr,
                    loc: cst.loc
                } as SlimeExpressionStatement]
            }

            // 处理 NoRenderBlock - 展开处理
            if (this.isCst(statementChild, 'NoRenderBlock')) {
                // 识别为 NoRenderBlock，展开处理
                this.noRenderDepth++

                try {
                    // 找到内部的 StatementList
                    const innerList = this.cstChildren(statementChild).find(
                        c => this.cstName(c) === 'StatementList'
                    )

                    if (innerList) {
                        // 递归处理内部语句，直接展开
                        const innerStatements = this.createStatementListAst(innerList)

                        // 给所有子语句添加 NoRenderBlock 标记，用于父级 IIFE 判断
                        for (const stmt of innerStatements) {
                            (stmt as any)._isFromNoRenderBlock = true
                        }

                        return innerStatements  // 返回数组（会被展开）
                    }

                    return []
                } finally {
                    this.noRenderDepth--
                }
            }
        }

        // 正常处理（调用父类）
        const stmts = super.createStatementListItemAst(cst)

        // 在渲染上下文中（div {} 内且非 #{} 内），对控制流语句进行响应式包裹
        if (this.ovsRenderDomViewDepth > 0 && this.noRenderDepth === 0) {
            // 遍历 stmts，对需要响应式包裹的语句（控制流语句）进行包裹
            return stmts.map((stmt: SlimeStatement) => {
                if (this.needsReactiveWrap(stmt)) {
                    // 控制流语句（if/for/while）需要响应式包裹
                    return this.wrapStatementWithReactiveExpression(stmt, null, cst.loc)
                }
                // 变量声明、普通表达式等直接返回
                return stmt
            })
        }

        return stmts
    }

    /**
     * 重写 PrimaryExpression 处理
     *
     * 添加对 OvsRenderFunction 的支持
     * OvsRenderFunction 在 OvsParser 中被放在 PrimaryExpression 层级
     */
    createPrimaryExpressionAst(cst: SubhutiCst): SlimeExpression {
        const first = this.cstChildren(cst)[0]

        // 处理 OvsRenderFunction
        if (this.isCst(first, 'OvsRenderFunction')) {
            return this.createOvsRenderDomViewDeclarationAst(first)
        }

        // 其他情况调用父类处理
        return super.createPrimaryExpressionAst(cst)
    }

    /**
     * 重写 ExpressionStatement 处理
     *
     * 核心逻辑（新版本）：
     * - 优先级：OvsRenderFunction > noRenderDepth > ovsRenderDomViewDepth
     * - OvsRenderFunction（p {}）：永远渲染（优先级最高）
     * - 在 #{} 内（noRenderDepth > 0）：不渲染（除非是 OvsRenderFunction）
     * - 在 div {} 内（ovsRenderDomViewDepth > 0）：渲染
     * - 其他：保持原样（不渲染）
     */
    createExpressionStatementAst(cst: SubhutiCst): SlimeExpressionStatement | any {
        const exprCst = this.cstChildren(cst)[0]
        if (!exprCst) {
            throw new Error('ExpressionStatement has no expression')
        }

        // 检查是否包含 OvsRenderFunction（递归查找）
        const isOvsRenderFunction = this.findOvsRenderFunction(exprCst)

        const expr = (this as any).createExpressionAst(exprCst)

        // 判断逻辑
        if (this.ovsRenderDomViewDepth > 0) {
            // 在 div {} 内

            // 1. OvsRenderFunction → 永远渲染（优先级最高）
            if (isOvsRenderFunction) {
                return this.createRenderExpressionStatement(expr, cst.loc)
            }

            // 2. 在 #{} 内 → 不渲染，保持原样
            if (this.noRenderDepth > 0) {
                return {
                    type: SlimeAstTypeName.ExpressionStatement,
                    expression: expr,
                    loc: cst.loc
                } as SlimeExpressionStatement
            }

            // 3. 副作用表达式（赋值、更新、delete）→ 不渲染
            if (this.isSideEffectExpression(expr)) {
                return {
                    type: SlimeAstTypeName.ExpressionStatement,
                    expression: expr,
                    loc: cst.loc
                } as SlimeExpressionStatement
            }

            // 4. 求值表达式 → 渲染
            return this.createRenderExpressionStatement(expr, cst.loc)
        }

        // 不在 div {} 内 → 保持原样
        return {
            type: SlimeAstTypeName.ExpressionStatement,
            expression: expr,
            loc: cst.loc
        } as SlimeExpressionStatement
    }

    /**
     * 创建渲染表达式语句
     * 
     * 优化：静态Literal不需要defineReactiveExpression包裹
     * - 静态表达式：children.push(expr)
     * - 动态表达式：children.push(defineReactiveExpression(() => expr))
     */
    private createRenderExpressionStatement(expr: SlimeExpression, loc: any): SlimeExpressionStatement {
        // 优化：Literal 是静态的，不需要响应式包裹
        if (expr.type === SlimeAstTypeName.Literal) {
            return this.createSimplePushStatement(expr, loc)
        }

        // 动态表达式：使用响应式包裹
        return this.createReactivePushStatement(expr, loc)
    }

    /**
     * 创建简单的 children.push(expr) 语句（无响应式包裹）
     */
    private createSimplePushStatement(expr: SlimeExpression, loc: any): SlimeExpressionStatement {
        const pushCall = SlimeAstCreateUtils.createCallExpression(
            SlimeAstCreateUtils.createMemberExpression(
                SlimeAstCreateUtils.createIdentifier('children'),
                SlimeTokenCreateUtils.createDotToken(loc),
                SlimeAstCreateUtils.createIdentifier('push')
            ),
            [expr]
        )
        if (loc) {
            pushCall.loc = loc
        }
        return {
            type: SlimeAstTypeName.ExpressionStatement,
            expression: pushCall,
            loc: loc
        } as SlimeExpressionStatement
    }
}
