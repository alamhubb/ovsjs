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
        const propertyNameCst = cst.children.find(c => c.name === 'PropertyName')

        // 查找 = 号后的表达式
        const assignIndex = cst.children.findIndex(c => c.value === '=' || c.name === 'Assign')

        if (propertyNameCst && assignIndex !== -1) {
            // 完整属性: name = value
            // PropertyName可以是Identifier、Literal或ComputedPropertyName
            let key: any
            const propNameChild = propertyNameCst.children?.[0]
            if (propNameChild) {
                if (propNameChild.name === 'ComputedPropertyName') {
                    // [expr]
                    key = (this as any).createComputedPropertyNameAst?.(propNameChild)
                } else if (propNameChild.name === 'Identifier' || propNameChild.name === 'IdentifierName') {
                    key = (this as any).createIdentifierAst?.(propNameChild)
                } else if (propNameChild.name === 'Literal') {
                    key = (this as any).createLiteralAst?.(propNameChild)
                }
            }

            if (!key) return null

            const keyName = this.getPropertyKeyName(key)

            // 找到 = 后面的表达式
            const valueCst = cst.children[assignIndex + 1]
            if (!valueCst) return null

            let value = (this as any).createExpressionAst?.(valueCst)

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
        const idRefCst = cst.children.find(c => c.name === 'IdentifierReference')
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
