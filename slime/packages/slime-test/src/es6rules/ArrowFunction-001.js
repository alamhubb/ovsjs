/**
 * 规则测试：ArrowFunction
 * 
 * 位置：Es2025Parser.ts Line 227
 * 分类：expressions
 * 编号：225
 * 
 * 规则语法：
 *   ArrowFunction:
 *     ArrowFormalParameters => ArrowFunctionBody
 * 
 * 测试目标：
 * - 覆盖各种箭头函数形式
 * - 验证参数和返回值
 * - 覆盖嵌套和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：无参数箭头函数    ArrowFunction -> () => 表达式
const fn1 = () => 42

// ✅ 测试2：单参数（无括号）    ArrowFunction -> 标识符 => 表达式
const double = x => x * 2

// ✅ 测试3：单参数（有括号）    ArrowFunction -> (参数) => 表达式
const triple = (x) => x * 3

// ✅ 测试4：多参数    ArrowFunction -> (多个参数) => 表达式
const add = (a, b) => a + b

// ✅ 测试5：对象返回    ArrowFunction -> 返回ObjectLiteral
const makeObj = (x) => ({ value: x })

// ✅ 测试6：块体函数    ArrowFunction -> 参数 => { 块体 }
const compute = (x) => {
    const result = x * 2
    return result
}

// ✅ 测试7：默认参数    ArrowFunction -> (参数默认值) => 表达式
const withDefault = (x = 10) => x * 2

// ✅ 测试8：Rest参数    ArrowFunction -> (...rest) => 表达式
const variadic = (...args) => args.length

// ✅ 测试9：解构参数    ArrowFunction -> 解构参数 => 表达式
const destructured = ({ x, y }) => x + y

// ✅ 测试10：复杂参数组合    ArrowFunction -> (参数、默认值、rest混合) => 表达式
const complex = (a, b = 2, ...rest) => a + b + rest.length

// ✅ 测试11：嵌套箭头函数    ArrowFunction -> 箭头函数返回箭头函数
const curry = (a) => (b) => (c) => a + b + c

// ✅ 测试12：数组方法中使用    ArrowFunction -> 作为回调函数
[1, 2, 3].map(x => x * 2)

// ✅ 测试13：条件表达式    ArrowFunction -> 返回条件表达式
const conditionalArrow = (x) => x > 0 ? 'positive' : 'negative'

// ✅ 测试14：对象方法（不应该用this）    ArrowFunction -> 对象中嵌套的箭头函数
const obj = {
    items: [1, 2, 3],
    process: function() {
        return this.items.map(x => x * 2)
    }
}

// ✅ 测试15：Promise链式    ArrowFunction -> 异步场景中的箭头函数
const asyncChain = (promise) =>
    promise
        .then(data => ({ data }))
        .catch(error => ({ error }))

/* Es2025Parser.ts: ArrowFunction: ArrowFormalParameters => ArrowFunctionBody */


// ============================================
// 来自文件: 403-ArrowFunction.js
// ============================================


/* Es2025Parser.ts: ArrowParameters => ConciseBody */


// ============================================
// 来自文件: 504-ArrowFunction.js
// ============================================

/**
 * 规则测试：ArrowFunction
 * 
 * 位置：Es2025Parser.ts Line 1484
 * 分类：functions
 * 编号：504
 * 
 * 规则特征：
 * ✓ 包含Option（1处）- async
 * ✓ 包含Or规则（1处）- 2个分支
 * 
 * 规则语法：
 *   ArrowFunction:
 *     async? BindingIdentifier => ConciseBody
 *     async? ( FormalParameterList? ) => ConciseBody
 * 
 * 测试目标：
 * - 测试单参数（无括号）
 * - 测试多参数（有括号）
 * - 测试无参数
 * - 测试async箭头函数
 * - 测试表达式body vs 块语句body
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：单参数 - 表达式body
const square = x => x * x
const double = n => n * 2

// ✅ 测试2：单参数 - 块语句body
const log = x => {
    console.log(x)
    return x
}

// ✅ 测试3：多参数 - 表达式body
const add = (a, b) => a + b
const multiply = (x, y, z) => x * y * z

// ✅ 测试4：多参数 - 块语句body
const complex = (a, b) => {
    const sum = a + b
    return sum * 2
}

// ✅ 测试5：无参数
const noop = () => {}
const random = () => Math.random()

// ✅ 测试6：Rest参数
const sum = (...numbers) => numbers.reduce((a, b) => a + b, 0)

// ✅ 测试7：默认参数
const greet = (name = 'Guest') => `Hello ${name}`
const calc = (a, b = 10, c = 20) => a + b + c

// ✅ 测试8：解构参数
const getName = ({name}) => name
const getFirst = ([first]) => first
const destructure = ({x, y}, [a, b]) => x + y + a + b

// ✅ 测试9：async箭头函数
const fetchData = async () => {
    const data = await fetch('/api')
    return data
}

const asyncProcess = async (id) => await loadUser(id)

// ✅ 测试10：async + Rest参数
const asyncAll = async (...ids) => {
    return Promise.all(ids.map(id => fetchUser(id)))
}

// ✅ 测试11：返回对象（需要括号）
const makeObject = (name, age) => ({name, age})
const create = () => ({x: 1, y: 2})

// ✅ 测试12：嵌套箭头函数
const curry = a => b => a + b
const compose = f => g => x => f(g(x))

// ✅ 测试13：箭头函数作为回调
const arr = [1, 2, 3, 4, 5]
const doubled = arr.map(x => x * 2)
const evens = arr.filter(x => x % 2 === 0)
const total = arr.reduce((sum, n) => sum + n, 0)

// ✅ 测试14：async + 解构
const loadUser = async ({id, cache = true}) => {
    if (cache) return getCached(id)
    return await fetch(`/user/${id}`)
}

/* Es2025Parser.ts: ArrowFunction */


// ============================================
// 合并来自: AsyncArrowFunction-001.js
// ============================================


/* Es2025Parser.ts: async ArrowFunction */

/**
 * 规则测试：ArrowFunction
 * 
 * 位置：Es2025Parser.ts Line 227
 * 分类：expressions
 * 编号：225
 * 
 * 规则语法：
 *   ArrowFunction:
 *     ArrowFormalParameters => ArrowFunctionBody
 * 
 * 测试目标：
 * - 覆盖各种箭头函数形式
 * - 验证参数和返回值
 * - 覆盖嵌套和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：无参数箭头函数    ArrowFunction -> () => 表达式
const fn1 = () => 42

// ✅ 测试2：单参数（无括号）    ArrowFunction -> 标识符 => 表达式
const double = x => x * 2

// ✅ 测试3：单参数（有括号）    ArrowFunction -> (参数) => 表达式
const triple = (x) => x * 3

// ✅ 测试4：多参数    ArrowFunction -> (多个参数) => 表达式
const add = (a, b) => a + b

// ✅ 测试5：对象返回    ArrowFunction -> 返回ObjectLiteral
const makeObj = (x) => ({ value: x })

// ✅ 测试6：块体函数    ArrowFunction -> 参数 => { 块体 }
const compute = (x) => {
    const result = x * 2
    return result
}

// ✅ 测试7：默认参数    ArrowFunction -> (参数默认值) => 表达式
const withDefault = (x = 10) => x * 2

// ✅ 测试8：Rest参数    ArrowFunction -> (...rest) => 表达式
const variadic = (...args) => args.length

// ✅ 测试9：解构参数    ArrowFunction -> 解构参数 => 表达式
const destructured = ({ x, y }) => x + y

// ✅ 测试10：复杂参数组合    ArrowFunction -> (参数、默认值、rest混合) => 表达式
const complex = (a, b = 2, ...rest) => a + b + rest.length

// ✅ 测试11：嵌套箭头函数    ArrowFunction -> 箭头函数返回箭头函数
const curry = (a) => (b) => (c) => a + b + c

// ✅ 测试12：数组方法中使用    ArrowFunction -> 作为回调函数
[1, 2, 3].map(x => x * 2)

// ✅ 测试13：条件表达式    ArrowFunction -> 返回条件表达式
const conditionalArrow = (x) => x > 0 ? 'positive' : 'negative'

// ✅ 测试14：对象方法（不应该用this）    ArrowFunction -> 对象中嵌套的箭头函数
const obj = {
    items: [1, 2, 3],
    process: function() {
        return this.items.map(x => x * 2)
    }
}

// ✅ 测试15：Promise链式    ArrowFunction -> 异步场景中的箭头函数
const asyncChain = (promise) =>
    promise
        .then(data => ({ data }))
        .catch(error => ({ error }))

/* Es2025Parser.ts: ArrowFunction: ArrowFormalParameters => ArrowFunctionBody */


/* Es2025Parser.ts: ArrowParameters => ConciseBody */

/**
 * 规则测试：ArrowFunction
 * 
 * 位置：Es2025Parser.ts Line 1484
 * 分类：functions
 * 编号：504
 * 
 * 规则特征：
 * ✓ 包含Option（1处）- async
 * ✓ 包含Or规则（1处）- 2个分支
 * 
 * 规则语法：
 *   ArrowFunction:
 *     async? BindingIdentifier => ConciseBody
 *     async? ( FormalParameterList? ) => ConciseBody
 * 
 * 测试目标：
 * - 测试单参数（无括号）
 * - 测试多参数（有括号）
 * - 测试无参数
 * - 测试async箭头函数
 * - 测试表达式body vs 块语句body
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：单参数 - 表达式body
const square = x => x * x
const double = n => n * 2

// ✅ 测试2：单参数 - 块语句body
const log = x => {
    console.log(x)
    return x
}

// ✅ 测试3：多参数 - 表达式body
const add = (a, b) => a + b
const multiply = (x, y, z) => x * y * z

// ✅ 测试4：多参数 - 块语句body
const complex = (a, b) => {
    const sum = a + b
    return sum * 2
}

// ✅ 测试5：无参数
const noop = () => {}
const random = () => Math.random()

// ✅ 测试6：Rest参数
const sum = (...numbers) => numbers.reduce((a, b) => a + b, 0)

// ✅ 测试7：默认参数
const greet = (name = 'Guest') => `Hello ${name}`
const calc = (a, b = 10, c = 20) => a + b + c

// ✅ 测试8：解构参数
const getName = ({name}) => name
const getFirst = ([first]) => first
const destructure = ({x, y}, [a, b]) => x + y + a + b

// ✅ 测试9：async箭头函数
const fetchData = async () => {
    const data = await fetch('/api')
    return data
}

const asyncProcess = async (id) => await loadUser(id)

// ✅ 测试10：async + Rest参数
const asyncAll = async (...ids) => {
    return Promise.all(ids.map(id => fetchUser(id)))
}

// ✅ 测试11：返回对象（需要括号）
const makeObject = (name, age) => ({name, age})
const create = () => ({x: 1, y: 2})

// ✅ 测试12：嵌套箭头函数
const curry = a => b => a + b
const compose = f => g => x => f(g(x))

// ✅ 测试13：箭头函数作为回调
const arr = [1, 2, 3, 4, 5]
const doubled = arr.map(x => x * 2)
const evens = arr.filter(x => x % 2 === 0)
const total = arr.reduce((sum, n) => sum + n, 0)

// ✅ 测试14：async + 解构
const loadUser = async ({id, cache = true}) => {
    if (cache) return getCached(id)
    return await fetch(`/user/${id}`)
}

/* Es2025Parser.ts: ArrowFunction */

// ============================================
// 合并来自: AsyncArrowFunction-001.js
// ============================================


/* Es2025Parser.ts: async ArrowFunction */
