/**
 * 规则测试：AwaitExpression
 * 
 * 位置：Es6Parser.ts Line 1627
 * 分类：expressions
 * 编号：229
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

async function test() {
    const result = await fetch()
    return await process(result)
}
