/**
 * 测试规则: ForDeclaration
 * 来源: 从 Declaration 拆分
 *//**
 * 规则测试：ForDeclaration
 * 
 * 位置：Es6Parser.ts Line 1247
 * 分类：statements
 * 编号：411
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

for (let x of arr) {}
for (const {a, b} in obj) {}

/* Es6Parser.ts: ForDeclaration */
