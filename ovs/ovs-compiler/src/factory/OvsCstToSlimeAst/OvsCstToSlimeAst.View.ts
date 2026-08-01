import {
    type SlimeCallExpression,
    type SlimeExpression,
    type SlimeExpressionStatement,
    type SlimeIdentifier,
    type SlimeStatement
} from "slime-ast"
import { normalizeGeneratedAst } from "cssts-compiler"
import { createCalleeForTag } from "../helpers/html-tags"
import { OvsCstToSlimeAstIIFE } from "./OvsCstToSlimeAst.IIFE"

/**
 * OVS 视图构建层
 * 
 * 负责创建视图相关的AST节点：
 * - createSimpleView: 简单视图（无IIFE）
 * - createReturnOvsAPICreateVNode: 返回VNode调用
 */
export abstract class OvsCstToSlimeAstView extends OvsCstToSlimeAstIIFE {

    // ==================== 视图构建方法 ====================

    private readIdentifierName(id: SlimeIdentifier): string {
        const rawName = this.readAstField(id, 'name')
        if (typeof rawName === 'string') return rawName
        throw new Error('OVS view identifier must expose a name')
    }

    private statementExpression(stmt: SlimeStatement): SlimeExpression {
        const stmtType = this.readAstType(stmt)
        if (typeof stmtType === 'string' && stmtType !== 'ExpressionStatement') {
            return stmt as any as SlimeExpression
        }
        const rawExpression = this.readAstField(stmt, 'expression')
        if (rawExpression !== null && rawExpression !== undefined) {
            if (typeof rawExpression !== 'function') return rawExpression
            throw new Error('OVS render child expression must be a static field')
        }
        if (stmt !== null && stmt !== undefined) return stmt as any as SlimeExpression
        throw new Error('OVS render child statement must expose an expression')
    }

    /**
     * 创建简单视图（直接返回标签函数调用，无 IIFE）
     *
     * 生成：
     * - HTML 标签：div(props, children) - 直接调用 htmlElements 中的函数
     * - 组件：MyComponent(props, children) - 调用组件函数
     *
     * @param id 元素/组件标识符
     * @param statements 语句数组（只包含 ExpressionStatement）
     * @param attrsVarName attrs变量名（已弃用，保留用于将来功能）
     * @returns CallExpression - 标签函数调用
     */
    protected createSimpleView(
        id: SlimeIdentifier,
        statements: SlimeStatement[],
        _attrsVarName: string | null,
        componentProps: SlimeExpression | null
    ): SlimeCallExpression {
        // 从 ExpressionStatement 中提取表达式，并包装为 ArrayElement
        const childElements: any[] = []
        for (let index = 0; index < statements.length; index++) {
            const exprStmt = statements[index] as any
            const expr = this.statementExpression(exprStmt)
            // 判断是否是 children.push(expr) 形式
            // 如果是，提取 push 的参数；否则直接使用表达式
            /*
            if (expr !== null && expr !== undefined && expr.type === 'CallExpression') {
                const callExpr = expr as SlimeSimpleCallExpression
                const callee = callExpr.callee
                // 检查是否是 children.push 形式
                if (callee.type === 'MemberExpression') {
                    const memberCallee = callee as SlimeMemberExpression
                    const calleeObject = memberCallee.object as SlimeIdentifier
                    const calleeProperty = memberCallee.property as SlimeIdentifier
                    if (calleeObject.name === 'children' &&
                        calleeProperty.name === 'push' &&
                        callExpr.arguments.length > 0) {
                        element = this.callArgumentExpression(callExpr.arguments[0])
                    } else {
                        // 涓嶆槸 children.push 褰㈠紡锛岀洿鎺ヤ娇鐢ㄨ〃杈惧紡
                        element = expr
                    }
                } else {
                    // 不是 children.push 形式，直接使用表达式
                    element = expr
                }
            } else {
                element = expr
            }
            // 包装为 ArrayElement，除了最后一个元素都需要逗号
            */
            const needComma = index < statements.length - 1
            childElements.push(this.createArrayElementNode(expr, needComma ? this.createCommaToken() : undefined))
        }

        // 创建 children 数组
        const childrenArray = this.createArrayExpressionNode(childElements)

        // 创建 props 对象：如果是组件调用，使用 componentProps，否则用空对象
        const propsObject = componentProps !== null && componentProps !== undefined
            ? normalizeGeneratedAst(componentProps as any) as SlimeExpression
            : this.createObjectExpressionNode([])

        // 创建 callee：HTML 标签转换为 $OvsHtmlTag.xxx，其他保持原样
        const callee = createCalleeForTag(this.readIdentifierName(id), id.loc)

        // 创建 tagName(props, children) 或 $OvsHtmlTag.tagName(props, children) 调用
        const vNodeCall = this.createCallExpressionNode(
            callee,
            this.createCallArguments([
                propsObject,      // 第一个参数：props
                childrenArray     // 第二个参数：children
            ]),
            id.loc
        ) as SlimeCallExpression

        // 关键：设置 CallExpression 的 loc，使其指向源代码中的标签位置
        return vNodeCall
    }

    protected createComplexIIFE(
        id: SlimeIdentifier,
        statements: SlimeStatement[],
        attrsVarName: string | null,
        componentProps: SlimeExpression | null
    ): SlimeCallExpression {
        const iifeFunctionBody: SlimeStatement[] = [
            this.createChildrenDeclaration()
        ]

        if (attrsVarName !== null && attrsVarName !== undefined) {
            iifeFunctionBody.push(this.createAttrsDeclaration(attrsVarName))
        }

        for (let index = 0; index < statements.length; index++) {
            iifeFunctionBody.push(statements[index])
        }
        iifeFunctionBody.push(
            this.createReturnOvsAPICreateVNode(id, attrsVarName, componentProps)
        )

        return this.createIIFE(iifeFunctionBody)
    }

    /**
     * 创建 return tagName(props, children) 语句
     *
     * 生成：
     * - HTML 标签：return div(props, children)
     * - 组件：return MyComponent(props, children)
     *
     * @param id 元素/组件标识符
     * @param attrsVarName attrs变量名（已弃用，保留用于将来功能）
     * @param componentProps 组件props对象
     * @returns ReturnStatement
     */
    protected createReturnOvsAPICreateVNode(
        id: SlimeIdentifier,
        _attrsVarName: string | null,
        componentProps: SlimeExpression | null
    ): SlimeStatement {

        // 创建 props 对象
        let propsObject: SlimeExpression
        if (componentProps !== null && componentProps !== undefined) {
            // 组件调用：使用 componentProps
            propsObject = normalizeGeneratedAst(componentProps as any) as SlimeExpression
        } else {
            // 普通元素无自定义props：{}
            propsObject = this.createObjectExpressionNode([])
        }

        // 创建 callee：HTML 标签转换为 $OvsHtmlTag.xxx，其他保持原样
        const callee = createCalleeForTag(this.readIdentifierName(id), id.loc)

        // 创建函数调用：tagName(props, children) 或 $OvsHtmlTag.tagName(props, children)
        const callExpression = this.createCallExpressionNode(
            callee,
            this.createCallArguments([
                propsObject,                                  // 第一个参数：props 对象
                this.createIdentifierNode('children')    // 第二个参数：children 数组（固定名字）
            ]),
            id.loc
        )

        // 关键：设置 CallExpression 的 loc，使其指向源代码中的标签位置
        // 包装为 return 语句
        return this.createReturnStatementNode(callExpression, id.loc)
    }
}
