import { SubhutiCst } from "subhuti"
import {
    type SlimeCallExpression,
    type SlimeExpression,
    type SlimeIdentifier,
    type SlimeStatement,
    SlimeAstCreateUtils,
    SlimeTokenCreateUtils
} from "slime-ast"
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
        const childElements = statements.map((stmt, index) => {
            const exprStmt = stmt as any
            const expr = exprStmt.expression
            let element: SlimeExpression

            // 判断是否是 children.push(expr) 形式
            // 如果是，提取 push 的参数；否则直接使用表达式
            if (expr && expr.type === 'CallExpression') {
                const callExpr = expr as SlimeCallExpression
                const callee = callExpr.callee as any
                // 检查是否是 children.push 形式
                if (callee?.type === 'MemberExpression' &&
                    callee.object?.name === 'children' &&
                    callee.property?.name === 'push' &&
                    callExpr.arguments.length > 0) {
                    element = callExpr.arguments[0] as SlimeExpression
                } else {
                    // 不是 children.push 形式，直接使用表达式
                    element = expr
                }
            } else {
                element = expr
            }
            // 包装为 ArrayElement，除了最后一个元素都需要逗号
            const needComma = index < statements.length - 1
            return SlimeAstCreateUtils.createArrayElement(element, needComma ? SlimeTokenCreateUtils.createCommaToken() : undefined)
        })

        // 创建 children 数组
        const childrenArray = SlimeAstCreateUtils.createArrayExpression(childElements)

        // 创建 props 对象：如果是组件调用，使用 componentProps，否则用空对象
        const propsObject = componentProps || SlimeAstCreateUtils.createObjectExpression([])

        // 创建 callee：HTML 标签转换为 $OvsHtmlTag.xxx，其他保持原样
        const callee = createCalleeForTag(id.name, id.loc, SlimeAstCreateUtils, SlimeTokenCreateUtils)

        // 创建 tagName(props, children) 或 $OvsHtmlTag.tagName(props, children) 调用
        const vNodeCall = SlimeAstCreateUtils.createCallExpression(
            callee,
            [
                propsObject,      // 第一个参数：props
                childrenArray     // 第二个参数：children
            ]
        )

        // 关键：设置 CallExpression 的 loc，使其指向源代码中的标签位置
        if (id.loc) {
            vNodeCall.loc = id.loc
        }

        return vNodeCall
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
        let propsObject
        if (componentProps) {
            // 组件调用：使用 componentProps
            propsObject = componentProps
        } else {
            // 普通元素无自定义props：{}
            propsObject = SlimeAstCreateUtils.createObjectExpression([])
        }

        // 创建 callee：HTML 标签转换为 $OvsHtmlTag.xxx，其他保持原样
        const callee = createCalleeForTag(id.name, id.loc, SlimeAstCreateUtils, SlimeTokenCreateUtils)

        // 创建函数调用：tagName(props, children) 或 $OvsHtmlTag.tagName(props, children)
        const callExpression = SlimeAstCreateUtils.createCallExpression(
            callee,
            [
                propsObject,                                  // 第一个参数：props 对象
                SlimeAstCreateUtils.createIdentifier('children')    // 第二个参数：children 数组（固定名字）
            ]
        )

        // 关键：设置 CallExpression 的 loc，使其指向源代码中的标签位置
        if (id.loc) {
            callExpression.loc = id.loc
        }

        // 包装为 return 语句
        return SlimeAstCreateUtils.createReturnStatement(callExpression)
    }
}
