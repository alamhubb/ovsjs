import { normalizeGeneratedAst } from "cssts-compiler"
import { com_slime_parser_cstToAst_SlimeAstCreateUtils as GeneratedSlimeAstCreateUtils } from "@qin/generated-qin-parser-ts/SlimeAstCreateUtils"
import { OvsCstToSlimeAstView } from "./OvsCstToSlimeAst.View"
import { cstChildrenOf, cstNameOf, cstValueOf, type OvsCst } from "./cst-utils"

export abstract class OvsCstToSlimeAstProperty extends OvsCstToSlimeAstView {
    createObjectLiteralAst(cst: OvsCst): any {
        return this.createObjectPropsAst(cst)
    }

    protected createOvsArgumentsAst(cst: OvsCst): any {
        const children: OvsCst[] = cstChildrenOf(cst)
        const properties: any[] = []
        let propListCst: OvsCst | undefined = undefined
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            const childName: string = cstNameOf(child) as string
            if (childName === 'OvsPropertyDefinitionList') {
                propListCst = child
                break
            }
        }
        if (propListCst !== null && propListCst !== undefined) {
            const propDefs: OvsCst[] = []
            const propChildren: OvsCst[] = cstChildrenOf(propListCst)
            for (let index = 0; index < propChildren.length; index++) {
                const child = propChildren[index]
                const childName: string = cstNameOf(child) as string
                if (childName === 'OvsPropertyDefinition') {
                    propDefs.push(child)
                }
            }

            for (let i = 0; i < propDefs.length; i++) {
                const prop = this.createOvsPropertyDefinitionAst(propDefs[i])
                if (prop !== null && prop !== undefined) {
                    properties.push(
                        this.createObjectPropertyItemNode(
                            prop,
                            i < propDefs.length - 1 ? this.createCommaToken() : undefined
                        )
                    )
                }
            }
        }

        return this.createObjectExpressionNode(properties)
    }

    protected createOvsPropertyDefinitionAst(cst: OvsCst): any {
        const children: OvsCst[] = cstChildrenOf(cst)
        if (children.length === 0) return null

        const firstChild = children[0]
        const firstChildName: string = cstNameOf(firstChild) as string
        const firstChildValue: string = cstValueOf(firstChild) as string
        if (firstChildName === 'Ellipsis' || firstChildValue === '...') {
            let exprCst: OvsCst | undefined = undefined
            for (let index = 0; index < children.length; index++) {
                const child = children[index]
                const childName: string = cstNameOf(child) as string
                const childValue: string = cstValueOf(child) as string
                if (childName !== 'Ellipsis' && childValue !== '...') {
                    exprCst = child
                    break
                }
            }
            if (exprCst === null || exprCst === undefined) return null
            const argument = this.createExpressionFromCstOrAst(exprCst)
            return this.createSpreadElementNode(argument, cst)
        }

        if (firstChildName === 'MethodDefinition') {
            throw new Error('OVS method property definitions are outside the current static MVP')
        }

        let propertyNameCst: OvsCst | undefined = undefined
        let assignIndex = -1
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            const childName: string = cstNameOf(child) as string
            const childValue: string = cstValueOf(child) as string
            if (childName === 'PropertyName') {
                propertyNameCst = child
            }
            if (
                assignIndex === -1 &&
                (childValue === '=' ||
                    childValue === ':' ||
                    childName === 'Assign' ||
                    childName === 'Colon')
            ) {
                assignIndex = index
            }
        }

        if (propertyNameCst !== null && propertyNameCst !== undefined && assignIndex !== -1) {
            const key = this.createPropertyNameAst(propertyNameCst)
            let valueCst: OvsCst | undefined = undefined
            for (let index = 0; index < children.length; index++) {
                if (index > assignIndex) {
                    valueCst = children[index]
                    break
                }
            }
            if (valueCst === null || valueCst === undefined) return null

            const value = this.createExpressionFromCstOrAst(valueCst)

            const prop = this.createPropertyNode(key, value)
            return prop
        }

        let idRefCst: OvsCst | undefined = undefined
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            const childName: string = cstNameOf(child) as string
            if (childName === 'IdentifierReference') {
                idRefCst = child
                break
            }
        }
        if (idRefCst !== null && idRefCst !== undefined) {
            const id = this.createIdentifierReferenceNode(idRefCst)
            const prop = this.createPropertyNode(id, id, undefined, true)
            return prop
        }

        return null
    }

    private createPropertyNode(key: any, value: any, loc?: any, shorthand: boolean = false): any {
        return normalizeGeneratedAst(GeneratedSlimeAstCreateUtils.createProperty(
            normalizeGeneratedAst(key as any),
            normalizeGeneratedAst(value as any),
            'init',
            false,
            shorthand,
            false,
            loc ?? null
        ) as any)
    }

    private createSpreadElementNode(argument: any, cst?: OvsCst): any {
        return normalizeGeneratedAst(GeneratedSlimeAstCreateUtils.createSpreadElement(
            normalizeGeneratedAst(argument as any),
            cst == null ? null : GeneratedSlimeAstCreateUtils.resolveSubhutiLocation(cst as any)
        ) as any)
    }

    private createIdentifierReferenceNode(cst: OvsCst): any {
        const directName: string = cstValueOf(cst) as string
        if (directName !== null && directName !== undefined && directName.length > 0) {
            return this.createIdentifierNode(directName)
        }

        const children: OvsCst[] = cstChildrenOf(cst)
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            const childName: string = cstValueOf(child) as string
            if (childName !== null && childName !== undefined && childName.length > 0) {
                return this.createIdentifierNode(childName)
            }
        }

        throw new Error('OVS identifier reference CST is missing a static name')
    }

    private createPropertyNameAst(cst: OvsCst): any {
        const children: OvsCst[] = cstChildrenOf(cst)
        if (children.length === 0) return null
        const child = children[0]
        const childName: string = cstNameOf(child) as string
        if (childName === 'LiteralPropertyName') {
            return this.createLiteralPropertyNameAst(child)
        }
        if (childName === 'ComputedPropertyName') {
            return this.createComputedPropertyNameAst(child)
        }
        return null
    }

    protected createObjectPropsAst(cst: OvsCst): any {
        const propDefs = this.collectPropertyDefinitions(cst)
        const properties: any[] = []
        for (let i = 0; i < propDefs.length; i++) {
            const prop = this.createOvsPropertyDefinitionAst(propDefs[i])
            if (prop !== null && prop !== undefined) {
                properties.push(
                    this.createObjectPropertyItemNode(
                        prop,
                        i < propDefs.length - 1 ? this.createCommaToken() : undefined
                    )
                )
            }
        }
        return this.createObjectExpressionNode(properties) as any
    }

    private collectPropertyDefinitions(cst: OvsCst | undefined): OvsCst[] {
        if (cst === null || cst === undefined) return []
        const name: string = cstNameOf(cst) as string
        if (name === 'PropertyDefinition') return [cst]
        const out: OvsCst[] = []
        const children: OvsCst[] = cstChildrenOf(cst)
        for (let index = 0; index < children.length; index++) {
            const childProps: OvsCst[] = this.collectPropertyDefinitions(children[index])
            for (let childIndex = 0; childIndex < childProps.length; childIndex++) {
                out.push(childProps[childIndex])
            }
        }
        return out
    }

    private createLiteralPropertyNameAst(cst: OvsCst): any {
        const children: OvsCst[] = cstChildrenOf(cst)
        if (children.length === 0) return null
        const child = children[0]
        const childName: string = cstNameOf(child) as string
        const childValue: string = cstValueOf(child) as string

        if (childName === 'StringLiteral') {
            return this.createLiteralNode(childValue, childValue)
        }

        if (childName === 'NumericLiteral') {
            return this.createLiteralNode(childValue, childValue)
        }

        if (
            childName === 'IdentifierName' ||
            (childValue !== null && childValue !== undefined && childValue.length > 0)
        ) {
            let name: string = childValue
            if (name === null || name === undefined || name.length === 0) {
                const nameChildren: OvsCst[] = cstChildrenOf(child)
                if (nameChildren.length === 0) return null
                name = cstValueOf(nameChildren[0]) as string
            }
            if (name === null || name === undefined || name.length === 0) return null
            return this.createIdentifierNode(name)
        }

        return null
    }

    private createComputedPropertyNameAst(cst: OvsCst): any {
        const children: OvsCst[] = cstChildrenOf(cst)
        let exprCst: OvsCst | undefined = undefined
        for (let index = 0; index < children.length; index++) {
            const child = children[index]
            const childName: string = cstNameOf(child) as string
            const childValue: string = cstValueOf(child) as string
            if (
                childName !== 'LBracket' &&
                childName !== 'RBracket' &&
                childValue !== '[' &&
                childValue !== ']'
            ) {
                exprCst = child
                break
            }
        }
        if (exprCst === null || exprCst === undefined) return null
        return this.createExpressionFromCstOrAst(exprCst)
    }

    private createLiteralNode(value: any, raw: string, loc?: any): any {
        const numericValue = Number(value)
        if (!Number.isNaN(numericValue) && raw.length > 0 && raw !== 'true' && raw !== 'false' && raw !== 'null') {
            return normalizeGeneratedAst(GeneratedSlimeAstCreateUtils.createNumericLiteral(numericValue, raw, loc ?? null) as any)
        }
        return normalizeGeneratedAst(GeneratedSlimeAstCreateUtils.createStringLiteral('' + value, loc ?? null, raw) as any)
    }

    protected createExpressionFromCstOrAst(value: any): any {
        const generatedAst = this.extractSingleStaticExpressionAst(value)
        if (generatedAst !== null && generatedAst !== undefined) return generatedAst
        return this.createExpressionAst(value)
    }

    private extractSingleStaticExpressionAst(value: any): any {
        const astType = this.readAstType(value)
        if (astType !== null && astType !== undefined && astType.length > 0) {
            return normalizeGeneratedAst(value as any)
        }

        const cstName: string | undefined = cstNameOf(value)
        if (cstName === 'StringLiteral') {
            const raw = this.literalRawValue(value)
            return this.createLiteralNode(this.unquoteStringLiteral(raw), raw)
        }
        if (cstName === 'NumericLiteral') {
            const raw = this.literalRawValue(value)
            return this.createLiteralNode(raw, raw)
        }
        if (cstName === 'IdentifierReference') {
            return this.createIdentifierReferenceNode(value)
        }
        if (!this.isTransparentExpressionCst(cstName)) return undefined

        const children: OvsCst[] = cstChildrenOf(value)
        let found: any = undefined
        let foundCount = 0
        for (let index = 0; index < children.length; index++) {
            const childAst = this.extractSingleStaticExpressionAst(children[index])
            if (childAst !== null && childAst !== undefined) {
                found = childAst
                foundCount++
            }
        }
        return foundCount === 1 ? found : undefined
    }

    private literalRawValue(cst: OvsCst): string {
        const direct: string | undefined = cstValueOf(cst)
        if (direct !== null && direct !== undefined && direct.length > 0) return direct
        const children: OvsCst[] = cstChildrenOf(cst)
        if (children.length === 0) return ''
        const childValue: string | undefined = cstValueOf(children[0])
        return childValue === null || childValue === undefined ? '' : childValue
    }

    private unquoteStringLiteral(raw: string): string {
        if (raw.length < 2) return raw
        const first = raw.substring(0, 1)
        const last = raw.substring(raw.length - 1)
        if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
            return raw.substring(1, raw.length - 1)
        }
        return raw
    }

    private isTransparentExpressionCst(name: string | undefined): boolean {
        if (name === null || name === undefined) return false
        if (name.endsWith('Literal')) return true
        return name === 'Expression'
            || name === 'AssignmentExpression'
            || name === 'ConditionalExpression'
            || name === 'ShortCircuitExpression'
            || name === 'LogicalORExpression'
            || name === 'LogicalANDExpression'
            || name === 'BitwiseORExpression'
            || name === 'BitwiseXORExpression'
            || name === 'BitwiseANDExpression'
            || name === 'EqualityExpression'
            || name === 'RelationalExpression'
            || name === 'ShiftExpression'
            || name === 'AdditiveExpression'
            || name === 'MultiplicativeExpression'
            || name === 'ExponentiationExpression'
            || name === 'UnaryExpression'
            || name === 'UpdateExpression'
            || name === 'LeftHandSideExpression'
            || name === 'MemberExpression'
            || name === 'CallExpression'
            || name === 'NewExpression'
            || name === 'PrimaryExpression'
            || name === 'ParenthesizedExpression'
            || name === 'IdentifierName'
            || name === 'IdentifierReference'
    }
}
