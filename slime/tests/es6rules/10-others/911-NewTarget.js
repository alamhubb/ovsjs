/**
 * 规则测试：NewTarget
 * 
 * 位置：Es6Parser.ts Line 517
 * 分类：others
 * 编号：911
 * 
 * 规则特征：
 * 简单规则
 * 
 * 测试目标：
 * - 验证规则的基本功能



 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（基础测试）
 */

function Func() {
    console.log(new.target)
}
