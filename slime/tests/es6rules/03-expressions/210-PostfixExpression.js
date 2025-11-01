/**
 * 规则测试：PostfixExpression
 * 
 * 位置：Es6Parser.ts Line 622
 * 分类：expressions
 * 编号：210
 * 
 * 规则特征：
 * ✓ 包含Option（1处）- 后缀运算符可选
 * ✓ Option内包含Or（2个分支）- ++ 或 --
 * 
 * 规则语法：
 *   PostfixExpression:
 *     LeftHandSideExpression (++ | --)?
 * 
 * 测试目标：
 * - 测试Option无（无后缀）
 * - 测试Option有 - Or分支1（++）
 * - 测试Option有 - Or分支2（--）
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Option无 - 无后缀运算符
const x = i
const value = obj.prop

// ✅ 测试2：Option有，Or分支1 - ++（变量）
i++
count++

// ✅ 测试3：Option有，Or分支1 - ++（属性）
obj.count++
user.age++

// ✅ 测试4：Option有，Or分支1 - ++（数组元素）
arr[0]++
matrix[i][j]++

// ✅ 测试5：Option有，Or分支2 - --（变量）
j--
index--

// ✅ 测试6：Option有，Or分支2 - --（属性）
obj.value--
counter.num--

// ✅ 测试7：在表达式中使用
const result = i++
const old = count++
while (n--) {}

// ✅ 测试8：后缀 vs 前缀对比
const a = i++
const b = ++j
const c = k--
const d = --m