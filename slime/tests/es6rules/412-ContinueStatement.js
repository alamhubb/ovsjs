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
