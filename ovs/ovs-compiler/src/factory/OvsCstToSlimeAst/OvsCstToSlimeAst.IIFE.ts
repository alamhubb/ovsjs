import { OvsCstToSlimeAstJudgement } from './OvsCstToSlimeAst.Judgement'

/**
 * OVS IIFE 构建层
 */
export abstract class OvsCstToSlimeAstIIFE extends OvsCstToSlimeAstJudgement {

    /**
     * 将控制流语句包裹为响应式表达式
     */
    protected wrapStatementWithReactiveExpression(
        stmt: any,
        _unused?: any,  // 保留参数位置兼容性
        loc?: any
    ): any {
        const bodyStatements: any[] = [
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
        statements: any[],
        attrsVarName?: string | null
    ): any {
        const iifeFunctionBody: any[] = [
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
        id: any,
        statements: any[],
        attrsVarName: string | null,
        componentProps: any
    ): any

    /**
     * 创建 IIFE
     */
    protected createIIFE(body: any[]): any {
        let loc: any = undefined
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
        )
    }

    // 抽象方法，由更上层实现
    protected abstract createReturnOvsAPICreateVNode(
        id: any,
        attrsVarName: string | null,
        componentProps: any
    ): any
}
