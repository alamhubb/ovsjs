/**
 * 规则测试：ClassExpression
 * 
 * 位置：Es6Parser.ts Line 1640
 * 分类：expressions
 * 编号：230
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

const C = class {}
const Named = class MyClass {}
const WithMethod = class { method() {} }
