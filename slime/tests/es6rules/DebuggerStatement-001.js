/**
 * 测试规则: DebuggerStatement
 * 来源: 从 Statement 拆分
 *//**
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
