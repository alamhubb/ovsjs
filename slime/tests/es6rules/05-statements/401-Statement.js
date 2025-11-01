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
