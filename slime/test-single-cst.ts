/**
 * 单个CST测试工具
 * 用法：
 *   npx tsx test-single-cst.ts "let a = 1"
 *   npx tsx test-single-cst.ts "const [a, b] = arr"
 *   npx tsx test-single-cst.ts "class Test { *gen() { yield 1 } }"
 */
import Es6Parser from './packages/slime-parser/src/language/es2015/Es6Parser.ts'
import {es6Tokens} from './packages/slime-parser/src/language/es2015/Es6Tokens.ts'
import SubhutiLexer from '../subhuti/src/parser/SubhutiLexer.ts'

// 收集CST中的所有token值
function collectTokenValues(node: any): string[] {
    const values: string[] = []
    
    if (node.value !== undefined && (!node.children || node.children.length === 0)) {
        values.push(node.value)
    }
    
    if (node.children) {
        for (const child of node.children) {
            values.push(...collectTokenValues(child))
        }
    }
    
    return values
}

// 收集CST中的所有节点名称
function collectNodeNames(node: any): string[] {
    const names: string[] = []
    
    if (node.name) {
        names.push(node.name)
    }
    
    if (node.children) {
        for (const child of node.children) {
            names.push(...collectNodeNames(child))
        }
    }
    
    return names
}

// 验证CST结构完整性
interface CSTValidationError {
    path: string
    issue: string
    node?: any
}

function validateCSTStructure(node: any, path: string = 'root'): CSTValidationError[] {
    const errors: CSTValidationError[] = []
    
    if (node === null) {
        errors.push({path, issue: 'Node is null'})
        return errors
    }
    
    if (node === undefined) {
        errors.push({path, issue: 'Node is undefined'})
        return errors
    }
    
    if (!node.name && node.value === undefined) {
        errors.push({
            path,
            issue: 'Node has neither name nor value',
            node: {...node, children: node.children ? `[${node.children.length} children]` : undefined}
        })
    }
    
    if (node.children !== undefined) {
        if (!Array.isArray(node.children)) {
            errors.push({
                path,
                issue: `children is not an array (type: ${typeof node.children})`,
                node: {name: node.name, childrenType: typeof node.children}
            })
            return errors
        }
        
        node.children.forEach((child: any, index: number) => {
            const childPath = `${path}.children[${index}]`
            
            if (child === null) {
                errors.push({path: childPath, issue: 'Child is null'})
                return
            }
            
            if (child === undefined) {
                errors.push({path: childPath, issue: 'Child is undefined'})
                return
            }
            
            const childErrors = validateCSTStructure(child, childPath)
            errors.push(...childErrors)
        })
    }
    
    if (node.value !== undefined && node.children && node.children.length > 0) {
        errors.push({
            path,
            issue: `Leaf node has both value and non-empty children`,
            node: {name: node.name, value: node.value, childrenCount: node.children.length}
        })
    }
    
    return errors
}

// 统计CST节点信息
function getCSTStatistics(node: any): {
    totalNodes: number
    leafNodes: number
    maxDepth: number
    nodeTypes: Map<string, number>
} {
    const stats = {
        totalNodes: 0,
        leafNodes: 0,
        maxDepth: 0,
        nodeTypes: new Map<string, number>()
    }
    
    function traverse(node: any, depth: number) {
        if (!node) return
        
        stats.totalNodes++
        stats.maxDepth = Math.max(stats.maxDepth, depth)
        
        if (node.name) {
            stats.nodeTypes.set(node.name, (stats.nodeTypes.get(node.name) || 0) + 1)
        }
        
        if (!node.children || node.children.length === 0) {
            stats.leafNodes++
        } else {
            for (const child of node.children) {
                traverse(child, depth + 1)
            }
        }
    }
    
    traverse(node, 0)
    return stats
}

// 主程序
// const code = process.argv[2]
const code = `

/**
 * 规则测试：BindingPattern
 * 
 * 位置：Es6Parser.ts Line 1007
 * 分类：identifiers
 * 编号：106
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 2个分支
 * 
 * 规则语法：
 *   BindingPattern:
 *     ObjectBindingPattern
 *     ArrayBindingPattern
 * 
 * 测试目标：
 * - 测试对象解构模式
 * - 测试数组解构模式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：ObjectBindingPattern - 基础    BindingPattern -> Or (分支2: ObjectBindingPattern)
const {name, age} = person

// ✅ 测试2：ObjectBindingPattern - 重命名    BindingPattern -> ObjectBindingPattern (重命名)
const {name: userName} = user

// ✅ 测试3：ObjectBindingPattern - 嵌套    BindingPattern -> ObjectBindingPattern (嵌套)
const {user: {name, profile: {age}}} = data

// ✅ 测试4：ObjectBindingPattern - Rest    BindingPattern -> ObjectBindingPattern (Rest)
const {a, ...rest} = obj

// ✅ 测试5：ArrayBindingPattern - 基础    BindingPattern -> Or (分支1: ArrayBindingPattern)
const [first, second] = arr

// ✅ 测试6：ArrayBindingPattern - 跳过元素    BindingPattern -> ArrayBindingPattern (Elision)
const [, , third] = arr

// ✅ 测试7：ArrayBindingPattern - Rest    BindingPattern -> ArrayBindingPattern (Rest)
const [head, ...tail] = arr

// ✅ 测试8：ArrayBindingPattern - 嵌套    BindingPattern -> ArrayBindingPattern (嵌套)
const [x, [y, z]] = [1, [2, 3]]

// ✅ 测试9：在函数参数中    BindingPattern -> 函数参数中的解构
function objectParam({name, age}) { return name }
function arrayParam([first, second]) { return first }

// ✅ 测试10：在for循环中    BindingPattern -> for-of循环中的解构
for (const {key, value} of entries) {}
for (const [index, item] of indexed) {}

/* Es6Parser.ts: Or[ArrayBindingPattern, ObjectBindingPattern] */


// ============================================
// 合并来自: ArrayBindingPattern-001.js
// ============================================

/**
 * 规则测试：ArrayBindingPattern
 * 
 * 位置：Es6Parser.ts（数组解构处理）
 * 分类：identifiers
 * 编号：108
 * 
 * 规则语法：
 *   ArrayBindingPattern:
 *     [ BindingElementList? ]
 * 
 * 测试目标：
 * ✅ 覆盖所有数组解构形式
 * ✅ 空解构、单元素、多元素（Option/Many）
 * ✅ 跳过元素、rest参数、默认值
 * ✅ 实际应用场景
 * ✅ 边界和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（20个测试）
 */

// ✅ 测试1：基本数组解构
const [a, b] = [1, 2]

// ✅ 测试2：空数组解构
const [] = []

// ✅ 测试3：单元素解构
const [first] = [42]

// ✅ 测试4：多元素解构
const [x, y, z] = [1, 2, 3]

// ✅ 测试5：跳过元素
const [first, , third] = [1, 2, 3]

// ✅ 测试6：跳过多个元素
const [head, , , tail] = [1, 2, 3, 4]

// ✅ 测试7：rest参数
const [first, ...rest] = [1, 2, 3, 4, 5]

// ✅ 测试8：默认值
const [x = 10] = []

// ✅ 测试9：混合默认值和rest
const [a = 1, ...rest] = []

// ✅ 测试10：嵌套数组解构
const [[inner]] = [[42]]

// ✅ 测试11：深层嵌套数组解构
const [[[deep]]] = [[[1]]]

// ✅ 测试12：混合嵌套
const [[a, b], [c, d]] = [[1, 2], [3, 4]]

// ✅ 测试13：嵌套和默认值
const [[x = 0, y = 0] = []] = []

// ✅ 测试14：函数参数数组解构
function process([a, b]) {
    return a + b
}

// ✅ 测试15：函数参数解构带默认值
function withDefaults([a = 0, b = 0] = []) {
    return a + b
}

// ✅ 测试16：for-of中的解构
for (const [id, value] of [[1, 'a'], [2, 'b']]) {
    console.log(id, value)
}

// ✅ 测试17：交换变量
let x = 1, y = 2;
[x, y] = [y, x]

// ✅ 测试18：从函数返回值解构
function getCoords() {
    return [10, 20]
}
const [x2, y2] = getCoords()

// ✅ 测试19：复杂嵌套混合
const [[a, ...inner], [b, c = 0] = []] = [[1, 2, 3], [4]]

// ✅ 测试20：实际应用场景
const result = [
    { id: 1, data: [10, 20] },
    { id: 2, data: [30, 40] }
]
const [{ data: [val1, val2] }] = result

/* Es6Parser.ts: ArrayBindingPattern: [ BindingElementList? ] */


// ============================================
// 合并来自: ObjectBindingPattern-001.js
// ============================================

/**
 * 规则测试：ObjectBindingPattern
 * 
 * 位置：Es6Parser.ts Line 1015
 * 分类：identifiers
 * 编号：107
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 4个分支
 * 
 * 规则语法：
 *   ObjectBindingPattern:
 *     { }
 *     { BindingPropertyList , BindingRestElement }  (ES2018, 长规则)
 *     { BindingPropertyList , }
 *     { BindingPropertyList }
 * 
 * 测试目标：
 * - 测试空对象解构
 * - 测试基础属性解构
 * - 测试属性重命名
 * - 测试默认值
 * - 测试Rest元素（ES2018）
 * - 测试嵌套解构
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：空对象解构
const {} = {}

// ✅ 测试2：基础属性解构
const {name, age} = {name: 'Alice', age: 25}
const {x, y, z} = {x: 1, y: 2, z: 3}

// ✅ 测试3：单个属性
const {value} = {value: 42}

// ✅ 测试4：属性重命名
const {name: userName} = {name: 'Bob'}
const {x: a, y: b} = {x: 10, y: 20}

// ✅ 测试5：默认值
const {prop = 'default'} = {}
const {x1 = 0, y1 = 0} = {x1: 5}

// ✅ 测试6：重命名 + 默认值
const {name: userName2 = 'Guest'} = {}
const {value: val = 100} = {value: 200}

// ✅ 测试7：Rest元素（ES2018）
const {a1, ...rest} = {a1: 1, b: 2, c: 3}
const {x2, y2, ...others} = {x2: 1, y2: 2, z: 3, w: 4}

// ✅ 测试8：嵌套对象解构
const {user: {name: n, age: a2}} = {user: {name: 'Eve', age: 22}}
const {data: {items: [first]}} = {data: {items: [1, 2, 3]}}

// ✅ 测试9：带尾逗号
const {p1, p2,} = {p1: 1, p2: 2}

// ✅ 测试10：函数参数中的对象解构
function greet({name, age}) {
}

const extract = ({id, data: {value}}) => value
const withDefaults = ({x = 0, y = 0} = {}) => x + y

// ✅ 测试11：Rest + 带尾逗号
const {first1, ...remaining,} = {first1: 1, second: 2, third: 3}

/* Es6Parser.ts: { BindingPropertyList? TrailingComma? } */


// ============================================
// 来自文件: 109-ObjectBindingPattern.js
// ============================================

/**
 * 规则测试：ObjectBindingPattern
 * 
 * 位置：Es6Parser.ts（对象解构处理）
 * 分类：identifiers
 * 编号：109
 * 
 * 规则语法：
 *   ObjectBindingPattern:
 *     { BindingPropertyList? }
 * 
 * 测试目标：
 * ✅ 覆盖所有对象解构形式
 * ✅ 空解构、单属性、多属性（Option/Many）
 * ✅ 属性重命名、嵌套、默认值
 * ✅ 实际应用场景
 * ✅ 边界和复杂场景
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善（20个测试）
 */

// ✅ 测试1：基本对象解构
const { x, y } = { x: 1, y: 2 }

// ✅ 测试2：空对象解构
const { } = {}

// ✅ 测试3：单属性解构
const { name } = { name: 'Alice' }

// ✅ 测试4：多属性解构
const { a, b, c } = { a: 1, b: 2, c: 3 }

// ✅ 测试5：属性重命名
const { x: xVal, y: yVal } = { x: 10, y: 20 }

// ✅ 测试6：部分解构
const { name: fullName } = { name: 'Bob', age: 30 }

// ✅ 测试7：默认值
const { count = 0 } = { }

// ✅ 测试8：混合重命名和默认值
const { x: a = 5, y: b = 10 } = { }

// ✅ 测试9：嵌套对象解构
const { user: { name, age } } = { user: { name: 'Charlie', age: 25 } }

// ✅ 测试10：深层嵌套解构
const { a: { b: { c } } } = { a: { b: { c: 'deep' } } }

// ✅ 测试11：混合嵌套和默认值
const { user: { name = 'Guest' } } = { }

// ✅ 测试12：rest属性
const { x, ...rest } = { x: 1, y: 2, z: 3 }

// ✅ 测试13：函数参数解构
function processObj({ x, y }) {
    return x + y
}

// ✅ 测试14：函数参数解构带默认值
function withDefaults({ x = 0, y = 0 } = {}) {
    return x + y
}

// ✅ 测试15：箭头函数参数解构
const arrow = ({ a, b }) => a + b

// ✅ 测试16：复杂嵌套解构
const { 
    user: { 
        profile: { 
            name, 
            contact: { email } 
        } 
    } 
} = { 
    user: { 
        profile: { 
            name: 'Dave', 
            contact: { email: 'dave@example.com' } 
        } 
    } 
}

// ✅ 测试17：in语句中的解构
for (let { id, value } of [{ id: 1, value: 'a' }, { id: 2, value: 'b' }]) {
    console.log(id, value)
}

// ✅ 测试18：数组中包含对象解构
const data = { 
    items: [
        { id: 1, name: 'item1' },
        { id: 2, name: 'item2' }
    ]
}
const { items: [{ id: firstId }] } = data

// ✅ 测试19：catch子句中的解构
try {
    throw { code: 'ERR_001', message: 'Error' }
} catch ({ code, message }) {
    console.log(code, message)
}

// ✅ 测试20：复杂场景混合所有特性
function complex({ 
    user: { name = 'Guest', profile: { age = 0 } = {} } = {},
    options: { ...opts } = {}
}) {
    return { name, age, opts }
}

/* Es6Parser.ts: ObjectBindingPattern: { BindingPropertyList? } */

/**
 * 规则测试：BindingPattern
 * 
 * 位置：Es6Parser.ts Line 1007
 * 分类：identifiers
 * 编号：106
 * 
 * 规则特征：
 * ✓ 包含Or规则（1处）- 2个分支
 * 
 * 规则语法：
 *   BindingPattern:
 *     ObjectBindingPattern
 *     ArrayBindingPattern
 * 
 * 测试目标：
 * - 测试对象解构模式
 * - 测试数组解构模式
 * 
 * 创建时间：2025-11-01
 * 状态：✅ 已完善
 */

// ✅ 测试1：ObjectBindingPattern - 基础
const {name, age} = person

// ✅ 测试2：ObjectBindingPattern - 重命名
const {name: userName} = user

// ✅ 测试3：ObjectBindingPattern - 嵌套
const {user: {name, profile: {age}}} = data

// ✅ 测试4：ObjectBindingPattern - Rest
const {a, ...rest} = obj

// ✅ 测试5：ArrayBindingPattern - 基础
const [first, second] = arr

// ✅ 测试6：ArrayBindingPattern - 跳过元素
const [, , third] = arr

// ✅ 测试7：ArrayBindingPattern - Rest
const [head, ...tail] = arr

// ✅ 测试8：ArrayBindingPattern - 嵌套
const [x, [y, z]] = [1, [2, 3]]

// ✅ 测试9：在函数参数中
function objectParam({name, age}) { return name }
function arrayParam([first, second]) { return first }

// ✅ 测试10：在for循环中
for (const {key, value} of entries) {}
for (const [index, item] of indexed) {}

/* Es6Parser.ts: Or[ArrayBindingPattern, ObjectBindingPattern] */


`

if (!code) {
    console.log('❌ 错误：请提供要测试的代码')
    console.log('\n用法示例：')
    console.log('  npx tsx test-single-cst.ts "let a = 1"')
    console.log('  npx tsx test-single-cst.ts "const [a, b] = arr"')
    console.log('  npx tsx test-single-cst.ts "class Test { method() {} }"')
    process.exit(1)
}

console.log('🧪 单个CST测试工具')
console.log('='.repeat(60))
console.log('输入代码:', code)
console.log('='.repeat(60))

try {
    // 词法分析
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(code)
    
    const inputTokens = tokens
        .filter((t: any) => {
            const tokenName = t.tokenType?.name || ''
            return tokenName !== 'SingleLineComment' &&
                tokenName !== 'MultiLineComment' &&
                tokenName !== 'Spacing' &&
                tokenName !== 'LineBreak'
        })
        .map((t: any) => t.tokenValue)
        .filter((v: any) => v !== undefined)
    
    console.log(`✅ 词法分析: ${tokens.length} tokens (有效token: ${inputTokens.length})`)
    
    // 语法分析
    const parser = new Es6Parser(tokens)
    const cst = parser.Program()
    console.log(`✅ 语法分析: CST生成成功`)
    
    // CST结构验证
    const structureErrors = validateCSTStructure(cst)
    if (structureErrors.length > 0) {
        console.log(`\n❌ CST结构错误 (${structureErrors.length}个):`)
        structureErrors.forEach(err => {
            console.log(`  - ${err.path}: ${err.issue}`)
            if (err.node) {
                console.log(`    节点信息:`, JSON.stringify(err.node, null, 2))
            }
        })
        throw new Error(`CST结构验证失败: ${structureErrors.length}个错误`)
    }
    console.log(`✅ CST结构: 无null/undefined节点，结构完整`)
    
    // CST统计信息
    const stats = getCSTStatistics(cst)
    console.log(`\n📊 CST统计:`)
    console.log(`  - 总节点数: ${stats.totalNodes}`)
    console.log(`  - 叶子节点: ${stats.leafNodes}`)
    console.log(`  - 最大深度: ${stats.maxDepth}`)
    
    // Token值验证
    const cstTokens = collectTokenValues(cst)
    const missingTokens: string[] = []
    
    for (const inputToken of inputTokens) {
        if (!cstTokens.includes(inputToken)) {
            missingTokens.push(inputToken)
        }
    }
    
    if (missingTokens.length > 0) {
        console.log(`\n❌ CST丢失了${missingTokens.length}个token值:`, missingTokens)
        throw new Error('Token值未完整保留')
    }
    console.log(`✅ Token值: ${cstTokens.length}个token值完整保留`)
    
    // 节点类型统计
    const nodeNames = collectNodeNames(cst)
    const uniqueNodeTypes = Array.from(stats.nodeTypes.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    
    console.log(`\n📋 主要节点类型 (Top 10):`)
    uniqueNodeTypes.forEach(([name, count]) => {
        console.log(`  - ${name}: ${count}次`)
    })
    
    // 输出完整CST（可选，默认不输出以保持简洁）
    if (process.argv.includes('--full')) {
        console.log('\n🌳 完整CST结构:')
        console.log(JSON.stringify(cst, null, 2))
    } else {
        console.log('\n💡 提示：添加 --full 参数可查看完整CST结构')
        console.log('   例如：npx tsx test-single-cst.ts "let a = 1" --full')
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('🎉 测试通过！')
    
} catch (error: any) {
    console.log(`\n❌ 测试失败: ${error.message}`)
    if (error.stack) {
        console.log('\n堆栈信息:')
        console.log(error.stack)
    }
    process.exit(1)
}



