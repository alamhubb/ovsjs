/**
 * 规则测试：LiteralPropertyName
 * 
 * 位置：Es6Parser.ts Line 267
 * 分类：literals
 * 编号：004
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

const obj = {
    identifier: 1,
    'string': 2,
    123: 3,
    class: 4,
    function: 5
}
