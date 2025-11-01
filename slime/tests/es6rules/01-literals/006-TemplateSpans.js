/**
 * 规则测试：TemplateSpans
 * 
 * 位置：Es6Parser.ts Line 347
 * 分类：literals
 * 编号：006
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

const x = 1, y = 2
const t1 = `value: ${x}`
const t2 = `x=${x}, y=${y}`
const t3 = `${a}${b}${c}`
