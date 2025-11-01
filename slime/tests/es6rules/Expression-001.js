/**
 * 规则测试：Expression
 * 
 * 位置：Es6Parser.ts Line 846
 * 分类：expressions
 * 编号：223
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * 
 * 规则语法：
 *   Expression:
 *     AssignmentExpression ( , AssignmentExpression )*
 * 
 * 测试目标：
 * - 测试单个表达式
 * - 测试逗号分隔的多个表达式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：单个表达式
const a = 1

// ✅ 测试2：逗号运算符 - 2个表达式
let x, y
x = 1, y = 2

// ✅ 测试3：逗号运算符 - 多个表达式
let result = (x = 1, y = 2, x + y)

// ✅ 测试4：for循环中的逗号表达式
for (let i = 0, j = 10; i < j; i++, j--) {
    console.log(i, j)
}

// ✅ 测试5：函数调用中（非逗号运算符）
func(a, b, c)

// ✅ 测试6：复杂表达式组合
const value = (console.log('start'), compute(), console.log('end'), 42)

/* Es6Parser.ts: AssignmentExpression (Comma AssignmentExpression)* */


// ============================================
// 合并来自: ClassExpression-001.js
// ============================================

/**
 * 规则测试：ClassExpression
 * 
 * 位置：Es6Parser.ts Line 268
 * 分类：expressions
 * 编号：230
 * 
 * 规则特征：
 * ✓ 包含Option（2处）- 类名、extends子句
 * 
 * 规则语法：
 *   ClassExpression:
 *     class Identifier? extends? Expression? { ClassBody }
 * 
 * 测试目标：
 * - 覆盖Option1无：匿名类表达式
 * - 覆盖Option1有：命名类表达式
 * - 覆盖Option2无：不继承
 * - 覆盖Option2有：继承基类
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Option1无 Option2无 - 匿名类（无继承）
const SimpleClass = class {
    constructor(x) {
        this.x = x
    }
    getValue() {
        return this.x
    }
}

// ✅ 测试2：Option1有 Option2无 - 命名类（无继承）
const NamedClass = class MyClass {
    method() {
        return 'named'
    }
}

// ✅ 测试3：Option1无 Option2有 - 匿名类（有继承）
class BaseClass {
    base() {
        return 'base'
    }
}
const DerivedClass = class extends BaseClass {
    derived() {
        return 'derived'
    }
}

// ✅ 测试4：Option1有 Option2有 - 命名类（有继承）
const NamedDerivedClass = class MyDerived extends BaseClass {
    method() {
        return super.base() + ' derived'
    }
}

// ✅ 测试5：构造函数
const WithConstructor = class {
    constructor(a, b) {
        this.a = a
        this.b = b
    }
}

// ✅ 测试6：static 方法
const StaticMethods = class {
    static staticMethod() {
        return 'static'
    }
    instanceMethod() {
        return 'instance'
    }
}

// ✅ 测试7：getter 和 setter
const GetterSetter = class {
    get value() {
        return this._value
    }
    set value(v) {
        this._value = v
    }
}

// ✅ 测试8：计算属性名
const ComputedProperty = class {
    ['computed_' + 'method']() {
        return 'computed'
    }
}

// ✅ 测试9：在条件表达式中
const ConditionalClass = condition ? class { method1() {} } : class { method2() {} }

// ✅ 测试10：类表达式作为参数
function createInstance(ClassConstructor) {
    return new ClassConstructor()
}
const instance = createInstance(class { constructor() { this.value = 42 } })

// ✅ 测试11：嵌套继承
class Level1 {}
class Level2 extends Level1 {}
const Level3 = class extends Level2 {
    method() {}
}

// ✅ 测试12：super 调用
const WithSuper = class extends BaseClass {
    constructor(x) {
        super()
        this.x = x
    }
}

// ✅ 测试13：多个方法
const MultiMethod = class {
    method1() { return 1 }
    method2() { return 2 }
    method3() { return 3 }
}

// ✅ 测试14：立即调用类表达式
const obj = new (class {
    constructor() {
        this.value = 42
    }
})()

// ✅ 测试15：复杂类表达式
const ComplexClass = class extends Array {
    constructor(...items) {
        super(...items)
        this.type = 'extended'
    }
    static create(...items) {
        return new this(...items)
    }
    getType() {
        return this.type
    }
}

/* Es6Parser.ts: ClassExpression: class Identifier? extends Expression? { ClassBody } */


// ============================================
// 来自文件: 407-ClassExpression.js
// ============================================


/* Es6Parser.ts: class Identifier? (extends Expression)? { ClassBody } */


// ============================================
// 合并来自: AwaitExpression-001.js
// ============================================

/**
 * 规则测试：AwaitExpression
 * 
 * 位置：Es6Parser.ts Line 690
 * 分类：expressions
 * 编号：228
 * 
 * EBNF规则：
 *   AwaitExpression:
 *     await UnaryExpression
 * 
 * 规则特征：
 * ✓ await只在async函数中合法
 * ✓ 后面跟UnaryExpression
 * 
 * 测试目标：
 * - 测试await各种表达式形式
 * - 测试await的返回值使用
 * - 测试await在不同控制流中的使用
 * - 验证async/await的完整性
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：简单await表达式
async function simple() {
  await promise
}

// ✅ 测试2：await函数调用
async function awaitCall() {
  await fetch(url)
}

// ✅ 测试3：await赋值
async function awaitAssign() {
  const result = await getData()
}

// ✅ 测试4：await在条件表达式中
async function awaitCondition() {
  if (await isReady()) {
    console.log('ready')
  }
}

// ✅ 测试5：多个await顺序执行
async function awaitSequence() {
  const a = await getA()
  const b = await getB()
  return a + b
}

// ✅ 测试6：await promise链
async function awaitChain() {
  const data = await fetch(url).then(r => r.json())
}

// ✅ 测试7：await在循环中
async function awaitLoop() {
  for (const item of items) {
    await process(item)
  }
}

// ✅ 测试8：await一元表达式
async function awaitUnary() {
  const value = +await getNumber()
  const negated = !await isReady()
}

/* Es6Parser.ts: await UnaryExpression */


// ============================================
// 来自文件: 229-AwaitExpression.js
// ============================================

/**
 * 规则测试：AwaitExpression
 * 
 * 位置：Es6Parser.ts Line 1627
 * 分类：expressions
 * 编号：229
 * 
 * 规则语法：
 *   AwaitExpression:
 *     await UnaryExpression
 * 
 * 测试目标：
 * ✅ 覆盖所有UnaryExpression分支
 * ✅ 实际async应用场景
 * ✅ 各种Promise类型
 * ✅ 边界和复杂场景（嵌套、表达式）
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（18个测试）
 */

// ✅ 测试1：基本await Promise
async function async1() {
    const result = await Promise.resolve(42)
}

// ✅ 测试2：await异步函数
async function async2() {
    async function getValue() {
        return 42
    }
    const result = await getValue()
}

// ✅ 测试3：await 变量（Promise）
async function async3() {
    const p = Promise.resolve(1)
    const result = await p
}

// ✅ 测试4：await 成员表达式
async function async4() {
    const obj = {
        getPromise: () => Promise.resolve(42)
    }
    const result = await obj.getPromise()
}

// ✅ 测试5：await 函数调用
async function async5() {
    function getPromise() {
        return Promise.resolve(42)
    }
    const result = await getPromise()
}

// ✅ 测试6：await 一元表达式（!）
async function async6() {
    const result = await !Promise.resolve(false)
}

// ✅ 测试7：await 数组元素
async function async7() {
    const promises = [Promise.resolve(1), Promise.resolve(2)]
    const result = await promises[0]
}

// ✅ 测试8：await new Promise
async function async8() {
    const result = await new Promise(resolve => {
        resolve(42)
    })
}

// ✅ 测试9：多个await
async function async9() {
    const a = await Promise.resolve(1)
    const b = await Promise.resolve(2)
    return a + b
}

// ✅ 测试10：await在循环中
async function async10() {
    for (let i = 0; i < 3; i++) {
        await Promise.resolve(i)
    }
}

// ✅ 测试11：await在条件中
async function async11() {
    if (await Promise.resolve(true)) {
        console.log('yes')
    }
}

// ✅ 测试12：await在表达式中
async function async12() {
    const result = (await Promise.resolve(1)) + (await Promise.resolve(2))
}

// ✅ 测试13：嵌套await
async function async13() {
    const result = await Promise.resolve(await Promise.resolve(42))
}

// ✅ 测试14：await 链式调用
async function async14() {
    const result = await Promise.resolve(1).then(() => Promise.resolve(2))
}

// ✅ 测试15：await 后缀表达式（i++）
async function async15() {
    let i = 0
    await Promise.resolve(i++)
}

// ✅ 测试16：await void表达式
async function async16() {
    const result = await void Promise.resolve(1)
}

// ✅ 测试17：await typeof表达式
async function async17() {
    const result = await typeof Promise.resolve(42)
}

// ✅ 测试18：await delete表达式
async function async18() {
    const obj = { x: 1 }
    await delete obj.x
}

/* Es6Parser.ts: AwaitExpression: await UnaryExpression */


// ============================================
// 合并来自: BitwiseNOTExpression-001.js
// ============================================

/**
 * 规则测试：BitwiseNOTExpression
 * 分类：expressions | 编号：229
 * 
 * 规则特征：
 * ✓ Or规则 - ~UnaryExpression | UnaryExpression
 * ✓ 一元操作 - 有/无~操作符
 * 
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1：Or分支2 - UnaryExpression（无~操作）
const a = 5

// ✅ 测试2：Or分支1 - ~操作单个数字
const b = ~5

// ✅ 测试3：~操作 - 变量
let x = 10
const c = ~x

// ✅ 测试4：~操作 - 表达式
const d = ~(5 + 3)

// ✅ 测试5：~操作 - 函数调用
function getValue() { return 8 }
const e = ~getValue()

// ✅ 测试6：~操作 - 对象属性
const obj = { val: 12 }
const f = ~obj.val

// ✅ 测试7：~操作 - 数组元素
const arr = [7, 9]
const g = ~arr[0]

// ✅ 测试8：~操作 - 成员表达式链
const obj2 = { prop: { val: 15 } }
const h = ~obj2.prop.val

// ✅ 测试9：嵌套~操作 - 双重取反
const i = ~~5

// ✅ 测试10：~操作 - 在条件中
if (~5 > -10) {
    console.log('bitwise not')
}

// ✅ 测试11：~操作 - 在赋值表达式
const j = (~8) + 1

// ✅ 测试12：~操作 - 与其他一元操作组合
const k = -~5

// ✅ 测试13：~操作 - 在逻辑表达式
const l = ~5 & 3

// ✅ 测试14：~操作 - 零值
const m = ~0

// ✅ 测试15：~操作 - 负数
const n = ~(-1)

/* Es6Parser.ts: BitwiseNOTExpression: ~ UnaryExpression | UnaryExpression */


// ============================================
// 合并来自: CommaExpression-001.js
// ============================================

/**
 * 规则测试：CommaExpression
 * 分类：expressions | 编号：233
 * 
 * 规则特征：
 * ✓ Or规则 - Expression , AssignmentExpression | AssignmentExpression
 * ✓ Many情况 - 0个/1个/多个逗号操作符
 * 
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1：Or分支2 - AssignmentExpression（无逗号）
const a = 5

// ✅ 测试2：Or分支1 - 两个操作数的逗号操作
const b = (1, 2)

// ✅ 测试3：逗号操作 - 多个表达式
const c = (1, 2, 3)

// ✅ 测试4：逗号操作 - 赋值表达式
let x = 1
const d = (x = 5, x + 1)

// ✅ 测试5：逗号操作 - 函数调用
function f() { return 10 }
const e = (f(), 20)

// ✅ 测试6：逗号操作 - 变量声明后
const result = (x++, x)

// ✅ 测试7：逗号操作 - 返回值是最后一个
function getValue() {
    return (1 + 1, 2 + 2, 3 + 3)
}

// ✅ 测试8：逗号操作 - 在循环中
for (let i = 0; i < 5; i++, x++) {
    console.log(i)
}

// ✅ 测试9：逗号操作 - 条件判断
if ((x = 10, x > 5)) {
    console.log('comma operator')
}

// ✅ 测试10：逗号操作 - 对象初始化
const obj = { value: (1, 2, 3) }

// ✅ 测试11：逗号操作 - 数组初始化
const arr = [1, (2, 3), 4]

// ✅ 测试12：逗号操作 - 嵌套
const nested = ((1, 2), (3, 4))

// ✅ 测试13：逗号操作 - 副作用序列
let y = 0
const z = (y++, y++, y)

// ✅ 测试14：逗号操作 - 表达式序列
const w = (true && false, false || true)

// ✅ 测试15：逗号操作 - 三元表达式
const ternary = (5 > 3, true) ? 'yes' : 'no'

/* Es6Parser.ts: CommaExpression: Expression , AssignmentExpression | AssignmentExpression */


// ============================================
// 合并来自: GeneratorExpression-001.js
// ============================================

/**
 * 规则测试：GeneratorExpression
 * 
 * 位置：Es6Parser.ts Line 1597
 * 分类：expressions
 * 编号：227
 * 
 * 规则特征：
 * ✓ 包含Option（2处）
 * 
 * 测试目标：
 * - 验证规则的基本功能

 * - 测试Option的有无两种情况

 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（基础测试）
 */

const g = function*() { yield 1 }
const named = function* gen() { yield 2 }

/* Es6Parser.ts: function* Identifier? (FormalParameters) { GeneratorBody } */


// ============================================
// 合并来自: AsyncGeneratorFunction-001.js
// ============================================


/* Es6Parser.ts: async function* Identifier? (FormalParameters) { FunctionBody } */


// ============================================
// 合并来自: UpdateExpression-001.js
// ============================================

/**
 * 规则测试：UpdateExpression
 * 分类：expressions | 编号：234
 * 
 * 规则定义（Es6Parser.ts）：
 * UpdateExpression:
 *   ++ LeftHandSideExpression
 *   -- LeftHandSideExpression
 *   LeftHandSideExpression ++
 *   LeftHandSideExpression --
 *   LeftHandSideExpression
 * 
 * 规则特征：
 * ✓ Or规则 - 5个分支
 *   分支1: ++ LeftHandSideExpression（前置递增）
 *   分支2: -- LeftHandSideExpression（前置递减）
 *   分支3: LeftHandSideExpression ++（后置递增）
 *   分支4: LeftHandSideExpression --（后置递减）
 *   分支5: LeftHandSideExpression（无更新）
 * 
 * 状态：✅ 已完善（16个测试）
 */

// ✅ 测试1：分支5 - LeftHandSideExpression（无更新操作）
let a = 5
const result1 = a

// ✅ 测试2：分支1 - 前置递增++
let b = 10
const result2 = ++b

// ✅ 测试3：分支2 - 前置递减--
let c = 20
const result3 = --c

// ✅ 测试4：分支3 - 后置递增++
let d = 15
const result4 = d++

// ✅ 测试5：分支4 - 后置递减--
let e = 25
const result5 = e--

// ✅ 测试6：前置递增 - 对象属性
const obj1 = { value: 5 }
const result6 = ++obj1.value

// ✅ 测试7：前置递减 - 对象属性
const obj2 = { value: 10 }
const result7 = --obj2.value

// ✅ 测试8：后置递增 - 对象属性
const obj3 = { value: 8 }
const result8 = obj3.value++

// ✅ 测试9：后置递减 - 对象属性
const obj4 = { value: 12 }
const result9 = obj4.value--

// ✅ 测试10：前置递增 - 数组元素
const arr1 = [1, 2, 3]
const result10 = ++arr1[0]

// ✅ 测试11：后置递增 - 数组元素
const arr2 = [5, 6, 7]
const result11 = arr2[1]++

// ✅ 测试12：前置递增 - 成员链
const obj5 = { prop: { val: 3 } }
const result12 = ++obj5.prop.val

// ✅ 测试13：后置递减 - 成员链
const obj6 = { prop: { val: 8 } }
const result13 = obj6.prop.val--

// ✅ 测试14：递增在条件中
let x = 5
if (++x > 5) {
    console.log('incremented')
}

// ✅ 测试15：递增在循环中
for (let i = 0; i < 5; i++) {
    console.log(i)
}

// ✅ 测试16：前置和后置的差异
let y = 0
const pre = ++y
const post = y++

/* Es6Parser.ts: UpdateExpression
 * Or分支1: ++ LeftHandSideExpression
 * Or分支2: -- LeftHandSideExpression
 * Or分支3: LeftHandSideExpression ++
 * Or分支4: LeftHandSideExpression --
 * Or分支5: LeftHandSideExpression
 */


// ============================================
// 合并来自: YieldExpression-001.js
// ============================================

/**
 * 规则测试：YieldExpression
 * 
 * 位置：Es6Parser.ts Line 1610
 * 分类：expressions
 * 编号：228
 * 
 * 规则特征：
 * ✓ 包含Option（1处）- yield后面可以无值
 * ✓ 包含Or（2处）- yield value 或 yield* value
 * 
 * 规则语法：
 *   YieldExpression:
 *     yield
 *     yield AssignmentExpression
 *     yield* AssignmentExpression
 * 
 * 测试目标：
 * ✅ 覆盖所有Or分支（yield、yield value、yield* value）
 * ✅ Option有/无情况（有值、无值）
 * ✅ 实际应用场景（生成器中使用）
 * ✅ 边界和复杂场景（嵌套、表达式）
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（20个测试）
 */

// ✅ 测试1：基本yield（无值）
function* gen1() {
    yield
}

// ✅ 测试2：yield返回字面量
function* gen2() {
    yield 42
}

// ✅ 测试3：yield返回字符串
function* gen3() {
    yield 'value'
}

// ✅ 测试4：yield返回变量
function* gen4() {
    const x = 10
    yield x
}

// ✅ 测试5：yield返回表达式
function* gen5() {
    yield 1 + 2
}

// ✅ 测试6：yield返回对象
function* gen6() {
    yield { x: 1, y: 2 }
}

// ✅ 测试7：yield返回数组
function* gen7() {
    yield [1, 2, 3]
}

// ✅ 测试8：yield返回函数调用
function* gen8() {
    yield Math.max(1, 2)
}

// ✅ 测试9：yield*委托给另一个生成器
function* gen9() {
    yield* [1, 2, 3]
}

// ✅ 测试10：yield*委托到生成器函数
function* gen10() {
    function* inner() {
        yield 1
        yield 2
    }
    yield* inner()
}

// ✅ 测试11：多个yield语句
function* gen11() {
    yield 1
    yield 2
    yield 3
}

// ✅ 测试12：yield在循环中
function* gen12() {
    for (let i = 0; i < 5; i++) {
        yield i
    }
}

// ✅ 测试13：yield在条件中
function* gen13(flag) {
    if (flag) {
        yield 'yes'
    } else {
        yield 'no'
    }
}

// ✅ 测试14：yield表达式的值
function* gen14() {
    const x = yield 1
    const y = yield x + 1
    yield y
}

// ✅ 测试15：yield*与多个值混合
function* gen15() {
    yield 0
    yield* [1, 2]
    yield 3
}

// ✅ 测试16：嵌套生成器中的yield
function* gen16() {
    function* inner() {
        yield* [1, 2]
    }
    yield inner()
}

// ✅ 测试17：yield返回Promise
function* gen17() {
    yield Promise.resolve(42)
}

// ✅ 测试18：yield返回箭头函数
function* gen18() {
    yield () => 42
}

// ✅ 测试19：复杂yield*表达式
function* gen19() {
    yield* (function*() {
        yield 1
        yield 2
    })()
}

// ✅ 测试20：yield在try-catch中
function* gen20() {
    try {
        yield 1
    } catch (e) {
        yield 'error'
    }
}

/* Es6Parser.ts: YieldExpression: yield [AssignmentExpression | *AssignmentExpression] */


// ============================================
// 合并来自: AssignmentExpression-001.js
// ============================================

/**
 * 规则测试：AssignmentExpression
 * 
 * 位置：Es6Parser.ts Line 1048
 * 分类：expressions
 * 编号：224
 * 
 * 规则语法：
 *   AssignmentExpression:
 *     ConditionalExpression
 *     LeftHandSideExpression = AssignmentExpression
 *     LeftHandSideExpression op= AssignmentExpression (+=, -=, etc)
 * 
 * 测试目标：
 * - 验证赋值表达式
 * - 覆盖各种赋值操作符
 * - 验证左值类型
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本赋值
let x = 5

// ✅ 测试2：重新赋值
x = 10

// ✅ 测试3：复合赋值 +=
x += 5

// ✅ 测试4：复合赋值 -=
x -= 3

// ✅ 测试5：复合赋值 *=
x *= 2

// ✅ 测试6：复合赋值 /=
x /= 2

// ✅ 测试7：复合赋值 %=
x %= 3

// ✅ 测试8：复合赋值 &=
let bits = 15
bits &= 7

// ✅ 测试9：复合赋值 |=
bits |= 8

// ✅ 测试10：复合赋值 ^=
bits ^= 3

// ✅ 测试11：对象属性赋值
const obj = {}
obj.prop = 'value'

// ✅ 测试12：数组元素赋值
const arr = [1, 2, 3]
arr[0] = 10

// ✅ 测试13：链式赋值
let a, b, c
a = b = c = 5

// ✅ 测试14：对象属性复合赋值
obj.count = 0
obj.count += 1

// ✅ 测试15：数组元素复合赋值
arr[1] += 10

/* Es6Parser.ts: AssignmentExpression: = or CompoundAssignmentOp */


// ============================================
// 合并来自: AssignmentExpressionEmptySemicolon-001.js
// ============================================

/**
 * 规则测试：AssignmentExpressionEmptySemicolon
 * 
 * 位置：Es6Parser.ts Line 1921
 * 分类：expressions
 * 编号：232
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

export default expr

/* Es6Parser.ts: AssignmentExpression ; */


// ============================================
// 合并来自: DefaultTokHoistableDeclarationClassDeclarationAssignmentExpression-001.js
// ============================================

/**
 * 规则测试：DefaultTokHoistableDeclarationClassDeclarationAssignmentExpression
 * 
 * 位置：Es6Parser.ts Line 1906
 * 分类：expressions
 * 编号：231
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

export default function() {}
export default class {}
export default {value: 42}

/* Es6Parser.ts: Or[Declaration, Statement] */


// ============================================
// 合并来自: FunctionExpression-001.js
// ============================================

/**
 * 规则测试：FunctionExpression
 * 
 * 位置：Es6Parser.ts Line 219
 * 分类：expressions
 * 编号：226
 * 
 * 规则特征：
 * ✓ 包含Option（2处）- 函数名、函数体
 * 
 * 规则语法：
 *   FunctionExpression:
 *     function Identifier? ( FormalParameters ) { FunctionBody }
 * 
 * 测试目标：
 * - 覆盖Option1无：匿名函数表达式
 * - 覆盖Option1有：命名函数表达式
 * - 验证各种函数参数形式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Option1无 - 匿名函数表达式
const func1 = function() {
    return 42
}

// ✅ 测试2：Option1有 - 命名函数表达式
const func2 = function namedFunc() {
    return 42
}

// ✅ 测试3：Option2无 - 无参数函数
const greet = function() {
    console.log('hello')
}

// ✅ 测试4：Option2有 - 单个参数
const double = function(x) {
    return x * 2
}

// ✅ 测试5：Option2有 - 多个参数
const add = function(a, b) {
    return a + b
}

// ✅ 测试6：默认参数
const withDefault = function(x = 10) {
    return x
}

// ✅ 测试7：Rest参数
const variadic = function(...args) {
    return args.length
}

// ✅ 测试8：解构参数
const destructured = function({ x, y }) {
    return x + y
}

// ✅ 测试9：立即调用函数表达式（IIFE）
const result1 = (function() {
    return 42
})()

// ✅ 测试10：IIFE 带参数
const result2 = (function(x) {
    return x * 2
})(21)

// ✅ 测试11：函数表达式作为参数
[1, 2, 3].map(function(x) {
    return x * 2
})

// ✅ 测试12：函数表达式作为对象属性
const obj = {
    method: function() { return 'method' },
    action: function(a, b) { return a + b }
}

// ✅ 测试13：递归函数表达式
const factorial = function fac(n) {
    return n <= 1 ? 1 : n * fac(n - 1)
}

// ✅ 测试14：在条件表达式中
const fn = condition ? function() { return 'yes' } : function() { return 'no' }

// ✅ 测试15：作为回调函数
setTimeout(function() {
    console.log('done')
}, 1000)

/* Es6Parser.ts: FunctionExpression: function Identifier? ( FormalParameters ) { FunctionBody } */


// ============================================
// 来自文件: 402-FunctionExpression.js
// ============================================


/* Es6Parser.ts: function Identifier? (FormalParameters) { FunctionBody } */


// ============================================
// 合并来自: AsyncFunctionExpression-001.js
// ============================================


/* Es6Parser.ts: async function Identifier? (FormalParameters) { FunctionBody } */


// ============================================
// 合并来自: GeneratorFunction-001.js
// ============================================


/* Es6Parser.ts: function* Identifier? (FormalParameters) { GeneratorBody } */

/**
 * 规则测试：Expression
 * 
 * 位置：Es6Parser.ts Line 846
 * 分类：expressions
 * 编号：223
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * 
 * 规则语法：
 *   Expression:
 *     AssignmentExpression ( , AssignmentExpression )*
 * 
 * 测试目标：
 * - 测试单个表达式
 * - 测试逗号分隔的多个表达式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：单个表达式
const a = 1

// ✅ 测试2：逗号运算符 - 2个表达式
let x, y
x = 1, y = 2

// ✅ 测试3：逗号运算符 - 多个表达式
let result = (x = 1, y = 2, x + y)

// ✅ 测试4：for循环中的逗号表达式
for (let i = 0, j = 10; i < j; i++, j--) {
    console.log(i, j)
}

// ✅ 测试5：函数调用中（非逗号运算符）
func(a, b, c)

// ✅ 测试6：复杂表达式组合
const value = (console.log('start'), compute(), console.log('end'), 42)

/* Es6Parser.ts: AssignmentExpression (Comma AssignmentExpression)* */
