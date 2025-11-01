/**
 * 规则测试：SuperProperty
 * 
 * 位置：Es6Parser.ts Line 493
 * 分类：others
 * 编号：909
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）
 * 
 * 测试目标：
 * - 验证规则的基本功能
 * - 覆盖所有Or分支


 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（基础测试）
 */

class Child extends Parent {
    method() {
        super.parentMethod()
        super['key']
    }
}
