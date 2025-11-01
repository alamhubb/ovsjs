
/* Es6Parser.ts: yield AssignmentExpression? */

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
// 合并来自: Yield-001.js
// ============================================


/* Es6Parser.ts: yield AssignmentExpression? */
