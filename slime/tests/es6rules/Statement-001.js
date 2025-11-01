/**
 * 规则测试：Statement
 * 
 * 位置：Es6Parser.ts Line 855
 * 分类：statements
 * 编号：401
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 11个分支
 * 
 * 规则语法：
 *   Statement:
 *     BlockStatement
 *     VariableDeclaration
 *     EmptyStatement
 *     LabelledStatement          (长规则，需优先)
 *     ExpressionStatement
 *     IfStatement
 *     BreakableStatement
 *     ContinueStatement
 *     BreakStatement
 *     ReturnStatement
 *     WithStatement
 *     ThrowStatement
 *     TryStatement
 *     DebuggerStatement
 * 
 * 测试目标：
 * - 覆盖所有Or分支
 * - 验证LabelledStatement优先于ExpressionStatement
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：BlockStatement
{
    let x = 1
    const y = 2
}

// ✅ 测试2：VariableDeclaration
let a = 1
const b = 2
var c = 3

// ✅ 测试3：EmptyStatement
;

// ✅ 测试4：LabelledStatement (必须在ExpressionStatement之前匹配)
myLabel: for (let i = 0; i < 3; i++) {
    if (i === 1) break myLabel
}

// ✅ 测试5：ExpressionStatement
1 + 2
console.log('test')
obj.method()

// ✅ 测试6：IfStatement
if (true) {
    console.log('yes')
}

if (x > 0) {
    console.log('positive')
} else {
    console.log('negative')
}

// ✅ 测试7：BreakableStatement - for loop
for (let i = 0; i < 10; i++) {
    if (i === 5) break
}

// ✅ 测试8：BreakableStatement - while loop
while (true) {
    break
}

// ✅ 测试9：BreakableStatement - switch
switch (x) {
    case 1:
        break
    default:
        break
}

// ✅ 测试10：ContinueStatement
for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) continue
    console.log(i)
}

// ✅ 测试11：BreakStatement
for (let i = 0; i < 10; i++) {
    break
}

// ✅ 测试12：ReturnStatement
function test() {
    return 42
}

// ✅ 测试13：WithStatement
with (Math) {
    const r = round(3.14)
}

// ✅ 测试14：ThrowStatement
function error() {
    throw new Error('test')
}

// ✅ 测试15：TryStatement
try {
    riskyCode()
} catch (e) {
    console.error(e)
}

// ✅ 测试16：DebuggerStatement
debugger

/* Es6Parser.ts: Or[BlockStatement, VariableStatement, ...] */


// ============================================
// 来自文件: 420-Statement.js
// ============================================

/**
 * 规则测试：Statement
 * 分类：statements | 编号：420
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1-15：Statement各种语句形式
if (true) { }
while (true) { break }
for (let i = 0; i < 5; i++) { }
for (const item of []) { }
for (const key in {}) { }
{ }
switch (1) { case 1: break }
try { } catch (e) { }
function f() { }
class C { }
return 1
break
continue
throw new Error()
debugger

/* Es6Parser.ts: Statement */


// ============================================
// 合并来自: ExpressionStatement-001.js
// ============================================


/* Es6Parser.ts: Expression ; */


// ============================================
// 来自文件: 225-ExpressionStatement.js
// ============================================

/**
 * 规则测试：ExpressionStatement
 * 
 * 位置：Es6Parser.ts Line 1119
 * 分类：expressions
 * 编号：225
 * 
 * 规则特征：
 * - 简单规则：Expression ; 
 * - 无Or、Option、Many分支
 * 
 * 规则语法：
 *   ExpressionStatement:
 *     Expression ;
 * 
 * 测试目标：
 * - 验证各种表达式可以作为语句
 * - 验证自动分号插入
 * - 覆盖各种表达式类型
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：算术表达式语句
1 + 2

// ✅ 测试2：函数调用表达式语句
console.log('test')

// ✅ 测试3：方法调用表达式语句
const obj = { method: function() {} }
obj.method()

// ✅ 测试4：赋值表达式语句
let x = 1
x = 2

// ✅ 测试5：复合赋值表达式语句
x += 3

// ✅ 测试6：递增表达式语句
x++

// ✅ 测试7：递减表达式语句
x--

// ✅ 测试8：逗号表达式语句
x = 1, x = 2

// ✅ 测试9：new 表达式语句
new Date()

// ✅ 测试10：函数表达式语句（不同于函数声明）
(function() {
    console.log('iife')
})()

// ✅ 测试11：成员访问表达式语句
const arr = [1, 2, 3]
arr[0]

// ✅ 测试12：delete 表达式语句
const obj2 = { prop: 1 }
delete obj2.prop

// ✅ 测试13：typeof 表达式语句
typeof x

// ✅ 测试14：逻辑表达式语句
x > 0 && console.log('positive')

// ✅ 测试15：条件表达式语句
true ? console.log('yes') : console.log('no')

/* Es6Parser.ts: ExpressionStatement: Expression ; */


// ============================================
// 来自文件: 304-ExpressionStatement.js
// ============================================


/* Es6Parser.ts: Expression ; */


// ============================================
// 合并来自: BlockStatement-001.js
// ============================================

/**
 * 规则测试：BlockStatement
 * 
 * 位置：Es6Parser.ts Line 1127
 * 分类：statements
 * 编号：301
 * 
 * 规则语法：
 *   BlockStatement:
 *     { StatementList? }
 * 
 * 测试目标：
 * - 覆盖空块和非空块
 * - 验证各种语句组合
 * - 覆盖作用域隔离
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：空块语句
{
}

// ✅ 测试2：单个语句块
{
    const x = 1
}

// ✅ 测试3：多个语句块
{
    const a = 1
    const b = 2
    console.log(a, b)
}

// ✅ 测试4：嵌套块
{
    const x = 1
    {
        const y = 2
        console.log(x, y)
    }
}

// ✅ 测试5：块中的if语句
{
    if (true) {
        console.log('yes')
    }
}

// ✅ 测试6：块中的for循环
{
    for (let i = 0; i < 3; i++) {
        console.log(i)
    }
}

// ✅ 测试7：块中的while循环
{
    let i = 0
    while (i < 3) {
        i++
    }
}

// ✅ 测试8：块中的try-catch
{
    try {
        throw new Error('test')
    } catch (e) {
    }
}

// ✅ 测试9：块中的函数声明
{
    function test() {
        return 42
    }
    console.log(test())
}

// ✅ 测试10：块中的类声明
{
    class MyClass {
        constructor(x) {
            this.x = x
        }
    }
    const obj = new MyClass(42)
}

// ✅ 测试11：块中的变量声明
{
    const x = 1
    let y = 2
    var z = 3
}

// ✅ 测试12：块中的表达式语句
{
    1 + 2
    console.log('done')
    x++
}

// ✅ 测试13：块中的return语句
function blockReturn() {
    {
        return 42
    }
}

// ✅ 测试14：块中的break语句
for (let i = 0; i < 10; i++) {
    {
        if (i === 5) break
    }
}

// ✅ 测试15：深层嵌套块
{
    {
        {
            {
                const deep = 'value'
                console.log(deep)
            }
        }
    }
}

/* Es6Parser.ts: BlockStatement: { StatementList? } */


// ============================================
// 来自文件: 403-BlockStatement.js
// ============================================

/**
 * 规则测试：BlockStatement
 * 
 * 位置：Es6Parser.ts Line 963
 * 分类：statements
 * 编号：403
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

{
    let x = 1
    const y = 2
}

/* Es6Parser.ts: BlockStatement */


// ============================================
// 来自文件: 707-BlockStatement.js
// ============================================

/**
 * 规则测试：BlockStatement
 * 分类：others | 编号：707
 * 
 * 规则定义（Es6Parser.ts）：
 * BlockStatement:
 *   Block
 * 
 * Block:
 *   { StatementList? }
 * 
 * 中文说明：
 * ✓ 块语句是由花括号包含的可选语句列表
 * ✓ 创建新的块作用域
 * ✓ 可以为空块
 * ✓ 常用于if/while/for等控制流中
 * 
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1：空块
{
}

// ✅ 测试2：块 - 单个语句
{
    console.log('in block')
}

// ✅ 测试3：块 - 多个语句
{
    const x = 1
    const y = 2
    console.log(x + y)
}

// ✅ 测试4：块 - 变量声明
{
    let a = 1
    const b = 2
    var c = 3
}

// ✅ 测试5：块 - 函数声明
{
    function inner() {
        return 42
    }
    inner()
}

// ✅ 测试6：块 - 类声明
{
    class Inner {
        method() {}
    }
    new Inner()
}

// ✅ 测试7：块 - if语句
{
    if (true) {
        console.log('if block')
    }
}

// ✅ 测试8：块 - for循环
{
    for (let i = 0; i < 3; i++) {
        console.log(i)
    }
}

// ✅ 测试9：块 - while循环
{
    let i = 0
    while (i < 2) {
        console.log(i)
        i++
    }
}

// ✅ 测试10：块 - try-catch
{
    try {
        throw new Error('error')
    } catch (e) {
        console.log('caught')
    }
}

// ✅ 测试11：嵌套块
{
    {
        {
            console.log('nested')
        }
    }
}

// ✅ 测试12：块 - 作用域隔离
{
    let x = 1
}
// let x 在块外不可见

// ✅ 测试13：块 - switch中的块
switch (1) {
    case 1: {
        const x = 1
        console.log(x)
        break
    }
}

// ✅ 测试14：块 - 函数中的块
function test() {
    {
        let local = 1
    }
}

// ✅ 测试15：块 - 复杂语句组合
{
    const items = [1, 2, 3]
    for (const item of items) {
        if (item > 1) {
            console.log(item)
        }
    }
}

/* Es6Parser.ts: BlockStatement
 * 规则：
 * BlockStatement:
 *   Block
 * 
 * Block:
 *   { StatementList? }
 */


// ============================================
// 合并来自: BreakableStatement-001.js
// ============================================

/**
 * 规则测试：BreakableStatement
 * 
 * 位置：Es6Parser.ts Line 955
 * 分类：statements
 * 编号：402
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

for (;;) { break }
while (true) { break }
switch (x) { case 1: break }

/* Es6Parser.ts: Or[IterationStatement, SwitchStatement] */


// ============================================
// 合并来自: BreakStatement-001.js
// ============================================


/* Es6Parser.ts: break Label? */


// ============================================
// 来自文件: 413-BreakStatement.js
// ============================================

/**
 * 规则测试：BreakStatement
 * 
 * 位置：Es6Parser.ts Line 1258
 * 分类：statements
 * 编号：413
 * 
 * 规则语法：
 *   BreakStatement:
 *     break ;
 * 
 * 测试目标：
 * - 验证break语句在各种循环中的使用
 * - 验证break在switch中的使用
 * - 覆盖条件break和无条件break
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：while循环中的break
while (true) {
    break
}

// ✅ 测试2：for循环中的break
for (let i = 0; i < 100; i++) {
    if (i === 5) break
}

// ✅ 测试3：do-while循环中的break
do {
    break
} while (true)

// ✅ 测试4：switch中的break
switch (1) {
    case 1:
        console.log('one')
        break
    case 2:
        console.log('two')
        break
}

// ✅ 测试5：嵌套循环中的break
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (j === 1) break
    }
}

// ✅ 测试6：for-in循环中的break
for (let key in { a: 1, b: 2 }) {
    if (key === 'a') break
}

// ✅ 测试7：for-of循环中的break
for (let item of [1, 2, 3]) {
    if (item === 2) break
}

// ✅ 测试8：条件break
for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) break
}

// ✅ 测试9：复杂条件break
while (true) {
    if (Math.random() > 0.5) {
        break
    }
}

// ✅ 测试10：try-catch中的break
for (let i = 0; i < 5; i++) {
    try {
        if (i === 3) break
    } catch (e) {
    }
}

// ✅ 测试11：if语句中的break（在循环中）
for (let i = 0; i < 5; i++) {
    if (true) {
        break
    }
}

// ✅ 测试12：多个break分支
for (let i = 0; i < 10; i++) {
    if (i === 0) break
    if (i === 5) break
    if (i === 9) break
}

// ✅ 测试13：switch的multiple case下的break
switch (1) {
    case 1:
    case 2:
    case 3:
        console.log('1-3')
        break
    case 4:
        console.log('4')
        break
}

// ✅ 测试14：循环中嵌套if的break
for (let i = 0; i < 5; i++) {
    if (i > 2) {
        if (true) {
            break
        }
    }
}

// ✅ 测试15：实际场景：搜索循环
function searchArray(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
            console.log('found')
            break
        }
    }
}

/* Es6Parser.ts: BreakStatement: break ; */


// ============================================
// 合并来自: ContinueStatement-001.js
// ============================================


/* Es6Parser.ts: continue Label? */


// ============================================
// 来自文件: 412-ContinueStatement.js
// ============================================

/**
 * 规则测试：ContinueStatement
 * 
 * 位置：Es6Parser.ts Line 1261
 * 分类：statements
 * 编号：412
 * 
 * 规则特征：
 * ✓ 包含Option（1处）- LabelIdentifier可选
 * 
 * 规则语法：
 *   ContinueStatement:
 *     continue LabelIdentifier? ;?
 * 
 * 测试目标：
 * - 测试Option无（无标签）
 * - 测试Option有（带标签）
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Option无 - for循环中的continue
for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) continue
    console.log(i)
}

// ✅ 测试2：Option无 - while循环中
let n = 0
while (n < 10) {
    n++
    if (n === 5) continue
    console.log(n)
}

// ✅ 测试3：Option无 - do-while循环中
let i = 0
do {
    i++
    if (i % 2 === 0) continue
    console.log(i)
} while (i < 10)

// ✅ 测试4：Option有 - 带标签的continue
loop: for (let i = 0; i < 10; i++) {
    if (i === 5) continue loop
}

// ✅ 测试5：Option有 - 嵌套循环跳转到外层
outer: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (j === 1) continue outer
    }
}

// ✅ 测试6：for-of循环中
for (const item of items) {
    if (!item) continue
    process(item)
}

// ✅ 测试7：for-in循环中
for (const key in obj) {
    if (key.startsWith('_')) continue
    console.log(key)
}

// ✅ 测试8：多个continue
for (let i = 0; i < 100; i++) {
    if (i < 10) continue
    if (i % 3 === 0) continue
    if (i % 5 === 0) continue
    console.log(i)
}
/* Es6Parser.ts: ContinueStatement */


// ============================================
// 来自文件: 414-ContinueStatement.js
// ============================================

/**
 * 规则测试：ContinueStatement
 * 
 * 位置：Es6Parser.ts Line 1266
 * 分类：statements
 * 编号：414
 * 
 * 规则语法：
 *   ContinueStatement:
 *     continue ;
 * 
 * 测试目标：
 * - 验证continue语句在各种循环中的使用
 * - 验证条件continue和无条件continue
 * - 覆盖嵌套循环中的continue
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：for循环中的continue
for (let i = 0; i < 10; i++) {
    if (i === 5) continue
    console.log(i)
}

// ✅ 测试2：while循环中的continue
let j = 0
while (j < 10) {
    j++
    if (j === 5) continue
    console.log(j)
}

// ✅ 测试3：do-while循环中的continue
let k = 0
do {
    k++
    if (k === 5) continue
    console.log(k)
} while (k < 10)

// ✅ 测试4：for-in循环中的continue
for (let key in { a: 1, b: 2, c: 3 }) {
    if (key === 'b') continue
    console.log(key)
}

// ✅ 测试5：for-of循环中的continue
for (let item of [1, 2, 3, 4, 5]) {
    if (item === 3) continue
    console.log(item)
}

// ✅ 测试6：嵌套循环中的continue
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (j === 1) continue
        console.log(i, j)
    }
}

// ✅ 测试7：条件continue
for (let i = 1; i <= 10; i++) {
    if (i % 2 === 0) continue
    console.log('odd: ' + i)
}

// ✅ 测试8：复杂条件continue
for (let i = 0; i < 20; i++) {
    if (i > 5 && i < 15) continue
    console.log(i)
}

// ✅ 测试9：try-catch中的continue
for (let i = 0; i < 5; i++) {
    try {
        if (i === 2) continue
        console.log(i)
    } catch (e) {
    }
}

// ✅ 测试10：if语句中的continue
for (let i = 0; i < 5; i++) {
    if (i % 2 === 0) {
        continue
    }
    console.log(i)
}

// ✅ 测试11：多个continue分支
for (let i = 0; i < 10; i++) {
    if (i === 0) continue
    if (i === 5) continue
    if (i === 9) continue
    console.log(i)
}

// ✅ 测试12：continue和break混合
for (let i = 0; i < 10; i++) {
    if (i === 3) continue
    if (i === 7) break
    console.log(i)
}

// ✅ 测试13：嵌套if中的continue
for (let i = 0; i < 5; i++) {
    if (i > 0) {
        if (i % 2 === 0) {
            continue
        }
    }
    console.log(i)
}

// ✅ 测试14：continue在数组方法中（类似）
const numbers = [1, 2, 3, 4, 5]
for (let num of numbers) {
    if (num === 3) continue
    console.log('processing: ' + num)
}

// ✅ 测试15：实际场景：跳过某些元素
function processItems(items) {
    for (let i = 0; i < items.length; i++) {
        if (!items[i]) continue
        console.log('processing ' + items[i])
    }
}

/* Es6Parser.ts: ContinueStatement: continue ; */


// ============================================
// 合并来自: DebuggerStatement-001.js
// ============================================

/**
 * 规则测试：DebuggerStatement
 * 
 * 位置：Es6Parser.ts Line 1401
 * 分类：statements
 * 编号：420
 * 
 * 规则特征：
 * - 简单规则：debugger关键字
 * 
 * 规则语法：
 *   DebuggerStatement:
 *     debugger ;?
 * 
 * 测试目标：
 * - 测试debugger语句
 * - 在各种位置使用
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：顶层debugger
debugger

// ✅ 测试2：函数中
function test() {
    debugger
}

// ✅ 测试3：条件debugger
function debug(enabled) {
    if (enabled) {
        debugger
    }
}

// ✅ 测试4：循环中
for (let i = 0; i < 10; i++) {
    if (i === 5) debugger
}

// ✅ 测试5：try-catch中
try {
    riskyCode()
} catch (e) {
    debugger
    console.error(e)
}

// ✅ 测试6：箭头函数中
const debug = () => {
    debugger
}

// ✅ 测试7：多个debugger
function complex() {
    debugger
    doSomething()
    debugger
    doMore()
    debugger
}

// ✅ 测试8：与其他语句混合
function process(data) {
    debugger
    const result = transform(data)
    debugger
    return result
}
/* Es6Parser.ts: DebuggerStatement */


// ============================================
// 来自文件: 423-DebuggerStatement.js
// ============================================

/**
 * 规则测试：DebuggerStatement
 * 分类：statements | 编号：423
 * 
 * 规则定义（Es6Parser.ts）：
 * DebuggerStatement:
 *   debugger
 * 
 * 中文说明：
 * ✓ debugger语句用于设置断点
 * ✓ 调试器会在此语句处停止执行
 * ✓ 在生产环境中应该移除
 * 
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1：基本debugger语句
debugger

// ✅ 测试2：debugger在函数中
function myFunction() {
    debugger
    console.log("after debugger")
}

// ✅ 测试3：debugger在条件中
if (true) {
    debugger
}

// ✅ 测试4：debugger在if-else中
if (false) {
    console.log("false branch")
} else {
    debugger
}

// ✅ 测试5：debugger在for循环中
for (let i = 0; i < 3; i++) {
    if (i === 1) {
        debugger
    }
}

// ✅ 测试6：debugger在while循环中
let x = 0
while (x < 2) {
    debugger
    x++
}

// ✅ 测试7：debugger在do-while中
let y = 0
do {
    debugger
    y++
} while (y < 1)

// ✅ 测试8：debugger在try块中
try {
    debugger
    console.log("in try")
} catch (e) {
    console.log(e)
}

// ✅ 测试9：debugger在catch块中
try {
    throw new Error("test")
} catch (e) {
    debugger
}

// ✅ 测试10：debugger在finally块中
try {
    console.log("try")
} finally {
    debugger
}

// ✅ 测试11：debugger在switch中
switch (1) {
    case 1:
        debugger
        break
    case 2:
        console.log(2)
        break
}

// ✅ 测试12：debugger在箭头函数中
const arrow = () => {
    debugger
    return 42
}

// ✅ 测试13：debugger在匿名函数中
const func = function() {
    debugger
    console.log("anonymous")
}

// ✅ 测试14：debugger在嵌套函数中
function outer() {
    function inner() {
        debugger
    }
    inner()
}

// ✅ 测试15：debugger在对象方法中
const obj = {
    method: function() {
        debugger
        return "value"
    }
}

/* Es6Parser.ts: DebuggerStatement
 * 规则：
 * DebuggerStatement:
 *   debugger
 */


// ============================================
// 合并来自: DoWhileStatement-001.js
// ============================================

/**
 * 规则测试：DoWhileStatement
 * 
 * 位置：Es6Parser.ts Line 1158
 * 分类：statements
 * 编号：407
 * 
 * 规则语法：
 *   DoWhileStatement:
 *     do Statement while ( Expression ) ;
 * 
 * 测试目标：
 * - 验证do-while至少执行一次的特性
 * - 验证条件表达式各种形式
 * - 覆盖嵌套和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本do-while
let i = 0
do {
    i++
} while (i < 5)

// ✅ 测试2：条件为false（仍执行一次）
let j = 10
do {
    console.log('execute once')
} while (false)

// ✅ 测试3：复杂条件
let count = 0
do {
    count++
} while (count < 100 && count !== 50)

// ✅ 测试4：单行语句
let x = 0
do x++
while (x < 5)

// ✅ 测试5：do-while中的break
let num = 0
do {
    if (num === 3) break
    num++
} while (true)

// ✅ 测试6：do-while中的continue
let val = 0
do {
    val++
    if (val === 2) continue
    console.log(val)
} while (val < 5)

// ✅ 测试7：嵌套do-while
let a = 0
do {
    let b = 0
    do {
        b++
    } while (b < 2)
    a++
} while (a < 3)

// ✅ 测试8：do-while中的复杂语句
let status = 0
do {
    if (status % 2 === 0) {
        console.log('even')
    } else {
        console.log('odd')
    }
    status++
} while (status < 10)

// ✅ 测试9：do-while中的for循环
let outer = 0
do {
    for (let inner = 0; inner < 2; inner++) {
        console.log(outer, inner)
    }
    outer++
} while (outer < 3)

// ✅ 测试10：do-while中的if-else
let index = 0
do {
    if (index < 5) {
        console.log('less')
    } else {
        console.log('more')
    }
    index++
} while (index < 10)

// ✅ 测试11：do-while中的try-catch
let error = 0
do {
    try {
        if (error === 2) throw new Error('test')
    } catch (e) {
    }
    error++
} while (error < 5)

// ✅ 测试12：do-while中的return
function doWhileReturn() {
    let pos = 0
    do {
        if (pos === 42) return pos
        pos++
    } while (pos < 100)
}

// ✅ 测试13：do-while中的块语句
let block = 0
do {
    {
        let temp = block * 2
        console.log(temp)
    }
    block++
} while (block < 5)

// ✅ 测试14：使用对象属性作为条件
let data = { index: 0 }
do {
    console.log(data.index)
    data.index++
} while (data.index < 5)

// ✅ 测试15：复杂循环场景
let total = 0
do {
    if (total === 0) {
        console.log('start')
    } else if (total === 4) {
        console.log('end')
    }
    total++
} while (total < 5)

/* Es6Parser.ts: DoWhileStatement: do Statement while ( Expression ) */


// ============================================
// 合并来自: EmptyStatement-001.js
// ============================================


/* Es6Parser.ts: ; */


// ============================================
// 来自文件: 303-EmptyStatement.js
// ============================================


/* Es6Parser.ts: ; */


// ============================================
// 来自文件: 404-EmptyStatement.js
// ============================================

/**
 * 规则测试：EmptyStatement
 * 
 * 位置：Es6Parser.ts Line 1114
 * 分类：statements
 * 编号：404
 * 
 * 规则特征：
 * - 简单规则：直接调用EmptySemicolon
 * 
 * 规则语法：
 *   EmptyStatement:
 *     ;?
 * 
 * 测试目标：
 * - 测试空语句（分号）
 * - 在各种上下文中使用
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：单个分号
;

// ✅ 测试2：多个分号
;;
/* Es6Parser.ts: EmptyStatement */


// ============================================
// 来自文件: 708-EmptyStatement.js
// ============================================

/**
 * 规则测试：EmptyStatement
 * 分类：others | 编号：708
 * 
 * 规则定义（Es6Parser.ts）：
 * EmptyStatement:
 *   ;
 * 
 * 中文说明：
 * ✓ 空语句只是一个分号
 * ✓ 不执行任何操作
 * ✓ 通常在语法需要语句但没有操作时使用
 * ✓ 可能是无意中遗漏代码
 * 
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1：基本空语句
;

// ✅ 测试2：if中的空语句
if (true);

// ✅ 测试3：if-else中的空语句
if (false) {
    console.log('no')
} else ;

// ✅ 测试4：for循环中的空语句
for (let i = 0; i < 5; i++);

// ✅ 测试5：while循环中的空语句
let count = 0
while (count < 3) count++;

// ✅ 测试6：do-while中的空语句
let x = 0
do ; while (x < 1)

// ✅ 测试7：无限循环with空语句
for (;;) {
    break
}

// ✅ 测试8：空语句in块
{
    ;
    console.log('after empty')
}

// ✅ 测试9：多个连续空语句
;;;

// ✅ 测试10：标记空语句
label: ;

// ✅ 测试11：空语句in try-catch
try {
    ;
} catch (e) {
    ;
}

// ✅ 测试12：finally中的空语句
try {
    console.log('try')
} finally ;

// ✅ 测试13：switch中的空语句
switch (1) {
    case 1:
        ;
        break
    default:
        ;
}

// ✅ 测试14：函数中的空语句
function test() {
    ;
    return 42
}

// ✅ 测试15：循环体全是空语句
for (let i = 0; i < 2; i++) {
    ;
}

/* Es6Parser.ts: EmptyStatement
 * 规则：
 * EmptyStatement:
 *   ;
 */


// ============================================
// 合并来自: ForInOfStatement-001.js
// ============================================

/**
 * 规则测试：ForInOfStatement
 * 
 * 位置：Es6Parser.ts Line 1179
 * 分类：statements
 * 编号：410
 * 
 * 规则特征：
 * ✓ 包含Or规则（2处）- for-in vs for-of
 * 
 * 规则语法：
 *   ForInOfStatement:
 *     for ( LeftHandSideExpression in Expression ) Statement
 *     for ( LeftHandSideExpression of Expression ) Statement
 * 
 * 测试目标：
 * - 覆盖Or分支：for-in和for-of
 * - 验证各种迭代对象（对象、数组、Set、Map）
 * - 覆盖嵌套和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Or分支1 - for-in 对象迭代
const obj = { a: 1, b: 2, c: 3 }
for (let key in obj) {
    console.log(key, obj[key])
}

// ✅ 测试2：Or分支1 - for-in 数组迭代
const arr = [10, 20, 30]
for (let index in arr) {
    console.log(index, arr[index])
}

// ✅ 测试3：Or分支2 - for-of 数组迭代
for (let value of arr) {
    console.log(value)
}

// ✅ 测试4：Or分支2 - for-of 字符串迭代
const str = 'hello'
for (let char of str) {
    console.log(char)
}

// ✅ 测试5：for-of Set迭代
const set = new Set([1, 2, 3])
for (let value of set) {
    console.log(value)
}

// ✅ 测试6：for-of Map迭代
const map = new Map([['a', 1], ['b', 2]])
for (let [key, value] of map) {
    console.log(key, value)
}

// ✅ 测试7：for-in 与break
for (let prop in obj) {
    if (prop === 'b') break
    console.log(prop)
}

// ✅ 测试8：for-of 与continue
for (let val of arr) {
    if (val === 20) continue
    console.log(val)
}

// ✅ 测试9：嵌套for-in
const nested = { outer: { inner: 'value' } }
for (let key1 in nested) {
    for (let key2 in nested[key1]) {
        console.log(key1, key2)
    }
}

// ✅ 测试10：嵌套for-of
const matrix = [[1, 2], [3, 4]]
for (let row of matrix) {
    for (let cell of row) {
        console.log(cell)
    }
}

// ✅ 测试11：for-in 对象属性迭代
const person = { name: 'Alice', age: 30 }
for (let prop in person) {
    console.log(`${prop}: ${person[prop]}`)
}

// ✅ 测试12：for-of 可迭代对象
const iterable = {
    [Symbol.iterator]: function() {
        let count = 0
        return {
            next: () => ({
                value: count++,
                done: count > 3        }
    }
}
for (let val of iterable) {
    console.log(val)
}

// ✅ 测试13：for-of 生成器
function* generator() {
    yield 1
    yield 2
    yield 3
}
for (let val of generator()) {
    console.log(val)
}

// ✅ 测试14：for-in 与复杂语句
for (let key in obj) {
    if (key.length > 1) {
        try {
            console.log(obj[key])
        } catch (e) {
        }
    }
}

// ✅ 测试15：for-of 与解构模式
const pairs = [[1, 'a'], [2, 'b'], [3, 'c']]
for (let [num, letter] of pairs) {
    console.log(`${num}: ${letter}`)
}

/* Es6Parser.ts: ForInOfStatement: for ( LeftHandSideExpression in|of Expression ) Statement */


// ============================================
// 合并来自: ForStatement-001.js
// ============================================

/**
 * 规则测试：ForStatement
 * 
 * 位置：Es6Parser.ts Line 1168
 * 分类：statements
 * 编号：409
 * 
 * 规则特征：
 * - for循环语句：for ( Init ; Test ; Update ) Statement
 * - 三个部分都可选（Option）
 * 
 * 规则语法：
 *   ForStatement:
 *     for ( VariableDeclaration? ; Expression? ; Expression? ) Statement
 * 
 * 测试目标：
 * - 覆盖三个部分的有/无组合
 * - 验证各种初始化、条件、更新形式
 * - 覆盖嵌套和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：标准三部分for循环
for (let i = 0; i < 10; i++) {
    console.log(i)
}

// ✅ 测试2：多个初始化变量
for (let a = 0, b = 10; a < b; a++, b--) {
    console.log(a, b)
}

// ✅ 测试3：复杂条件
for (let x = 0; x < 100 && x !== 50; x += 2) {
    console.log(x)
}

// ✅ 测试4：复杂更新表达式
for (let i = 0; i < 10; i++, i *= 2) {
    console.log(i)
}

// ✅ 测试5：无初始化（使用已有变量）
let start = 0
for (; start < 5; start++) {
    console.log(start)
}

// ✅ 测试6：无条件（无限循环，需break）
for (let i = 0; ; i++) {
    if (i > 5) break
    console.log(i)
}

// ✅ 测试7：无更新
for (let i = 0; i < 3;) {
    console.log(i)
    i++
}

// ✅ 测试8：仅初始化
for (let i = 0; ; ) {
    if (i > 2) break
    console.log(i)
    i++
}

// ✅ 测试9：完全空循环
for (;;) {
    break
}

// ✅ 测试10：嵌套for循环
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        console.log(i, j)
    }
}

// ✅ 测试11：for循环中的break
for (let i = 0; i < 100; i++) {
    if (i === 5) break
    console.log(i)
}

// ✅ 测试12：for循环中的continue
for (let i = 0; i < 10; i++) {
    if (i === 5) continue
    console.log(i)
}

// ✅ 测试13：for循环中的return
function forReturn() {
    for (let i = 0; i < 100; i++) {
        if (i === 42) return i
    }
}

// ✅ 测试14：for循环中的复杂语句
for (let i = 0; i < 5; i++) {
    if (i % 2 === 0) {
        console.log('even', i)
    } else {
        try {
            console.log('odd', i)
        } catch (e) {
        }
    }
}

// ✅ 测试15：三层嵌套for
for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
        for (let k = 0; k < 2; k++) {
            console.log(i, j, k)
        }
    }
}

/* Es6Parser.ts: ForStatement: for ( VariableDeclaration? ; Expression? ; Expression? ) Statement */


// ============================================
// 合并来自: IfStatement-001.js
// ============================================


/* Es6Parser.ts: if (Expression) Statement (else Statement)? */


// ============================================
// 来自文件: 405-IfStatement.js
// ============================================

/**
 * 规则测试：IfStatement
 * 
 * 位置：Es6Parser.ts Line 1126
 * 分类：statements
 * 编号：405
 * 
 * 规则特征：
 * ✓ 包含Option（1处）- else 分支可选
 * 
 * 规则语法：
 *   IfStatement:
 *     if ( Expression ) Statement
 *     if ( Expression ) Statement else Statement
 * 
 * 测试目标：
 * - 覆盖Option无：if语句（无else）
 * - 覆盖Option有：if-else语句（有else）
 * - 验证各种条件表达式
 * - 验证嵌套if语句
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Option无 - 纯 if 语句
if (true) {
    console.log('always')
}

// ✅ 测试2：Option无 - if 带简单条件
const x = 5
if (x > 0) {
    console.log('positive')
}

// ✅ 测试3：Option无 - if 带复杂条件
if (x > 0 && x < 10) {
    console.log('in range')
}

// ✅ 测试4：Option有 - 基础 if-else
if (x > 0) {
    console.log('positive')
} else {
    console.log('non-positive')
}

// ✅ 测试5：Option有 - if-else else
if (x > 0) {
    console.log('positive')
} else if (x === 0) {
    console.log('zero')
} else {
    console.log('negative')
}

// ✅ 测试6：Option无 - 单行 if
if (x > 0) console.log('positive')

// ✅ 测试7：Option有 - 单行 if-else
if (x > 0) console.log('yes')
else console.log('no')

// ✅ 测试8：嵌套 if 语句
if (x > 0) {
    if (x < 10) {
        console.log('small positive')
    }
}

// ✅ 测试9：嵌套 if-else
if (x > 0) {
    if (x < 10) {
        console.log('small positive')
    } else {
        console.log('large positive')
    }
} else {
    console.log('non-positive')
}

// ✅ 测试10：条件表达式中的赋值
let result
if (x > 0) {
    result = 'positive'
} else {
    result = 'non-positive'
}

// ✅ 测试11：在循环中的 if 语句
for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) {
        console.log(i)
    }
}

// ✅ 测试12：在函数中的 if 语句
function checkValue(v) {
    if (v > 0) {
        return 'positive'
    } else {
        return 'non-positive'
    }
}

// ✅ 测试13：多个 else if
if (x === 1) {
    console.log('one')
} else if (x === 2) {
    console.log('two')
} else if (x === 3) {
    console.log('three')
} else {
    console.log('other')
}

// ✅ 测试14：复杂条件
if (x > 0 && (y < 10 || z === 0)) {
    console.log('complex')
} else {
    console.log('simple')
}

// ✅ 测试15：方法调用在条件中
const str = 'hello'
if (str.length > 0) {
    console.log('not empty')
}

/* Es6Parser.ts: IfStatement: if ( Expression ) Statement else? Statement */


// ============================================
// 合并来自: IterationStatement-001.js
// ============================================

/**
 * 规则测试：IterationStatement
 * 
 * 位置：Es6Parser.ts Line 1139
 * 分类：statements
 * 编号：406
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

for (let i = 0; i < 10; i++) {}
while (true) { break }
do {} while (false)
for (const x of arr) {}

/* Es6Parser.ts: IterationStatement */


// ============================================
// 合并来自: IterationStatementDoWhile-001.js
// ============================================


/* Es6Parser.ts: do Statement while (Expression) */


// ============================================
// 合并来自: IterationStatementFor-001.js
// ============================================


/* Es6Parser.ts: for (VariableDeclaration? Expression? Expression?) Statement */


// ============================================
// 合并来自: IterationStatementForIn-001.js
// ============================================


/* Es6Parser.ts: for (VariableDeclaration in Expression) Statement */


// ============================================
// 合并来自: IterationStatementForOf-001.js
// ============================================


/* Es6Parser.ts: for (VariableDeclaration of Expression) Statement */


// ============================================
// 合并来自: IterationStatementWhile-001.js
// ============================================


/* Es6Parser.ts: while (Expression) Statement */


// ============================================
// 合并来自: LabeledStatement-001.js
// ============================================

/**
 * 规则测试：LabeledStatement
 * 分类：statements | 编号：422
 * 
 * 规则定义（Es6Parser.ts - 直接来自Parser）：
 * LabeledStatement:
 *   LabelIdentifier : LabelledItem
 * 
 * LabelledItem:
 *   Statement
 *   FunctionDeclaration
 *   ClassDeclaration
 * 
 * 中文说明：
 * ✓ 标签语句由标签标识符、冒号和被标记的项组成
 * ✓ 被标记的项可以是语句、函数声明或类声明
 * ✓ 用于break/continue的目标标记
 * 
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1：LabelledItem - 简单语句
myLabel: {
    console.log("labeled block")
}

// ✅ 测试2：LabelledItem - break到标签
outerLoop: {
    for (let i = 0; i < 3; i++) {
        if (i === 2) {
            break outerLoop
        }
        console.log(i)
    }
}

// ✅ 测试3：LabelledItem - continue到标签
outerFor: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (j === 1) {
            continue outerFor
        }
        console.log(i, j)
    }
}

// ✅ 测试4：LabelledItem - if语句
testIf: if (true) {
    console.log("labeled if")
}

// ✅ 测试5：LabelledItem - while循环
whileLoop: while (true) {
    break whileLoop
}

// ✅ 测试6：LabelledItem - do-while循环
doWhileLoop: do {
    break doWhileLoop
} while (false)

// ✅ 测试7：LabelledItem - for循环
forLabel: for (let i = 0; i < 5; i++) {
    if (i === 3) {
        break forLabel
    }
    console.log(i)
}

// ✅ 测试8：LabelledItem - for-in循环
forInLabel: for (const key in {a: 1, b: 2}) {
    if (key === 'b') {
        break forInLabel
    }
    console.log(key)
}

// ✅ 测试9：LabelledItem - for-of循环
forOfLabel: for (const item of [1, 2, 3]) {
    if (item === 2) {
        break forOfLabel
    }
    console.log(item)
}

// ✅ 测试10：LabelledItem - switch语句
switchLabel: switch (1) {
    case 1:
        console.log("switch")
        break switchLabel
}

// ✅ 测试11：LabelledItem - try-catch
tryLabel: try {
    throw new Error("test")
} catch (e) {
    break tryLabel
}

// ✅ 测试12：LabelledItem - 嵌套标签
outerLabel: {
    innerLabel: {
        console.log("nested labels")
        break outerLabel
    }
}

// ✅ 测试13：LabelledItem - FunctionDeclaration
myFunc: function test() {
    return "labeled function"
}

// ✅ 测试14：LabelledItem - ClassDeclaration
myClass: class Test {
    method() {
        return "labeled class"
    }
}

// ✅ 测试15：LabelledItem - 块语句
blockLabel: {
    let x = 10
    console.log(x)
    break blockLabel
}

/* Es6Parser.ts: LabeledStatement
 * 规则：
 * LabeledStatement:
 *   LabelIdentifier : LabelledItem
 * 
 * LabelledItem:
 *   Statement
 *   FunctionDeclaration
 *   ClassDeclaration
 */


// ============================================
// 合并来自: LabelledStatement-001.js
// ============================================


/* Es6Parser.ts: Label : Statement */


// ============================================
// 来自文件: 417-LabelledStatement.js
// ============================================

/**
 * 规则测试：LabelledStatement
 * 
 * 位置：Es6Parser.ts Line 1340
 * 分类：statements
 * 编号：417
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

label1: for (;;) { break label1 }
outer: while (true) { break outer }

/* Es6Parser.ts: LabelledStatement */


// ============================================
// 合并来自: ReturnStatement-001.js
// ============================================


/* Es6Parser.ts: return Expression? */


// ============================================
// 来自文件: 402-ReturnStatement.js
// ============================================

/**
 * 规则测试：ReturnStatement
 * 
 * 位置：Es6Parser.ts Line 1244
 * 分类：statements
 * 编号：402
 * 
 * 规则语法：
 *   ReturnStatement:
 *     return Expression? ;
 * 
 * 测试目标：
 * - 验证无返回值的return
 * - 验证有返回值的return
 * - 覆盖各种返回值类型
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：无返回值
function test1() {
    return
}

// ✅ 测试2：返回字面量
function test2() {
    return 42
}

// ✅ 测试3：返回字符串
function test3() {
    return 'hello'
}

// ✅ 测试4：返回布尔值
function test4() {
    return true
}

// ✅ 测试5：返回变量
function test5() {
    const x = 10
    return x
}

// ✅ 测试6：返回表达式
function test6() {
    return 1 + 2 * 3
}

// ✅ 测试7：返回对象
function test7() {
    return { x: 1, y: 2 }
}

// ✅ 测试8：返回数组
function test8() {
    return [1, 2, 3]
}

// ✅ 测试9：返回函数调用结果
function test9() {
    return Math.max(1, 2, 3)
}

// ✅ 测试10：返回箭头函数
function test10() {
    return (x) => x * 2
}

// ✅ 测试11：条件返回
function test11(x) {
    if (x > 0) {
        return 'positive'
    } else {
        return 'negative'
    }
}

// ✅ 测试12：循环中的return
function test12() {
    for (let i = 0; i < 10; i++) {
        if (i === 5) return i
    }
}

// ✅ 测试13：return await表达式
async function test13() {
    return await Promise.resolve(42)
}

// ✅ 测试14：返回null/undefined
function test14() {
    return null
}

// ✅ 测试15：多个return分支
function test15(x) {
    if (x < 0) return 'negative'
    if (x === 0) return 'zero'
    if (x > 0) return 'positive'
}

/* Es6Parser.ts: ReturnStatement: return Expression? ; */


// ============================================
// 来自文件: 414-ReturnStatement.js
// ============================================

/**
 * 规则测试：ReturnStatement
 * 
 * 位置：Es6Parser.ts Line 1281
 * 分类：statements
 * 编号：414
 * 
 * 规则特征：
 * ✓ 包含Option（1处）- Expression可选
 * 
 * 规则语法：
 *   ReturnStatement:
 *     return Expression? ;?
 * 
 * 测试目标：
 * - 测试Option无（无返回值）
 * - 测试Option有（有返回值）
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Option无 - 无返回值
function none() {
    return
}

// ✅ 测试2：Option无 - void函数
function log(msg) {
    console.log(msg)
    return
}

// ✅ 测试3：Option有 - 返回基础值
function get() {
    return 42
}

// ✅ 测试4：Option有 - 返回表达式
function sum(a, b) {
    return a + b
}

// ✅ 测试5：返回对象
function createUser(name) {
    return {name, age: 0}
}

// ✅ 测试6：返回数组
function range(n) {
    return [1, 2, 3, n]
}

// ✅ 测试7：返回函数
function makeAdder(x) {
    return function(y) {
        return x + y
    }
}

// ✅ 测试8：条件返回
function abs(n) {
    if (n < 0) return -n
    return n
}

function test() { return 42 }
function none() { return }
function complex() { return {a: 1, b: 2} }

/* Es6Parser.ts: ReturnStatement */


// ============================================
// 合并来自: StatementList-001.js
// ============================================

/**
 * 规则测试：StatementList
 * 
 * 位置：Es6Parser.ts Line 1726
 * 分类：statements
 * 编号：424
 * 
 * 规则特征：
 * ✓ 包含Many（1处）
 * 
 * 测试目标：
 * - 验证规则的基本功能


 * - 测试Many的0/1/多种情况
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（基础测试）
 */

const x = 1
const y = 2
console.log(x + y)

/* Es6Parser.ts: StatementList */


// ============================================
// 合并来自: StatementListItem-001.js
// ============================================

/**
 * 规则测试：StatementListItem
 * 
 * 位置：Es6Parser.ts Line 1733
 * 分类：statements
 * 编号：425
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

const x = 1
function test() {}
class MyClass {}

/* Es6Parser.ts: StatementListItem */


// ============================================
// 合并来自: SwitchStatement-001.js
// ============================================


/* Es6Parser.ts: switch (Expression) CaseBlock */


// ============================================
// 来自文件: 416-SwitchStatement.js
// ============================================

/**
 * 规则测试：SwitchStatement
 * 
 * 位置：Es6Parser.ts Line 1300
 * 分类：statements
 * 编号：416
 * 
 * 规则语法：
 *   SwitchStatement:
 *     switch ( Expression ) CaseBlock
 *   CaseBlock:
 *     { CaseClause* DefaultClause? CaseClause* }
 * 
 * 测试目标：
 * - 验证各种case子句组合
 * - 验证default子句
 * - 覆盖fall-through和break场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本switch-case
let x = 1
switch (x) {
    case 1:
        console.log('one')
        break
    case 2:
        console.log('two')
        break
}

// ✅ 测试2：包含default
switch (x) {
    case 1:
        console.log('one')
        break
    default:
        console.log('other')
        break
}

// ✅ 测试3：多个case
let val = 3
switch (val) {
    case 1:
        console.log('one')
        break
    case 2:
        console.log('two')
        break
    case 3:
        console.log('three')
        break
    case 4:
        console.log('four')
        break
}

// ✅ 测试4：fall-through（无break）
let num = 1
switch (num) {
    case 1:
    case 2:
    case 3:
        console.log('1-3')
        break
    case 4:
    case 5:
        console.log('4-5')
        break
}

// ✅ 测试5：复杂表达式作为discriminant
let obj = { type: 'user' }
switch (obj.type) {
    case 'user':
        console.log('is user')
        break
    case 'admin':
        console.log('is admin')
        break
}

// ✅ 测试6：switch中的块语句
switch (x) {
    case 1: {
        const temp = x * 2
        console.log(temp)
        break
    }
    case 2: {
        console.log('case 2')
        break
    }
}

// ✅ 测试7：switch中的if-else
switch (x) {
    case 1:
        if (x > 0) {
            console.log('positive')
        }
        break
    case 2:
        console.log('two')
        break
}

// ✅ 测试8：switch中的for循环
switch (x) {
    case 1:
        for (let i = 0; i < 3; i++) {
            console.log(i)
        }
        break
    case 2:
        console.log('two')
        break
}

// ✅ 测试9：switch中的try-catch
switch (x) {
    case 1:
        try {
            console.log('try')
        } catch (e) {
            console.log('error')
        }
        break
}

// ✅ 测试10：嵌套switch
switch (x) {
    case 1:
        switch (val) {
            case 1:
                console.log('inner 1')
                break
            case 2:
                console.log('inner 2')
                break
        }
        break
    case 2:
        console.log('outer 2')
        break
}

// ✅ 测试11：字符串case
let str = 'hello'
switch (str) {
    case 'hello':
        console.log('greeting')
        break
    case 'bye':
        console.log('farewell')
        break
    default:
        console.log('unknown')
        break
}

// ✅ 测试12：仅default
switch (x) {
    default:
        console.log('default only')
        break
}

// ✅ 测试13：无break的fall-through完整示例
switch (x) {
    case 1:
        console.log('start')
    case 2:
        console.log('mid')
    case 3:
        console.log('end')
        break
    default:
        console.log('default')
}

// ✅ 测试14：switch中的return
function switchReturn() {
    switch (x) {
        case 1:
            return 'one'
        case 2:
            return 'two'
        default:
            return 'other'
    }
}

// ✅ 测试15：复杂switch场景
let code = 'error'
switch (code) {
    case 'success':
        console.log('✓ Success')
        break
    case 'warning':
        console.log('⚠ Warning')
        break
    case 'error':
        console.log('✗ Error')
        for (let i = 0; i < 3; i++) {
            console.log(`  attempt ${i}`)
        }
        break
    default:
        try {
            console.log('Unknown code: ' + code)
        } catch (e) {
            console.log('Error handling error')
        }
}

/* Es6Parser.ts: SwitchStatement: switch ( Expression ) CaseBlock */


// ============================================
// 合并来自: ThrowStatement-001.js
// ============================================


/* Es6Parser.ts: throw Expression */


// ============================================
// 来自文件: 418-ThrowStatement.js
// ============================================

/**
 * 规则测试：ThrowStatement
 * 
 * 位置：Es6Parser.ts Line 1355
 * 分类：statements
 * 编号：418
 * 
 * 规则特征：
 * - 简单规则：throw Expression
 * 
 * 规则语法：
 *   ThrowStatement:
 *     throw Expression ;?
 * 
 * 测试目标：
 * - 测试抛出各种类型的异常
 * - 测试在不同场景中使用
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：抛出Error对象
function error1() {
    throw new Error('test')
}

/* Es6Parser.ts: ThrowStatement */


// ============================================
// 来自文件: 421-ThrowStatement.js
// ============================================

/**
 * 规则测试：ThrowStatement
 * 分类：statements | 编号：421
 * 
 * 规则定义（Es6Parser.ts）：
 * ThrowStatement:
 *   throw Expression
 * 
 * 规则特征：
 * ✓ 固定形式 - throw关键字后跟表达式
 * ✓ 表达式类型 - 各种表达式都可以throw
 * ✓ 控制流 - 打断执行流程
 * 
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1：throw字符串
try {
    throw "error message"
} catch (e) {
    console.log(e)
}

// ✅ 测试2：throw数字
try {
    throw 404
} catch (e) {
    console.log(e)
}

// ✅ 测试3：throw Error对象
try {
    throw new Error("Something went wrong")
} catch (e) {
    console.log(e.message)
}

// ✅ 测试4：throw自定义Error
try {
    throw new TypeError("Type error occurred")
} catch (e) {
    console.log(e)
}

// ✅ 测试5：throw对象字面量
try {
    throw { code: 500, message: "Server error" }
} catch (e) {
    console.log(e.code)
}

// ✅ 测试6：throw数组
try {
    throw [1, 2, 3, "error"]
} catch (e) {
    console.log(e)
}

// ✅ 测试7：throw函数调用结果
function getError() {
    return new Error("Function error")
}
try {
    throw getError()
} catch (e) {
    console.log(e.message)
}

// ✅ 测试8：throw条件表达式
try {
    throw (Math.random() > 0.5 ? new Error("Random error") : "Random message")
} catch (e) {
    console.log(e)
}

// ✅ 测试9：throw变量
const err = new Error("Variable error")
try {
    throw err
} catch (e) {
    console.log(e.message)
}

// ✅ 测试10：throw对象属性
const errorObj = { err: new Error("Property error") }
try {
    throw errorObj.err
} catch (e) {
    console.log(e.message)
}

// ✅ 测试11：throw在条件中
try {
    if (true) {
        throw new Error("Conditional throw")
    }
} catch (e) {
    console.log(e)
}

// ✅ 测试12：throw在循环中
try {
    for (let i = 0; i < 5; i++) {
        if (i === 3) {
            throw new Error("Loop error at " + i)
        }
    }
} catch (e) {
    console.log(e.message)
}

// ✅ 测试13：throw在函数中
function throwError() {
    throw new Error("Function throw")
}
try {
    throwError()
} catch (e) {
    console.log(e.message)
}

// ✅ 测试14：throw ReferenceError
try {
    throw new ReferenceError("Undefined variable")
} catch (e) {
    console.log(e.name)
}

// ✅ 测试15：throw复杂表达式
try {
    throw new Error("Error: " + (1 + 1) + " is not 3")
} catch (e) {
    console.log(e.message)
}

/* Es6Parser.ts: ThrowStatement
 * 规则形式：throw Expression
 * 表达式可以是：
 *   - 字面量（字符串、数字等）
 *   - Error对象
 *   - 对象字面量/数组字面量
 *   - 函数调用
 *   - 条件表达式
 *   - 变量
 *   - 成员表达式
 */


// ============================================
// 合并来自: TryStatement-001.js
// ============================================


/* Es6Parser.ts: try Block (Catch | Finally | Catch Finally) */


// ============================================
// 来自文件: 419-TryStatement.js
// ============================================

/**
 * 规则测试：TryStatement
 * 
 * 位置：Es6Parser.ts Line 1288
 * 分类：statements
 * 编号：419
 * 
 * 规则语法：
 *   TryStatement:
 *     try Block Catch
 *     try Block Finally
 *     try Block Catch Finally
 * 
 * 测试目标：
 * - 覆盖try-catch、try-finally、try-catch-finally
 * - 验证catch参数和finally执行
 * - 覆盖各种异常处理场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本try-catch
try {
    console.log('try')
} catch (e) {
    console.log('error')
}

// ✅ 测试2：try-finally（无catch）
try {
    console.log('try')
} finally {
    console.log('finally')
}

// ✅ 测试3：try-catch-finally（完整）
try {
    console.log('try')
} catch (e) {
    console.log('catch')
} finally {
    console.log('finally')
}

// ✅ 测试4：throw异常
try {
    throw new Error('test error')
} catch (e) {
    console.log(e.message)
}

// ✅ 测试5：自定义Error对象
try {
    throw { code: 'CUSTOM', msg: 'custom error' }
} catch (err) {
    console.log(err.code)
}

// ✅ 测试6：catch中的异常处理
try {
    throw new Error('first')
} catch (e) {
    try {
        throw new Error('second')
    } catch (e2) {
        console.log(e2.message)
    }
}

// ✅ 测试7：finally中的代码保证执行
let finally_executed = false
try {
    throw new Error('test')
} catch (e) {
    console.log('caught')
} finally {
    finally_executed = true
}

// ✅ 测试8：try中的return和finally
function tryReturn() {
    try {
        return 'from try'
    } finally {
        console.log('in finally')
    }
}

// ✅ 测试9：catch中的return和finally
function catchReturn() {
    try {
        throw new Error('error')
    } catch (e) {
        return 'from catch'
    } finally {
        console.log('in finally')
    }
}

// ✅ 测试10：嵌套try-catch
try {
    try {
        throw new Error('inner error')
    } catch (e) {
        console.log('inner catch')
        throw new Error('rethrow')
    }
} catch (e) {
    console.log('outer catch')
}

// ✅ 测试11：try-catch中的循环
try {
    for (let i = 0; i < 5; i++) {
        if (i === 3) throw new Error('at 3')
        console.log(i)
    }
} catch (e) {
    console.log('loop error')
}

// ✅ 测试12：try中的函数调用
function mayThrow() {
    throw new Error('function error')
}
try {
    mayThrow()
} catch (e) {
    console.log('caught function error')
}

// ✅ 测试13：finally中的异常
try {
    console.log('try')
} finally {
    throw new Error('finally error')
}

// ✅ 测试14：复杂异常处理
try {
    const obj = null
    console.log(obj.property)
} catch (e) {
    if (e instanceof TypeError) {
        console.log('type error')
    } else {
        console.log('other error')
    }
} finally {
    console.log('cleanup')
}

// ✅ 测试15：完整异常处理场景
function processData(data) {
    try {
        if (!data) throw new Error('No data')
        const result = JSON.parse(data)
        return result
    } catch (e) {
        console.log('Parse error: ' + e.message)
        return null
    } finally {
        console.log('Done processing')
    }
}

/* Es6Parser.ts: TryStatement: try Block (Catch | Finally | Catch Finally) */


// ============================================
// 合并来自: VariableStatement-001.js
// ============================================

/**
 * 规则测试：VariableStatement
 * 
 * 位置：Es6Parser.ts Line 1135
 * 分类：statements
 * 编号：302
 * 
 * 规则语法：
 *   VariableStatement:
 *     var VariableDeclarationList ;
 * 
 * 测试目标：
 * - 验证var关键字声明
 * - 验证多变量声明
 * - 覆盖各种初始化形式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：单个var声明
var x = 1

// ✅ 测试2：多个var声明
var a = 1, b = 2, c = 3

// ✅ 测试3：无初始值的var
var uninitialized

// ✅ 测试4：混合有/无初始值
var init = 42, noinit, another = 'test'

// ✅ 测试5：var在全局作用域
var globalVar = 'global'

// ✅ 测试6：var在函数作用域
function testVarScope() {
    var funcVar = 'function scope'
    console.log(funcVar)
}

// ✅ 测试7：var提升特性
console.log(typeof hoisted)
var hoisted = 42

// ✅ 测试8：var在if语句中
if (true) {
    var ifVar = 'in if'
}
console.log(ifVar)

// ✅ 测试9：var在for循环中
for (var i = 0; i < 5; i++) {
    console.log(i)
}

// ✅ 测试10：var重新声明
var redeclare = 1
var redeclare = 2

// ✅ 测试11：var声明中的表达式初始值
var computed = 1 + 2 * 3

// ✅ 测试12：var声明对象初始值
var obj = { name: 'test', age: 25 }

// ✅ 测试13：var声明数组初始值
var arr = [1, 2, 3, 4, 5]

// ✅ 测试14：var声明函数初始值
var func = function() {
    return 42
}

// ✅ 测试15：复杂var声明组合
var p = 10, q = function() {}, r = { x: 1 }, s, t = [1, 2]

/* Es6Parser.ts: VariableStatement: var VariableDeclarationList ; */


// ============================================
// 合并来自: WhileStatement-001.js
// ============================================

/**
 * 规则测试：WhileStatement
 * 
 * 位置：Es6Parser.ts Line 1160
 * 分类：statements
 * 编号：408
 * 
 * 规则特征：
 * - 简单规则：while ( Expression ) Statement
 * - 无Or、Option、Many分支
 * 
 * 规则语法：
 *   WhileStatement:
 *     while ( Expression ) Statement
 * 
 * 测试目标：
 * - 验证条件表达式的各种形式
 * - 验证循环体的各种语句形式
 * - 覆盖边界情况和嵌套
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本while循环
while (true) {
    break
}

// ✅ 测试2：条件变量
let x = 0
while (x < 10) {
    x++
}

// ✅ 测试3：复杂条件
let i = 0
while (i < 100 && x > 0) {
    i++
}

// ✅ 测试4：单行循环体
let j = 5
while (j > 0) j--

// ✅ 测试5：空循环体
let k = 0
while (false) {
}

// ✅ 测试6：嵌套while
let a = 0, b = 0
while (a < 3) {
    while (b < 2) {
        b++
    }
    a++
    b = 0
}

// ✅ 测试7：while中的break
let count = 0
while (count < 100) {
    if (count === 5) break
    count++
}

// ✅ 测试8：while中的continue
let num = 0
while (num < 10) {
    num++
    if (num === 5) continue
    console.log(num)
}

// ✅ 测试9：while中的return
function searchWhile() {
    let pos = 0
    while (pos < 100) {
        if (pos === 42) return pos
        pos++
    }
}

// ✅ 测试10：while中的块语句
let val = 0
while (val < 5) {
    {
        let temp = val * 2
        console.log(temp)
    }
    val++
}

// ✅ 测试11：while中的if语句
let status = 0
while (status < 100) {
    if (status % 2 === 0) {
        console.log('even')
    } else {
        console.log('odd')
    }
    status++
}

// ✅ 测试12：while中的for循环
let outer = 0
while (outer < 3) {
    for (let inner = 0; inner < 2; inner++) {
        console.log(outer, inner)
    }
    outer++
}

// ✅ 测试13：while中的try-catch
let error = 0
while (error < 5) {
    try {
        if (error === 3) throw new Error('test')
    } catch (e) {
    }
    error++
}

// ✅ 测试14：条件表达式变化
let data = { count: 0 }
while (data.count < 10) {
    data.count++
}

// ✅ 测试15：复杂循环场景
function processLoop() {
    let index = 0
    while (index < 1000) {
        if (index === 0) {
            console.log('start')
        } else if (index === 500) {
            console.log('middle')
        } else if (index === 999) {
            break
        }
        index++
    }
}

/* Es6Parser.ts: WhileStatement: while ( Expression ) Statement */


// ============================================
// 合并来自: WithStatement-001.js
// ============================================

/**
 * 规则测试：WithStatement
 * 
 * 位置：Es6Parser.ts Line 1291
 * 分类：statements
 * 编号：415
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

with (Math) { const x = PI }

/* Es6Parser.ts: WithStatement */


// ============================================
// 来自文件: 709-WithStatement.js
// ============================================

/**
 * 规则测试：WithStatement
 * 分类：others | 编号：709
 * 
 * 规则定义（Es6Parser.ts）：
 * WithStatement:
 *   with ( Expression ) Statement
 * 
 * 中文说明：
 * ✓ with语句为对象的所有属性创建一个新的作用域
 * ✓ 包含表达式和语句
 * ✓ 在严格模式中被禁止
 * ✓ 不推荐使用（性能问题）
 * 
 * 状态：✅ 已完善（15个测试）
 */

// ✅ 测试1：基本with语句
const obj1 = { x: 1, y: 2 }
with (obj1) {
    console.log(x, y)
}

// ✅ 测试2：with - 单个属性访问
const obj2 = { name: 'test' }
with (obj2) {
    console.log(name)
}

// ✅ 测试3：with - 修改属性
const obj3 = { value: 0 }
with (obj3) {
    value = 10
}

// ✅ 测试4：with - 嵌套对象
const obj4 = { user: { name: 'John', age: 30 } }
with (obj4.user) {
    console.log(name, age)
}

// ✅ 测试5：with - 空语句
const obj5 = { x: 1 };
with (obj5);

// ✅ 测试6：with - if语句
const obj6 = { flag: true }
with (obj6) {
    if (flag) {
        console.log('flag is true')
    }
}

// ✅ 测试7：with - for循环
const obj7 = { items: [1, 2, 3] }
with (obj7) {
    for (const item of items) {
        console.log(item)
    }
}

// ✅ 测试8：with - while循环
const obj8 = { count: 0 }
with (obj8) {
    while (count < 3) {
        console.log(count)
        count++
    }
}

// ✅ 测试9：with - try-catch
const obj9 = { data: 'test' }
with (obj9) {
    try {
        console.log(data)
    } catch (e) {
        console.log('error')
    }
}

// ✅ 测试10：with - 块语句
const obj10 = { value: 42 }
with (obj10) {
    {
        console.log(value)
    }
}

// ✅ 测试11：with - 表达式对象
with ({x: 1, y: 2}) {
    console.log(x, y)
}

// ✅ 测试12：with - 函数调用结果
function getObject() {
    return {value: 'test'}
}
with (getObject()) {
    console.log(value)
}

// ✅ 测试13：with - 变量声明在with中
const obj13 = { x: 1 }
with (obj13) {
    let local = 10
    console.log(x, local)
}

// ✅ 测试14：嵌套with
const obj14a = {a: 1}
const obj14b = {b: 2}
with (obj14a) {
    with (obj14b) {
        console.log(b)
    }
}

// ✅ 测试15：with - switch语句
const obj15 = { status: 1 }
with (obj15) {
    switch (status) {
        case 1:
            console.log('active')
            break
        default:
            console.log('inactive')
    }
}

/* Es6Parser.ts: WithStatement
 * 规则：
 * WithStatement:
 *   with ( Expression ) Statement
 */

/**
 * 规则测试：Statement
 * 
 * 位置：Es6Parser.ts Line 855
 * 分类：statements
 * 编号：401
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 11个分支
 * 
 * 规则语法：
 *   Statement:
 *     BlockStatement
 *     VariableDeclaration
 *     EmptyStatement
 *     LabelledStatement          (长规则，需优先)
 *     ExpressionStatement
 *     IfStatement
 *     BreakableStatement
 *     ContinueStatement
 *     BreakStatement
 *     ReturnStatement
 *     WithStatement
 *     ThrowStatement
 *     TryStatement
 *     DebuggerStatement
 * 
 * 测试目标：
 * - 覆盖所有Or分支
 * - 验证LabelledStatement优先于ExpressionStatement
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：BlockStatement
{
    let x = 1
    const y = 2
}

// ✅ 测试2：VariableDeclaration
let a = 1
const b = 2
var c = 3

// ✅ 测试3：EmptyStatement
;

// ✅ 测试4：LabelledStatement (必须在ExpressionStatement之前匹配)
myLabel: for (let i = 0; i < 3; i++) {
    if (i === 1) break myLabel
}

// ✅ 测试5：ExpressionStatement
1 + 2
console.log('test')
obj.method()

// ✅ 测试6：IfStatement
if (true) {
    console.log('yes')
}

if (x > 0) {
    console.log('positive')
} else {
    console.log('negative')
}

// ✅ 测试7：BreakableStatement - for loop
for (let i = 0; i < 10; i++) {
    if (i === 5) break
}

// ✅ 测试8：BreakableStatement - while loop
while (true) {
    break
}

// ✅ 测试9：BreakableStatement - switch
switch (x) {
    case 1:
        break
    default:
        break
}

// ✅ 测试10：ContinueStatement
for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) continue
    console.log(i)
}

// ✅ 测试11：BreakStatement
for (let i = 0; i < 10; i++) {
    break
}

// ✅ 测试12：ReturnStatement
function test() {
    return 42
}

// ✅ 测试13：WithStatement
with (Math) {
    const r = round(3.14)
}

// ✅ 测试14：ThrowStatement
function error() {
    throw new Error('test')
}

// ✅ 测试15：TryStatement
try {
    riskyCode()
} catch (e) {
    console.error(e)
}

// ✅ 测试16：DebuggerStatement
debugger

/* Es6Parser.ts: Or[BlockStatement, VariableStatement, ...] */
