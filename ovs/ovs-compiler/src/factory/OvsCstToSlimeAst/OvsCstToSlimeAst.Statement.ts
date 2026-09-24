import { normalizeGeneratedAst } from "cssts-compiler"
import { OvsCstToSlimeAstProperty } from "./OvsCstToSlimeAst.Property"
import { checkCstName } from "../OvsCstToSlimeAstUtils"
import { cstChildrenOf, cstLocOf, cstNameOf, cstValueOf, isCstNamed, type OvsCst } from "./cst-utils"

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
    // 需要从主类访问的抽象方法
    protected abstract createOvsRenderDomViewDeclarationAst(cst: OvsCst): any
    protected abstract findOvsRenderFunction(cst: OvsCst): boolean
    protected abstract isSideEffectExpression(expr: any): boolean
    protected abstract needsReactiveWrap(stmt: any): boolean
    protected abstract wrapStatementWithReactiveExpression(stmt: any, _unused?: any, loc?: any): any
    protected abstract enterNoRenderBlock(): void
    protected abstract leaveNoRenderBlock(): void
    protected abstract isInsideOvsRenderDomView(): boolean
    protected abstract isInsideNoRenderBlock(): boolean
    protected abstract shouldWrapRenderContext(): boolean

    private readCstName(cst: OvsCst | undefined): string | undefined {
        return cstNameOf(cst)
    }

    private readCstChildren(cst: OvsCst | undefined): OvsCst[] {
        return cstChildrenOf(cst)
    }

    private hasCstName(cst: OvsCst | undefined, name: string): boolean {
        return isCstNamed(cst, name)
    }

    private findFirstCst(cst: OvsCst | undefined, name: string): OvsCst | undefined {
        if (cst === null || cst === undefined) return undefined
        if (this.readCstName(cst) === name) return cst
        for (const child of this.readCstChildren(cst)) {
            const found = this.findFirstCst(child, name)
            if (found !== null && found !== undefined) return found
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

    private blockFromStatements(statements: any[], loc: any): any {
        return this.createBlockStatementNode(statements, loc) as any
    }

    private createIfBodyStatementAst(cst: OvsCst | undefined): any | null {
        if (cst === null || cst === undefined) return null
        const name: string = this.readCstName(cst) as string
        if (name === null || name === undefined || name.length === 0) return null

        if (name === 'IfStatementBody') {
            const statementList = this.findFirstCst(cst, 'StatementList')
            if (statementList !== null && statementList !== undefined) {
                return this.blockFromStatements(this.createStatementListAst(statementList), cstLocOf(cst))
            }
            const children: OvsCst[] = this.readCstChildren(cst)
            for (let index = 0; index < children.length; index++) {
                const child = children[index]
                const body = this.createIfBodyStatementAst(child)
                if (body !== null && body !== undefined) return body
            }
            return null
        }

        if (name === 'Block' || name === 'BlockStatement') {
            const statementList = this.findFirstCst(cst, 'StatementList')
            const statements = statementList !== null && statementList !== undefined
                ? this.createStatementListAst(statementList)
                : []
            return this.blockFromStatements(statements, cstLocOf(cst))
        }

        if (name === 'Statement' || name === 'StatementListItem' || name === 'Declaration' || name === 'OvsRenderStatement'
            || name === 'ExpressionStatement' || name === 'ReturnStatement' || name === 'IfStatement'
            || name === 'VariableStatement' || name === 'LexicalDeclaration' || name === 'VariableDeclaration') {
            const statements: any[] = this.createStatementListItemAst(cst)
            if (statements.length === 0) return null
            return statements.length === 1 ? statements[0] : this.blockFromStatements(statements, cstLocOf(cst))
        }

        return null
    }

    createExpressionAst(cst: OvsCst): any {
        const existingAstType = this.readAstType(cst as any)
        if (existingAstType !== null && existingAstType !== undefined && existingAstType.length > 0) {
            return normalizeGeneratedAst(cst as any)
        }

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

    createReturnStatementAst(cst: OvsCst): any {
        const render = this.findFirstCst(cst, 'OvsRenderFunction')
        if (render !== null && render !== undefined) {
            return this.createReturnStatementNode(
                this.createOvsRenderDomViewDeclarationAst(render)
            ) as any
        }
        return super.createReturnStatementAst(cst)
    }

    /**
     * Override: 处理 StatementList，支持 NoRenderBlock
     */
    createIfStatementAst(cst: OvsCst): any {
        let test: any | null = null
        let consequent: any | null = null
        let alternate: any | null = null
        let sawElse = false

        const children: OvsCst[] = this.readCstChildren(cst)
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            const name: string = this.readCstName(child) as string
            const value: string = cstValueOf(child) as string
            if (name === 'Else' || value === 'else') {
                sawElse = true
                continue
            }
            if (test === null && this.isExpressionCstName(name)) {
                test = normalizeGeneratedAst(this.createExpressionAst(child) as any) as any
                continue
            }
            const body = this.createIfBodyStatementAst(child)
            if (body === null || body === undefined) continue
            if (!sawElse && consequent === null) {
                consequent = body
            } else if (sawElse && alternate === null) {
                alternate = body
            }
        }

        if (test === null) {
            throw new Error('IfStatement has no test expression')
        }

        return normalizeGeneratedAst({
            type: 'IfStatement',
            test,
            consequent: consequent === null ? this.blockFromStatements([], undefined) : consequent,
            alternate,
            loc: null
        } as any) as any
    }

    createStatementListAst(cst: OvsCst): any[] {
        checkCstName(cst, 'StatementList')

        const statements: any[] = []

        const children = this.readCstChildren(cst)
        if (children.length === 0) return statements

        for (const child of children) {
            // StatementListItem 包裹了 Statement 或 Declaration
            const stmts = this.createStatementListItemAst(child)

            // 展开数组
            if (stmts.length > 0) {
                for (let index = 0; index < stmts.length; index++) {
                    statements.push(stmts[index])
                }
            }
        }

        return statements
    }

    /**
     * Override: 处理 StatementListItem，支持 OvsRenderStatement 和 NoRenderBlock
     */
    createStatementListItemAst(cst: OvsCst): any[] {
        const name: string = this.readCstName(cst) as string
        const children: OvsCst[] = this.readCstChildren(cst)
        const isWrapper = name === 'ModuleItem' || name === 'StatementListItem' || name === 'Statement'
        const isStatementNode = name === 'Statement'
        let hasOvsStatementChild = false
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            if (this.hasCstName(child, 'OvsRenderStatement') || this.hasCstName(child, 'NoRenderBlock')) {
                hasOvsStatementChild = true
                break
            }
        }
        const isOvsStatementWrapper = name === 'Statement' && hasOvsStatementChild
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
            checkCstName(cst, 'StatementListItem')
        }

        if (children.length === 0 && !isDirectStatementListItemChild && !isOvsStatementWrapper) {
            return []
        }

        if (isWrapper || isOvsStatementWrapper) {
            const collected: any[] = []
            for (let index = 0; index < children.length; index++) {
                const child = children[index]
                const result = this.createStatementListItemAst(child)
                for (let resultIndex = 0; resultIndex < result.length; resultIndex++) {
                    collected.push(result[resultIndex])
                }
            }
            return this.wrapRenderContextStatements(collected, cstLocOf(cst))
        }

        const child = cst

        if (this.hasCstName(child, 'OvsRenderStatement')) {
            return this.createOvsRenderStatementAst(child, cstLocOf(cst))
        }

        if (this.hasCstName(child, 'ExpressionStatement')) {
            return [this.createExpressionStatementAst(child)]
        }

        if (this.hasCstName(child, 'ReturnStatement')) {
            return [this.createReturnStatementAst(child)]
        }

        if (this.hasCstName(child, 'IfStatement')) {
            return this.wrapRenderContextStatements([this.createIfStatementAst(child)], cstLocOf(cst))
        }

        if (this.hasCstName(child, 'VariableStatement') || this.hasCstName(child, 'LexicalDeclaration') || this.hasCstName(child, 'VariableDeclaration')) {
            return [this.wrapRenderContextStatement((this as any).createVariableDeclarationAst(child), cstLocOf(cst))]
        }

        if (this.hasCstName(child, 'Declaration')) {
            const declaration = (this as any).createDeclarationAst(child)
            return declaration !== null && declaration !== undefined
                ? [this.wrapRenderContextStatement(declaration, cstLocOf(cst))]
                : []
        }

        // 检查是否是 Statement
        if (this.hasCstName(child, 'Statement')) {
            const statementChildren: OvsCst[] = this.readCstChildren(child)
            const statementChild = statementChildren[0]

            // 处理 OvsRenderStatement - 语句版本的 OVS 渲染
            if (this.hasCstName(statementChild, 'OvsRenderStatement')) {
                return this.createOvsRenderStatementAst(statementChild, cstLocOf(cst))
            }

            // 处理 NoRenderBlock - 展开处理
            if (this.hasCstName(statementChild, 'NoRenderBlock')) {
                // 识别为 NoRenderBlock，展开处理
                this.enterNoRenderBlock()

                try {
                    // 找到内部的 StatementList
                    const noRenderChildren: OvsCst[] = this.readCstChildren(statementChild)
                    let innerList: OvsCst | undefined = undefined
                    for (let index = 0; index < noRenderChildren.length; index++) {
                        const noRenderChild = noRenderChildren[index]
                        const noRenderChildName: string = this.readCstName(noRenderChild) as string
                        if (noRenderChildName === 'StatementList') {
                            innerList = noRenderChild
                            break
                        }
                    }

                    if (innerList !== null && innerList !== undefined) {
                        // NoRenderBlock stays a standard BlockStatement instead of adding dynamic marker fields.
                        const innerStatements = this.createStatementListAst(innerList)
                        return [this.blockFromStatements(innerStatements, cstLocOf(cst))]
                    }

                    return []
                } finally {
                    this.leaveNoRenderBlock()
                }
            }
        }

        // 正常处理（调用父类）
        const baseResult = super.createStatementListItemAst(cst)
        const stmts = baseResult == null ? [] : Array.isArray(baseResult) ? baseResult : [baseResult]

        // 在渲染上下文中（div {} 内且非 #{} 内），对控制流语句进行响应式包裹
        return this.wrapRenderContextStatements(stmts, cstLocOf(cst))
    }

    private wrapRenderContextStatements(stmts: any[], loc: any): any[] {
        if (!this.shouldWrapRenderContext()) {
            return stmts
        }
        const wrapped: any[] = []
        for (let index = 0; index < stmts.length; index++) {
            wrapped.push(this.wrapRenderContextStatement(stmts[index], loc))
        }
        return wrapped
    }

    private wrapRenderContextStatement(stmt: any, loc: any): any {
        if (this.shouldWrapRenderContext() && this.needsReactiveWrap(stmt)) {
            return this.wrapStatementWithReactiveExpression(stmt, null, loc)
        }
        return stmt
    }

    private createOvsRenderStatementAst(statementChild: OvsCst, loc: any): any[] {
        const expr = this.createOvsRenderDomViewDeclarationAst(statementChild)

        if (this.isInsideOvsRenderDomView()) {
            const pushCall = this.createCallExpressionNode(
                this.createMemberExpressionNode(
                    this.createIdentifierNode('children'),
                    this.createDotToken(loc),
                    this.createIdentifierNode('push'),
                    loc
                ),
                this.createCallArguments([expr]),
                loc
            )
            return [this.createExpressionStatementNode(pushCall, loc) as any]
        }

        return [this.createExpressionStatementNode(expr, loc) as any]
    }

    /**
     * 重写 PrimaryExpression 处理
     *
     * 添加对 OvsRenderFunction 的支持
     * OvsRenderFunction 在 OvsParser 中被放在 PrimaryExpression 层级
     */
    createPrimaryExpressionAst(cst: OvsCst): any {
        const existingAstType = this.readAstType(cst as any)
        if (existingAstType !== null && existingAstType !== undefined && existingAstType.length > 0) {
            return normalizeGeneratedAst(cst as any)
        }

        const first = this.readCstChildren(cst)[0]

        // 处理 OvsRenderFunction
        if (this.hasCstName(first, 'OvsRenderFunction')) {
            return this.createOvsRenderDomViewDeclarationAst(first)
        }

        // 其他情况调用父类处理
        return super.createPrimaryExpressionAst(cst)
    }

    private expressionStatementExpressionCst(cst: OvsCst): OvsCst {
        let current = cst
        let children = this.readCstChildren(current)

        while (this.hasCstName(current, 'ExpressionStatement') && children.length === 1 && this.hasCstName(children[0], 'ExpressionStatement')) {
            current = children[0]
            children = this.readCstChildren(current)
        }

        let expression: OvsCst | undefined = undefined
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            if (this.hasCstName(child, 'Expression')) {
                expression = child
                break
            }
        }
        if (expression === null || expression === undefined) {
            for (let index = 0; index < children.length; index++) {
                const child = children[index]
                const name = this.readCstName(child)
                if (name !== 'Semicolon' && name !== 'SemicolonASI') {
                    expression = child
                    break
                }
            }
        }
        if (expression === null || expression === undefined) {
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
    createExpressionStatementAst(cst: OvsCst): any {
        const exprCst = this.expressionStatementExpressionCst(cst)

        // 检查是否包含 OvsRenderFunction（递归查找）
        const isOvsRenderFunction = this.findOvsRenderFunction(exprCst)

        const expr: any = normalizeGeneratedAst(this.createExpressionFromCstOrAst(exprCst) as any)

        // 判断逻辑
        if (this.isInsideOvsRenderDomView()) {
            // 在 div {} 内

            // 1. OvsRenderFunction → 永远渲染（优先级最高）
            if (isOvsRenderFunction) {
                return this.createRenderExpressionStatement(expr, cstLocOf(cst))
            }

            // 2. 在 #{} 内 → 不渲染，保持原样
            if (this.isInsideNoRenderBlock()) {
                return this.createExpressionStatementNode(expr, cstLocOf(cst)) as any
            }

            // 3. 副作用表达式（赋值、更新、delete）→ 不渲染
            if (this.isSideEffectExpression(expr)) {
                return this.createExpressionStatementNode(expr, cstLocOf(cst)) as any
            }

            // 4. 求值表达式 → 渲染
            return this.createRenderExpressionStatement(expr, cstLocOf(cst))
        }

        // 不在 div {} 内 → 保持原样
        return this.createExpressionStatementNode(expr, cstLocOf(cst)) as any
    }

    /**
     * 创建渲染表达式语句
     * 
     * 优化：静态Literal不需要defineReactiveExpression包裹
     * - 静态表达式：children.push(expr)
     * - 动态表达式：children.push(defineReactiveExpression(() => expr))
     */
    private createRenderExpressionStatement(expr: any, loc: any): any {
        // 优化：Literal 是静态的，不需要响应式包裹
        // 动态表达式：使用响应式包裹
        return this.createReactivePushStatement(expr, loc)
    }

    /**
     * 创建简单的 children.push(expr) 语句（无响应式包裹）
     */
}
