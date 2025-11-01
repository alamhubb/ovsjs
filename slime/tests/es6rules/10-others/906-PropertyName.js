/**
 * 规则测试：PropertyName
 * 
 * 位置：Es6Parser.ts Line 259
 * 分类：others
 * 编号：906
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
    name: 'test',
    'string-key': 1,
    123: 'number',
    [computed]: 'value'
}
