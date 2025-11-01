/**
 * 测试规则: IterationStatement
 * 来源: 从 Statement 拆分
 *//**
 * 规则测试：IterationStatement
 * 
 * 位置：Es6Parser.ts Line 1139
 * 分类：statements
 * 编号：406
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

for (let i = 0; i < 10; i++) {}
while (true) { break }
do {} while (false)
for (const x of arr) {}

/* Es6Parser.ts: IterationStatement */

// ============================================
// 合并来自: IterationStatementWhile-001.js
// ============================================


/* Es6Parser.ts: while (Expression) Statement */

// ============================================
// 合并来自: IterationStatementDoWhile-001.js
// ============================================


/* Es6Parser.ts: do Statement while (Expression) */

// ============================================
// 合并来自: IterationStatementFor-001.js
// ============================================


/* Es6Parser.ts: for (VariableDeclaration? Expression? Expression?) Statement */

// ============================================
// 合并来自: IterationStatementForIn-001.js
// ============================================


/* Es6Parser.ts: for (VariableDeclaration in Expression) Statement */

// ============================================
// 合并来自: IterationStatementForOf-001.js
// ============================================


/* Es6Parser.ts: for (VariableDeclaration of Expression) Statement */
