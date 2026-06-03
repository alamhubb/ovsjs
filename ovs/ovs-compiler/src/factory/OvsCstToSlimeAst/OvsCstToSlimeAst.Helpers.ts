import { CssTsCstToAst } from "cssts-compiler"
import {
    SlimeAstTypeName,
    type SlimeBlockStatement,
    type SlimeExpression,
    type SlimeExpressionStatement,
    type SlimeStatement,
    SlimeAstCreateUtils,
    SlimeTokenCreateUtils
} from "slime-ast"

/**
 * OVS AST 辅助方法基类
 * 
 * 提供通用的 AST 创建辅助方法，被所有上层类复用
 */
export abstract class OvsCstToSlimeAstHelpers extends CssTsCstToAst {

    // ==================== 公共 AST 创建方法 ====================

    /**
     * 创建 children 数组声明：const children = []
     */
    protected createChildrenDeclaration(): SlimeStatement {
        return SlimeAstCreateUtils.createVariableDeclaration(
            SlimeTokenCreateUtils.createConstToken(),
            [
                SlimeAstCreateUtils.createVariableDeclarator(
                    SlimeAstCreateUtils.createIdentifier('children'),
                    SlimeTokenCreateUtils.createAssignToken(),
                    SlimeAstCreateUtils.createArrayExpression([])
                )
            ]
        )
    }

    /**
     * 创建 attrs 对象声明：const temp$$attrs$$uuid = {}
     */
    protected createAttrsDeclaration(attrsVarName: string): SlimeStatement {
        return SlimeAstCreateUtils.createVariableDeclaration(
            SlimeTokenCreateUtils.createConstToken(),
            [
                SlimeAstCreateUtils.createVariableDeclarator(
                    SlimeAstCreateUtils.createIdentifier(attrsVarName),
                    SlimeTokenCreateUtils.createAssignToken(),
                    SlimeAstCreateUtils.createObjectExpression([])
                )
            ]
        )
    }

    /**
     * 创建 children.push(defineReactiveExpression(() => body)) 语句
     * 
     * 统一响应式包裹逻辑，被多个方法复用
     */
    protected createReactivePushStatement(
        bodyExpr: SlimeExpression | SlimeBlockStatement,
        loc?: any
    ): SlimeExpressionStatement {
        // 1. 创建箭头函数：() => body
        const arrowFunction = SlimeAstCreateUtils.createArrowFunctionExpression(
            bodyExpr,
            [],
            false,
            false
        )

        // 2. 创建 defineReactiveExpression(() => body)
        const defineReactiveCall = SlimeAstCreateUtils.createCallExpression(
            SlimeAstCreateUtils.createIdentifier('defineReactiveExpression'),
            [arrowFunction]
        )

        // 3. 创建 children.push(defineReactiveExpression(...))
        const pushCall = SlimeAstCreateUtils.createCallExpression(
            SlimeAstCreateUtils.createMemberExpression(
                SlimeAstCreateUtils.createIdentifier('children'),
                SlimeTokenCreateUtils.createDotToken(loc),
                SlimeAstCreateUtils.createIdentifier('push')
            ),
            [defineReactiveCall]
        )
        if (loc) {
            pushCall.loc = loc
        }

        return {
            type: SlimeAstTypeName.ExpressionStatement,
            expression: pushCall,
            loc
        } as SlimeExpressionStatement
    }
}
