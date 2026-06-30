import { SubhutiCst } from "subhuti"
import OvsParser from "../../parser/OvsParser"
import {
    SlimeAstTypeName,
    type SlimeBlockStatement,
    type SlimeExpression,
    type SlimeExpressionStatement,
    type SlimeIdentifier,
    type SlimeProgram,
    type SlimeStatement,
    SlimeAstCreateUtils,
    SlimeTokenCreateUtils
} from "slime-ast"
import { QinParser as SlimeParser } from "@qin/generated-qin-parser-ts"
import { SlimeCstToAst, registerSlimeCstToAstUtil } from "@qin/generated-qin-parser-ts/SlimeCstToAstBridge"
import { OvsCstToSlimeAstImport } from "./OvsCstToSlimeAst.Import"

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
    protected override resetState(): void {
        super.resetState()
        this.hasOvsSyntax = false
        this.ovsRenderDomViewDepth = 0
        this.noRenderDepth = 0
        this.attrsVarNameStack = []
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

        // 获取 body 进行后处理
        let body = [...program.body]

        // 1. CSSTS 后处理：添加 cssts 和 csstsAtom 导入
        body = (this as any).processCsstsPostTransform(body)

        // 2. OVS 后处理：处理顶层表达式和自动导入
        body = this.processTopLevelAndImports(body)

        // 更新 program.body
        program.body = body

        return program
    }

    // ==================== 核心转换方法（实现抽象方法） ====================

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

    createDeclarationAst(cst: SubhutiCst): any {
        // Declaration -> OvsViewDeclaration | VariableDeclaration | FunctionDeclaration | ...
        let first = cst
        while (this.isCst(first, 'Declaration')) {
            const child = this.cstChildren(first)[0]
            if (!child) break
            first = child
        }
        if (this.isCst(first, 'OvsViewDeclaration')) {
            return this.createOvsViewDeclarationAst(first)
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

        const children = this.cstChildren(cst)

        // 1. 提取组件名
        const componentNameCst = children[1]
        if (!componentNameCst) {
            throw new Error('OvsViewDeclaration: missing component name')
        }
        const componentName = (this as any).createIdentifierAst(componentNameCst)

        // 2. 提取参数（可选）
        let params: any[] = []
        const arrowFormalParametersName = SlimeParser.prototype.ArrowFormalParameters?.name || 'ArrowFormalParameters'
        const formalParamsCst = children.find(c => this.cstName(c) === arrowFormalParametersName)

        if (formalParamsCst) {
            params = (this as any).createArrowFormalParametersAstWrapped(formalParamsCst)
        }
        // 如果没有声明参数，默认使用 props
        if (params.length === 0) {
            params = [SlimeAstCreateUtils.createIdentifier('props')]
        }

        // 3. 提取函数体内的 StatementList
        const statementListName = SlimeParser.prototype.StatementList?.name || 'StatementList'
        const statementListCst = children.find(c => this.cstName(c) === statementListName)

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
                    const arrowFunc = SlimeAstCreateUtils.createArrowFunctionExpression(
                        expr,
                        [],
                        false,
                        false
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
        const arrowFunction = SlimeAstCreateUtils.createArrowFunctionExpression(
            arrowFunctionBody,
            params,
            false,
            false
        )

        // 7. 创建 defineOvsComponent(props => { ... }) 调用
        const defineOvsCall = SlimeAstCreateUtils.createCallExpression(
            SlimeAstCreateUtils.createIdentifier('defineOvsComponent'),
            [arrowFunction]
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
        if (this.isCst(cst, 'OvsRenderFunction')) {
            return true
        }

        // 递归检查第一个子节点（表达式解析的核心路径）
        const children = this.cstChildren(cst)
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

    /**
     * 判断语句是否需要父级IIFE包裹
     */
    protected needsParentIIFE(stmt: SlimeStatement): boolean {
        if (stmt.type === SlimeAstTypeName.VariableDeclaration) return true
        if ((stmt as any)._isFromNoRenderBlock) return true
        if (stmt.type === SlimeAstTypeName.ExpressionStatement) {
            return this.isSideEffectExpression((stmt as SlimeExpressionStatement).expression)
        }
        return false
    }

    /**
     * 判断语句是否需要响应式包裹
     */
    protected needsReactiveWrap(stmt: SlimeStatement): boolean {
        if (this.needsParentIIFE(stmt)) return false
        if (stmt.type === SlimeAstTypeName.ExpressionStatement) return false
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
            stmt,
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

        const cstName = this.cstName(cst)
        const isRenderFunction = cstName === 'OvsRenderFunction'
        const isRenderStatement = cstName === 'OvsRenderStatement'
        if (!isRenderFunction && !isRenderStatement) {
            throw new Error(`Expected OvsRenderFunction or OvsRenderStatement, got ${cstName}`)
        }

        // 获取元素/组件名称
        const cstChildren = this.cstChildren(cst)
        const idCst = cstChildren[0]
        if (!idCst) {
            throw new Error('OvsRenderDomViewDeclaration has no identifier')
        }
        const id = this.isCst(idCst, 'IdentifierName')
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
        const ovsArgumentsCst = cstChildren.find(child => this.cstName(child) === ovsArgumentsName)
        let componentProps: SlimeExpression | null = null

        if (ovsArgumentsCst) {
            componentProps = (this as any).createOvsArgumentsAst(ovsArgumentsCst)
        } else {
            // 兼容旧语法：查找普通 Arguments 节点
            const argumentsName = SlimeParser.prototype.Arguments?.name || 'Arguments'
            const argumentsCst = cstChildren.find(child => this.cstName(child) === argumentsName)

            if (argumentsCst && this.cstChildren(argumentsCst).length > 0) {
                const argumentListName = SlimeParser.prototype.ArgumentList?.name || 'ArgumentList'
                const argListCst = this.cstChildren(argumentsCst).find(child => this.cstName(child) === argumentListName)
                const firstArg = this.cstChildren(this.cstChildren(argListCst)[0])[0]
                if (firstArg) {
                    componentProps = (this as any).createExpressionAst(firstArg)
                }
            }
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
            const statementListCst = cstChildren.find(child => this.cstName(child) === statementListName)

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

    /**
     * 重写 createFunctionBodyAst：进入函数体时退出 OVS 渲染上下文
     */
    createFunctionBodyAst(cst: SubhutiCst): Array<SlimeStatement> {
        const savedRenderDepth = this.ovsRenderDomViewDepth
        const savedNoRenderDepth = this.noRenderDepth

        this.ovsRenderDomViewDepth = 0
        this.noRenderDepth = 0

        try {
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
        const first = this.cstChildren(cst)[0]

        // 只有 block 形式 () => { ... } 需要重置渲染上下文
        if (this.isCst(first, 'LBrace')) {
            const savedRenderDepth = this.ovsRenderDomViewDepth
            const savedNoRenderDepth = this.noRenderDepth

            this.ovsRenderDomViewDepth = 0
            this.noRenderDepth = 0

            try {
                return (this as any).createConciseBodyAstBase?.(cst) || super.createConciseBodyAst?.(cst)
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
    const stopProto = Object.getPrototypeOf(SlimeCstToAst.prototype)
    while (proto != null && proto !== stopProto) {
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
