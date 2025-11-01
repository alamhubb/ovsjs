/**
 * 规则测试：BreakStatement
 * 
 * 位置：Es6Parser.ts Line 1271
 * 分类：statements
 * 编号：413
 * 
 * 规则特征：
 * ✓ 包含Option（1处）- LabelIdentifier可选
 * 
 * 规则语法：
 *   BreakStatement:
 *     break LabelIdentifier? ;?
 * 
 * 测试目标：
 * - 测试Option无（无标签）
 * - 测试Option有（带标签）
 * 
 * 创建时间：2025-11-01
 * 更新时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：Option无 - for循环中的break
for (let i = 0; i < 10; i++) {
    if (i === 5) break
}

// ✅ 测试2：Option无 - while循环中
while (true) {
    break
}

// ✅ 测试3：Option无 - do-while循环中
do {
    break
} while (true)

// ✅ 测试4：Option无 - switch中
switch (x) {
    case 1:
        console.log(1)
        break
    default:
        break
}

// ✅ 测试5：Option有 - 带标签的break
outer: for (let i = 0; i < 10; i++) {
    if (i === 5) break outer
}

// ✅ 测试6：Option有 - 嵌套循环跳出外层
outerLoop: for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (i + j === 4) break outerLoop
    }
}

// ✅ 测试7：块语句标签break
blockLabel: {
    console.log('start')
    if (condition) break blockLabel
    console.log('unreachable')
}

// ✅ 测试8：复杂嵌套
outer: for (let i = 0; i < 5; i++) {
    inner: for (let j = 0; j < 5; j++) {
        if (j === 2) break inner
        if (i + j === 6) break outer
    }
}