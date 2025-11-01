/**
 * 测试规则: ForStatement
 * 来源: 从 Statement 拆分
 *//**
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
