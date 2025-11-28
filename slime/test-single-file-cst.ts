/**
 * 文件CST测试工具
 * 用法：
 *   npx tsx test-single-file-cst.ts tests/cases/01-literals-basic.js
 *   npx tsx test-single-file-cst.ts tests/cases/19-destructuring-array-basic.js
 *   npx tsx test-single-file-cst.ts tests/cases/33-class-basic.js
 */
import * as fs from 'fs'
import * as path from 'path'
import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import {es2025Tokens} from "slime-parser/src/language/es2025/Es2025Tokens";
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser";

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
const filePath = process.argv[2] || 'tests/cases/39-export-default.js'
// const filePath = process.argv[2] || 'tests/es6rules/AdditiveExpression-001.js'

if (!filePath) {
    console.log('❌ 错误：请提供要测试的文件路径')
    console.log('\n用法示例：')
    console.log('  npx tsx test-single-file-cst.ts tests/cases/01-literals-basic.js')
    console.log('  npx tsx test-single-file-cst.ts tests/cases/19-destructuring-array-basic.js')
    console.log('  npx tsx test-single-file-cst.ts tests/cases/33-class-basic.js')
    console.log('\n提示：')
    console.log('  - 添加 --full 参数可查看完整CST结构')
    console.log('  - 例如：npx tsx test-single-file-cst.ts tests/cases/01-literals-basic.js --full')
    process.exit(1)
}

// 检查文件是否存在
if (!fs.existsSync(filePath)) {
    console.log(`❌ 错误：文件不存在: ${filePath}`)
    process.exit(1)
}

// 读取文件内容
let code: string
try {
    code = fs.readFileSync(filePath, 'utf-8')
} catch (error: any) {
    console.log(`❌ 错误：读取文件失败: ${error.message}`)
    process.exit(1)
}

console.log('🧪 文件CST测试工具')
console.log('='.repeat(60))
console.log('测试文件:', path.resolve(filePath))
console.log('文件大小:', code.length, '字符')
console.log('='.repeat(60))

// 显示代码内容（如果不太长）
if (code.length <= 500) {
    console.log('\n📄 文件内容:')
    console.log(code)
    console.log('='.repeat(60))
} else {
    console.log(`\n📄 文件内容: (${code.length}字符，较长，省略显示)`)
    console.log('='.repeat(60))
}

try {
    // 清空 logall 目录
    const logallDir = path.join(__dirname, '../subhuti/logall')
    if (fs.existsSync(logallDir)) {
        const files = fs.readdirSync(logallDir)
        for (const file of files) {
            fs.unlinkSync(path.join(logallDir, file))
        }
        console.log(`🧹 已清空日志目录: ${logallDir}`)
        console.log(`   清空了 ${files.length} 个文件`)
    } else {
        console.log(`📁 日志目录不存在，将在验证时自动创建: ${logallDir}`)
    }
    console.log('='.repeat(60))

    // 词法分析
    const lexer = new SubhutiLexer(es2025Tokens)
    const tokens = lexer.tokenize(code)

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

    // 语法分析和验证
    const parser = new Es2025Parser(tokens)
    parser.debug()
    // parser.validate()

    // 生成 CST
    let cst
    let parseError: any = null
    try {
        cst = parser.Script()
    } catch (error) {
        parseError = error
    } finally {
        // 即使解析失败，也输出 debug 信息
        if ((parser as any)._debugger?.autoOutput) {
            (parser as any)._debugger.autoOutput()
        }
    }
    
    // 如果解析失败，重新抛出异常
    if (parseError) {
        throw parseError
    }
    
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
    
    // 输出完整CST（可选）
    if (process.argv.includes('--full')) {
        console.log('\n🌳 完整CST结构:')
        console.log(JSON.stringify(cst, null, 2))
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('🎉 测试通过！')
    
} catch (error: any) {
    console.log(`\n❌ 测试失败: ${error.message}`)

    // 显示完整的错误信息（如果有 toString 方法）
    if (typeof error.toString === 'function') {
        console.log('\n' + '='.repeat(60))
        console.log('详细错误信息:')
        console.log('='.repeat(60))
        console.log(error.toString())
    }

    // 显示堆栈信息
    if (error.stack) {
        console.log('\n' + '='.repeat(60))
        console.log('堆栈信息:')
        console.log('='.repeat(60))
        console.log(error.stack)
    }

    process.exit(1)
}






