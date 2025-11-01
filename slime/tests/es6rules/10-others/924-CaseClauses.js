/**
 * 规则测试：CaseClauses
 * 
 * 位置：Es6Parser.ts Line 1320
 * 分类：others
 * 编号：924
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * 
 * 测试目标：
 * - 验证规则的基本功能


 * - 测试Many的0/1/多种情况
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（基础测试）
 */

switch (x) {
    case 1:
        doA()
    case 2:
        doB()
}
