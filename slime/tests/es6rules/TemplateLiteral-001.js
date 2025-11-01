/**
 * 测试规则: TemplateLiteral
 * 来源: 从 Literal 拆分
 */

// TODO: 添加 TemplateLiteral 的完整测试用例
// 当前从 Literal 的内容中提取

const assert = require('assert');
const { parse } = require('../../packages/slime-parser');


});

/**
 * 规则测试：TemplateLiteral
 * 
 * 位置：Es6Parser.ts（模板字符串处理）
 * 分类：literals
 * 编号：005
 * 
 * 规则语法：
 *   TemplateLiteral:
 *     NoSubstitutionTemplate
 *     TemplateHead Expression* TemplateTail
 * 
 * 测试目标：
 * ✅ 覆盖所有模板字符串形式
 * ✅ 无插值模板（Option 0情况）
 * ✅ 单和多插值（Option 1+情况）
 * ✅ 实际应用场景
 * ✅ 边界和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（20个测试）
 */

// ✅ 测试1：无插值模板字符串
const simple = `hello world`

// ✅ 测试2：单个插值
const single = `value: ${42}`

// ✅ 测试3：多个插值
const multiple = `a: ${1}, b: ${2}, c: ${3}`

// ✅ 测试4：模板字符串插值变量
const x = 10
const withVar = `value: ${x}`

// ✅ 测试5：模板字符串插值表达式
const expr = `result: ${1 + 2}`

// ✅ 测试6：模板字符串插值函数调用
const funcExpr = `result: ${Math.max(1, 2, 3)}`

// ✅ 测试7：模板字符串插值对象
const obj = { name: 'Alice', age: 30 }
const objInterp = `name: ${obj.name}, age: ${obj.age}`

// ✅ 测试8：模板字符串插值数组
const arr = [1, 2, 3]
const arrInterp = `items: ${arr.length}`

// ✅ 测试9：模板字符串插值嵌套模板
const nested = `outer: ${`inner: ${42}`}`

// ✅ 测试10：模板字符串插值三元表达式
const ternary = `result: ${true ? 'yes' : 'no'}`

// ✅ 测试11：模板字符串插值逻辑表达式
const logical = `check: ${x > 5 && x < 100}`

// ✅ 测试12：模板字符串多行
const multiline = `line 1
line 2
line 3`

// ✅ 测试13：模板字符串特殊字符
const special = `symbols: \n \t \r \$ \`` 

// ✅ 测试14：模板字符串插值循环
let result = ''
for (let i = 0; i < 3; i++) {
    result += `item: ${i}\n`
}

// ✅ 测试15：模板字符串作为函数参数
function process(template) {
    return template
}
const param = process(`template: ${42}`)

// ✅ 测试16：模板字符串插值空表达式
const empty = `empty: ${''}` 

// ✅ 测试17：模板字符串插值null/undefined
const nullish = `value: ${null}, ${undefined}`

// ✅ 测试18：模板字符串插值对象方法
const obj2 = {
    getValue: () => 42
}
const methodCall = `method result: ${obj2.getValue()}`

// ✅ 测试19：模板字符串在对象属性中
const config = {
    path: `./data/${1 + 1}/file.txt`,
    url: `https://example.com/api/${42}`
}

// ✅ 测试20：模板字符串插值箭头函数
const arrow = `result: ${((x) => x * 2)(21)}`

/* Es6Parser.ts: TemplateLiteral: NoSubstitutionTemplate | TemplateHead (Expression TemplateMiddle)* Expression TemplateTail */
