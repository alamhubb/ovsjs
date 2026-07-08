import OvsParser from "../../parser/OvsParser"
import {
    SlimeAstTypeName,
    type SlimeBlockStatement,
    type SlimeExpression,
    type SlimeExpressionStatement,
    type SlimeIdentifier,
    type SlimeProgram,
    type SlimeStatement,
    SlimeProgramSourceType,
    SlimeAstCreateUtils,
    SlimeTokenCreateUtils
} from "slime-ast"
import { QinParser as SlimeParser } from "@qin/generated-qin-parser-ts"
import { SlimeCstToAst, registerSlimeCstToAstUtil } from "@qin/generated-qin-parser-ts/SlimeCstToAstBridge"
import { normalizeGeneratedAst } from "cssts-compiler"
import { OvsCstToSlimeAstImport } from "./OvsCstToSlimeAst.Import"
import { cstChildrenOf, cstNameOf, isCstNamed, toArray, type SubhutiCst } from "./cst-utils"

/**
 * OVS CST 到 Slime AST 转换器（主类）
 * 
 * 继承链（从下到上）：
 * CssTsCstToAst (cssts-compiler)
 *     ↓
 * OvsCstToSlimeAstHelpers - 基础辅助方法
 *     ↓
 * OvsCstToSlimeAstJudgement - 判断逻辑
 *     ↓
 * OvsCstToSlimeAstIIFE - IIFE 构建
 *     ↓
 * OvsCstToSlimeAstView - 视图构建
 *     ↓
 * OvsCstToSlimeAstProperty - 属性处理
 *     ↓
 * OvsCstToSlimeAstStatement - 语句转换
 *     ↓
 * OvsCstToSlimeAstImport - 导入管理
 *     ↓
 * OvsCstToSlimeAst - 主类（本类）
 */
export class OvsCstToSlimeAst extends OvsCstToSlimeAstImport {
    /**
     * 标记是否使用了 OVS 特有语法
     * 包括：div {}、view 声明、css {} 等
     * 如果没有使用 OVS 语法，则不做 defineOvsComponent 包装
     */
    protected hasOvsSyntax = false

    /**
     * 计数器：标记当前是否在 OvsRenderDomViewDeclaration 内部
     * 用于判断 ExpressionStatement 是否需要转换为 children.push()
     */
    protected ovsRenderDomViewDepth = 0

    /**
     * 计数器：标记当前是否在 NoRenderBlock #{} 内部
     * 用于判断 ExpressionStatement 是否应该渲染
     */
    protected noRenderDepth = 0

    /**
     * 当前view的临时attrs变量名栈（支持嵌套）
     */
    private attrsVarNameStack: Array<string | null> = []

    constructor() {
        super()  // 父类构造链会自动注册到 cssts 和 slime 层
        registerOvsCstToSlimeAst(this)  // 只注册到 ovs 层
    }

    // ==================== 状态管理 ====================

    /**
     * 重写父类的 resetState 方法，重置 OVS 特有的状态
     */
    public override resetState(): void {
        super.resetState()
        this.hasOvsSyntax = false
        this.ovsRenderDomViewDepth = 0
        this.noRenderDepth = 0
        this.attrsVarNameStack = []
    }

    toProgram(cst: SubhutiCst): SlimeProgram {
        this.resetState()
        return SlimeAstCreateUtils.createProgram(this.collectProgramBody(cst) as any, SlimeProgramSourceType.Module)
    }

    /**
      * 面向文件的完整 AST 转换：CST → AST + 后处理
      * 
      * 职责：完整的文件转换，包含所有后处理
      * - 添加 cssts/csstsAtom 导入（如果使用了 CSSTS 语法）
      * - 添加 $OvsHtmlTag/defineOvsComponent 导入（如果使用了 OVS 语法）
      * - 包装成 defineOvsComponent（如果没有 export 且使用了 OVS 语法）
      * 
      * 适用场景：vite 插件、实际编译
      */
    toFileAst(cst: SubhutiCst): SlimeProgram {
        // 先调用 toProgram 做纯 AST 转换
        const program = this.toProgram(cst)
        const normalizedProgram = normalizeGeneratedAst(program as any) as any

        // 获取 body 进行后处理
        let body = toArray(normalizedProgram.body)

        // 1. CSSTS 后处理：添加 cssts 和 csstsAtom 导入
        body = (this as any).processCsstsPostTransform(body)

        // 2. OVS 后处理：处理顶层表达式和自动导入
        body = this.processTopLevelAndImports(body)

        return normalizeGeneratedAst(
            SlimeAstCreateUtils.createProgram(body as any, SlimeProgramSourceType.Module) as any
        ) as SlimeProgram
    }

    // ==================== 核心转换方法（实现抽象方法） ====================

    private rootCstName(cst: SubhutiCst | undefined): string | undefined {
        return cstNameOf(cst)
    }

    private rootCstChildren(cst: SubhutiCst | undefined): SubhutiCst[] {
        return cstChildrenOf(cst)
    }

    private rootHasCstName(cst: SubhutiCst | undefined, name: string): boolean {
        return isCstNamed(cst, name)
    }

    private collectProgramBody(cst: SubhutiCst | undefined): SlimeStatement[] {
        const body: SlimeStatement[] = []
        this.collectProgramBodyInto(cst, body)
        return body
    }

    private collectProgramBodyInto(cst: SubhutiCst | undefined, body: SlimeStatement[]): void {
        if (!cst) return
        const name = this.rootCstName(cst)
        if (name === 'ModuleItem' || name === 'StatementListItem') {
            const result = this.createProgramBodyItemAst(cst)
            body.push(...(Array.isArray(result) ? result : [result]))
            return
        }
        for (const child of this.rootCstChildren(cst)) {
            this.collectProgramBodyInto(child, body)
        }
    }

    private createProgramBodyItemAst(cst: SubhutiCst): SlimeStatement[] {
        const exportNode = this.rootFindFirstCst(cst, 'ExportDeclaration')
        if (exportNode) {
            if (this.isExportDefaultOvsRender(exportNode)) {
                return [normalizeGeneratedAst(this.createExportOvsRenderAst(exportNode) as any) as SlimeStatement]
            }
            if (this.isExportNamedDeclaration(exportNode)) {
                return [normalizeGeneratedAst(this.createExportNamedDeclarationAst(exportNode) as any) as SlimeStatement]
            }
            return this.createBaseProgramBodyItems(exportNode)
        }
        if (this.containsOvsSyntaxNode(cst)) {
            const ovsResult = this.createStatementListItemAst(cst)
            if (ovsResult.length > 0) {
                return ovsResult.map(item => normalizeGeneratedAst(item as any) as SlimeStatement)
            }
        }
        return this.createBaseProgramBodyItems(cst)
    }

    private createBaseProgramBodyItems(cst: SubhutiCst): SlimeStatement[] {
        const importNode = this.unwrapNestedCst(this.rootFindFirstCst(cst, 'ImportDeclaration'), 'ImportDeclaration')
        if (importNode) {
            return [normalizeGeneratedAst(
                ((this as any).createImportDeclarationAstBase?.(importNode) || super.createImportDeclarationAst(importNode)) as any
            ) as SlimeStatement]
        }
        const exportNode = this.unwrapNestedCst(this.rootFindFirstCst(cst, 'ExportDeclaration'), 'ExportDeclaration')
        const baseResult = exportNode
            ? (super.createExportDeclarationAst(exportNode) as any)
            : (this.createStatementListItemAst(cst) as any)
        const baseItems = baseResult == null ? [] : Array.isArray(baseResult) ? baseResult : [baseResult]
        return baseItems.map(item => normalizeGeneratedAst(item as any) as SlimeStatement)
    }

    private unwrapNestedCst(cst: SubhutiCst | undefined, name: string): SubhutiCst | undefined {
        let current = cst
        while (current && this.rootCstName(current) === name) {
            const sameNameChild = this.rootCstChildren(current).find(child => this.rootCstName(child) === name)
            if (!sameNameChild) return current
            current = sameNameChild
        }
        return current
    }

    private containsOvsSyntaxNode(cst: SubhutiCst | undefined): boolean {
        if (!cst) return false
        const name = this.rootCstName(cst)
        if (name === 'OvsRenderStatement' || name === 'OvsRenderFunction' || name === 'OvsViewDeclaration' || name === 'NoRenderBlock') {
            return true
        }
        return this.rootCstChildren(cst).some(child => this.containsOvsSyntaxNode(child))
    }

    private isExportDefaultOvsRender(cst: SubhutiCst | undefined): boolean {
        if (!cst || this.rootCstName(cst) !== 'ExportDeclaration') return false
        const children = this.rootCstChildren(cst)
        const defaultIndex = children.findIndex(child => this.rootCstName(child) === 'Default')
        if (defaultIndex < 0) return false
        return children.slice(defaultIndex + 1).some(child => this.containsOvsSyntaxNode(child))
    }

    private isExportNamedDeclaration(cst: SubhutiCst | undefined): boolean {
        if (!cst || this.rootCstName(cst) !== 'ExportDeclaration') return false
        return !!this.findExportDeclarationNode(cst)
    }

    private rootFindFirstCst(cst: SubhutiCst | undefined, name: string): SubhutiCst | undefined {
        if (!cst) return undefined
        if (this.rootCstName(cst) === name) return cst
        for (const child of this.rootCstChildren(cst)) {
            const found = this.rootFindFirstCst(child, name)
            if (found) return found
        }
        return undefined
    }

    private createExportOvsRenderAst(cst: SubhutiCst): any {
        const render = this.rootFindFirstCst(cst, 'OvsRenderFunction')
        if (!render) {
            throw new Error('OVS export default requires an OvsRenderFunction')
        }
        return {
            type: SlimeAstTypeName.ExportDefaultDeclaration,
            declaration: this.createOvsRenderDomViewDeclarationAst(render),
            loc: cst.loc
        }
    }

    private createExportNamedDeclarationAst(cst: SubhutiCst): any {
        const declarationNode = this.findExportDeclarationNode(cst)
        if (!declarationNode) {
            throw new Error('OVS named export requires a declaration')
        }
        const declaration = normalizeGeneratedAst(this.createExportDeclarationAst(declarationNode) as any)
        return SlimeAstCreateUtils.createExportNamedDeclaration(declaration as any, [], null, cst.loc as any)
    }

    private findExportDeclarationNode(cst: SubhutiCst): SubhutiCst | undefined {
        const children = this.rootCstChildren(cst)
        const exportIndex = children.findIndex(child => this.rootCstName(child) === 'Export')
        if (exportIndex < 0) return undefined
        for (const child of children.slice(exportIndex + 1)) {
            const name = this.rootCstName(child)
            if (name === 'VariableStatement' || name === 'Declaration') {
                return child
            }
        }
        return undefined
    }

    createExportDeclarationAst(cst: SubhutiCst | undefined): any {
        if (!cst) return null
        const name = this.rootCstName(cst)
        if (name === 'Declaration' || name === 'HoistableDeclaration') {
            for (const child of this.rootCstChildren(cst)) {
                const nested = this.createExportDeclarationAst(child)
                if (nested) return nested
            }
            return null
        }
        if (name === 'VariableStatement' || name === 'VariableDeclaration' || name === 'LexicalDeclaration') {
            if (this.containsOvsSyntaxNode(cst)) {
                const ovsVariable = this.createOvsAwareVariableDeclarationAst(cst)
                if (ovsVariable) return ovsVariable
            }
            return (this as any).createVariableDeclarationAst(cst)
        }
        return this.createDeclarationAst(cst)
    }

    createVariableDeclarationAst(cst: SubhutiCst): any {
        if (this.containsOvsOwnedFunctionBody(cst) || this.containsOvsSyntaxNode(cst)) {
            const ovsVariable = this.createOvsAwareVariableDeclarationAst(cst)
            if (ovsVariable) return ovsVariable
        }
        return (this as any).createVariableDeclarationAstBase?.(cst) || super.createVariableDeclarationAst?.(cst)
    }

    private createOvsAwareVariableDeclarationAst(cst: SubhutiCst): any {
        const declarations = this.collectVariableDeclaratorCsts(cst)
            .map(declarator => this.createOvsAwareVariableDeclaratorAst(declarator))
            .filter(Boolean)

        if (declarations.length === 0) return null

        return SlimeAstCreateUtils.createVariableDeclaration(
            this.createVariableKindToken(this.findVariableKind(cst), cst.loc),
            declarations,
            cst.loc
        )
    }

    private collectVariableDeclaratorCsts(cst: SubhutiCst | undefined): SubhutiCst[] {
        if (!cst) return []
        const name = this.rootCstName(cst)
        const children = this.rootCstChildren(cst)
        if ((name === 'LexicalBinding' || name === 'VariableDeclarator' || name === 'VariableDeclaration')
            && children.some(child => this.rootCstName(child) === 'Initializer')) {
            return [cst]
        }
        const out: SubhutiCst[] = []
        for (const child of children) {
            out.push(...this.collectVariableDeclaratorCsts(child))
        }
        return out
    }

    private createOvsAwareVariableDeclaratorAst(cst: SubhutiCst): any {
        const idName = this.findBindingIdentifierName(cst)
        if (!idName) return null

        const initializer = this.rootCstChildren(cst).find(child => this.rootCstName(child) === 'Initializer')
        const arrow = this.rootFindFirstCstByNames(initializer, ['ArrowFunction', 'AsyncArrowFunction'])
        if (!arrow || (!this.containsOvsSyntaxNode(arrow) && !this.containsOvsOwnedFunctionBody(arrow))) return null

        return SlimeAstCreateUtils.createVariableDeclarator(
            SlimeAstCreateUtils.createIdentifier(idName, cst.loc),
            SlimeTokenCreateUtils.createAssignToken(cst.loc),
            this.createOvsAwareArrowFunctionExpressionAst(arrow),
            cst.loc
        )
    }

    private createOvsAwareArrowFunctionExpressionAst(cst: SubhutiCst): any {
        const children = this.rootCstChildren(cst)
        const paramsCst = children.find(child => this.rootCstName(child) === 'ArrowParameters')
        const conciseBody = children.find(child => {
            const name = this.rootCstName(child)
            return name === 'ConciseBody' || name === 'AsyncConciseBody'
        })
        const params = paramsCst
            ? (((this as any).createFormalParametersAst?.(paramsCst) || (this as any).createArrowFormalParametersAstWrapped?.(paramsCst) || []) as any[])
                .map(param => normalizeGeneratedAst(param))
            : []
        const body = conciseBody
            ? normalizeGeneratedAst(this.createConciseBodyAst(conciseBody) as any)
            : SlimeAstCreateUtils.createBlockStatement([], cst.loc)
        const expression = this.rootAstType(body) !== SlimeAstTypeName.BlockStatement

        return this.createArrowFunctionExpressionAst(
            params,
            body,
            expression,
            this.rootCstName(cst) === 'AsyncArrowFunction',
            cst.loc ?? null
        )
    }

    private findVariableKind(cst: SubhutiCst | undefined): 'const' | 'let' | 'var' {
        if (!cst) return 'const'
        const value = (cst as any).value
        const name = this.rootCstName(cst)
        if (value === 'var' || name === 'Var') return 'var'
        if (value === 'let' || name === 'Let') return 'let'
        if (value === 'const' || name === 'Const') return 'const'
        for (const child of this.rootCstChildren(cst)) {
            const kind = this.findVariableKind(child)
            if (kind !== 'const' || (child as any).value === 'const' || this.rootCstName(child) === 'Const') return kind
        }
        return 'const'
    }

    private createVariableKindToken(kind: 'const' | 'let' | 'var', loc: any): any {
        if (kind === 'var') return SlimeTokenCreateUtils.createVarToken(loc)
        if (kind === 'let') return SlimeTokenCreateUtils.createLetToken(loc)
        return SlimeTokenCreateUtils.createConstToken(loc)
    }

    private findBindingIdentifierName(cst: SubhutiCst | undefined): string | undefined {
        if (!cst) return undefined
        const name = this.rootCstName(cst)
        if (name === 'BindingIdentifier' || name === 'Identifier' || name === 'IdentifierReference') {
            return this.firstCstValue(cst)
        }
        for (const child of this.rootCstChildren(cst)) {
            if (this.rootCstName(child) === 'Initializer') break
            const found = this.findBindingIdentifierName(child)
            if (found) return found
        }
        return undefined
    }

    private firstCstValue(cst: SubhutiCst | undefined): string | undefined {
        if (!cst) return undefined
        const value = (cst as any).value
        if (typeof value === 'string' && value.length > 0) return value
        for (const child of this.rootCstChildren(cst)) {
            const found = this.firstCstValue(child)
            if (found) return found
        }
        return undefined
    }

    private rootFindFirstCstByNames(cst: SubhutiCst | undefined, names: string[]): SubhutiCst | undefined {
        if (!cst) return undefined
        const name = this.rootCstName(cst)
        if (name && names.indexOf(name) >= 0) return cst
        for (const child of this.rootCstChildren(cst)) {
            const found = this.rootFindFirstCstByNames(child, names)
            if (found) return found
        }
        return undefined
    }

    createDeclarationAst(cst: SubhutiCst): any {
        // Declaration -> OvsViewDeclaration | VariableDeclaration | FunctionDeclaration | ...
        let first = cst
        while (this.rootHasCstName(first, 'Declaration')) {
            const child = this.rootCstChildren(first).find(candidate => {
                const name = this.rootCstName(candidate)
                return name !== 'Export' && name !== 'Default'
            })
            if (!child) return null
            first = child
        }
        if (this.rootHasCstName(first, 'OvsViewDeclaration')) {
            return this.createOvsViewDeclarationAst(first)
        }
        if (this.rootHasCstName(first, 'VariableStatement') || this.rootHasCstName(first, 'LexicalDeclaration') || this.rootHasCstName(first, 'VariableDeclaration')) {
            return (this as any).createVariableDeclarationAst(first)
        }
        // 调用基类方法（来自CssTsCstToAst或更底层）
        return (this as any).createDeclarationAstBase?.(first) || super.createDeclarationAst?.(first)
    }

    /**
     * 转换 OvsViewDeclaration 为 defineOvsComponent 包裹的组件
     *
     * 新语法输入：view ComponentName (props) { div { ... } }
     * 输出：const ComponentName = defineOvsComponent(props => { ... return div(...) })
     */
    protected createOvsViewDeclarationAst(cst: SubhutiCst): any {
        this.hasOvsSyntax = true

        const children = this.rootCstChildren(cst)

        // 1. 提取组件名
        const componentNameCst = children[1]
        if (!componentNameCst) {
            throw new Error('OvsViewDeclaration: missing component name')
        }
        const componentName = (this as any).createIdentifierAst(componentNameCst)

        // 2. 提取参数（可选）
        let params: any[] = []
        const arrowFormalParametersName = SlimeParser.prototype.ArrowFormalParameters?.name || 'ArrowFormalParameters'
        const formalParamsCst = children.find(c => this.rootCstName(c) === arrowFormalParametersName)

        if (formalParamsCst) {
            params = (this as any).createArrowFormalParametersAstWrapped(formalParamsCst)
        }
        // 如果没有声明参数，默认使用 props
        if (params.length === 0) {
            params = [SlimeAstCreateUtils.createIdentifier('props')]
        }

        // 3. 提取函数体内的 StatementList
        const statementListName = SlimeParser.prototype.StatementList?.name || 'StatementList'
        const statementListCst = children.find(c => this.rootCstName(c) === statementListName)

        let functionBodyStatements: SlimeStatement[] = []

        if (statementListCst) {
            // 转换 StatementList
            functionBodyStatements = this.createStatementListAst(statementListCst)
        }

        // 4. 处理函数体：检查最后一条语句
        // 如果最后一条是 ExpressionStatement 且表达式是 OvsRenderFunction 调用，
        // 需要将其转换为 return 语句
        if (functionBodyStatements.length > 0) {
            const lastStmt = functionBodyStatements[functionBodyStatements.length - 1]

            // 检查是否是 ExpressionStatement
            if (lastStmt.type === SlimeAstTypeName.ExpressionStatement) {
                const expr = (lastStmt as SlimeExpressionStatement).expression

                // 检查是否是 CallExpression（OvsRenderFunction 转换后的结果）
                if (expr.type === SlimeAstTypeName.CallExpression) {
                    // 将表达式包装成箭头函数：() => expr
                    const arrowFunc = this.createArrowFunctionExpressionAst(
                        [],
                        expr,
                        true,
                        false,
                        cst.loc ?? null
                    )

                    // 将最后的表达式语句转换为 return () => expr
                    functionBodyStatements[functionBodyStatements.length - 1] =
                        SlimeAstCreateUtils.createReturnStatement(arrowFunc)
                }
            }
        }

        // 5. 创建箭头函数体
        const arrowFunctionBody = SlimeAstCreateUtils.createBlockStatement(
            functionBodyStatements,
            cst.loc,
            { type: 'LBrace', value: '{', loc: cst.loc } as any,
            { type: 'RBrace', value: '}', loc: cst.loc } as any
        )

        // 6. 创建箭头函数：props => { ... }
        const arrowFunction = this.createArrowFunctionExpressionAst(
            params,
            arrowFunctionBody,
            false,
            false,
            cst.loc ?? null
        )

        // 7. 创建 defineOvsComponent(props => { ... }) 调用
        const defineOvsCall = SlimeAstCreateUtils.createCallExpression(
            SlimeAstCreateUtils.createIdentifier('defineOvsComponent'),
            this.createCallArguments([arrowFunction])
        )

        // 8. 创建变量声明：const ComponentName = defineOvsComponent(...)
        const variableDeclaration = SlimeAstCreateUtils.createVariableDeclaration(
            SlimeTokenCreateUtils.createConstToken(),
            [
                SlimeAstCreateUtils.createVariableDeclarator(
                    componentName,
                    SlimeTokenCreateUtils.createAssignToken(),
                    defineOvsCall
                )
            ]
        )
        variableDeclaration.loc = cst.loc

        return variableDeclaration
    }

    // ==================== 实现抽象方法 ====================

    /**
     * 递归查找 CST 树中是否包含 OvsRenderFunction 节点
     */
    protected findOvsRenderFunction(cst: SubhutiCst): boolean {
        if (!cst) return false

        // 直接匹配
        if (this.rootHasCstName(cst, 'OvsRenderFunction')) {
            return true
        }

        // 递归检查第一个子节点（表达式解析的核心路径）
        const children = this.rootCstChildren(cst)
        if (children.length > 0) {
            return this.findOvsRenderFunction(children[0])
        }

        return false
    }

    /**
     * 判断表达式是否是副作用表达式
     */
    protected isSideEffectExpression(expr: SlimeExpression): boolean {
        const type = expr.type
        if (type === SlimeAstTypeName.AssignmentExpression) return true
        if (type === SlimeAstTypeName.UpdateExpression) return true
        if (type === SlimeAstTypeName.UnaryExpression) {
            const unary = expr as any
            if (unary.operator === 'delete' || unary.operator === 'void') return true
        }
        return false
    }

    private rootAstType(node: any): string | undefined {
        const rawType = node?.type
        if (typeof rawType === 'string') return rawType
        const value = typeof rawType === 'function' ? rawType.call(node) : rawType
        if (typeof value === 'string') return value
        const enumName = typeof value?.name === 'function' ? value.name() : value?.__qinEnumName
        if (typeof enumName === 'string') {
            return enumName.split('_').filter(Boolean).map(part => {
                if (part === 'TS') return 'TS'
                const lower = part.toLowerCase()
                return lower.slice(0, 1).toUpperCase() + lower.slice(1)
            }).join('')
        }
        return undefined
    }

    /**
     * 判断语句是否需要父级IIFE包裹
     */
    protected needsParentIIFE(stmt: SlimeStatement): boolean {
        const type = this.rootAstType(stmt)
        if (type === SlimeAstTypeName.VariableDeclaration) return true
        if ((stmt as any)._isFromNoRenderBlock) return true
        if (type === SlimeAstTypeName.ExpressionStatement) {
            return this.isSideEffectExpression((stmt as SlimeExpressionStatement).expression)
        }
        return false
    }

    /**
     * 判断语句是否需要响应式包裹
     */
    protected needsReactiveWrap(stmt: SlimeStatement): boolean {
        if (this.needsParentIIFE(stmt)) return false
        if (this.rootAstType(stmt) === SlimeAstTypeName.ExpressionStatement) return false
        return true
    }

    /**
     * 将控制流语句包裹为响应式表达式
     *
     * 块形式：defineReactiveExpression(() => { const children = []; stmt; return children })
     * 
     * 注意：ExpressionStatement 不应传入此方法，由 needsReactiveWrap 过滤
     */
    protected wrapStatementWithReactiveExpression(stmt: SlimeStatement, _unused?: any, loc?: any): SlimeStatement {
        // 安全检查：ExpressionStatement 不应进入此方法
        if (stmt.type === SlimeAstTypeName.ExpressionStatement) {
            throw new Error('wrapStatementWithReactiveExpression: ExpressionStatement should not reach here')
        }

        // 块形式：() => { const children = []; stmt; return children }
        const bodyStatements: SlimeStatement[] = [
            this.createChildrenDeclaration(),
            normalizeGeneratedAst(stmt as any) as SlimeStatement,
            SlimeAstCreateUtils.createReturnStatement(
                SlimeAstCreateUtils.createIdentifier('children')
            )
        ]
        const arrowBody = SlimeAstCreateUtils.createBlockStatement(
            bodyStatements,
            loc,
            SlimeTokenCreateUtils.createLBraceToken(loc),
            SlimeTokenCreateUtils.createRBraceToken(loc)
        )

        return this.createReactivePushStatement(arrowBody, loc)
    }


    /**
     * 转换 OvsRenderDomViewDeclaration 为表达式或 IIFE
     */
    protected createOvsRenderDomViewDeclarationAst(cst: SubhutiCst): SlimeExpression {
        this.hasOvsSyntax = true

        const cstName = this.rootCstName(cst)
        const isRenderFunction = cstName === 'OvsRenderFunction'
        const isRenderStatement = cstName === 'OvsRenderStatement'
        if (!isRenderFunction && !isRenderStatement) {
            throw new Error(`Expected OvsRenderFunction or OvsRenderStatement, got ${cstName}`)
        }

        // 获取元素/组件名称
        const cstChildren = this.rootCstChildren(cst)
        const idCst = cstChildren[0]
        if (!idCst) {
            throw new Error('OvsRenderDomViewDeclaration has no identifier')
        }
        const id = this.rootHasCstName(idCst, 'IdentifierName')
            ? (this as any).createIdentifierAst(idCst)
            : (this as any).createIdentifierReferenceAst(idCst)

        // 设置 loc 信息
        if (idCst.loc) {
            id.loc = {
                type: idCst.loc.type,
                value: id.name,
                start: idCst.loc.start,
                end: idCst.loc.end
            }
        }


        // 查找 OvsArguments 节点
        const ovsArgumentsName = 'OvsArguments'
        const ovsArgumentsCst = cstChildren.find(child => this.rootCstName(child) === ovsArgumentsName)
        let componentProps: SlimeExpression | null = null

        if (ovsArgumentsCst) {
            componentProps = normalizeGeneratedAst((this as any).createOvsArgumentsAst(ovsArgumentsCst) as any) as SlimeExpression
        }

        // 进入 OvsRenderDomViewDeclaration
        this.ovsRenderDomViewDepth++
        const uuid = Math.random().toString(36).substring(2, 10)
        const attrsVarName = `temp$$attrs$$${uuid}`
        this.attrsVarNameStack.push(attrsVarName)

        const savedNoRenderDepth = this.noRenderDepth
        this.noRenderDepth = 0

        try {
            const statementListName = SlimeParser.prototype.StatementList?.name || 'StatementList'
            const statementListCst = cstChildren.find(child => this.rootCstName(child) === statementListName)

            let bodyStatements: SlimeStatement[] = []
            if (statementListCst) {
                const statements = this.createStatementListAst(statementListCst)

                for (const stmt of statements) {
                    if (Array.isArray(stmt)) {
                        bodyStatements.push(...stmt)
                    } else {
                        bodyStatements.push(stmt)
                    }
                }
            }

            const needsComplexMode = bodyStatements.some(stmt => this.needsParentIIFE(stmt))
            const currentAttrsVarName = this.attrsVarNameStack[this.attrsVarNameStack.length - 1]

            if (!needsComplexMode) {
                return this.createSimpleView(id, bodyStatements, currentAttrsVarName, componentProps)
            } else {
                return this.createComplexIIFE(id, bodyStatements, currentAttrsVarName, componentProps)
            }
        } finally {
            this.ovsRenderDomViewDepth--
            this.attrsVarNameStack.pop()
            this.noRenderDepth = savedNoRenderDepth
        }
    }

    private isOvsBlockBodyContainer(cst: SubhutiCst | undefined): boolean {
        const name = this.rootCstName(cst)
        return name === 'FunctionBody'
            || name === 'OvsFunctionBody'
            || name === 'AsyncFunctionBody'
            || name === 'OvsAsyncFunctionBody'
            || name === 'Block'
            || name === 'BlockStatement'
            || name === 'ConciseBody'
            || name === 'AsyncConciseBody'
    }

    private isOvsOwnedFunctionBody(cst: SubhutiCst | undefined): boolean {
        const name = this.rootCstName(cst)
        return name === 'OvsFunctionBody' || name === 'OvsAsyncFunctionBody'
    }

    private containsOvsOwnedFunctionBody(cst: SubhutiCst | undefined): boolean {
        if (!cst) return false
        if (this.isOvsOwnedFunctionBody(cst)) return true
        return this.rootCstChildren(cst).some(child => this.containsOvsOwnedFunctionBody(child))
    }

    private findNearestStatementList(cst: SubhutiCst | undefined): SubhutiCst | undefined {
        if (!cst) return undefined
        for (const child of this.rootCstChildren(cst)) {
            if (this.rootCstName(child) === 'StatementList') return child
        }
        for (const child of this.rootCstChildren(cst)) {
            if (this.isOvsBlockBodyContainer(child)) {
                const found = this.findNearestStatementList(child)
                if (found) return found
            }
        }
        return undefined
    }

    private createOvsBlockBodyAst(cst: SubhutiCst): SlimeBlockStatement {
        const statementListCst = this.findNearestStatementList(cst)
        if (statementListCst) {
            return SlimeAstCreateUtils.createBlockStatement(
                this.createStatementListAst(statementListCst),
                cst.loc,
                SlimeTokenCreateUtils.createLBraceToken(cst.loc),
                SlimeTokenCreateUtils.createRBraceToken(cst.loc)
            )
        }
        return SlimeAstCreateUtils.createBlockStatement(
            [],
            cst.loc,
            SlimeTokenCreateUtils.createLBraceToken(cst.loc),
            SlimeTokenCreateUtils.createRBraceToken(cst.loc)
        )
    }

    /**
     * 重写 createFunctionBodyAst：进入函数体时退出 OVS 渲染上下文
     */
    createFunctionBodyAst(cst: SubhutiCst): SlimeBlockStatement {
        const savedRenderDepth = this.ovsRenderDomViewDepth
        const savedNoRenderDepth = this.noRenderDepth

        this.ovsRenderDomViewDepth = 0
        this.noRenderDepth = 0

        try {
            if (this.containsOvsOwnedFunctionBody(cst) || (this.containsOvsSyntaxNode(cst) && this.isOvsBlockBodyContainer(cst))) {
                return this.createOvsBlockBodyAst(cst)
            }
            return (this as any).createFunctionBodyAstBase?.(cst) || super.createFunctionBodyAst?.(cst)
        } finally {
            this.ovsRenderDomViewDepth = savedRenderDepth
            this.noRenderDepth = savedNoRenderDepth
        }
    }

    /**
     * 重写 createConciseBodyAst：箭头函数体
     */
    createConciseBodyAst(cst: SubhutiCst): SlimeBlockStatement | SlimeExpression {
        const children = this.rootCstChildren(cst)
        const first = children[0]

        // 只有 block 形式 () => { ... } 需要重置渲染上下文
        if ((this.containsOvsOwnedFunctionBody(cst) || this.containsOvsSyntaxNode(cst))
            && (this.rootHasCstName(first, 'LBrace') || children.some(child => this.isOvsBlockBodyContainer(child)))) {
            const savedRenderDepth = this.ovsRenderDomViewDepth
            const savedNoRenderDepth = this.noRenderDepth

            this.ovsRenderDomViewDepth = 0
            this.noRenderDepth = 0

            try {
                return this.createOvsBlockBodyAst(cst)
            } finally {
                this.ovsRenderDomViewDepth = savedRenderDepth
                this.noRenderDepth = savedNoRenderDepth
            }
        }

        // 表达式形式 () => expr 直接调用父类
        return (this as any).createConciseBodyAstBase?.(cst) || super.createConciseBodyAst?.(cst)
    }
}

// ==================== 全局注册机制 ====================
let _ovsCstToSlimeAstUtil: OvsCstToSlimeAst

_ovsCstToSlimeAstUtil = new OvsCstToSlimeAst()

export function registerOvsCstToSlimeAst(instance: OvsCstToSlimeAst): void {
    _ovsCstToSlimeAstUtil = instance
}

// Proxy: 保持 ovsCstToSlimeAst.xxx() 调用方式，同时支持动态替换
export const OvsCstToSlimeAstUtils = {} as OvsCstToSlimeAst

function bindOvsCstToSlimeAstForwarders(): void {
    let proto: any = OvsCstToSlimeAst.prototype
    while (proto != null && proto !== Object.prototype) {
        for (const prop of Object.getOwnPropertyNames(proto)) {
            const descriptor = Object.getOwnPropertyDescriptor(proto, prop)
            if (prop === 'constructor' || typeof descriptor?.value !== 'function') {
                continue
            }
            ;(OvsCstToSlimeAstUtils as any)[prop] = function (...args: any[]) {
                return (_ovsCstToSlimeAstUtil as any)[prop](...args)
            }
        }
        proto = Object.getPrototypeOf(proto)
    }
}

bindOvsCstToSlimeAstForwarders()
