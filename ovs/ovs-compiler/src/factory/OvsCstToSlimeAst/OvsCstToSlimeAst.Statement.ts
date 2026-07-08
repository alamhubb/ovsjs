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
import { normalizeGeneratedAst } from "cssts-compiler"
import { OvsCstToSlimeAstProperty } from "./OvsCstToSlimeAst.Property"
import { checkCstName } from "../OvsCstToSlimeAstUtils"
import { cstChildrenOf, cstNameOf, cstValueOf, isCstNamed, type SubhutiCst } from "./cst-utils"

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

    private readCstName(cst: SubhutiCst | undefined): string | undefined {
        return cstNameOf(cst)
    }

    private readCstChildren(cst: SubhutiCst | undefined): SubhutiCst[] {
        return cstChildrenOf(cst)
    }

    private hasCstName(cst: SubhutiCst | undefined, name: string): boolean {
        return isCstNamed(cst, name)
    }

    private readAstType(node: any): string | undefined {
        const rawType = node?.type
        if (typeof rawType === 'string') return rawType
        const value = typeof rawType === 'function' ? rawType.call(node) : rawType
        if (typeof value === 'string') return value
        const enumName = typeof value?.name === 'function' ? value.name() : value?.__qinEnumName
        if (typeof enumName === 'string' && enumName.length > 0) {
            return enumName.split('_').filter(Boolean).map(part => {
                if (part === 'TS') return 'TS'
                const lower = part.toLowerCase()
                return lower.slice(0, 1).toUpperCase() + lower.slice(1)
            }).join('')
        }
        return undefined
    }

    private findFirstCst(cst: SubhutiCst | undefined, name: string): SubhutiCst | undefined {
        if (!cst) return undefined
        if (this.readCstName(cst) === name) return cst
        for (const child of this.readCstChildren(cst)) {
            const found = this.findFirstCst(child, name)
            if (found) return found
        }
        return undefined
    }

    // ==================== 语句转换方法 ====================

    /**
     * 重写 createExpressionAst 处理
     * 
     * 添加对 OvsRenderFunction 的支持
     */
    private isExpressionCstName(name: string | undefined): boolean {
        return name === 'Expression'
            || name === 'AssignmentExpression'
            || name === 'ConditionalExpression'
            || name === 'LogicalORExpression'
            || name === 'LogicalANDExpression'
            || name === 'BitwiseORExpression'
            || name === 'BitwiseXORExpression'
            || name === 'BitwiseANDExpression'
            || name === 'EqualityExpression'
            || name === 'RelationalExpression'
            || name === 'ShiftExpression'
            || name === 'AdditiveExpression'
            || name === 'MultiplicativeExpression'
            || name === 'ExponentiationExpression'
            || name === 'UnaryExpression'
            || name === 'UpdateExpression'
            || name === 'LeftHandSideExpression'
            || name === 'MemberExpression'
            || name === 'CallExpression'
            || name === 'NewExpression'
            || name === 'PrimaryExpression'
            || name === 'IdentifierReference'
            || name === 'Literal'
            || name === 'ParenthesizedExpression'
            || name === 'OvsRenderFunction'
    }

    private blockFromStatements(statements: SlimeStatement[], loc: any): SlimeStatement {
        return SlimeAstCreateUtils.createBlockStatement(
            statements,
            loc,
            SlimeTokenCreateUtils.createLBraceToken(loc),
            SlimeTokenCreateUtils.createRBraceToken(loc)
        ) as SlimeStatement
    }

    private createIfBodyStatementAst(cst: SubhutiCst | undefined): SlimeStatement | null {
        if (!cst) return null
        const name = this.readCstName(cst)
        if (!name) return null

        if (name === 'IfStatementBody') {
            const statementList = this.findFirstCst(cst, 'StatementList')
            if (statementList) {
                return this.blockFromStatements(this.createStatementListAst(statementList), cst.loc)
            }
            for (const child of this.readCstChildren(cst)) {
                const body = this.createIfBodyStatementAst(child)
                if (body) return body
            }
            return null
        }

        if (name === 'Block' || name === 'BlockStatement') {
            const statementList = this.findFirstCst(cst, 'StatementList')
            return this.blockFromStatements(statementList ? this.createStatementListAst(statementList) : [], cst.loc)
        }

        if (name === 'Statement' || name === 'StatementListItem' || name === 'Declaration' || name === 'OvsRenderStatement'
            || name === 'ExpressionStatement' || name === 'ReturnStatement' || name === 'IfStatement'
            || name === 'VariableStatement' || name === 'LexicalDeclaration' || name === 'VariableDeclaration') {
            const result = this.createStatementListItemAst(cst)
            const statements = Array.isArray(result) ? result : [result as any]
            if (statements.length === 0) return null
            return statements.length === 1 ? statements[0] : this.blockFromStatements(statements, cst.loc)
        }

        return null
    }

    createExpressionAst(cst: SubhutiCst): SlimeExpression {
        const astName = this.readCstName(cst)
        let left
        if (astName === 'OvsRenderFunction') {
            left = this.createOvsRenderDomViewDeclarationAst(cst)
        } else if (astName === 'ObjectLiteral') {
            left = (this as any).createObjectPropsAst(cst)
        } else {
            left = super.createExpressionAst(cst)
        }
        return left
    }

    createReturnStatementAst(cst: SubhutiCst): SlimeStatement {
        const render = this.findFirstCst(cst, 'OvsRenderFunction')
        if (render) {
            return SlimeAstCreateUtils.createReturnStatement(
                this.createOvsRenderDomViewDeclarationAst(render),
                cst.loc
            ) as SlimeStatement
        }
        return super.createReturnStatementAst(cst)
    }

    /**
     * Override: 处理 StatementList，支持 NoRenderBlock
     */
    createIfStatementAst(cst: SubhutiCst): SlimeStatement {
        let test: SlimeExpression | null = null
        let consequent: SlimeStatement | null = null
        let alternate: SlimeStatement | null = null
        let sawElse = false

        for (const child of this.readCstChildren(cst)) {
            const name = this.readCstName(child)
            if (name === 'Else' || cstValueOf(child) === 'else') {
                sawElse = true
                continue
            }
            if (!test && this.isExpressionCstName(name)) {
                test = normalizeGeneratedAst((this as any).createExpressionAst(child) as any) as SlimeExpression
                continue
            }
            const body = this.createIfBodyStatementAst(child)
            if (!body) continue
            if (!sawElse && !consequent) {
                consequent = body
            } else if (sawElse && !alternate) {
                alternate = body
            }
        }

        if (!test) {
            throw new Error('IfStatement has no test expression')
        }

        return SlimeAstCreateUtils.createIfStatement(
            test,
            consequent || this.blockFromStatements([], cst.loc),
            alternate,
            cst.loc
        ) as SlimeStatement
    }

    createStatementListAst(cst: SubhutiCst): SlimeStatement[] {
        checkCstName(cst, SlimeParser.prototype.StatementList.name)

        const statements: SlimeStatement[] = []

        const children = this.readCstChildren(cst)
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
        const name = this.readCstName(cst)
        const children = this.readCstChildren(cst)
        const isWrapper = name === 'ModuleItem' || name === 'StatementListItem' || name === 'Statement'
        const isStatementNode = name === 'Statement'
        const isOvsStatementWrapper = name === 'Statement' && children.some(child => this.hasCstName(child, 'OvsRenderStatement') || this.hasCstName(child, 'NoRenderBlock'))
        const isDirectStatementListItemChild = name === 'Declaration'
            || name === 'VariableStatement'
            || name === 'LexicalDeclaration'
            || name === 'VariableDeclaration'
            || name === 'OvsRenderStatement'
            || name === 'ReturnStatement'
            || name === 'ExpressionStatement'
            || name === 'BlockStatement'
            || name === 'IfStatement'
            || name === 'IterationStatement'
            || name === 'DoWhileStatement'
            || name === 'WhileStatement'
            || name === 'ForStatement'
            || name === 'ForInOfStatement'
            || name === 'ContinueStatement'
            || name === 'BreakStatement'
            || name === 'WithStatement'
            || name === 'ThrowStatement'
            || name === 'TryStatement'
            || name === 'DebuggerStatement'
            || name === 'LabelledStatement'
            || name === 'SwitchStatement'
        if (!isWrapper && !isStatementNode && !isDirectStatementListItemChild) {
            checkCstName(cst, SlimeParser.prototype.StatementListItem.name)
        }

        if (children.length === 0 && !isDirectStatementListItemChild && !isOvsStatementWrapper) {
            return []
        }

        if (isWrapper || isOvsStatementWrapper) {
            const collected: SlimeStatement[] = []
            for (const child of children) {
                const result = this.createStatementListItemAst(child)
                collected.push(...(Array.isArray(result) ? result : [result]))
            }
            return this.wrapRenderContextStatements(collected, cst.loc)
        }

        const child = cst

        if (this.hasCstName(child, 'OvsRenderStatement')) {
            return this.createOvsRenderStatementAst(child, cst.loc)
        }

        if (this.hasCstName(child, 'ExpressionStatement')) {
            return [this.createExpressionStatementAst(child)]
        }

        if (this.hasCstName(child, 'ReturnStatement')) {
            return [this.createReturnStatementAst(child)]
        }

        if (this.hasCstName(child, 'IfStatement')) {
            return this.wrapRenderContextStatements([this.createIfStatementAst(child)], cst.loc)
        }

        if (this.hasCstName(child, 'VariableStatement') || this.hasCstName(child, 'LexicalDeclaration') || this.hasCstName(child, 'VariableDeclaration')) {
            return [this.wrapRenderContextStatement((this as any).createVariableDeclarationAst(child), cst.loc)]
        }

        if (this.hasCstName(child, 'Declaration')) {
            const declaration = (this as any).createDeclarationAst(child)
            return declaration ? [this.wrapRenderContextStatement(declaration, cst.loc)] : []
        }

        // 检查是否是 Statement
        if (this.hasCstName(child, 'Statement')) {
            const statementChild = this.readCstChildren(child)[0]

            // 处理 OvsRenderStatement - 语句版本的 OVS 渲染
            if (this.hasCstName(statementChild, 'OvsRenderStatement')) {
                return this.createOvsRenderStatementAst(statementChild, cst.loc)
            }

            // 处理 NoRenderBlock - 展开处理
            if (this.hasCstName(statementChild, 'NoRenderBlock')) {
                // 识别为 NoRenderBlock，展开处理
                this.noRenderDepth++

                try {
                    // 找到内部的 StatementList
                    const innerList = this.readCstChildren(statementChild).find(
                        c => this.readCstName(c) === 'StatementList'
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
        const baseResult = super.createStatementListItemAst(cst)
        const stmts = baseResult == null ? [] : Array.isArray(baseResult) ? baseResult : [baseResult]

        // 在渲染上下文中（div {} 内且非 #{} 内），对控制流语句进行响应式包裹
        return this.wrapRenderContextStatements(stmts, cst.loc)
    }

    private wrapRenderContextStatements(stmts: SlimeStatement[], loc: any): SlimeStatement[] {
        if (this.ovsRenderDomViewDepth <= 0 || this.noRenderDepth !== 0) {
            return stmts
        }
        return stmts.map((stmt: SlimeStatement) => this.wrapRenderContextStatement(stmt, loc))
    }

    private wrapRenderContextStatement(stmt: SlimeStatement, loc: any): SlimeStatement {
        if (this.ovsRenderDomViewDepth > 0 && this.noRenderDepth === 0 && this.needsReactiveWrap(stmt)) {
            return this.wrapStatementWithReactiveExpression(stmt, null, loc)
        }
        return stmt
    }

    private createOvsRenderStatementAst(statementChild: SubhutiCst, loc: any): SlimeExpressionStatement[] {
        const expr = this.createOvsRenderDomViewDeclarationAst(statementChild)

        if (this.ovsRenderDomViewDepth > 0) {
            const pushCall = SlimeAstCreateUtils.createCallExpression(
                SlimeAstCreateUtils.createMemberExpression(
                    SlimeAstCreateUtils.createIdentifier('children'),
                    SlimeTokenCreateUtils.createDotToken(loc),
                    SlimeAstCreateUtils.createIdentifier('push')
                ),
                this.createCallArguments([expr])
            )
            if (loc) {
                pushCall.loc = loc
            }
            return [{
                type: SlimeAstTypeName.ExpressionStatement,
                expression: pushCall,
                loc
            } as SlimeExpressionStatement]
        }

        return [{
            type: SlimeAstTypeName.ExpressionStatement,
            expression: expr,
            loc
        } as SlimeExpressionStatement]
    }

    /**
     * 重写 PrimaryExpression 处理
     *
     * 添加对 OvsRenderFunction 的支持
     * OvsRenderFunction 在 OvsParser 中被放在 PrimaryExpression 层级
     */
    createPrimaryExpressionAst(cst: SubhutiCst): SlimeExpression {
        const first = this.readCstChildren(cst)[0]

        // 处理 OvsRenderFunction
        if (this.hasCstName(first, 'OvsRenderFunction')) {
            return this.createOvsRenderDomViewDeclarationAst(first)
        }

        // 其他情况调用父类处理
        return super.createPrimaryExpressionAst(cst)
    }

    private expressionStatementExpressionCst(cst: SubhutiCst): SubhutiCst {
        let current = cst
        let children = this.readCstChildren(current)

        while (this.hasCstName(current, 'ExpressionStatement') && children.length === 1 && this.hasCstName(children[0], 'ExpressionStatement')) {
            current = children[0]
            children = this.readCstChildren(current)
        }

        const expression = children.find(child => this.hasCstName(child, 'Expression')) || children.find(child => {
            const name = this.readCstName(child)
            return name !== 'Semicolon' && name !== 'SemicolonASI'
        })
        if (!expression) {
            throw new Error('ExpressionStatement has no expression')
        }
        return expression
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
        const exprCst = this.expressionStatementExpressionCst(cst)

        // 检查是否包含 OvsRenderFunction（递归查找）
        const isOvsRenderFunction = this.findOvsRenderFunction(exprCst)

        const expr = normalizeGeneratedAst((this as any).createExpressionAst(exprCst) as any) as SlimeExpression

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
        if (this.readAstType(expr) === SlimeAstTypeName.Literal) {
            return this.createSimplePushStatement(expr, loc)
        }

        // 动态表达式：使用响应式包裹
        return this.createReactivePushStatement(expr, loc)
    }

    /**
     * 创建简单的 children.push(expr) 语句（无响应式包裹）
     */
    private createSimplePushStatement(expr: SlimeExpression, loc: any): SlimeExpressionStatement {
        const normalizedExpr = normalizeGeneratedAst(expr as any) as SlimeExpression
        const pushCall = SlimeAstCreateUtils.createCallExpression(
            SlimeAstCreateUtils.createMemberExpression(
                SlimeAstCreateUtils.createIdentifier('children'),
                SlimeTokenCreateUtils.createDotToken(loc),
                SlimeAstCreateUtils.createIdentifier('push')
            ),
            this.createCallArguments([normalizedExpr])
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
