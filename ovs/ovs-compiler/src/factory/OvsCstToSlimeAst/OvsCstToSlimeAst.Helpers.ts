import { CssTsCstToAst, normalizeGeneratedAst } from "cssts-compiler"
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
    protected createArrowFunctionExpressionAst(
        params: any[],
        body: SlimeExpression | SlimeBlockStatement,
        expression: boolean,
        async: boolean = false,
        loc?: any
    ): any {
        return normalizeGeneratedAst({
            type: SlimeAstTypeName.ArrowFunctionExpression,
            params,
            body: normalizeGeneratedAst(body as any),
            expression,
            async,
            paramsParenthesized: params.length !== 1,
            loc: loc ?? null
        } as any)
    }

    protected createCallArgument(argument: SlimeExpression | any, commaToken?: any): any {
        return SlimeAstCreateUtils.createCallArgument(
            normalizeGeneratedAst(argument as any) as any,
            commaToken
        )
    }

    protected createCallArguments(args: Array<SlimeExpression | any>): any[] {
        return args.map((arg, index) => this.createCallArgument(
            arg,
            index < args.length - 1 ? SlimeTokenCreateUtils.createCommaToken() : undefined
        ))
    }

    protected callArgumentExpression(argumentItem: any): SlimeExpression {
        const argument = argumentItem?.argument
        if (!argument) {
            throw new Error('OVS call expression argument must use Slime call-argument wrapper')
        }
        return normalizeGeneratedAst(argument as any) as SlimeExpression
    }

    protected createReactivePushStatement(
        bodyExpr: SlimeExpression | SlimeBlockStatement,
        loc?: any
    ): SlimeExpressionStatement {
        const normalizedBodyExpr = normalizeGeneratedAst(bodyExpr as any) as SlimeExpression | SlimeBlockStatement

        // 1. 创建箭头函数：() => body
        const arrowFunction = this.createArrowFunctionExpressionAst(
            [],
            normalizedBodyExpr,
            (normalizedBodyExpr as any).type !== SlimeAstTypeName.BlockStatement,
            false,
            loc ?? null
        )

        // 2. 创建 defineReactiveExpression(() => body)
        const defineReactiveCall = SlimeAstCreateUtils.createCallExpression(
            SlimeAstCreateUtils.createIdentifier('defineReactiveExpression'),
            this.createCallArguments([arrowFunction])
        )

        // 3. 创建 children.push(defineReactiveExpression(...))
        const pushCall = SlimeAstCreateUtils.createCallExpression(
            SlimeAstCreateUtils.createMemberExpression(
                SlimeAstCreateUtils.createIdentifier('children'),
                SlimeTokenCreateUtils.createDotToken(loc),
                SlimeAstCreateUtils.createIdentifier('push')
            ),
            this.createCallArguments([defineReactiveCall])
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
