import SubhutiLexer from "../subhuti/src/parser/SubhutiLexer.ts"
import {es6Tokens} from "./packages/slime-parser/src/language/es2015/Es6Tokens.ts"
import Es6Parser from "./packages/slime-parser/src/language/es2015/Es6Parser.ts"

// 辅助函数：清理 tokens
function traverseClearTokens(cst: any): any {
    if (!cst) return cst
    const result = { ...cst }
    delete result.tokens
    if (result.children && Array.isArray(result.children)) {
        result.children = result.children.map(child => traverseClearTokens(child))
    }
    return result
}

// 辅助函数：清理 loc
function traverseClearLoc(cst: any): any {
    if (!cst) return cst
    const result = { ...cst }
    delete result.loc
    if (result.children && Array.isArray(result.children)) {
        result.children = result.children.map(child => traverseClearLoc(child))
    }
    return result
}

// 辅助函数：递归统计 CST 节点
function analyzeCst(cst: any, depth = 0): void {
    const indent = '  '.repeat(depth)
    
    if (!cst) {
        console.log(`${indent}(null)`)
        return
    }
    
    if (cst.name) {
        const childCount = cst.children?.length || 0
        const valueInfo = cst.value !== undefined ? ` value="${cst.value}"` : ''
        console.log(`${indent}${cst.name} (${childCount} children)${valueInfo}`)
        
        if (cst.children && Array.isArray(cst.children)) {
            cst.children.forEach((child: any, index: number) => {
                analyzeCst(child, depth + 1)
            })
        }
    } else if (cst.value !== undefined) {
        console.log(`${indent}Token: "${cst.value}"`)
    }
}

const code = `
function complex({ 
    user: { name = 'Guest', profile: { age = 0 } = {} } = {},
    options: { ...opts } = {}
}) {
    return { name, age, opts }
}
`

console.log('='.repeat(80))
console.log('测试代码:')
console.log(code)
console.log('='.repeat(80))

try {
    const lexer = new SubhutiLexer(es6Tokens)
    const tokens = lexer.lexer(code)
    console.log(`\n✓ 词法分析成功: ${tokens.length} tokens`)
    
    const parser = new Es6Parser(tokens)
    const curCst = parser.Program()
    console.log(`\n✓ 语法分析成功`)
    
    // 清理 CST
    let cstForAst = traverseClearTokens(JSON.parse(JSON.stringify(curCst)))
    cstForAst = traverseClearLoc(cstForAst)
    
    console.log('\n' + '='.repeat(80))
    console.log(`=== CST 顶层信息 ===`)
    console.log(`CST name: ${cstForAst.name}`)
    console.log(`CST children 数量: ${cstForAst.children?.length || 0}`)
    
    if (cstForAst.children && cstForAst.children.length > 0) {
        console.log('\n=== CST 第一级子节点 ===')
        cstForAst.children.forEach((child: any, index: number) => {
            console.log(`[${index}] ${child.name} (${child.children?.length || 0} children)`)
        })
    }
    
    console.log('\n' + '='.repeat(80))
    console.log('=== 完整 CST 结构树 ===\n')
    analyzeCst(cstForAst)
    
    console.log('\n' + '='.repeat(80))
    console.log('=== JSON 格式 CST（前200行）===\n')
    const jsonStr = JSON.stringify(cstForAst, null, 2)
    const lines = jsonStr.split('\n')
    console.log(lines.slice(0, 200).join('\n'))
    if (lines.length > 200) {
        console.log(`\n... (总共 ${lines.length} 行，省略后 ${lines.length - 200} 行)`)
    }
    
} catch (error: any) {
    console.error('\n✗ 错误:', error.message)
    console.error('堆栈:', error.stack)
}



