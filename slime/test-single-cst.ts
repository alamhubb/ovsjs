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
import Es2020Parser from "./packages/slime-parser/src/language/es2020/Es2020Parser.ts"
import {es2020Tokens} from "./packages/slime-parser/src/language/es2020/Es2020Tokens.ts"

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

// MWE + 二分增量调试法 - 第4轮：验证修复 + 扩展测试
const testCases = [
    // 原始问题代码
    { code: `const a = {null: 41}`, desc: '原始问题代码', fullCst: false },
    
    // 更多null场景
    { code: `const obj = {null: 1, true: 2, false: 3}`, desc: '多个literal关键字属性', fullCst: false },
    { code: `const obj = {a: 1, null: 2, b: 3}`, desc: '混合属性', fullCst: false },
    { code: `const obj = {null: null}`, desc: 'null作为属性名和值', fullCst: false },
    
    // 嵌套对象
    { code: `const obj = {null: {null: 1}}`, desc: '嵌套对象中的null属性', fullCst: false },
]

console.log('🔍 MWE + 二分增量调试法')
console.log('='.repeat(80))

let firstFailure = -1

for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    const code = testCase.code
    
    console.log(`\n[${i + 1}/${testCases.length}] 测试: ${testCase.desc}`)
    console.log(`代码: ${code}`)
    console.log('-'.repeat(80))
    
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
        
        console.log(`  ✅ 词法分析: ${tokens.length} tokens (有效: ${inputTokens.length})`)
        
        // 语法分析
        const parser = new Es2020Parser(tokens).debug()
        const cst = parser.Program()
        console.log(`  ✅ 语法分析: CST生成成功`)
        
        // CST结构验证
        const structureErrors = validateCSTStructure(cst)
        if (structureErrors.length > 0) {
            throw new Error(`CST结构验证失败: ${structureErrors.length}个错误`)
        }
        console.log(`  ✅ CST结构完整`)
        
        // Token值验证
        const cstTokens = collectTokenValues(cst)
        const missingTokens: string[] = []
        
        for (const inputToken of inputTokens) {
            if (!cstTokens.includes(inputToken)) {
                missingTokens.push(inputToken)
            }
        }
        
        if (missingTokens.length > 0) {
            throw new Error(`Token值未完整保留: ${missingTokens.join(', ')}`)
        }
        console.log(`  ✅ Token值完整保留`)
        
        console.log(`  🎉 通过！`)
        
        // 输出完整CST（如果指定）
        if (testCase.fullCst) {
            console.log('\n🌳 完整CST结构:')
            console.log(JSON.stringify(cst, null, 2))
        }
        
    } catch (error: any) {
        console.log(`  ❌ 失败: ${error.message}`)
        
        if (firstFailure === -1) {
            firstFailure = i
            console.log(`  ⚠️  这是第一个失败的测试！`)
            
            // 输出详细错误信息
            if (error.stack) {
                console.log(`\n  详细堆栈:`)
                const stackLines = error.stack.split('\n').slice(0, 10)
                stackLines.forEach((line: string) => console.log(`    ${line}`))
            }
            
            // 如果指定输出完整CST，即使失败也输出
            if (testCase.fullCst) {
                try {
                    const lexer = new SubhutiLexer(es2020Tokens)
                    const tokens = lexer.lexer(testCase.code)
                    const parser = new Es2020Parser(tokens)
                    const cst = parser.Program()
                    
                    console.log('\n🌳 完整CST结构（失败的测试）:')
                    console.log(JSON.stringify(cst, null, 2))
                } catch (e: any) {
                    console.log('\n⚠️  无法生成CST:', e.message)
                }
            }
        }
        
        // 如果不是最后一个测试，继续下一个
        if (i < testCases.length - 1) {
            continue
        }
    }
}

// 总结报告
console.log('\n' + '='.repeat(80))
console.log('📊 测试总结')
console.log('='.repeat(80))

if (firstFailure === -1) {
    console.log('✅ 所有测试都通过了！')
} else {
    console.log(`❌ 从第 ${firstFailure + 1} 个测试开始失败`)
    console.log(`失败的测试: ${testCases[firstFailure].desc}`)
    console.log(`失败的代码: ${testCases[firstFailure].code}`)
    
    if (firstFailure > 0) {
        console.log(`\n✅ 成功的测试 (1-${firstFailure}):`)
        for (let i = 0; i < firstFailure; i++) {
            console.log(`  ${i + 1}. ${testCases[i].desc}`)
        }
    }
    
    console.log(`\n🔍 问题边界已定位！`)
    console.log(`问题出现在: ${testCases[firstFailure].desc}`)
    
    // 分析问题
    console.log('\n💡 问题分析:')
    const failedCode = testCases[firstFailure].code
    
    if (failedCode.includes('null:')) {
        console.log('  - 问题：null 关键字不能作为对象属性名')
        console.log('  - 原因：LiteralPropertyName 或 PropertyName 规则未支持 null')
        console.log('  - 建议：检查 Es2020Parser 或 Es6Parser 中的 LiteralPropertyName 规则')
        console.log('  - 规范：ES6 允许所有 IdentifierName（包括关键字）作为属性名')
    } else if (failedCode.match(/\b(true|false|if|class|for|while|return|function)\s*:/)) {
        console.log('  - 问题：其他关键字不能作为对象属性名')
        console.log('  - 原因：IdentifierName 规则未包含该关键字')
    }
    
    process.exit(1)
}

console.log('\n💡 下一步：所有基础测试已通过，可以测试更复杂的场景')













