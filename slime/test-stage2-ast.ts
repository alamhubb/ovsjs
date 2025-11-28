/**
 * 阶段2: AST生成测试
 * 测试范围: CST → AST转换
 * 前提: 阶段1已通过（CST可以正常生成）
 *
 * 验证内容:
 * 1. CST → AST 转换成功
 * 2. AST 结构正确性
 * 3. AST 节点类型正确性
 */
import SubhutiLexer from 'subhuti/src/SubhutiLexer.ts'
import * as fs from 'fs'
import * as path from 'path'
import { es2025Tokens } from "slime-parser/src/language/es2025/Es2025Tokens"
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser"
import { SlimeCstToAst } from "slime-parser/src/language/SlimeCstToAstUtil"

// 使用与 CST 测试相同的目录
const casesDir = path.join(__dirname, 'tests/cases')
const files = fs.readdirSync(casesDir)
    .filter(f => f.endsWith('.js'))
    // 排除工具脚本
    .filter(f => !f.startsWith('add-'))
    .sort()

console.log(`🧪 阶段2: AST生成测试 - ES6规则测试`)
console.log(`测试目录: tests/es6rules/`)
console.log(`测试文件数: ${files.length}`)
console.log('验证: CST→AST转换、AST结构、节点类型\n')

// ============ AST 验证工具函数 ============

interface ASTValidationError {
    path: string
    issue: string
    node?: any
}

/**
 * 验证 AST 结构完整性
 */
function validateASTStructure(node: any, path: string = 'root'): ASTValidationError[] {
    const errors: ASTValidationError[] = []

    // 1. 检查节点不为 null/undefined
    if (node === null) {
        errors.push({ path, issue: 'Node is null' })
        return errors
    }
    if (node === undefined) {
        errors.push({ path, issue: 'Node is undefined' })
        return errors
    }

    // 2. 检查节点必须有 type 属性
    if (!node.type) {
        errors.push({
            path,
            issue: 'Node has no type property',
            node: JSON.stringify(node).substring(0, 100)
        })
    }

    // 3. 递归检查子节点
    if (node.body && Array.isArray(node.body)) {
        node.body.forEach((child: any, index: number) => {
            errors.push(...validateASTStructure(child, `${path}.body[${index}]`))
        })
    }

    if (node.declarations && Array.isArray(node.declarations)) {
        node.declarations.forEach((child: any, index: number) => {
            errors.push(...validateASTStructure(child, `${path}.declarations[${index}]`))
        })
    }

    if (node.expression) {
        errors.push(...validateASTStructure(node.expression, `${path}.expression`))
    }

    if (node.left) {
        errors.push(...validateASTStructure(node.left, `${path}.left`))
    }

    if (node.right) {
        errors.push(...validateASTStructure(node.right, `${path}.right`))
    }

    return errors
}

/**
 * 统计 AST 节点信息
 */
function getASTStatistics(node: any): {
    totalNodes: number
    nodeTypes: Map<string, number>
} {
    const stats = {
        totalNodes: 0,
        nodeTypes: new Map<string, number>()
    }

    function traverse(node: any) {
        if (!node || typeof node !== 'object') return

        stats.totalNodes++

        if (node.type) {
            stats.nodeTypes.set(node.type, (stats.nodeTypes.get(node.type) || 0) + 1)
        }

        // 遍历常见的子节点属性
        const childProps = ['body', 'declarations', 'expression', 'left', 'right',
            'init', 'test', 'update', 'consequent', 'alternate', 'argument',
            'arguments', 'callee', 'object', 'property', 'elements', 'properties',
            'params', 'id', 'key', 'value', 'superClass']

        for (const prop of childProps) {
            if (node[prop]) {
                if (Array.isArray(node[prop])) {
                    node[prop].forEach((child: any) => traverse(child))
                } else if (typeof node[prop] === 'object') {
                    traverse(node[prop])
                }
            }
        }
    }

    traverse(node)
    return stats
}

// ============ 测试主循环 ============

for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const testName = file.replace('.js', '')
    const filePath = path.join(casesDir, file)
    const code = fs.readFileSync(filePath, 'utf-8')

    console.log(`\n[${i + 1}] 测试: ${testName}`)
    console.log('='.repeat(60))
    console.log(`输入代码预览: ${code.substring(0, 60).replace(/\n/g, ' ')}...`)

    try {
        // ========== 阶段1: 词法分析 + 语法分析 ==========
        const lexer = new SubhutiLexer(es2025Tokens)
        const tokens = lexer.tokenize(code)

        const parser = new Es2025Parser(tokens)
        const cst = parser.Module()

        if (!cst) {
            throw new Error('CST 生成返回 undefined')
        }
        console.log(`✅ CST生成: ${cst.children?.length || 0} 个子节点`)

        // ========== 阶段2: CST → AST 转换 ==========
        const slimeCstToAst = new SlimeCstToAst()
        const ast = slimeCstToAst.toProgram(cst)

        if (!ast) {
            throw new Error('AST 转换返回 null/undefined')
        }

        console.log(`✅ AST转换: 成功`)

        // ========== 验证 AST 结构 ==========
        const structureErrors = validateASTStructure(ast)
        if (structureErrors.length > 0) {
            console.log(`\n❌ AST结构错误 (${structureErrors.length}个):`)
            structureErrors.slice(0, 5).forEach(err => {
                console.log(`  - ${err.path}: ${err.issue}`)
            })
            if (structureErrors.length > 5) {
                console.log(`  ... 还有 ${structureErrors.length - 5} 个错误`)
            }
            throw new Error(`AST结构验证失败: ${structureErrors.length}个错误`)
        }
        console.log(`✅ AST结构: 验证通过`)

        // ========== AST 统计信息 ==========
        const stats = getASTStatistics(ast)
        const topTypes = Array.from(stats.nodeTypes.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([type, count]) => `${type}(${count})`)
            .join(', ')

        console.log(`📊 AST统计: ${stats.totalNodes}个节点`)
        console.log(`📊 主要类型: ${topTypes}`)

        // ========== 显示 AST body 概要 ==========
        if (ast.body && Array.isArray(ast.body)) {
            const bodyTypes = ast.body.map((node: any) => node.type).join(', ')
            console.log(`📊 Body节点: ${ast.body.length}个 [${bodyTypes.substring(0, 50)}${bodyTypes.length > 50 ? '...' : ''}]`)
        }

    } catch (error: any) {
        console.log(`\n❌ 失败: ${error.message}`)
        console.log('\n输入代码:')
        console.log(code)
        console.log('\n' + '='.repeat(60))
        console.log('详细错误信息:')
        console.log('='.repeat(60))
        console.log(error.toString())
        console.log('\n' + '='.repeat(60))
        console.log('错误栈:')
        console.log('='.repeat(60))
        console.log(error.stack)
        console.log(`\n⚠️ 测试在第 ${i + 1} 个用例停止，文件名：${testName}`)
        console.log(`当前进度: ${i}/${files.length} 通过\n`)
        process.exit(1)
    }
}

console.log('\n' + '='.repeat(60))
console.log(`🎉 阶段2全部通过: ${files.length}/${files.length}`)
console.log('✅ CST → AST 转换: 所有用例成功')
console.log('✅ AST 结构验证: 所有节点有 type 属性')
console.log('✅ AST 节点统计: 完成')


