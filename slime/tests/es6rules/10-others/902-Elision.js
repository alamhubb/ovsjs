/**
 * 规则测试：Elision
 * 
 * 位置：Es6Parser.ts Line 197
 * 分类：others
 * 编号：902
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * 
 * 规则语法：
 *   Elision:
 *     , ,*
 * 
 * 测试目标：
 * - 测试数组省略（连续逗号）
 * - 测试Many=0/1/多
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Many=0 - 单个逗号
const arr1 = [1, , 3]

// ✅ 测试2：Many=1 - 两个逗号
const arr2 = [1, , , 4]

// ✅ 测试3：Many=2 - 三个逗号
const arr3 = [, , , 1]

// ✅ 测试4：Many=3 - 四个逗号
const arr4 = [1, , , , , 5]

// ✅ 测试5：前导省略
const leading = [, , 1, 2, 3]

// ✅ 测试6：中间省略
const middle = [1, 2, , , 5, 6]

// ✅ 测试7：尾部省略
const trailing = [1, 2, 3, , ,]

// ✅ 测试8：全部省略
const sparse = [, , , , ,]
const extreme = [, 1, , 2, , 3, ,]