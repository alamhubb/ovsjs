/**
 * 规则测试：UnaryExpression
 * 
 * 位置：Es6Parser.ts Line 633
 * 分类：expressions
 * 编号：211
 * 
 * 规则特征：
 * ✓ 包含Or规则（2处）
 *   - 主Or：AwaitExpression | PostfixExpression | UnaryOperator UnaryExpression
 *   - 子Or（UnaryOperator）：delete | void | typeof | ++ | -- | + | - | ~ | !
 * 
 * 规则语法：
 *   UnaryExpression:
 *     AwaitExpression
 *     PostfixExpression
 *     delete UnaryExpression
 *     void UnaryExpression
 *     typeof UnaryExpression
 *     ++ UnaryExpression
 *     -- UnaryExpression
 *     + UnaryExpression
 *     - UnaryExpression
 *     ~ UnaryExpression
 *     ! UnaryExpression
 * 
 * 测试目标：
 * - 覆盖所有Or分支（3个主分支 + 9个运算符）
 * - 覆盖所有9个一元运算符
 * - 验证递归表达式（UnaryExpression → UnaryExpression）
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Or分支1 - PostfixExpression（无前缀运算符）
const x = 42
const y = x++

// ✅ 测试2：Or分支2 - typeof 运算符
const type1 = typeof 42
const type2 = typeof 'string'
const type3 = typeof x

// ✅ 测试3：Or分支2 - void 运算符
const v1 = void 0
const v2 = void x

// ✅ 测试4：Or分支2 - delete 运算符
const obj = { prop: 1 }
delete obj.prop

// ✅ 测试5：前缀 ++ 运算符
let a = 1
const b1 = ++a

// ✅ 测试6：前缀 -- 运算符
let c = 10
const c1 = --c

// ✅ 测试7：一元 + 运算符
const plus1 = +42
const plus2 = +'123'
const plus3 = +x

// ✅ 测试8：一元 - 运算符
const neg1 = -42
const neg2 = -x
const neg3 = --c

// ✅ 测试9：~ 按位非运算符
const bit1 = ~5
const bit2 = ~x

// ✅ 测试10：! 逻辑非运算符
const not1 = !true
const not2 = !x
const not3 = !!value

// ✅ 测试11：嵌套一元表达式
const nested1 = typeof +'123'
const nested2 = -(-x)
const nested3 = !!~x

// ✅ 测试12：一元表达式在复杂表达式中
const sum = +x + -y
const result = typeof x === 'number'
const toggle = !flag

// ✅ 测试13：Or分支3 - await 表达式（async函数中）
async function asyncFunc() {
    const result = await Promise.resolve(42)
    const result2 = await somePromise
}

// ✅ 测试14：删除数组元素
const arr = [1, 2, 3]
delete arr[0]

// ✅ 测试15：类型检查组合
if (typeof value === 'undefined') {
    console.log('undefined')
}

/* Es6Parser.ts: UnaryExpression: Or[AwaitExpression, PostfixExpression, UnaryOperator UnaryExpression] where UnaryOperator: delete | void | typeof | ++ | -- | + | - | ~ | ! */

/**
 * 规则测试：UnaryExpression
 * 
 * 位置：Es6Parser.ts Line 633
 * 分类：expressions
 * 编号：211
 * 
 * 规则特征：
 * ✓ 包含Or规则（2处）
 *   - 主Or：AwaitExpression | PostfixExpression | UnaryOperator UnaryExpression
 *   - 子Or（UnaryOperator）：delete | void | typeof | ++ | -- | + | - | ~ | !
 * 
 * 规则语法：
 *   UnaryExpression:
 *     AwaitExpression
 *     PostfixExpression
 *     delete UnaryExpression
 *     void UnaryExpression
 *     typeof UnaryExpression
 *     ++ UnaryExpression
 *     -- UnaryExpression
 *     + UnaryExpression
 *     - UnaryExpression
 *     ~ UnaryExpression
 *     ! UnaryExpression
 * 
 * 测试目标：
 * - 覆盖所有Or分支（3个主分支 + 9个运算符）
 * - 覆盖所有9个一元运算符
 * - 验证递归表达式（UnaryExpression → UnaryExpression）
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Or分支1 - PostfixExpression（无前缀运算符）
const x = 42
const y = x++

// ✅ 测试2：Or分支2 - typeof 运算符
const type1 = typeof 42
const type2 = typeof 'string'
const type3 = typeof x

// ✅ 测试3：Or分支2 - void 运算符
const v1 = void 0
const v2 = void x

// ✅ 测试4：Or分支2 - delete 运算符
const obj = { prop: 1 }
delete obj.prop

// ✅ 测试5：前缀 ++ 运算符
let a = 1
const b1 = ++a

// ✅ 测试6：前缀 -- 运算符
let c = 10
const c1 = --c

// ✅ 测试7：一元 + 运算符
const plus1 = +42
const plus2 = +'123'
const plus3 = +x

// ✅ 测试8：一元 - 运算符
const neg1 = -42
const neg2 = -x
const neg3 = --c

// ✅ 测试9：~ 按位非运算符
const bit1 = ~5
const bit2 = ~x

// ✅ 测试10：! 逻辑非运算符
const not1 = !true
const not2 = !x
const not3 = !!value

// ✅ 测试11：嵌套一元表达式
const nested1 = typeof +'123'
const nested2 = -(-x)
const nested3 = !!~x

// ✅ 测试12：一元表达式在复杂表达式中
const sum = +x + -y
const result = typeof x === 'number'
const toggle = !flag

// ✅ 测试13：Or分支3 - await 表达式（async函数中）
async function asyncFunc() {
    const result = await Promise.resolve(42)
    const result2 = await somePromise
}

// ✅ 测试14：删除数组元素
const arr = [1, 2, 3]
delete arr[0]

// ✅ 测试15：类型检查组合
if (typeof value === 'undefined') {
    console.log('undefined')
}

/* Es6Parser.ts: UnaryExpression: Or[AwaitExpression, PostfixExpression, UnaryOperator UnaryExpression] where UnaryOperator: delete | void | typeof | ++ | -- | + | - | ~ | ! */
