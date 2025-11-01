/**
 * 规则测试：ConciseBody
 * 
 * 位置：Es6Parser.ts Line 1505
 * 分类：others
 * 编号：932
 * 
 * EBNF规则：
 *   ConciseBody:
 *     AssignmentExpression
 *     { FunctionBody }
 * 
 * 测试目标：
 * - 测试表达式体（简化）
 * - 测试块体（完整）
 * - 测试数字返回
 * - 测试字符串返回
 * - 测试对象字面量返回
 * - 测试调用表达式返回
 * - 测试条件表达式体
 * - 测试复杂表达式体
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：表达式体（简化）
const arrow1 = () => 42

// ✅ 测试2：块体（完整）
const arrow2 = () => { return 42 }

// ✅ 测试3：字符串返回
const str = () => 'hello'

// ✅ 测试4：对象字面量返回（需要括号）
const obj = () => ({name: 'John', age: 30})

// ✅ 测试5：调用表达式返回
const call = () => Math.max(1, 2, 3)

// ✅ 测试6：数组返回
const arr = () => [1, 2, 3, 4, 5]

// ✅ 测试7：条件表达式体
const conditional = (x) => x > 0 ? 'positive' : 'negative'

// ✅ 测试8：复杂块体
const complex = (x, y) => {
    let result = x + y
    if (result > 100) {
        return 'large'
    } else {
        return 'small'
    }
}

/* Es6Parser.ts: ConciseBody */

/**
 * 规则测试：ConciseBody
 * 
 * 位置：Es6Parser.ts Line 1505
 * 分类：others
 * 编号：932
 * 
 * EBNF规则：
 *   ConciseBody:
 *     AssignmentExpression
 *     { FunctionBody }
 * 
 * 测试目标：
 * - 测试表达式体（简化）
 * - 测试块体（完整）
 * - 测试数字返回
 * - 测试字符串返回
 * - 测试对象字面量返回
 * - 测试调用表达式返回
 * - 测试条件表达式体
 * - 测试复杂表达式体
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：表达式体（简化）
const arrow1 = () => 42

// ✅ 测试2：块体（完整）
const arrow2 = () => { return 42 }

// ✅ 测试3：字符串返回
const str = () => 'hello'

// ✅ 测试4：对象字面量返回（需要括号）
const obj = () => ({name: 'John', age: 30})

// ✅ 测试5：调用表达式返回
const call = () => Math.max(1, 2, 3)

// ✅ 测试6：数组返回
const arr = () => [1, 2, 3, 4, 5]

// ✅ 测试7：条件表达式体
const conditional = (x) => x > 0 ? 'positive' : 'negative'

// ✅ 测试8：复杂块体
const complex = (x, y) => {
    let result = x + y
    if (result > 100) {
        return 'large'
    } else {
        return 'small'
    }
}

/* Es6Parser.ts: ConciseBody */


// ============================================
// 合并来自: AsyncArrowFunctionBody-001.js
// ============================================


/* Es6Parser.ts: async ArrowFunction with async body */
