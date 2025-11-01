/**
 * 规则测试：BindingIdentifier
 * 
 * 位置：Es6Parser.ts Line 87
 * 分类：identifiers
 * 编号：102
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- Identifier
 * 
 * 规则语法：
 *   BindingIdentifier:
 *     Identifier
 * 
 * 测试目标：
 * - 测试绑定标识符（声明新变量）
 * - 在各种声明场景中使用
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：let声明
let myVar = 1
let anotherVar = 2

// ✅ 测试2：const声明
const constVar = 3
const PI = 3.14

// ✅ 测试3：var声明
var oldVar = 4

// ✅ 测试4：函数名声明
function funcName() {}