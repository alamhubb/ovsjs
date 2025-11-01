/**
 * 规则测试：FunctionDeclaration
 * 
 * 位置：Es6Parser.ts Line 210
 * 分类：functions
 * 编号：501
 * 
 * 规则特征：
 * - 函数声明：function Identifier ( FormalParameters ) { FunctionBody }
 * - 必须有函数名
 * 
 * 规则语法：
 *   FunctionDeclaration:
 *     function Identifier ( FormalParameters ) { FunctionBody }
 * 
 * 测试目标：
 * - 验证基本函数声明
 * - 验证各种参数形式
 * - 覆盖嵌套和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本函数声明
function greet() {
    console.log('hello')
}

// ✅ 测试2：带参数的函数
function add(a, b) {
    return a + b
}

// ✅ 测试3：多个参数
function multiply(x, y, z) {
    return x * y * z
}

// ✅ 测试4：默认参数
function withDefault(x = 10, y = 20) {
    return x + y
}

// ✅ 测试5：Rest参数
function variadic(...args) {
    return args.length
}

// ✅ 测试6：解构参数
function destructured({ x, y }) {
    return x + y
}

// ✅ 测试7：混合参数形式
function mixed(a, b = 2, ...rest) {
    return a + b + rest.length
}

// ✅ 测试8：无返回值函数
function printOnly(msg) {
    console.log(msg)
}

// ✅ 测试9：有返回值函数
function getValue() {
    return 42
}

// ✅ 测试10：递归函数
function factorial(n) {
    return n <= 1 ? 1 : n * factorial(n - 1)
}

// ✅ 测试11：嵌套函数声明
function outer() {
    function inner() {
        return 'inner'
    }
    return inner()
}

// ✅ 测试12：函数体中的块语句
function withBlock() {
    {
        const x = 1
        console.log(x)
    }
    {
        const y = 2
        console.log(y)
    }
}

// ✅ 测试13：函数体中的if-else
function conditional(x) {
    if (x > 0) {
        return 'positive'
    } else if (x < 0) {
        return 'negative'
    } else {
        return 'zero'
    }
}

// ✅ 测试14：函数体中的for循环
function sumTo(n) {
    let sum = 0
    for (let i = 1; i <= n; i++) {
        sum += i
    }
    return sum
}

// ✅ 测试15：复杂函数场景
function processArray(items, filter = true) {
    let result = []
    
    for (let item of items) {
        if (filter && item > 0) {
            result.push(item * 2)
        } else if (!filter) {
            result.push(item)
        }
    }
    
    return result.length > 0 ? result : null
}

/* Es6Parser.ts: FunctionDeclaration: function Identifier ( FormalParameters ) { FunctionBody } */
