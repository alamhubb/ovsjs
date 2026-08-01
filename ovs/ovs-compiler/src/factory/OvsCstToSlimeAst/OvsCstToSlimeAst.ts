import {
    type SlimeBlockStatement,
    type SlimeExpression,
    type SlimeIdentifier,
    type SlimeNode,
    type SlimeProgram,
    type SlimeStatement,
} from "slime-ast"
import { SlimeCstToAst, registerSlimeCstToAstUtil } from "@qin/generated-qin-parser-ts/SlimeCstToAstBridge"
import { normalizeGeneratedAst } from "cssts-compiler"
import { OvsCstToSlimeAstImport } from "./OvsCstToSlimeAst.Import"
import { cstChildrenOf, cstLocOf, cstNameOf, cstValueOf, isCstNamed, toArray, type OvsCst } from "./cst-utils"

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
    protected hasOvsSyntax: boolean = false

    /**
     * 计数器：标记当前是否在 OvsRenderDomViewDeclaration 内部
     * 用于判断 ExpressionStatement 是否需要转换为 children.push()
     */
    protected ovsRenderDomViewDepth: number = 0

    /**
     * 计数器：标记当前是否在 NoRenderBlock #{} 内部
     * 用于判断 ExpressionStatement 是否应该渲染
     */
    protected noRenderDepth: number = 0

    /**
     * 当前view的临时attrs变量名栈（支持嵌套）
     */
    private attrsVarNameCounter: number = 0

    // ==================== 状态管理 ====================

    /**
     * 重写父类的 resetState 方法，重置 OVS 特有的状态
     */
    public override resetState(): void {
        super.resetState()
        this.hasOvsSyntax = false
        this.ovsRenderDomViewDepth = 0
        this.noRenderDepth = 0
        this.attrsVarNameCounter = 0
    }

    protected enterNoRenderBlock(): void {
        this.noRenderDepth = this.noRenderDepth + 1
    }

    protected leaveNoRenderBlock(): void {
        this.noRenderDepth = this.noRenderDepth - 1
    }

    protected isInsideOvsRenderDomView(): boolean {
        return this.ovsRenderDomViewDepth > 0
    }

    protected isInsideNoRenderBlock(): boolean {
        return this.noRenderDepth > 0
    }

    protected shouldWrapRenderContext(): boolean {
        return this.ovsRenderDomViewDepth > 0 && this.noRenderDepth === 0
    }

    protected usesOvsSyntax(): boolean {
        return this.hasOvsSyntax
    }

    private nextAttrsVarName(): string {
        const index = this.attrsVarNameCounter
        this.attrsVarNameCounter = this.attrsVarNameCounter + 1
        if (index === 0) return 'temp$$attrs$$0'
        if (index === 1) return 'temp$$attrs$$1'
        if (index === 2) return 'temp$$attrs$$2'
        if (index === 3) return 'temp$$attrs$$3'
        if (index === 4) return 'temp$$attrs$$4'
        if (index === 5) return 'temp$$attrs$$5'
        if (index === 6) return 'temp$$attrs$$6'
        if (index === 7) return 'temp$$attrs$$7'
        throw new Error('Too many nested OVS attrs scopes')
    }

    private createProgramNode(body: any[]): any {
        return normalizeGeneratedAst({
            type: 'Program',
            sourceType: 'module',
            body,
            loc: null
        } as any) as SlimeProgram
    }

    toOvsProgram(cst: OvsCst): any {
        this.resetState()
        const body = this.collectProgramBody(cst) as any
        return this.createProgramNode(body)
    }

    toProgram(cst: OvsCst): SlimeProgram {
        return this.toOvsProgram(cst)
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
    toOvsFileAst(cst: OvsCst): any {
        const program = this.toOvsProgram(cst)
        let body = toArray(this.readAstField(program, 'body'))

        // 1. CSSTS 后处理：仅在实际使用 CSSTS 语法时执行
        if (this.hasCsstsSyntax) {
            body = (this as any).processCsstsPostTransform(body)
        }

        // 2. OVS 后处理：处理顶层表达式和自动导入
        body = this.processTopLevelAndImports(body)

        return this.createProgramNode(body as any)
    }

    toFileAst(cst: OvsCst): any {
        return this.toOvsFileAst(cst)
    }

    // ==================== 核心转换方法（实现抽象方法） ====================

    private rootCstName(cst: OvsCst | undefined): string | undefined {
        return cstNameOf(cst)
    }

    private rootCstChildren(cst: OvsCst | undefined): OvsCst[] {
        return cstChildrenOf(cst)
    }

    private rootHasCstName(cst: OvsCst | undefined, name: string): boolean {
        return isCstNamed(cst, name)
    }

    private rootIdentifierName(cst: OvsCst | undefined): string {
        const directValue = cstValueOf(cst)
        if (directValue !== null && directValue !== undefined) return directValue
        const children = this.rootCstChildren(cst)
        for (let index = 0; index < children.length; index++) {
            const childValue = cstValueOf(children[index])
            if (childValue !== null && childValue !== undefined) return childValue
        }
        const name = this.rootCstName(cst)
        if (name === 'Yield') return 'yield'
        if (name === 'Await') return 'await'
        throw new Error(`Expected identifier CST with token value, got ${name}`)
    }

    private collectProgramBody(cst: OvsCst | undefined): SlimeStatement[] {
        if (cst === null || cst === undefined) return []
        if (this.isProgramBodyItemCst(cst)) {
            const rawResult = this.createProgramBodyItemAst(cst)
            const result: SlimeStatement[] = toArray<SlimeStatement>(rawResult)
            return result
        }
        let body: SlimeStatement[] = []
        const children = this.rootCstChildren(cst)
        for (let index = 0; index < children.length; index++) {
            body = body.concat(this.collectProgramBody(children[index]) as any)
        }
        return body
    }

    private collectProgramBodyInto(cst: OvsCst | undefined, body: SlimeStatement[]): void {
        if (cst === null || cst === undefined) return
        if (this.isProgramBodyItemCst(cst)) {
            const rawResult = this.createProgramBodyItemAst(cst)
            const result: SlimeStatement[] = toArray<SlimeStatement>(rawResult)
            for (let index = 0; index < result.length; index++) {
                body.push(result[index])
            }
            return
        }
        const name = this.rootCstName(cst)
        const children = this.rootCstChildren(cst)
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            this.collectProgramBodyInto(child, body)
        }
    }

    private isProgramBodyItemCst(cst: OvsCst | undefined): boolean {
        if (cst === null || cst === undefined) return false
        const name = this.rootCstName(cst)
        return name === 'ModuleItem'
            || name === 'StatementListItem'
            || name === 'Statement'
            || name === 'Declaration'
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
            || name === 'NoRenderBlock'
    }

    private createProgramBodyItemAst(cst: OvsCst): SlimeStatement[] {
        const cstName = this.rootCstName(cst)
        const exportNode = this.rootFindFirstCst(cst, 'ExportDeclaration')
        if (exportNode !== null && exportNode !== undefined) {
            if (this.isExportDefaultOvsRender(exportNode)) {
                return [normalizeGeneratedAst(this.createExportOvsRenderAst(exportNode) as any) as SlimeStatement]
            }
            if (this.isExportNamedDeclaration(exportNode)) {
                return [normalizeGeneratedAst(this.createExportNamedDeclarationAst(exportNode) as any) as SlimeStatement]
            }
            return this.createBaseProgramBodyItems(exportNode)
        }
        const directRender = this.findDirectWrappedStatementCst(cst, 'OvsRenderStatement')
            ?? this.rootFindFirstCst(cst, 'OvsRenderStatement')
        if (directRender !== null && directRender !== undefined) {
            return [normalizeGeneratedAst({
                type: 'ExpressionStatement',
                expression: this.createOvsRenderDomViewDeclarationAst(directRender),
                loc: cstLocOf(directRender) ?? null
            } as any) as SlimeStatement]
        }
        if (this.containsOvsSyntaxNode(cst)) {
            const ovsResult = this.createStatementListItemAst(cst)
            if (ovsResult.length > 0) {
                const normalized: SlimeStatement[] = []
                for (let index = 0; index < ovsResult.length; index++) {
                    normalized.push(normalizeGeneratedAst(ovsResult[index] as any) as SlimeStatement)
                }
                return normalized
            }
        }
        return this.createBaseProgramBodyItems(cst)
    }

    private findDirectWrappedStatementCst(cst: OvsCst | undefined, targetName: string): OvsCst | undefined {
        if (cst === null || cst === undefined) return undefined
        const name = this.rootCstName(cst)
        if (name === targetName) return cst
        const children = this.rootCstChildren(cst)
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            const childName = this.rootCstName(child)
            if (childName === targetName) return child
            const found = this.findDirectWrappedStatementCst(child, targetName)
            if (found !== null && found !== undefined) return found
        }
        return undefined
    }

    private createBaseProgramBodyItems(cst: OvsCst): SlimeStatement[] {
        const importNode = this.unwrapNestedCst(this.rootFindFirstCst(cst, 'ImportDeclaration'), 'ImportDeclaration')
        if (importNode !== null && importNode !== undefined) {
            return [normalizeGeneratedAst(
                super.createImportDeclarationAst(importNode) as any
            ) as SlimeStatement]
        }
        const exportNode = this.unwrapNestedCst(this.rootFindFirstCst(cst, 'ExportDeclaration'), 'ExportDeclaration')
        if (exportNode !== null && exportNode !== undefined) {
            return [normalizeGeneratedAst(super.createExportDeclarationAst(exportNode) as any) as SlimeStatement]
        }
        const baseItems: SlimeStatement[] = this.createStatementListItemAst(cst)
        const normalized: SlimeStatement[] = []
        for (let index = 0; index < baseItems.length; index++) {
            normalized.push(normalizeGeneratedAst(baseItems[index] as any) as SlimeStatement)
        }
        return normalized
    }

    private unwrapNestedCst(cst: OvsCst | undefined, name: string): OvsCst | undefined {
        let current = cst
        while (current !== null && current !== undefined && this.rootCstName(current) === name) {
            const children = this.rootCstChildren(current)
            let sameNameChild: OvsCst | undefined = undefined
            for (let index = 0; index < children.length; index++) {
                const child = children[index]
                if (this.rootCstName(child) === name) {
                    sameNameChild = child
                    break
                }
            }
            if (sameNameChild === null || sameNameChild === undefined) return current
            current = sameNameChild
        }
        return current
    }

    private containsOvsSyntaxNode(cst: OvsCst | undefined): boolean {
        if (cst === null || cst === undefined) return false
        const name = this.rootCstName(cst)
        if (name === 'OvsRenderStatement' || name === 'OvsRenderFunction' || name === 'OvsViewDeclaration' || name === 'NoRenderBlock') {
            return true
        }
        const children = this.rootCstChildren(cst)
        for (let index = 0; index < children.length; index++) {
            if (this.containsOvsSyntaxNode(children[index])) return true
        }
        return false
    }

    private isExportDefaultOvsRender(cst: OvsCst | undefined): boolean {
        if (cst === null || cst === undefined || this.rootCstName(cst) !== 'ExportDeclaration') return false
        const children = this.rootCstChildren(cst)
        let defaultIndex = -1
        for (let index = 0; index < children.length; index++) {
            if (this.rootCstName(children[index]) === 'Default') {
                defaultIndex = index
                break
            }
        }
        if (defaultIndex < 0) return false
        for (let index = defaultIndex + 1; index < children.length; index++) {
            if (this.containsOvsSyntaxNode(children[index])) return true
        }
        return false
    }

    private isExportNamedDeclaration(cst: OvsCst | undefined): boolean {
        if (!cst || this.rootCstName(cst) !== 'ExportDeclaration') return false
        return this.findExportDeclarationNode(cst) !== null && this.findExportDeclarationNode(cst) !== undefined
    }

    private rootFindFirstCst(cst: OvsCst | undefined, name: string): OvsCst | undefined {
        if (cst === null || cst === undefined) return undefined
        if (this.rootCstName(cst) === name) return cst
        for (const child of this.rootCstChildren(cst)) {
            const found = this.rootFindFirstCst(child, name)
            if (found !== null && found !== undefined) return found
        }
        return undefined
    }

    private rootFindChildByName(children: OvsCst[], name: string): OvsCst | undefined {
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            if (this.rootCstName(child) === name) return child
        }
        return undefined
    }

    private createExportOvsRenderAst(cst: OvsCst): any {
        const render = this.rootFindFirstCst(cst, 'OvsRenderFunction')
        if (render === null || render === undefined) {
            throw new Error('OVS export default requires an OvsRenderFunction')
        }
        return {
            type: 'ExportDefaultDeclaration',
            declaration: this.createOvsRenderDomViewDeclarationAst(render),
            loc: cstLocOf(cst)
        }
    }

    private createExportNamedDeclarationAst(cst: OvsCst): any {
        const declarationNode = this.findExportDeclarationNode(cst)
        if (declarationNode === null || declarationNode === undefined) {
            throw new Error('OVS named export requires a declaration')
        }
        const declaration = normalizeGeneratedAst(this.createExportDeclarationAst(declarationNode) as any)
        return {
            type: 'ExportNamedDeclaration',
            declaration,
            specifiers: [],
            source: null,
            loc: cstLocOf(cst)
        }
    }

    private findExportDeclarationNode(cst: OvsCst): OvsCst | undefined {
        const children = this.rootCstChildren(cst)
        let exportIndex = -1
        for (let index = 0; index < children.length; index++) {
            if (this.rootCstName(children[index]) === 'Export') {
                exportIndex = index
                break
            }
        }
        if (exportIndex < 0) return undefined
        for (let index = exportIndex + 1; index < children.length; index++) {
            const child = children[index]
            const name = this.rootCstName(child)
            if (name === 'VariableStatement' || name === 'Declaration') {
                return child
            }
        }
        return undefined
    }

    createExportDeclarationAst(cst: OvsCst | undefined): any {
        if (cst === null || cst === undefined) return null
        const name = this.rootCstName(cst)
        if (name === 'Declaration' || name === 'HoistableDeclaration') {
            const children = this.rootCstChildren(cst)
            for (let index = 0; index < children.length; index++) {
                const child = children[index]
                const nested = this.createExportDeclarationAst(child)
                if (nested !== null && nested !== undefined) return nested
            }
            return null
        }
        if (name === 'VariableStatement' || name === 'VariableDeclaration' || name === 'LexicalDeclaration') {
            if (this.containsOvsSyntaxNode(cst)) {
                const ovsVariable = this.createOvsAwareVariableDeclarationAst(cst)
                if (ovsVariable !== null && ovsVariable !== undefined) return ovsVariable
            }
            return this.createVariableDeclarationAst(cst)
        }
        return this.createDeclarationAst(cst)
    }

    createVariableDeclarationAst(cst: OvsCst): any {
        if (this.containsOvsOwnedFunctionBody(cst) || this.containsOvsSyntaxNode(cst)) {
            const ovsVariable = this.createOvsAwareVariableDeclarationAst(cst)
            if (ovsVariable !== null && ovsVariable !== undefined) return ovsVariable
        }
        return super.createVariableDeclarationAst(cst)
    }

    private createOvsAwareVariableDeclarationAst(cst: OvsCst): any {
        const declaratorCsts = this.collectVariableDeclaratorCsts(cst)
        const declarations: any[] = []
        for (let index = 0; index < declaratorCsts.length; index++) {
            const declaration = this.createOvsAwareVariableDeclaratorAst(declaratorCsts[index])
            if (declaration !== null && declaration !== undefined) {
                declarations.push(declaration)
            }
        }

        if (declarations.length === 0) return null

        const variableKind: string = this.findVariableKind(cst)
        return {
            type: 'VariableDeclaration',
            kind: this.createVariableKindToken(variableKind, cstLocOf(cst)),
            declarations,
            loc: cstLocOf(cst)
        }
    }

    private collectVariableDeclaratorCsts(cst: OvsCst | undefined): OvsCst[] {
        if (cst === null || cst === undefined) return []
        const name = this.rootCstName(cst)
        const children = this.rootCstChildren(cst)
        let hasInitializer = false
        for (let index = 0; index < children.length; index++) {
            if (this.rootCstName(children[index]) === 'Initializer') {
                hasInitializer = true
                break
            }
        }
        if ((name === 'LexicalBinding' || name === 'VariableDeclarator' || name === 'VariableDeclaration')
            && hasInitializer) {
            return [cst]
        }
        const out: OvsCst[] = []
        for (let index = 0; index < children.length; index++) {
            const childDeclarators = this.collectVariableDeclaratorCsts(children[index])
            for (let childIndex = 0; childIndex < childDeclarators.length; childIndex++) {
                out.push(childDeclarators[childIndex])
            }
        }
        return out
    }

    private createOvsAwareVariableDeclaratorAst(cst: OvsCst): any {
        const idName = this.findBindingIdentifierName(cst)
        if (idName === null || idName === undefined || idName.length === 0) return null

        const children = this.rootCstChildren(cst)
        let initializer: OvsCst | undefined = undefined
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            if (this.rootCstName(child) === 'Initializer') {
                initializer = child
                break
            }
        }
        const arrow = this.rootFindFirstCstByNames(initializer, ['ArrowFunction', 'AsyncArrowFunction'])
        if (arrow === null || arrow === undefined || (!this.containsOvsSyntaxNode(arrow) && !this.containsOvsOwnedFunctionBody(arrow))) return null

        return {
            type: 'VariableDeclarator',
            id: this.createIdentifierNode(idName, cstLocOf(cst)),
            eqToken: this.createAssignToken(cstLocOf(cst)),
            init: this.createOvsAwareArrowFunctionExpressionAst(arrow),
            loc: cstLocOf(cst)
        }
    }

    private createOvsAwareArrowFunctionExpressionAst(cst: OvsCst): any {
        const children = this.rootCstChildren(cst)
        let paramsCst: OvsCst | undefined = undefined
        let conciseBody: OvsCst | undefined = undefined
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            const name = this.rootCstName(child)
            if (paramsCst === null || paramsCst === undefined) {
                if (name === 'ArrowParameters') {
                    paramsCst = child
                    continue
                }
            }
            if (conciseBody === null || conciseBody === undefined) {
                if (name === 'ConciseBody' || name === 'AsyncConciseBody') {
                    conciseBody = child
                }
            }
        }
        const params: any[] = []
        if (paramsCst !== null && paramsCst !== undefined) {
            const rawParams = this.createFormalParametersAst(paramsCst)
            for (let index = 0; index < rawParams.length; index++) {
                params.push(normalizeGeneratedAst(rawParams[index] as any))
            }
        }
        const body = conciseBody !== null && conciseBody !== undefined
            ? normalizeGeneratedAst(this.createConciseBodyAst(conciseBody) as any)
            : this.createBlockStatementNode([], cstLocOf(cst))
        const expression = this.rootAstType(body) !== 'BlockStatement'

        return this.createArrowFunctionExpressionAst(
            params,
            body,
            expression,
            this.rootCstName(cst) === 'AsyncArrowFunction',
            cstLocOf(cst) ?? null
        )
    }

    private findVariableKind(cst: OvsCst | undefined): 'const' | 'let' | 'var' {
        if (cst === null || cst === undefined) return 'const'
        const rawValue = cstValueOf(cst)
        const value: string = rawValue === null || rawValue === undefined ? '' : rawValue
        const name = this.rootCstName(cst)
        if (value === 'var' || name === 'Var') return 'var'
        if (value === 'let' || name === 'Let') return 'let'
        if (value === 'const' || name === 'Const') return 'const'
        const children = this.rootCstChildren(cst)
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            const kind = this.findVariableKind(child)
            const childRawValue = cstValueOf(child)
            const childValue: string = childRawValue === null || childRawValue === undefined ? '' : childRawValue
            if (kind !== 'const' || childValue === 'const' || this.rootCstName(child) === 'Const') return kind
        }
        return 'const'
    }

    private createVariableKindToken(kind: string, loc: any): any {
        if (kind === 'var') return {type: 'Var', value: 'var', loc}
        if (kind === 'let') return {type: 'Let', value: 'let', loc}
        return {type: 'Const', value: 'const', loc}
    }

    private findBindingIdentifierName(cst: OvsCst | undefined): string | undefined {
        if (cst === null || cst === undefined) return undefined
        const name = this.rootCstName(cst)
        if (name === 'BindingIdentifier' || name === 'Identifier' || name === 'IdentifierReference') {
            return this.firstCstValue(cst)
        }
        const children = this.rootCstChildren(cst)
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            if (this.rootCstName(child) === 'Initializer') break
            const found = this.findBindingIdentifierName(child)
            if (found !== null && found !== undefined && found.length > 0) return found
        }
        return undefined
    }

    private firstCstValue(cst: OvsCst | undefined): string | undefined {
        if (cst === null || cst === undefined) return undefined
        const rawValue = cstValueOf(cst)
        const value: string = rawValue === null || rawValue === undefined ? '' : rawValue
        if (typeof value === 'string' && value.length > 0) return value
        const children = this.rootCstChildren(cst)
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            const found = this.firstCstValue(child)
            if (found !== null && found !== undefined && found.length > 0) return found
        }
        return undefined
    }

    private rootFindFirstCstByNames(cst: OvsCst | undefined, names: string[]): OvsCst | undefined {
        if (cst === null || cst === undefined) return undefined
        const name = this.rootCstName(cst)
        if (name !== null && name !== undefined) {
            for (let nameIndex = 0; nameIndex < names.length; nameIndex++) {
                if (names[nameIndex] === name) return cst
            }
        }
        const children = this.rootCstChildren(cst)
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            const found = this.rootFindFirstCstByNames(child, names)
            if (found !== null && found !== undefined) return found
        }
        return undefined
    }

    createDeclarationAst(cst: OvsCst): any {
        // Declaration -> OvsViewDeclaration | VariableDeclaration | FunctionDeclaration | ...
        let first = cst
        while (this.rootHasCstName(first, 'Declaration')) {
            const children = this.rootCstChildren(first)
            let child: OvsCst | undefined = undefined
            for (let index = 0; index < children.length; index++) {
                const candidate = children[index]
                const name = this.rootCstName(candidate)
                if (name !== 'Export' && name !== 'Default') {
                    child = candidate
                    break
                }
            }
            if (child === null || child === undefined) return null
            first = child
        }
        if (this.rootHasCstName(first, 'OvsViewDeclaration')) {
            return this.createOvsViewDeclarationAst(first)
        }
        if (this.rootHasCstName(first, 'VariableStatement') || this.rootHasCstName(first, 'LexicalDeclaration') || this.rootHasCstName(first, 'VariableDeclaration')) {
            return this.createVariableDeclarationAst(first)
        }
        return super.createDeclarationAst(first)
        // 调用基类方法（来自CssTsCstToAst或更底层）
    }

    /**
     * 转换 OvsViewDeclaration 为 defineOvsComponent 包裹的组件
     *
     * 新语法输入：view ComponentName (props) { div { ... } }
     * 输出：const ComponentName = defineOvsComponent(props => { ... return div(...) })
     */
    protected createOvsViewDeclarationAst(cst: OvsCst): any {
        this.hasOvsSyntax = true

        const children = this.rootCstChildren(cst)

        // 1. 提取组件名
        const componentNameCst = children[1]
        if (componentNameCst === null || componentNameCst === undefined) {
            throw new Error('OvsViewDeclaration: missing component name')
        }
        const componentNameText = this.firstCstValue(componentNameCst)
        if (componentNameText === null || componentNameText === undefined || componentNameText.length === 0) {
            throw new Error('OvsViewDeclaration: missing component name')
        }
        const componentName = this.createIdentifierNode(componentNameText, cstLocOf(cst))

        // 2. 提取参数（可选）
        let params: any[] = []
        const arrowFormalParametersName = 'ArrowFormalParameters'
        let formalParamsCst: OvsCst | undefined = undefined
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            if (this.rootCstName(child) === arrowFormalParametersName) {
                formalParamsCst = child
                break
            }
        }

        if (formalParamsCst !== null && formalParamsCst !== undefined) {
            const rawParams = this.createFormalParametersAst(formalParamsCst)
            for (let index = 0; index < rawParams.length; index++) {
                params.push(normalizeGeneratedAst(rawParams[index] as any))
            }
        }
        // 如果没有声明参数，默认使用 props
        if (params.length === 0) {
            params = [this.createIdentifierNode('props')]
        }

        // 3. 提取函数体内的 StatementList
        const statementListName = 'StatementList'
        let statementListCst: OvsCst | undefined = undefined
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            if (this.rootCstName(child) === statementListName) {
                statementListCst = child
                break
            }
        }

        let functionBodyStatements: SlimeStatement[] = []

        if (statementListCst !== null && statementListCst !== undefined) {
            // 转换 StatementList
            functionBodyStatements = this.createStatementListAst(statementListCst)
        }

        // 4. 处理函数体：检查最后一条语句
        // 如果最后一条是 ExpressionStatement 且表达式是 OvsRenderFunction 调用，
        // 需要将其转换为 return 语句
        if (functionBodyStatements.length > 0) {
            const lastStmt = functionBodyStatements[functionBodyStatements.length - 1]

            // 检查是否是 ExpressionStatement
            if (this.readAstType(lastStmt) === 'ExpressionStatement') {
                const expr = this.readAstField(lastStmt, 'expression') as SlimeExpression

                // 检查是否是 CallExpression（OvsRenderFunction 转换后的结果）
                    // 将表达式包装成箭头函数：() => expr
                const arrowFunc = this.createArrowFunctionExpressionAst(
                        [],
                        expr,
                        true,
                        false,
                        cstLocOf(cst) ?? null
                    )

                    // 将最后的表达式语句转换为 return () => expr
                functionBodyStatements[functionBodyStatements.length - 1] =
                    this.createReturnStatementNode(arrowFunc, cstLocOf(cst))
            }
        }

        // 5. 创建箭头函数体
        const arrowFunctionBody = this.createBlockStatementNode(functionBodyStatements, cstLocOf(cst))

        // 6. 创建箭头函数：props => { ... }
        const arrowFunction = this.createArrowFunctionExpressionAst(
            params,
            arrowFunctionBody,
            false,
            false,
            cstLocOf(cst) ?? null
        )

        // 7. 创建 defineOvsComponent(props => { ... }) 调用
        const defineOvsArgs: any[] = []
        defineOvsArgs.push(arrowFunction)
        const defineOvsCall = this.createCallExpressionNode(
            this.createIdentifierNode('defineOvsComponent'),
            this.createCallArguments(defineOvsArgs)
        )

        // 8. 创建变量声明：const ComponentName = defineOvsComponent(...)
        return {
            type: 'VariableDeclaration',
            kind: {type: 'Const', value: 'const', loc: cstLocOf(cst)},
            declarations: [
                {
                    type: 'VariableDeclarator',
                    id: componentName,
                    eqToken: this.createAssignToken(cstLocOf(cst)),
                    init: defineOvsCall,
                    loc: cstLocOf(cst)
                }
            ],
            loc: cstLocOf(cst)
        }
    }

    // ==================== 实现抽象方法 ====================

    /**
     * 递归查找 CST 树中是否包含 OvsRenderFunction 节点
     */
    protected findOvsRenderFunction(cst: OvsCst): boolean {
        if (cst === null || cst === undefined) return false

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
    protected isSideEffectExpression(expr: any): boolean {
        const type = this.readAstType(expr)
        if (type === 'AssignmentExpression') return true
        if (type === 'UpdateExpression') return true
        if (type === 'UnaryExpression') {
            return true
        }
        return false
    }

    private rootAstType(node: any): string | undefined {
        if (node === null || node === undefined) return undefined
        return this.readAstType(node)
    }

    /**
     * 判断语句是否需要父级IIFE包裹
     */
    protected needsParentIIFE(stmt: SlimeStatement): boolean {
        const type = this.rootAstType(stmt)
        if (type === 'VariableDeclaration') return true
        if (type === 'BlockStatement') return true
        if (type === 'ExpressionStatement') {
            return true
        }
        return false
    }

    /**
     * 判断语句是否需要响应式包裹
     */
    protected needsReactiveWrap(stmt: SlimeStatement): boolean {
        if (this.needsParentIIFE(stmt)) return false
        if (this.rootAstType(stmt) === 'ExpressionStatement') return false
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
        if (this.readAstType(stmt) === 'ExpressionStatement') {
            throw new Error('wrapStatementWithReactiveExpression: ExpressionStatement should not reach here')
        }

        // 块形式：() => { const children = []; stmt; return children }
        const bodyStatements: SlimeStatement[] = [
            this.createChildrenDeclaration(),
            normalizeGeneratedAst(stmt as any) as SlimeStatement,
            this.createReturnStatementNode(this.createIdentifierNode('children'), loc) as SlimeStatement
        ]
        const arrowBody = this.createBlockStatementNode(bodyStatements, loc)

        return this.createReactivePushStatement(arrowBody, loc, false)
    }


    /**
     * 转换 OvsRenderDomViewDeclaration 为表达式或 IIFE
     */
    protected createOvsRenderDomViewDeclarationAst(cst: OvsCst): SlimeExpression {
        this.hasOvsSyntax = true

        const cstName = this.rootCstName(cst)
        const isRenderFunction = cstName === 'OvsRenderFunction'
        const isRenderStatement = cstName === 'OvsRenderStatement'
        if (!isRenderFunction && !isRenderStatement) {
            throw new Error(`Expected OvsRenderFunction or OvsRenderStatement, got ${cstName}`)
        }

        // 获取元素/组件名称
        const cstChildren = this.rootCstChildren(cst)
        let childNames = ''
        for (let index = 0; index < cstChildren.length; index++) {
            childNames = childNames + (index === 0 ? '' : ',') + this.rootCstName(cstChildren[index])
        }
        const idCst = cstChildren[0]
        if (idCst === null || idCst === undefined) {
            throw new Error('OvsRenderDomViewDeclaration has no identifier')
        }
        const id = this.createIdentifierNode(this.rootIdentifierName(idCst), null) as SlimeIdentifier

        // 设置 loc 信息


        // 查找 OvsArguments 节点
        const ovsArgumentsName = 'OvsArguments'
        const ovsArgumentsCst = this.rootFindChildByName(cstChildren, ovsArgumentsName)
        let componentProps: SlimeExpression | null = null

        if (ovsArgumentsCst !== null && ovsArgumentsCst !== undefined) {
            componentProps = normalizeGeneratedAst(this.createOvsArgumentsAst(ovsArgumentsCst) as any) as SlimeExpression
        }

        // 进入 OvsRenderDomViewDeclaration
        this.ovsRenderDomViewDepth = this.ovsRenderDomViewDepth + 1
        const attrsVarName = this.nextAttrsVarName()

        const savedNoRenderDepth = this.noRenderDepth
        this.noRenderDepth = 0

        try {
            const statementListName = 'StatementList'
            const statementListCst = this.rootFindChildByName(cstChildren, statementListName)
            let bodyStatements: SlimeStatement[] = []
            if (statementListCst !== null && statementListCst !== undefined) {
                const statements = this.createStatementListAst(statementListCst)

                for (const stmt of statements) {
                    if (Array.isArray(stmt)) {
                        for (let index = 0; index < stmt.length; index++) {
                            bodyStatements.push(stmt[index])
                        }
                    } else {
                        bodyStatements.push(stmt)
                    }
                }
            }

            let needsComplexMode = false
            for (let index = 0; index < bodyStatements.length; index++) {
                if (this.needsParentIIFE(bodyStatements[index])) {
                    needsComplexMode = true
                    break
                }
            }
            if (!needsComplexMode) {
                return this.createSimpleView(id, bodyStatements, attrsVarName, componentProps)
            } else {
                return this.createComplexIIFE(id, bodyStatements, attrsVarName, componentProps)
            }
        } finally {
            this.ovsRenderDomViewDepth = this.ovsRenderDomViewDepth - 1
            this.noRenderDepth = savedNoRenderDepth
        }
    }

    private isOvsBlockBodyContainer(cst: OvsCst | undefined): boolean {
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

    private isOvsOwnedFunctionBody(cst: OvsCst | undefined): boolean {
        const name = this.rootCstName(cst)
        return name === 'OvsFunctionBody' || name === 'OvsAsyncFunctionBody'
    }

    private containsOvsOwnedFunctionBody(cst: OvsCst | undefined): boolean {
        if (cst === null || cst === undefined) return false
        if (this.isOvsOwnedFunctionBody(cst)) return true
        const children = this.rootCstChildren(cst)
        for (let index = 0; index < children.length; index++) {
            if (this.containsOvsOwnedFunctionBody(children[index])) return true
        }
        return false
    }

    private findNearestStatementList(cst: OvsCst | undefined): OvsCst | undefined {
        if (cst === null || cst === undefined) return undefined
        for (const child of this.rootCstChildren(cst)) {
            if (this.rootCstName(child) === 'StatementList') return child
        }
        for (const child of this.rootCstChildren(cst)) {
            if (this.isOvsBlockBodyContainer(child)) {
                const found = this.findNearestStatementList(child)
                if (found !== null && found !== undefined) return found
            }
        }
        return undefined
    }

    private createOvsBlockBodyAst(cst: OvsCst): SlimeBlockStatement {
        const statementListCst = this.findNearestStatementList(cst)
        if (statementListCst !== null && statementListCst !== undefined) {
            return this.createBlockStatementNode(this.createStatementListAst(statementListCst), cstLocOf(cst)) as SlimeBlockStatement
        }
        const emptyStatements: SlimeStatement[] = []
        return this.createBlockStatementNode(emptyStatements, cstLocOf(cst)) as SlimeBlockStatement
    }

    /**
     * 重写 createFunctionBodyAst：进入函数体时退出 OVS 渲染上下文
     */
    createFunctionBodyAst(cst: OvsCst): SlimeBlockStatement {
        const savedRenderDepth = this.ovsRenderDomViewDepth
        const savedNoRenderDepth = this.noRenderDepth

        this.ovsRenderDomViewDepth = 0
        this.noRenderDepth = 0

        try {
            if (this.containsOvsOwnedFunctionBody(cst) || (this.containsOvsSyntaxNode(cst) && this.isOvsBlockBodyContainer(cst))) {
                return this.createOvsBlockBodyAst(cst)
            }
            return super.createFunctionBodyAst(cst)
        } finally {
            this.ovsRenderDomViewDepth = savedRenderDepth
            this.noRenderDepth = savedNoRenderDepth
        }
    }

    /**
     * 重写 createConciseBodyAst：箭头函数体
     */
    createConciseBodyAst(cst: OvsCst): SlimeBlockStatement | SlimeExpression {
        const children = this.rootCstChildren(cst)
        const first = children[0]
        let hasBlockBodyContainerChild = false
        for (let index = 0; index < children.length; index++) {
            if (this.isOvsBlockBodyContainer(children[index])) {
                hasBlockBodyContainerChild = true
                break
            }
        }

        // 只有 block 形式 () => { ... } 需要重置渲染上下文
        if ((this.containsOvsOwnedFunctionBody(cst) || this.containsOvsSyntaxNode(cst))
            && (this.rootHasCstName(first, 'LBrace') || hasBlockBodyContainerChild)) {
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
        return super.createConciseBodyAst(cst)
    }
}

// ==================== 全局注册机制 ====================
let _ovsCstToSlimeAstUtil: OvsCstToSlimeAst | null = null

function getOvsCstToSlimeAstUtil(): OvsCstToSlimeAst {
    if (_ovsCstToSlimeAstUtil == null) {
        _ovsCstToSlimeAstUtil = new OvsCstToSlimeAst()
    }
    return _ovsCstToSlimeAstUtil
}

export function registerOvsCstToSlimeAst(instance: OvsCstToSlimeAst): void {
    _ovsCstToSlimeAstUtil = instance
}

// Proxy: 保持 ovsCstToSlimeAst.xxx() 调用方式，同时支持动态替换
export const OvsCstToSlimeAstUtils = {} as OvsCstToSlimeAst

function bindOvsCstToSlimeAstForwarders(): void {
    const utils: any = OvsCstToSlimeAstUtils
    utils.toProgram = function (...args: any[]) {
        return (getOvsCstToSlimeAstUtil() as any).toProgram(...args)
    }
    utils.toFileAst = function (...args: any[]) {
        return (getOvsCstToSlimeAstUtil() as any).toFileAst(...args)
    }
    utils.toOvsProgram = function (...args: any[]) {
        return (getOvsCstToSlimeAstUtil() as any).toOvsProgram(...args)
    }
    utils.toOvsFileAst = function (...args: any[]) {
        return (getOvsCstToSlimeAstUtil() as any).toOvsFileAst(...args)
    }
    utils.clearUsedAtoms = function (...args: any[]) {
        return (getOvsCstToSlimeAstUtil() as any).clearUsedAtoms(...args)
    }
    utils.getUsedAtoms = function (...args: any[]) {
        return (getOvsCstToSlimeAstUtil() as any).getUsedAtoms(...args)
    }
}

bindOvsCstToSlimeAstForwarders()
