import { OvsCstToSlimeAstJudgement } from './OvsCstToSlimeAst.Judgement'
import {
    type SlimeCallExpression,
    type SlimeExpression,
    type SlimeIdentifier,
    type SlimeStatement
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
            this.createReturnStatementNode(this.createIdentifierNode('children'), loc)
        ]
        const arrowBody = this.createBlockStatementNode(bodyStatements, loc)

        return this.createReactivePushStatement(arrowBody, loc, false)
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

        if (attrsVarName !== null && attrsVarName !== undefined) {
            iifeFunctionBody.push(this.createAttrsDeclaration(attrsVarName))
        }

        for (let index = 0; index < statements.length; index++) {
            iifeFunctionBody.push(statements[index])
        }

        iifeFunctionBody.push(
            this.createReturnStatementNode(this.createIdentifierNode('children'))
        )

        return this.createIIFE(iifeFunctionBody)
    }

    /**
     * 创建完整的 IIFE（需要id）
     */
    protected abstract createComplexIIFE(
        id: SlimeIdentifier,
        statements: SlimeStatement[],
        attrsVarName: string | null,
        componentProps: SlimeExpression | null
    ): SlimeCallExpression

    /**
     * 创建 IIFE
     */
    protected createIIFE(body: Array<SlimeStatement>): SlimeCallExpression {
        let loc: any = undefined
        if (body.length > 0) {
            loc = body[0].loc
        }

        // 创建函数体的 BlockStatement
        const blockStatement = this.createBlockStatementNode(body, loc)

        // 创建箭头函数：() => { ...body }
        const arrowFunction = this.createArrowFunctionExpressionAst(
            [],
            blockStatement,
            false,
            false,
            loc ?? null
        )

        const defineCall = this.createCallExpressionNode(
            this.createIdentifierNode('defineOvsComponent'),
            this.createCallArguments([arrowFunction])
        )

        return this.createCallExpressionNode(
            defineCall,
            this.createCallArguments([
                this.createObjectExpressionNode([]),
                this.createArrayExpressionNode([])
            ])
        ) as SlimeCallExpression
    }

    // 抽象方法，由更上层实现
    protected abstract createReturnOvsAPICreateVNode(
        id: SlimeIdentifier,
        attrsVarName: string | null,
        componentProps: SlimeExpression | null
    ): SlimeStatement
}
