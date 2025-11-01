/**
 * 测试规则: BreakStatement
 * 来源: 从 Statement 拆分
 */

/* Es6Parser.ts: break Label? */

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

// ✅ 测试1：while循环中的break    BreakStatement -> break语句在WhileStatement中
while (true) {
    break
}

// ✅ 测试2：for循环中的break    BreakStatement -> break语句在ForStatement中
for (let i = 0; i < 100; i++) {
    if (i === 5) break
}

// ✅ 测试3：do-while循环中的break    BreakStatement -> break语句在DoWhileStatement中
do {
    break
} while (true)

// ✅ 测试4：switch中的break    BreakStatement -> break语句在SwitchStatement中
switch (1) {
    case 1:
        console.log('one')
        break
    case 2:
        console.log('two')
        break
}

// ✅ 测试5：嵌套循环中的break    BreakStatement -> break语句在嵌套ForStatement中
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (j === 1) break
    }
}

// ✅ 测试6：for-in循环中的break    BreakStatement -> break语句在ForInOfStatement中
for (let key in { a: 1, b: 2 }) {
    if (key === 'a') break
}

// ✅ 测试7：for-of循环中的break    BreakStatement -> break语句在ForInOfStatement中 (of分支)
for (let item of [1, 2, 3]) {
    if (item === 2) break
}

// ✅ 测试8：条件break    BreakStatement -> break语句在条件判断中
for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) break
}

// ✅ 测试9：复杂条件break    BreakStatement -> break语句在复杂条件中
while (true) {
    if (Math.random() > 0.5) {
        break
    }
}

// ✅ 测试10：try-catch中的break    BreakStatement -> break语句在TryStatement中
for (let i = 0; i < 5; i++) {
    try {
        if (i === 3) break
    } catch (e) {
    }
}

// ✅ 测试11：if语句中的break（在循环中）    BreakStatement -> break语句在IfStatement中
for (let i = 0; i < 5; i++) {
    if (true) {
        break
    }
}

// ✅ 测试12：多个break分支    BreakStatement -> 多个break语句分支
for (let i = 0; i < 10; i++) {
    if (i === 0) break
    if (i === 5) break
    if (i === 9) break
}

// ✅ 测试13：switch的multiple case下的break    BreakStatement -> break语句在多个case中
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

// ✅ 测试14：循环中嵌套if的break    BreakStatement -> 嵌套IfStatement中的break
for (let i = 0; i < 5; i++) {
    if (i > 2) {
        if (true) {
            break
        }
    }
}

// ✅ 测试15：实际场景：搜索循环    BreakStatement -> 实际应用（搜索）
function searchArray(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
            console.log('found')
            break
        }
    }
}

/* Es6Parser.ts: BreakStatement: break ; */
