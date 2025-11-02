import SubhutiLexer from "subhuti/src/parser/SubhutiLexer";
import {es2020Tokens} from "../../packages/slime-parser/src/language/es2020/Es2020Tokens";
import Es2020Parser from "../../packages/slime-parser/src/language/es2020/Es2020Parser";

// 逐步测试：从简单到复杂
const tests = [
    { name: '1. Identifier', code: 'Math' },
    { name: '2. Member Access', code: 'Math.max' },
    { name: '3. Simple Call', code: 'Math.max(1)' },
    { name: '4. Two Args Call', code: 'Math.max(1, 2)' },
    { name: '5. Full Expression', code: 'Math.max(1, 2) + Math.min(5, 3)' },
]

for (const test of tests) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`测试: ${test.name}`)
    console.log(`代码: ${test.code}`)
    console.log('='.repeat(60))
    
    try {
        const lexer = new SubhutiLexer(es2020Tokens)
        const tokens = lexer.lexer(test.code)
        
        console.log('\nTokens:', tokens.map(t => `${t.tokenName}="${t.tokenValue}"`).join(', '))
        
        const parser = new Es2020Parser(tokens)
        const cst = parser.Program()
        
        // 简化输出：只显示关键结构
        function simplifyCST(node: any, depth = 0): string {
            if (!node) return ''
            
            const indent = '  '.repeat(depth)
            let result = `${indent}${node.name}`
            
            if (node.value) {
                result += ` = "${node.value}"`
            }
            
            if (node.children && node.children.length > 0) {
                result += ` (${node.children.length} children)`
                const childrenStr = node.children
                    .map((c: any) => simplifyCST(c, depth + 1))
                    .filter((s: string) => s)
                    .join('\n')
                if (childrenStr) {
                    result += '\n' + childrenStr
                }
            } else if (node.children && node.children.length === 0) {
                result += ' [EMPTY]'
            }
            
            return result
        }
        
        console.log('\nCST 简化结构:')
        console.log(simplifyCST(cst))
        
    } catch (e: any) {
        console.log('\n❌ 解析失败:', e.message)
    }
}

