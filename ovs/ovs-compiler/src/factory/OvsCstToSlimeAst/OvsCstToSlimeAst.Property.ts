import {
    SlimeAstTypeName,
    type SlimeExpression,
    SlimeAstCreateUtils,
    SlimeTokenCreateUtils
} from "slime-ast"
import { normalizeGeneratedAst } from "cssts-compiler"
import { OvsCstToSlimeAstView } from "./OvsCstToSlimeAst.View"
import { cstChildrenOf, cstNameOf, cstValueOf, toArray, type SubhutiCst } from "./cst-utils"

export abstract class OvsCstToSlimeAstProperty extends OvsCstToSlimeAstView {
    createObjectLiteralAst(cst: SubhutiCst): SlimeExpression {
        return this.createObjectPropsAst(cst)
    }

    protected createOvsArgumentsAst(cst: SubhutiCst): SlimeExpression {
        const children = cstChildrenOf(cst)
        const properties: any[] = []
        const propListCst = children.find(child => cstNameOf(child) === 'OvsPropertyDefinitionList')
        if (propListCst) {
            const propDefs = cstChildrenOf(propListCst).filter(c => cstNameOf(c) === 'OvsPropertyDefinition')

            for (let i = 0; i < propDefs.length; i++) {
                const prop = this.createOvsPropertyDefinitionAst(propDefs[i])
                if (prop) {
                    properties.push(
                        SlimeAstCreateUtils.createObjectPropertyItem(
                            prop,
                            i < propDefs.length - 1 ? SlimeTokenCreateUtils.createCommaToken() : undefined
                        )
                    )
                }
            }
        }

        return SlimeAstCreateUtils.createObjectExpression(properties)
    }

    protected createOvsPropertyDefinitionAst(cst: SubhutiCst): any {
        const children = cstChildrenOf(cst)
        if (children.length === 0) return null

        const firstChild = children[0]
        if (cstNameOf(firstChild) === 'Ellipsis' || cstValueOf(firstChild) === '...') {
            const exprCst = children.find(c =>
                cstNameOf(c) !== 'Ellipsis' && cstValueOf(c) !== '...'
            )
            if (!exprCst) return null
            const argument = this.createExpressionAst(exprCst)
            return SlimeAstCreateUtils.createSpreadElement(argument, cst.loc)
        }

        if (cstNameOf(firstChild) === 'MethodDefinition') {
            const methodDef = normalizeGeneratedAst((this as any).createMethodDefinitionAst(firstChild, false) as any) as any
            const ovsBody = this.createOvsMethodBodyAst(firstChild)
            if (ovsBody && methodDef.value) {
                methodDef.value.body = ovsBody
                if ('__qin_field_body' in methodDef.value) {
                    methodDef.value.__qin_field_body = ovsBody
                }
            }
            const keyAst = SlimeAstCreateUtils.createPropertyAst(methodDef.key, methodDef.value)
            if (methodDef.computed) keyAst.computed = true
            if (methodDef.kind === 'get' || methodDef.kind === 'set') {
                keyAst.kind = methodDef.kind
            } else {
                keyAst.method = true
            }
            keyAst.loc = cst.loc
            return keyAst
        }

        const propertyNameCst = children.find(child => cstNameOf(child) === 'PropertyName')
        const assignIndex = children.findIndex(child =>
            cstValueOf(child) === '=' ||
            cstValueOf(child) === ':' ||
            cstNameOf(child) === 'Assign' ||
            cstNameOf(child) === 'Colon'
        )

        if (propertyNameCst && assignIndex !== -1) {
            const key = this.createPropertyNameAst(propertyNameCst)
            const keyName = this.getPropertyKeyName(key)
            const valueCst = children[assignIndex + 1]
            if (!valueCst) return null

            let value = (this as any).createExpressionAst(valueCst)
            if (keyName === 'class' && this.getAstType(value) === SlimeAstTypeName.ObjectExpression) {
                value = this.transformClassObjectToArray(value)
            }

            const prop = SlimeAstCreateUtils.createPropertyAst(key, value)
            prop.loc = cst.loc
            return prop
        }

        const idRefCst = children.find(child => cstNameOf(child) === 'IdentifierReference')
        if (idRefCst) {
            const id = (this as any).createIdentifierReferenceAst(idRefCst)
            const prop = SlimeAstCreateUtils.createPropertyAst(id, { ...id })
            prop.shorthand = true
            prop.loc = cst.loc
            return prop
        }

        return null
    }

    private createOvsMethodBodyAst(methodCst: SubhutiCst): any {
        const bodyCst = this.findFirstCstByNames(methodCst, ['OvsFunctionBody', 'OvsAsyncFunctionBody'])
        if (!bodyCst) return null
        const statementList = this.findFirstCstByNames(bodyCst, ['StatementList'])
        const statements = statementList ? (this as any).createStatementListAst(statementList) : []
        return normalizeGeneratedAst(
            SlimeAstCreateUtils.createBlockStatement(
                statements,
                bodyCst.loc,
                SlimeTokenCreateUtils.createLBraceToken(bodyCst.loc),
                SlimeTokenCreateUtils.createRBraceToken(bodyCst.loc)
            ) as any
        )
    }

    private findFirstCstByNames(cst: SubhutiCst | undefined, names: string[]): SubhutiCst | undefined {
        if (!cst) return undefined
        const name = cstNameOf(cst)
        if (name && names.indexOf(name) >= 0) return cst
        for (const child of cstChildrenOf(cst)) {
            const found = this.findFirstCstByNames(child, names)
            if (found) return found
        }
        return undefined
    }

    private getPropertyKeyName(key: any): string | null {
        if (this.getAstType(key) === SlimeAstTypeName.Identifier) {
            return typeof key.name === 'function' ? key.name() : key.name
        }
        if (this.getAstType(key) === SlimeAstTypeName.Literal) {
            const value = typeof key.value === 'function' ? key.value() : key.value
            return typeof value === 'string' ? value : null
        }
        return null
    }

    private createPropertyNameAst(cst: SubhutiCst): any {
        const child = cstChildrenOf(cst)[0]
        if (cstNameOf(child) === 'LiteralPropertyName') {
            return this.createLiteralPropertyNameAst(child)
        }
        if (cstNameOf(child) === 'ComputedPropertyName') {
            return this.createComputedPropertyNameAst(child)
        }
        return null
    }

    protected createObjectPropsAst(cst: SubhutiCst): SlimeExpression {
        const propDefs = this.collectPropertyDefinitions(cst)
        const properties: any[] = []
        for (let i = 0; i < propDefs.length; i++) {
            const prop = this.createOvsPropertyDefinitionAst(propDefs[i])
            if (prop) {
                properties.push(
                    SlimeAstCreateUtils.createObjectPropertyItem(
                        prop,
                        i < propDefs.length - 1 ? SlimeTokenCreateUtils.createCommaToken() : undefined
                    )
                )
            }
        }
        return normalizeGeneratedAst(SlimeAstCreateUtils.createObjectExpression(properties) as any) as SlimeExpression
    }

    private collectPropertyDefinitions(cst: SubhutiCst | undefined): SubhutiCst[] {
        if (!cst) return []
        if (cstNameOf(cst) === 'PropertyDefinition') return [cst]
        const out: SubhutiCst[] = []
        for (const child of cstChildrenOf(cst)) {
            out.push(...this.collectPropertyDefinitions(child))
        }
        return out
    }

    private createLiteralPropertyNameAst(cst: SubhutiCst): any {
        const child = cstChildrenOf(cst)[0]
        const childName = cstNameOf(child)
        const childValue = cstValueOf(child)

        if (childName === 'StringLiteral') {
            return (this as any).createStringLiteralAst(child)
        }

        if (childName === 'NumericLiteral') {
            return (this as any).createNumericLiteralAst(child)
        }

        if (childName === 'IdentifierName' || childValue) {
            const name = childValue || cstValueOf(cstChildrenOf(child)[0])
            return SlimeAstCreateUtils.createIdentifier(name)
        }

        return null
    }

    private createComputedPropertyNameAst(cst: SubhutiCst): any {
        const exprCst = cstChildrenOf(cst).find(c =>
            cstNameOf(c) !== 'LBracket' && cstNameOf(c) !== 'RBracket' &&
            cstValueOf(c) !== '[' && cstValueOf(c) !== ']'
        )
        return exprCst ? (this as any).createExpressionAst(exprCst) : null
    }

    private transformClassObjectToArray(objExpr: any): SlimeExpression {
        const propItems = toArray<any>(typeof objExpr.properties === 'function' ? objExpr.properties() : objExpr.properties)
        const elements: any[] = []

        for (let i = 0; i < propItems.length; i++) {
            const prop = propItems[i].property || propItems[i]
            const key = typeof prop.key === 'function' ? prop.key() : prop.key
            const shorthand = typeof prop.shorthand === 'function' ? prop.shorthand() : prop.shorthand
            if (shorthand && this.getAstType(key) === SlimeAstTypeName.Identifier) {
                const className = typeof key.name === 'function' ? key.name() : key.name
                const memberExpr = SlimeAstCreateUtils.createMemberExpression(
                    SlimeAstCreateUtils.createIdentifier('OvsCls'),
                    SlimeTokenCreateUtils.createDotToken(),
                    SlimeAstCreateUtils.createIdentifier(className)
                )
                elements.push(
                    SlimeAstCreateUtils.createArrayElement(
                        memberExpr,
                        i < propItems.length - 1 ? SlimeTokenCreateUtils.createCommaToken() : undefined
                    )
                )
            }
        }

        return SlimeAstCreateUtils.createArrayExpression(elements)
    }

    private getAstType(node: any): string | undefined {
        const rawType = node?.type
        if (typeof rawType === 'string') return rawType
        const value = typeof rawType === 'function' ? rawType.call(node) : rawType
        if (typeof value === 'string') return value
        const enumName = typeof value?.name === 'function' ? value.name() : value?.__qinEnumName
        if (typeof enumName !== 'string') return undefined
        return enumName.split('_').filter(Boolean).map(part => {
            if (part === 'TS') return 'TS'
            const lower = part.toLowerCase()
            return lower.slice(0, 1).toUpperCase() + lower.slice(1)
        }).join('')
    }
}
