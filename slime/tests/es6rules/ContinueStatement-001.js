/**
 * 测试规则: ContinueStatement
 * 来源: 从 Statement 拆分
 */

// TODO: 添加 ContinueStatement 的完整测试用例
// 当前从 Statement 的内容中提取

const assert = require('assert');
const { parse } = require('../../packages/slime-parser');


});


/* Es6Parser.ts: continue Label? */

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
