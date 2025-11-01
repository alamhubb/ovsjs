/**
 * 测试规则: EmptyStatement
 * 来源: 从 Statement 拆分
 *//* Es6Parser.ts: ; */


/* Es6Parser.ts: ; */

/**
 * 规则测试：EmptyStatement
 * 
 * 位置：Es6Parser.ts Line 1114
 * 分类：statements
 * 编号：404
 * 
 * 规则特征：
 * - 简单规则：直接调用EmptySemicolon
 * 
 * 规则语法：
 *   EmptyStatement:
 *     ;?
 * 
 * 测试目标：
 * - 测试空语句（分号）
 * - 在各种上下文中使用
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：单个分号
;

// ✅ 测试2：多个分号
;;
/* Es6Parser.ts: EmptyStatement */
