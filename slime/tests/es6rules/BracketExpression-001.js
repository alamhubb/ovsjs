/**
 * 规则测试：BracketExpression
 * 
 * 位置：Es6Parser.ts Line 485
 * 分类：expressions
 * 编号：206
 * 
 * 规则特征：
 * - 简单规则：[ Expression ]
 * 
 * 规则语法：
 *   BracketExpression:
 *     [ Expression ]
 * 
 * 测试目标：
 * - 测试方括号成员访问
 * - 测试计算属性访问
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：数组索引访问 - 数字
arr[0]
arr[1]
arr[10]

// ✅ 测试2：对象属性访问 - 字符串
obj['key']
obj['propertyName']

// ✅ 测试3：对象属性访问 - 变量
const key = 'dynamic'
obj[key]
obj[key + 'Suffix']

// ✅ 测试4：链式方括号访问
matrix[i][j]
/* Es6Parser.ts: [ Expression ] */

/**
 * 规则测试：BracketExpression
 * 
 * 位置：Es6Parser.ts Line 485
 * 分类：expressions
 * 编号：206
 * 
 * 规则特征：
 * - 简单规则：[ Expression ]
 * 
 * 规则语法：
 *   BracketExpression:
 *     [ Expression ]
 * 
 * 测试目标：
 * - 测试方括号成员访问
 * - 测试计算属性访问
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：数组索引访问 - 数字
arr[0]
arr[1]
arr[10]

// ✅ 测试2：对象属性访问 - 字符串
obj['key']
obj['propertyName']

// ✅ 测试3：对象属性访问 - 变量
const key = 'dynamic'
obj[key]
obj[key + 'Suffix']

// ✅ 测试4：链式方括号访问
matrix[i][j]
/* Es6Parser.ts: [ Expression ] */
