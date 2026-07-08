import { OvsCstToSlimeAstJudgement } from './OvsCstToSlimeAst.Judgement'
import {
    SlimeAstTypeName,
    type SlimeBlockStatement,
    type SlimeCallExpression,
    type SlimeExpression,
    type SlimeIdentifier,
    type SlimeStatement,
    SlimeAstCreateUtils,
    SlimeTokenCreateUtils
} from "slime-ast"

/**
 * OVS IIFE 构建层
 */
export abstract class OvsCstToSlimeAstIIFE extends OvsCstToSlimeAstJudgement {

    /**
     * 将控制流语句包裹为响应式表达式
     */
    protected wrapStatementWithReactiveExpression(
        stmt: SlimeStatement,
        _unused?: any,  // 保留参数位置兼容性
        loc?: any
    ): SlimeStatement {
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
     * 创建基础 IIFE（不需要id）
     */
    public createBaseIIFE(
        statements: SlimeStatement[],
        attrsVarName?: string | null
    ): SlimeCallExpression {
        const iifeFunctionBody: SlimeStatement[] = [
            this.createChildrenDeclaration()
        ]

        if (attrsVarName) {
            iifeFunctionBody.push(this.createAttrsDeclaration(attrsVarName))
        }

        iifeFunctionBody.push(...statements)

        iifeFunctionBody.push(
            SlimeAstCreateUtils.createReturnStatement(
                SlimeAstCreateUtils.createIdentifier('children')
            )
        )

        return this.createIIFE(iifeFunctionBody)
    }

    /**
     * 创建完整的 IIFE（需要id）
     */
    protected createComplexIIFE(
        id: SlimeIdentifier,
        statements: SlimeStatement[],
        attrsVarName: string | null,
        componentProps: SlimeExpression | null
    ): SlimeCallExpression {
        const iifeFunctionBody: SlimeStatement[] = [
            this.createChildrenDeclaration()
        ]

        if (attrsVarName) {
            iifeFunctionBody.push(this.createAttrsDeclaration(attrsVarName))
        }

        iifeFunctionBody.push(...statements)

        iifeFunctionBody.push(this.createReturnOvsAPICreateVNode(id, attrsVarName, componentProps))

        return this.createIIFE(iifeFunctionBody)
    }

    /**
     * 创建 IIFE
     */
    private createIIFE(body: Array<SlimeStatement>): SlimeCallExpression {
        const loc = body[0]?.loc || undefined

        // 创建函数体的 BlockStatement
        const blockStatement = SlimeAstCreateUtils.createBlockStatement(
            body,
            loc,
            SlimeTokenCreateUtils.createLBraceToken(loc),
            SlimeTokenCreateUtils.createRBraceToken(loc)
        )

        // 创建箭头函数：() => { ...body }
        const arrowFunction = this.createArrowFunctionExpressionAst(
            [],
            blockStatement,
            false,
            false,
            loc ?? null
        )

        const defineCall = SlimeAstCreateUtils.createCallExpression(
            SlimeAstCreateUtils.createIdentifier('defineOvsComponent'),
            this.createCallArguments([arrowFunction])
        )

        return SlimeAstCreateUtils.createCallExpression(
            defineCall,
            this.createCallArguments([
                SlimeAstCreateUtils.createObjectExpression([]),
                SlimeAstCreateUtils.createArrayExpression([])
            ])
        )
    }

    // 抽象方法，由更上层实现
    protected abstract createReturnOvsAPICreateVNode(
        id: SlimeIdentifier,
        attrsVarName: string | null,
        componentProps: SlimeExpression | null
    ): SlimeStatement
}
