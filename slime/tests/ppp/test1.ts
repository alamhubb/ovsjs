import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import JsonUtil from "subhuti/src/utils/JsonUtil";
import {traverseClearLoc, traverseClearTokens} from "../utils/parserTestUtils";
import {LogUtil} from "../../src/logutil";
import {es2020Tokens} from "../../packages/slime-parser/src/language/es2020/Es2020Tokens";
import Es2020Parser from "../../packages/slime-parser/src/language/es2020/Es2020Parser";
import Es6Parser from "slime-parser/src/language/es2015/Es6Parser";

const code = `
const [first, ...rest] = arr
const [a, b, ...others] = list

// ✅ 测试2：只有rest，没有前置元素    BindingRestElement -> ... BindingIdentifier (sole rest)
const [...all] = array
const [...items] = data

// ✅ 测试3：函数参数rest    BindingRestElement -> ... BindingIdentifier (function params)
function test(first, ...args) {
    return args
}

// ✅ 测试4：函数参数只有rest
function collect(...items) {
    return items
}

// ✅ 测试5：对象rest（ES2018 - 可能不支持）
const {name, ...otherProps} = obj

// ✅ 测试6：嵌套解构中的rest
const [first, ...[second, third]] = arr

// ✅ 测试7：rest配合默认值
function sum(initial = 0, ...nums) {
    return nums.reduce((a, b) => a + b, initial)
}

// ✅ 测试8：多个函数使用rest
const fn1 = (...args) => args.length
const fn2 = (a, b, ...rest) => rest
`

const lexer = new SubhutiLexer(es2020Tokens)
const tokens = lexer.lexer(code)
console.log(tokens)

const parser = new Es6Parser(tokens)
const curCst = parser.Program()

const outCst = JsonUtil.cloneDeep(curCst)
let cstForAst = traverseClearTokens(outCst)
cstForAst = traverseClearLoc(cstForAst)
console.log('\n=== CST 结构（children 数量）:', cstForAst.children.length)
console.log('\n=== 完整 CST 结构：')
console.log(JSON.stringify(cstForAst, null, 2))
LogUtil.log(cstForAst)
