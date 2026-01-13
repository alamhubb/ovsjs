import { OvsCstToSlimeAstHelpers } from './OvsCstToSlimeAst.Helpers'
import {
    SlimeAstTypeName,
    type SlimeExpression,
    type SlimeExpressionStatement,
    type SlimeStatement
} from "slime-ast"

/**
 * OVS 判断逻辑层
 * 
 * 提供各种判断方法，用于决定 AST 节点的处理方式
 */
export abstract class OvsCstToSlimeAstJudgement extends OvsCstToSlimeAstHelpers {

    /**
     * 判断 AST 表达式是否是副作用表达式（不应该渲染）
     * 
     * - AssignmentExpression: x = 1
     * - UpdateExpression: x++
     * - UnaryExpression + delete/void
     */
    protected isSideEffectExpression(expr: SlimeExpression): boolean {
        const type = expr.type

        // 赋值表达式
        if (type === SlimeAstTypeName.AssignmentExpression) return true

        // 更新表达式
        if (type === SlimeAstTypeName.UpdateExpression) return true

        // delete/void 表达式
        if (type === SlimeAstTypeName.UnaryExpression) {
            const unary = expr as any
            if (unary.operator === 'delete' || unary.operator === 'void') return true
        }

        return false
    }

    /**
     * 判断语句是否需要父级使用复杂模式（IIFE）
     * 
     * 只有以下情况需要父级 IIFE：
     * 1. VariableDeclaration - 需要作用域隔离
     * 2. NoRenderBlock 子节点（带标记）- 需要执行但不渲染
     * 3. 副作用表达式 - 需要执行但不渲染
     * 
     * 控制流语句（if/for）已在 createStatementListItemAst 中被转换为
     * ExpressionStatement（包含 defineReactiveExpression），不需要父级 IIFE
     */
    protected needsParentIIFE(stmt: SlimeStatement): boolean {
        // 1. 变量声明 → 需要父级 IIFE（作用域隔离）
        if (stmt.type === SlimeAstTypeName.VariableDeclaration) {
            return true
        }

        // 2. NoRenderBlock 子节点（带标记）→ 需要父级 IIFE
        if ((stmt as any)._isFromNoRenderBlock) {
            return true
        }

        // 3. 副作用表达式（赋值、更新等）→ 需要父级 IIFE
        if (stmt.type === SlimeAstTypeName.ExpressionStatement) {
            return this.isSideEffectExpression((stmt as SlimeExpressionStatement).expression)
        }

        // 其他（包括已转换的控制流语句）→ 不需要父级 IIFE
        return false
    }

    /**
     * 判断语句是否需要响应式包裹（defineReactiveExpression）
     * 
     * 逻辑：
     * 1. needsParentIIFE 返回 true 的 → 不需要（由父级 IIFE 处理）
     * 2. ExpressionStatement → 不需要（已在 createExpressionStatementAst 中处理）
     * 3. 其他（控制流语句 if/for/while/switch 等）→ 需要响应式包裹
     */
    protected needsReactiveWrap(stmt: SlimeStatement): boolean {
        // 复用：needsParentIIFE 返回 true 的不需要响应式包裹
        if (this.needsParentIIFE(stmt)) return false

        // ExpressionStatement 已在 createExpressionStatementAst 中处理
        if (stmt.type === SlimeAstTypeName.ExpressionStatement) return false

        // 其他（控制流语句 if/for/while/switch 等）→ 需要响应式包裹
        return true
    }
}
