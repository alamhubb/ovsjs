/**
 * 测试规则: BlockStatement
 * 来源: 从 Statement 拆分
 *//**
 * 规则测试：BlockStatement
 * 
 * 位置：Es6Parser.ts Line 1127
 * 分类：statements
 * 编号：301
 * 
 * 规则语法：
 *   BlockStatement:
 *     { StatementList? }
 * 
 * 测试目标：
 * - 覆盖空块和非空块
 * - 验证各种语句组合
 * - 覆盖作用域隔离
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：空块语句
{
}

// ✅ 测试2：单个语句块
{
    const x = 1
}

// ✅ 测试3：多个语句块
{
    const a = 1
    const b = 2
    console.log(a, b)
}

// ✅ 测试4：嵌套块
{
    const x = 1
    {
        const y = 2
        console.log(x, y)
    }
}

// ✅ 测试5：块中的if语句
{
    if (true) {
        console.log('yes')
    }
}

// ✅ 测试6：块中的for循环
{
    for (let i = 0; i < 3; i++) {
        console.log(i)
    }
}

// ✅ 测试7：块中的while循环
{
    let i = 0
    while (i < 3) {
        i++
    }
}

// ✅ 测试8：块中的try-catch
{
    try {
        throw new Error('test')
    } catch (e) {
    }
}

// ✅ 测试9：块中的函数声明
{
    function test() {
        return 42
    }
    console.log(test())
}

// ✅ 测试10：块中的类声明
{
    class MyClass {
        constructor(x) {
            this.x = x
        }
    }
    const obj = new MyClass(42)
}

// ✅ 测试11：块中的变量声明
{
    const x = 1
    let y = 2
    var z = 3
}

// ✅ 测试12：块中的表达式语句
{
    1 + 2
    console.log('done')
    x++
}

// ✅ 测试13：块中的return语句
function blockReturn() {
    {
        return 42
    }
}

// ✅ 测试14：块中的break语句
for (let i = 0; i < 10; i++) {
    {
        if (i === 5) break
    }
}

// ✅ 测试15：深层嵌套块
{
    {
        {
            {
                const deep = 'value'
                console.log(deep)
            }
        }
    }
}

/* Es6Parser.ts: BlockStatement: { StatementList? } */

/**
 * 规则测试：BlockStatement
 * 
 * 位置：Es6Parser.ts Line 963
 * 分类：statements
 * 编号：403
 * 
 * 规则特征：
 * 简单规则
 * 
 * 测试目标：
 * - 验证规则的基本功能



 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（基础测试）
 */

{
    let x = 1
    const y = 2
}

/* Es6Parser.ts: BlockStatement */
