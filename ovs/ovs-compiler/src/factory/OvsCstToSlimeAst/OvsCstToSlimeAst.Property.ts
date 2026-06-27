import { SubhutiCst } from "subhuti"
import {
    SlimeAstTypeName,
    type SlimeExpression,
    SlimeAstCreateUtils,
    SlimeTokenCreateUtils
} from "slime-ast"
import { OvsCstToSlimeAstView } from "./OvsCstToSlimeAst.View"

/**
 * OVS 属性处理层
 * 
 * 负责处理OVS特有的属性语法：
 * - createOvsArgumentsAst: 转换OVS参数
 * - createOvsPropertyDefinitionAst: 转换属性定义
 * - transformClassObjectToArray: class属性特殊处理
 */
export abstract class OvsCstToSlimeAstProperty extends OvsCstToSlimeAstView {

    // ==================== OVS 参数语法转换 ====================

    /**
     * 转换 OvsArguments CST 为 ObjectExpression AST
     * 
     * 输入 CST: OvsArguments -> OvsPropertyDefinitionList -> OvsPropertyDefinition*
     * 输出 AST: ObjectExpression { properties: SlimeObjectPropertyItem[] }
     * 
     * 特殊处理：
     * - class = { colorRed, fontBold } → class: [OvsCls.colorRed, OvsCls.fontBold]
     */
    protected createOvsArgumentsAst(cst: SubhutiCst): SlimeExpression {
        const objectLiteralCst = cst.children?.find(child => child.name === 'ObjectLiteral')
        if (objectLiteralCst) {
            return (this as any).createObjectLiteralAst(objectLiteralCst)
        }

        const properties: any[] = []

        // 查找 OvsPropertyDefinitionList
        const propListCst = cst.children?.find(child => child.name === 'OvsPropertyDefinitionList')

        if (propListCst && propListCst.children) {
            const propDefs = propListCst.children.filter(c => c.name === 'OvsPropertyDefinition')

            for (let i = 0; i < propDefs.length; i++) {
                const propDefCst = propDefs[i]
                const prop = this.createOvsPropertyDefinitionAst(propDefCst)
                if (prop) {
                    // 包装为 ObjectPropertyItem，除了最后一个都需要逗号
                    const needComma = i < propDefs.length - 1
                    properties.push(
                        SlimeAstCreateUtils.createObjectPropertyItem(
                            prop,
                            needComma ? SlimeTokenCreateUtils.createCommaToken() : undefined
                        )
                    )
                }
            }
        }

        return SlimeAstCreateUtils.createObjectExpression(properties)
    }

    /**
     * 转换 OvsPropertyDefinition CST 为 Property AST
     * 
     * 处理的语法形式：
     * 1. PropertyName = AssignmentExpression  → { key: value }
     * 2. MethodDefinition                     → { method() {} }
     * 3. ... AssignmentExpression             → { ...spread }
     * 4. IdentifierReference                  → { shorthand: true }
     * 
     * 特殊处理 class 属性：
     * - class = { colorRed, fontBold } → class: [OvsCls.colorRed, OvsCls.fontBold]
     */
    protected createOvsPropertyDefinitionAst(cst: SubhutiCst): any {
        if (!cst.children || cst.children.length === 0) return null

        const firstChild = cst.children[0]

        // 1. 展开属性: ... AssignmentExpression
        if (firstChild.name === 'Ellipsis' || firstChild.value === '...') {
            const exprCst = cst.children.find(c =>
                c.name !== 'Ellipsis' && c.value !== '...'
            )
            if (exprCst) {
                const argument = this.createExpressionAst(exprCst)
                return SlimeAstCreateUtils.createSpreadElement(argument, cst.loc)
            }
            return null
        }

        // 2. 方法定义: MethodDefinition
        if (firstChild.name === 'MethodDefinition') {
            // 需要调用父类的createMethodDefinitionAst
            const methodDef = (this as any).createMethodDefinitionAst(null, firstChild)

            const keyAst = SlimeAstCreateUtils.createPropertyAst(methodDef.key, methodDef.value)

            // 继承 MethodDefinition 的 computed 标志
            if (methodDef.computed) {
                keyAst.computed = true
            }

            // 继承 MethodDefinition 的 kind 标志（getter/setter/method）
            if (methodDef.kind === 'get' || methodDef.kind === 'set') {
                keyAst.kind = methodDef.kind
            } else {
                // 普通方法使用 method: true
                keyAst.method = true
            }

            keyAst.loc = cst.loc
            return keyAst
        }

        // 3. PropertyName = AssignmentExpression 或 简写属性
        // 查找 PropertyName
        let propertyNameCst = null
        for (let i = 0; i < cst.children.length; i++) {
            if (cst.children[i].name === 'PropertyName') {
                propertyNameCst = cst.children[i]
                break
            }
        }

        // 查找 = 号后的表达式
        let assignIndex = -1
        for (let i = 0; i < cst.children.length; i++) {
            if (cst.children[i].value === '=' || cst.children[i].name === 'Assign') {
                assignIndex = i
                break
            }
        }

        if (propertyNameCst && assignIndex !== -1) {
            // 完整属性: name = value
            const key = this.createPropertyNameAst(propertyNameCst)
            const keyName = this.getPropertyKeyName(key)

            // 找到 = 后面的表达式
            const valueCst = cst.children[assignIndex + 1]
            if (!valueCst) return null

            let value = (this as any).createExpressionAst(valueCst)

            // 特殊处理 class 属性
            if (keyName === 'class' && value.type === SlimeAstTypeName.ObjectExpression) {
                value = this.transformClassObjectToArray(value)
            }

            // 使用 createPropertyAst 创建属性
            const prop = SlimeAstCreateUtils.createPropertyAst(key, value)
            prop.loc = cst.loc
            return prop
        }

        // 4. 简写属性: IdentifierReference
        let idRefCst = null
        for (let i = 0; i < cst.children.length; i++) {
            if (cst.children[i].name === 'IdentifierReference') {
                idRefCst = cst.children[i]
                break
            }
        }
        if (idRefCst) {
            const id = (this as any).createIdentifierReferenceAst(idRefCst)
            // 创建简写属性
            const prop = SlimeAstCreateUtils.createPropertyAst(id, { ...id })
            prop.shorthand = true
            prop.loc = cst.loc
            return prop
        }

        return null
    }

    /**
     * 获取属性键的名称（用于判断是否是 class 属性）
     */
    private getPropertyKeyName(key: any): string | null {
        if (key.type === SlimeAstTypeName.Identifier) {
            return key.name
        }
        if (key.type === SlimeAstTypeName.Literal && typeof key.value === 'string') {
            return key.value
        }
        return null
    }

    /**
     * 转换 PropertyName CST 为 AST
     */
    private createPropertyNameAst(cst: SubhutiCst): any {
        if (!cst.children || cst.children.length === 0) return null

        const child = cst.children[0]

        // LiteralPropertyName
        if (child.name === 'LiteralPropertyName') {
            return this.createLiteralPropertyNameAst(child)
        }

        // ComputedPropertyName
        if (child.name === 'ComputedPropertyName') {
            return this.createComputedPropertyNameAst(child)
        }

        return null
    }

    /**
     * 转换 LiteralPropertyName CST 为 AST
     */
    private createLiteralPropertyNameAst(cst: SubhutiCst): any {
        if (!cst.children || cst.children.length === 0) return null

        const child = cst.children[0]

        // IdentifierName
        if (child.name === 'IdentifierName' || child.value) {
            const name = child.value || child.children?.[0]?.value
            return SlimeAstCreateUtils.createIdentifier(name)
        }

        // StringLiteral / NumericLiteral
        if (child.name === 'StringLiteral' || child.name === 'NumericLiteral') {
            return (this as any).createLiteralAst(child)
        }

        return null
    }

    /**
     * 转换 ComputedPropertyName CST 为 AST
     */
    private createComputedPropertyNameAst(cst: SubhutiCst): any {
        // [expression]
        const exprCst = cst.children?.find(c =>
            c.name !== 'LBracket' && c.name !== 'RBracket' &&
            c.value !== '[' && c.value !== ']'
        )
        if (exprCst) {
            return (this as any).createExpressionAst(exprCst)
        }
        return null
    }

    /**
     * 转换 class 对象为数组
     * 
     * 输入: { colorRed, fontBold }  (ObjectExpression with shorthand properties)
     * 输出: [OvsCls.colorRed, OvsCls.fontBold]  (ArrayExpression)
     */
    private transformClassObjectToArray(objExpr: any): SlimeExpression {
        const elements: any[] = []

        if (objExpr.properties) {
            const propItems = objExpr.properties
            const totalProps = propItems.length

            for (let i = 0; i < totalProps; i++) {
                const propItem = propItems[i]
                // SlimeObjectPropertyItem 结构: { property: SlimeProperty, commaToken? }
                const prop = propItem.property || propItem

                // 只处理简写属性
                if (prop.shorthand && prop.key && prop.key.type === SlimeAstTypeName.Identifier) {
                    const className = prop.key.name
                    // 创建 OvsCls.className
                    const memberExpr = SlimeAstCreateUtils.createMemberExpression(
                        SlimeAstCreateUtils.createIdentifier('OvsCls'),
                        SlimeTokenCreateUtils.createDotToken(),
                        SlimeAstCreateUtils.createIdentifier(className)
                    )
                    elements.push(
                        SlimeAstCreateUtils.createArrayElement(
                            memberExpr,
                            i < totalProps - 1
                                ? SlimeTokenCreateUtils.createCommaToken()
                                : undefined
                        )
                    )
                }
            }
        }

        return SlimeAstCreateUtils.createArrayExpression(elements)
    }
}
