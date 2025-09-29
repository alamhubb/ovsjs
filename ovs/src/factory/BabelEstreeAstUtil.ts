import * as babeType from "@babel/types";
import {OvsAstRenderDomViewDeclaration} from "../interface/OvsInterface";
import {CallExpression, ExpressionStatement, Statement} from '@babel/types';
import JsonUtil from "subhuti/src/utils/JsonUtil.ts";

export default class BabelEstreeAstUtil {
    static createOvsRenderDomViewDeclarationEstreeAst(ast: OvsAstRenderDomViewDeclaration): CallExpression {
        const body = BabelEstreeAstUtil.createOvsAPICreateVNode(ast)
        const viewIIFE = BabelEstreeAstUtil.createIIFE(body)
        return viewIIFE
    }

    static createIIFE(body: Array<Statement>): CallExpression {
        const blockStatement = babeType.blockStatement(body)
        const functionExpression = babeType.functionExpression(null, [], blockStatement)
        const callExpression = babeType.callExpression(functionExpression, [])
        return callExpression
    }

    static createOvsAPICreateVNode(ast: OvsAstRenderDomViewDeclaration): Statement[] {
        const memberExpressionObject = babeType.identifier('OvsAPI')
        const memberExpressionProperty = babeType.identifier('createVNode')
        const memberExpression = babeType.memberExpression(memberExpressionObject, memberExpressionProperty)
        const OvsAPICreateVNodeFirstParamsViewName = babeType.stringLiteral(ast.id.name)

        const OvsAPICreateVNodeSecondParamsChildren = babeType.arrayExpression(ast.children)

        const callExpression = babeType.callExpression(memberExpression, [OvsAPICreateVNodeFirstParamsViewName, OvsAPICreateVNodeSecondParamsChildren])
        const ReturnStatement = babeType.returnStatement(callExpression)

        return [ReturnStatement]
    }
}
