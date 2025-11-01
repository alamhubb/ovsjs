/**
 * 规则测试：Block
 * 
 * 位置：Es6Parser.ts Line 968
 * 分类：others
 * 编号：922
 * 
 * EBNF规则：
 *   Block:
 *     { StatementList? }
 * 
 * 测试目标：
 * - 测试空块
 * - 测试单语句块
 * - 测试多语句块
 * - 测试嵌套块
 * - 测试块级作用域
 * - 测试条件块
 * - 测试循环块
 * - 测试复杂块结构
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（8个测试用例）
 */

// ✅ 测试1：空块
{
}

// ✅ 测试2：单语句块
{
    let x = 1
}

// ✅ 测试3：多语句块
{
    let x = 1
    const y = 2
    var z = x + y
}

// ✅ 测试4：嵌套块
{
    let a = 1
    {
        let b = 2
        {
            let c = 3
        }
    }
}

// ✅ 测试5：块级作用域隔离
{
    let x = 'outer'
    {
        let x = 'inner'
    }
}

// ✅ 测试6：if语句块
if (true) {
    console.log('in block')
}

// ✅ 测试7：for循环块
for (let i = 0; i < 10; i++) {
    console.log(i)
}

// ✅ 测试8：复杂块结构（多层控制流）
{
    let counter = 0
    if (counter === 0) {
        {
            let temp = counter + 1
            counter = temp
        }
    }
    while (counter > 0) {
        {
            counter--
        }
    }
}

/* Es6Parser.ts: Block */
