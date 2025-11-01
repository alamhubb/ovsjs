/**
 * 规则测试：GeneratorDeclaration
 * 
 * 位置：Es6Parser.ts Line 1584
 * 分类：functions
 * 编号：506
 * 
 * 规则特征：
 * - Generator函数：function* Identifier ( FormalParameters ) { GeneratorBody }
 * 
 * 规则语法：
 *   GeneratorDeclaration:
 *     function* Identifier ( FormalParameters ) { GeneratorBody }
 * 
 * 测试目标：
 * - 验证generator函数声明
 * - 验证yield表达式
 * - 覆盖各种generator模式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本generator函数
function* gen() {
    yield 1
    yield 2
}

// ✅ 测试2：generator函数带参数
function* numbers(n) {
    for (let i = 0; i < n; i++) {
        yield i
    }
}

// ✅ 测试3：generator函数返回值
function* withReturn() {
    yield 1
    yield 2
    return 'done'
}

// ✅ 测试4：generator函数中的if语句
function* conditional(x) {
    if (x > 0) {
        yield 'positive'
    } else {
        yield 'negative'
    }
}

// ✅ 测试5：generator函数中的循环
function* loop(n) {
    for (let i = 0; i < n; i++) {
        yield i * 2
    }
}

// ✅ 测试6：generator函数中的while循环
function* whileLoop() {
    let i = 0
    while (i < 5) {
        yield i
        i++
    }
}

// ✅ 测试7：嵌套generator调用
function* nested() {
    yield 1
    yield* numbers(3)
    yield 4
}

// ✅ 测试8：generator中的try-catch
function* withTry() {
    try {
        yield 1
    } catch (e) {
        yield 'error'
    }
}

// ✅ 测试9：多个yield
function* multiYield() {
    yield 'a'
    yield 'b'
    yield 'c'
    yield 'd'
    yield 'e'
}

// ✅ 测试10：yield表达式的值
function* yieldValue() {
    const x = yield 1
    const y = yield 2
    yield x + y
}

// ✅ 测试11：generator中的for-of
function* forOf(arr) {
    for (let item of arr) {
        yield item * 2
    }
}

// ✅ 测试12：generator中的递归调用
function* fibonacci(n) {
    if (n <= 1) {
        yield n
    } else {
        yield* fibonacci(n - 1)
        yield n
    }
}

// ✅ 测试13：generator中的对象返回
function* objectGen() {
    yield { x: 1 }
    yield { y: 2 }
}

// ✅ 测试14：generator中的数组返回
function* arrayGen() {
    yield [1, 2, 3]
    yield [4, 5, 6]
}

// ✅ 测试15：复杂generator场景
function* complexGen(max) {
    for (let i = 0; i < max; i++) {
        if (i % 2 === 0) {
            yield i
        } else {
            yield i * 2
        }
    }
}

/* Es6Parser.ts: GeneratorDeclaration: function* Identifier ( FormalParameters ) { GeneratorBody } */
