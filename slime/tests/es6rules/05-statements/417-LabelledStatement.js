/**
 * 规则测试：LabelledStatement
 * 
 * 位置：Es6Parser.ts Line 1340
 * 分类：statements
 * 编号：417
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

label1: for (;;) { break label1 }
outer: while (true) { break outer }
