/**
 * 测试规则: DoWhileStatement
 * 来源: 从 Statement 拆分
 */

// TODO: 添加 DoWhileStatement 的完整测试用例
// 当前从 Statement 的内容中提取

const assert = require('assert');
const { parse } = require('../../packages/slime-parser');

describe('DoWhileStatement', () => {
  it('should parse DoWhileStatement', () => {
    // TODO: 补充实现测试
  });
});

/**
 * 规则测试：DoWhileStatement
 * 
 * 位置：Es6Parser.ts Line 1158
 * 分类：statements
 * 编号：407
 * 
 * 规则语法：
 *   DoWhileStatement:
 *     do Statement while ( Expression ) ;
 * 
 * 测试目标：
 * - 验证do-while至少执行一次的特性
 * - 验证条件表达式各种形式
 * - 覆盖嵌套和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：基本do-while
let i = 0
do {
    i++
} while (i < 5)

// ✅ 测试2：条件为false（仍执行一次）
let j = 10
do {
    console.log('execute once')
} while (false)

// ✅ 测试3：复杂条件
let count = 0
do {
    count++
} while (count < 100 && count !== 50)

// ✅ 测试4：单行语句
let x = 0
do x++
while (x < 5)

// ✅ 测试5：do-while中的break
let num = 0
do {
    if (num === 3) break
    num++
} while (true)

// ✅ 测试6：do-while中的continue
let val = 0
do {
    val++
    if (val === 2) continue
    console.log(val)
} while (val < 5)

// ✅ 测试7：嵌套do-while
let a = 0
do {
    let b = 0
    do {
        b++
    } while (b < 2)
    a++
} while (a < 3)

// ✅ 测试8：do-while中的复杂语句
let status = 0
do {
    if (status % 2 === 0) {
        console.log('even')
    } else {
        console.log('odd')
    }
    status++
} while (status < 10)

// ✅ 测试9：do-while中的for循环
let outer = 0
do {
    for (let inner = 0; inner < 2; inner++) {
        console.log(outer, inner)
    }
    outer++
} while (outer < 3)

// ✅ 测试10：do-while中的if-else
let index = 0
do {
    if (index < 5) {
        console.log('less')
    } else {
        console.log('more')
    }
    index++
} while (index < 10)

// ✅ 测试11：do-while中的try-catch
let error = 0
do {
    try {
        if (error === 2) throw new Error('test')
    } catch (e) {
    }
    error++
} while (error < 5)

// ✅ 测试12：do-while中的return
function doWhileReturn() {
    let pos = 0
    do {
        if (pos === 42) return pos
        pos++
    } while (pos < 100)
}

// ✅ 测试13：do-while中的块语句
let block = 0
do {
    {
        let temp = block * 2
        console.log(temp)
    }
    block++
} while (block < 5)

// ✅ 测试14：使用对象属性作为条件
let data = { index: 0 }
do {
    console.log(data.index)
    data.index++
} while (data.index < 5)

// ✅ 测试15：复杂循环场景
let total = 0
do {
    if (total === 0) {
        console.log('start')
    } else if (total === 4) {
        console.log('end')
    }
    total++
} while (total < 5)

/* Es6Parser.ts: DoWhileStatement: do Statement while ( Expression ) */
