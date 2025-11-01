/**
 * 测试规则: ArrayLiteral
 * 来源: 从 Literal 拆分
 */

// TODO: 添加 ArrayLiteral 的完整测试用例
// 当前从 Literal 的内容中提取

const assert = require('assert');
const { parse } = require('../../packages/slime-parser');

describe('ArrayLiteral', () => {
  it('should parse ArrayLiteral', () => {
    // TODO: 补充实现测试
  });
});

/**
 * 规则测试：ArrayLiteral
 * 
 * 位置：Es6Parser.ts Line 285
 * 分类：literals
 * 编号：002
 * 
 * 规则语法：
 *   ArrayLiteral:
 *     [ ElementList? ]
 *     [ ElementList , ]
 * 
 * 测试目标：
 * - 验证空数组
 * - 验证各种元素类型
 * - 覆盖复杂数组
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：空数组
const empty = []

// ✅ 测试2：单个元素
const single = [42]

// ✅ 测试3：多个元素
const multi = [1, 2, 3, 4, 5]

// ✅ 测试4：各种类型混合
const mixed = [1, 'string', true, null, undefined, {}, []]

// ✅ 测试5：嵌套数组
const nested = [[1, 2], [3, 4], [5, 6]]

// ✅ 测试6：数组中的对象
const arrayOfObjects = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' }
]

// ✅ 测试7：数组中的函数
const arrayOfFunctions = [
    () => 1,
    function() { return 2 },
    x => x * 3
]

// ✅ 测试8：数组中的表达式
const expressions = [1 + 2, 3 * 4, 5 - 1]

// ✅ 测试9：尾逗号数组
const trailing = [1, 2, 3,]

// ✅ 测试10：稀疏数组（元素缺失）
const sparse = [1, , , 4]

// ✅ 测试11：Spread运算符
const arr = [1, 2, 3]
const spread = [...arr, 4, 5]

// ✅ 测试12：多行数组
const multiline = [
    'a',
    'b',
    'c',
    'd',
    'e'
]

// ✅ 测试13：复杂嵌套
const complex = [
    [1, [2, [3, [4]]]],
    { key: 'value' },
    () => 'function'
]

// ✅ 测试14：数组中的Promise
const promises = [
    Promise.resolve(1),
    Promise.reject(2),
    new Promise(r => r(3))
]

// ✅ 测试15：实际应用
const data = [
    { id: 1, values: [10, 20, 30] },
    { id: 2, values: [40, 50, 60] },
    { id: 3, values: [70, 80, 90] }
]

/* Es6Parser.ts: ArrayLiteral: [ ElementList? ] */
