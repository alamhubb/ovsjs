/**
 * 规则测试：GeneratorDeclaration
 * 
 * 位置：Es6Parser.ts Line 1584
 * 分类：functions
 * 编号：506
 * 
 * 规则特征：
 * ✓ 包含Option（1处）
 * 
 * 测试目标：
 * - 验证规则的基本功能

 * - 测试Option的有无两种情况

 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（基础测试）
 */

function* gen() {
    yield 1
    yield 2
}

function* numbers(n) {
    for (let i = 0; i < n; i++) {
        yield i
    }
}
