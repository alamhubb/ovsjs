/**
 * 测试规则: DefaultTokHoistableDeclarationClassDeclarationAssignmentExpression
 * 来源: 从 Expression 拆分
 */

/**
 * 规则测试：DefaultTokHoistableDeclarationClassDeclarationAssignmentExpression
 * 
 * 位置：Es2025Parser.ts Line 1906
 * 分类：expressions
 * 编号：231
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

export default function() {}
export default class {}
export default {value: 42}

/* Es2025Parser.ts: Or[Declaration, Statement] */
