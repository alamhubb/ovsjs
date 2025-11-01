/**
 * 测试规则: ExportClauseFromClauseEmptySemicolon
 * 来源: 从 FromClause 拆分
 *//**
 * 规则测试：ExportClauseFromClauseEmptySemicolon
 * 
 * 位置：Es6Parser.ts Line 1892
 * 分类：modules
 * 编号：709
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

export {name} from './module.js'
export {a, b} from './other.js'

/* Es6Parser.ts: ExportClauseFromClauseEmptySemicolon */
