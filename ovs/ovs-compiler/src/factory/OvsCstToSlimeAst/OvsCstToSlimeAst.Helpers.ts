import { CssTsCstToAst, normalizeGeneratedAst } from "cssts-compiler"
import { com_slime_parser_cstToAst_SlimeAstCreateUtils as GeneratedSlimeAstCreateUtils } from "@qin/generated-qin-parser-ts/SlimeAstCreateUtils"

declare function __qin_ast_type_of__(node: any): any
declare function __qin_ast_body_of__(node: any): any
declare function __qin_ast_expression_of__(node: any): any
declare function __qin_ast_name_of__(node: any): any

/**
 * OVS AST 辅助方法基类
 * 
 * 提供通用的 AST 创建辅助方法，被所有上层类复用
 */
export abstract class OvsCstToSlimeAstHelpers extends CssTsCstToAst {

    protected readAstField(node: any, fieldName: string): any {
        if (node === null || node === undefined) return undefined
        if (fieldName === 'type') {
            const type = __qin_ast_type_of__(node)
            if (type === null || type === undefined) return undefined
            return '' + type
        }
        if (fieldName === 'body') {
            return __qin_ast_body_of__(node)
        }
        if (fieldName === 'expression') {
            return __qin_ast_expression_of__(node)
        }
        if (fieldName === 'name') {
            return __qin_ast_name_of__(node)
        }
        throw new Error('Unsupported static OVS AST field: ' + fieldName)
    }

    protected readAstType(node: any): string | undefined {
        const rawValue = this.readAstField(node, 'type')
        if (typeof rawValue !== 'string') return undefined
        const value: string = rawValue as string
        if (value === 'PROGRAM') return 'Program'
        if (value === 'IDENTIFIER') return 'Identifier'
        if (value === 'LITERAL') return 'Literal'
        if (value === 'ARRAY_EXPRESSION') return 'ArrayExpression'
        if (value === 'OBJECT_EXPRESSION') return 'ObjectExpression'
        if (value === 'ARROW_FUNCTION_EXPRESSION') return 'ArrowFunctionExpression'
        if (value === 'CALL_EXPRESSION') return 'CallExpression'
        if (value === 'MEMBER_EXPRESSION') return 'MemberExpression'
        if (value === 'EXPRESSION_STATEMENT') return 'ExpressionStatement'
        if (value === 'BLOCK_STATEMENT') return 'BlockStatement'
        if (value === 'RETURN_STATEMENT') return 'ReturnStatement'
        if (value === 'VARIABLE_DECLARATION') return 'VariableDeclaration'
        if (value === 'FUNCTION_DECLARATION') return 'FunctionDeclaration'
        if (value === 'CLASS_DECLARATION') return 'ClassDeclaration'
        if (value === 'IMPORT_DECLARATION') return 'ImportDeclaration'
        if (value === 'EXPORT_DEFAULT_DECLARATION') return 'ExportDefaultDeclaration'
        if (value === 'EXPORT_NAMED_DECLARATION') return 'ExportNamedDeclaration'
        if (value === 'PROPERTY') return 'Property'
        return value
    }

    // ==================== 公共 AST 创建方法 ====================

    /**
     * 创建 children 数组声明：const children = []
     */
    protected createChildrenDeclaration(): any {
        return this.createConstDeclaration('children', this.createArrayExpressionNode([]))
    }

    /**
     * 创建 attrs 对象声明：const temp$$attrs$$uuid = {}
     */
    protected createAttrsDeclaration(attrsVarName: string): any {
        return this.createConstDeclaration(attrsVarName, this.createObjectExpressionNode([]))
    }

    /**
     * 创建 children.push(defineReactiveExpression(() => body)) 语句
     * 
     * 统一响应式包裹逻辑，被多个方法复用
     */
    protected createArrowFunctionExpressionAst(
        params: any[],
        body: any,
        expression: boolean,
        async: boolean = false,
        loc?: any
    ): any {
        return normalizeGeneratedAst(GeneratedSlimeAstCreateUtils.createArrowFunctionExpression(
            params,
            normalizeGeneratedAst(body as any),
            expression,
            async,
            params.length !== 1,
            loc ?? null
        ) as any)
    }

    protected createCallArgument(argument: any, commaToken?: any): any {
        return normalizeGeneratedAst(argument as any)
    }

    protected createCallArguments(args: any[]): any[] {
        const result: any[] = []
        for (let index = 0; index < args.length; index++) {
            const arg = args[index]
            result.push(normalizeGeneratedAst(arg as any))
        }
        return result
    }

    protected callArgumentExpression(argumentItem: any): any {
        const argument = argumentItem
        if (!argument) {
            throw new Error('OVS call expression argument must expose a static expression')
        }
        return normalizeGeneratedAst(argument as any)
    }

    protected createReactivePushStatement(
        bodyExpr: any,
        loc?: any,
        expression: boolean = true
    ): any {
        const normalizedBodyExpr: any = normalizeGeneratedAst(bodyExpr as any)

        // 1. 创建箭头函数：() => body
        const arrowFunction = this.createArrowFunctionExpressionAst(
            [],
            normalizedBodyExpr,
            expression,
            false,
            loc ?? null
        )

        // 2. 创建 defineReactiveExpression(() => body)
        const defineReactiveCall = this.createCallExpressionNode(
            this.createIdentifierNode('defineReactiveExpression'),
            this.createCallArguments([arrowFunction])
        )

        // 3. 创建 children.push(defineReactiveExpression(...))
        const pushCall = this.createCallExpressionNode(
            this.createMemberExpressionNode(
                this.createIdentifierNode('children'),
                this.createDotToken(loc),
                this.createIdentifierNode('push'),
                loc
            ),
            this.createCallArguments([defineReactiveCall]),
            loc
        )

        return this.createExpressionStatementNode(pushCall, loc)
    }

    protected createConstDeclaration(name: string, init: any, loc?: any): any {
        const declarator = GeneratedSlimeAstCreateUtils.createVariableDeclarator(
            this.createIdentifierNode(name, loc),
            normalizeGeneratedAst(init as any),
            loc ?? null
        )
        return normalizeGeneratedAst(GeneratedSlimeAstCreateUtils.createVariableDeclaration(
            [declarator],
            'const',
            loc ?? null
        ) as any)
    }

    protected createIdentifierNode(name: string, loc?: any): any {
        return normalizeGeneratedAst(GeneratedSlimeAstCreateUtils.createIdentifier(name, loc ?? null) as any)
    }

    protected createArrayExpressionNode(elements: any[], loc?: any): any {
        const values: any[] = []
        for (let index = 0; index < elements.length; index++) {
            values.push(normalizeGeneratedAst(elements[index] as any))
        }
        return normalizeGeneratedAst(GeneratedSlimeAstCreateUtils.createArrayExpression(values, loc ?? null) as any)
    }

    protected createArrayElementNode(element: any, commaToken?: any): any {
        return normalizeGeneratedAst(element as any)
    }

    protected createObjectExpressionNode(properties: any[], loc?: any): any {
        const values: any[] = []
        for (let index = 0; index < properties.length; index++) {
            values.push(normalizeGeneratedAst(properties[index] as any))
        }
        return normalizeGeneratedAst(GeneratedSlimeAstCreateUtils.createObjectExpression(values, loc ?? null) as any)
    }

    protected createObjectPropertyItemNode(property: any, commaToken?: any): any {
        return normalizeGeneratedAst(property as any)
    }

    protected createBlockStatementNode(body: any[], loc?: any): any {
        return normalizeGeneratedAst(GeneratedSlimeAstCreateUtils.createBlockStatement(body, loc ?? null) as any)
    }

    protected createReturnStatementNode(argument: any, loc?: any): any {
        return normalizeGeneratedAst(GeneratedSlimeAstCreateUtils.createReturnStatement(
            normalizeGeneratedAst(argument as any),
            loc ?? null
        ) as any)
    }

    protected createCallExpressionNode(callee: any, args: any[], loc?: any): any {
        return normalizeGeneratedAst(GeneratedSlimeAstCreateUtils.createCallExpression(
            normalizeGeneratedAst(callee as any),
            args,
            false,
            loc ?? null
        ) as any)
    }

    protected createMemberExpressionNode(object: any, dot: any, property: any, loc?: any): any {
        return normalizeGeneratedAst(GeneratedSlimeAstCreateUtils.createMemberExpression(
            normalizeGeneratedAst(object as any),
            normalizeGeneratedAst(property as any),
            false,
            false,
            loc ?? null
        ) as any)
    }

    protected createExpressionStatementNode(expression: any, loc?: any): any {
        return normalizeGeneratedAst(GeneratedSlimeAstCreateUtils.createExpressionStatement(
            normalizeGeneratedAst(expression as any),
            loc ?? null
        ) as any)
    }

    protected createConstToken(loc?: any): any {
        return {type: 'Const', value: 'const', loc: loc ?? null}
    }

    protected createAssignToken(loc?: any): any {
        return {type: 'Assign', value: '=', loc: loc ?? null}
    }

    protected createCommaToken(loc?: any): any {
        return {type: 'Comma', value: ',', loc: loc ?? null}
    }

    protected createDotToken(loc?: any): any {
        return {type: 'Dot', value: '.', loc: loc ?? null}
    }

    protected createLBraceToken(loc?: any): any {
        return {type: 'LBrace', value: '{', loc: loc ?? null}
    }

    protected createRBraceToken(loc?: any): any {
        return {type: 'RBrace', value: '}', loc: loc ?? null}
    }
}
