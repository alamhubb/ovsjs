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
import Es2020Parser from "./packages/slime-parser/src/language/es2020/Es2020Parser";
import {es2020Tokens} from "./packages/slime-parser/src/language/es2020/Es2020Tokens";

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
 * 测试规则: ArrayBindingPattern
 * 来源: 从 BindingPattern 拆分
 */

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

// ✅ 测试1：基本数组解构    ArrayBindingPattern -> [ BindingElementList ]
const [a, b] = [1, 2]

// ✅ 测试2：空数组解构    ArrayBindingPattern -> [ ]
const [] = []

// ✅ 测试3：单元素解构    ArrayBindingPattern -> [ BindingElementList ]
const [first] = [42]

// ✅ 测试4：多元素解构    ArrayBindingPattern -> [ BindingElementList ]
const [x, y, z] = [1, 2, 3]

// ✅ 测试5：跳过元素    ArrayBindingPattern -> [ Elision + BindingElementList ]
const [first, , third] = [1, 2, 3]

// ✅ 测试6：跳过多个元素    ArrayBindingPattern -> [ Elision(多个) ]
const [head, , , tail] = [1, 2, 3, 4]

// ✅ 测试7：rest参数    ArrayBindingPattern -> [ BindingRestElement ]
const [first, ...rest] = [1, 2, 3, 4, 5]

// ✅ 测试8：默认值    ArrayBindingPattern -> [ BindingElement with Initializer ]
const [x = 10] = []

// ✅ 测试9：混合默认值和rest    ArrayBindingPattern -> [ 默认值 + rest ]
const [a = 1, ...rest] = []

// ✅ 测试10：嵌套数组解构    ArrayBindingPattern -> [ 嵌套的BindingPattern ]
const [[inner]] = [[42]]

// ✅ 测试11：深层嵌套数组解构    ArrayBindingPattern -> [ 深层嵌套 ]
const [[[deep]]] = [[[1]]]

// ✅ 测试12：混合嵌套    ArrayBindingPattern -> [ 多个嵌套 ]
const [[a, b], [c, d]] = [[1, 2], [3, 4]]

// ✅ 测试13：嵌套和默认值    ArrayBindingPattern -> [ 嵌套 + 默认值 ]
const [[x = 0, y = 0] = []] = []

// ✅ 测试14：函数参数数组解构    ArrayBindingPattern -> 函数参数中的解构
function process([a, b]) {
    return a + b
}

// ✅ 测试15：函数参数解构带默认值    ArrayBindingPattern -> 参数中的默认值
function withDefaults([a = 0, b = 0] = []) {
    return a + b
}

// ✅ 测试16：for-of中的解构    ArrayBindingPattern -> for-of循环中使用
for (const [id, value] of [[1, 'a'], [2, 'b']]) {
    console.log(id, value)
}

// ✅ 测试17：交换变量    ArrayBindingPattern -> 赋值语句中的解构
let x = 1, y = 2;
[x, y] = [y, x]

// ✅ 测试18：从函数返回值解构    ArrayBindingPattern -> 赋值右侧是函数调用
function getCoords() {
    return [10, 20]
}
const [x2, y2] = getCoords()

// ✅ 测试19：复杂嵌套混合    ArrayBindingPattern -> 复杂的嵌套和rest混合
const [[a, ...inner], [b, c = 0] = []] = [[1, 2, 3], [4]]

// ✅ 测试20：实际应用场景    ArrayBindingPattern -> 实际应用中的复杂解构
const result = [
    { id: 1, data: [10, 20] },
    { id: 2, data: [30, 40] }
]
const [{ data: [val1, val2] }] = result

/* Es6Parser.ts: ArrayBindingPattern: [ BindingElementList? ] */

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
    const lexer = new SubhutiLexer(es2020Tokens)
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
    const parser = new Es2020Parser(tokens)
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



