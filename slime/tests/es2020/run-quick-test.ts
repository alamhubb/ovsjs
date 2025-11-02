// ES2020 快速测试运行器
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// 导入 Parser 相关
import Es2020Parser from '../../packages/slime-parser/src/language/es2020/Es2020Parser.ts'
import { es2020Tokens } from '../../packages/slime-parser/src/language/es2020/Es2020Tokens.ts'
import SubhutiLexer from '../../../subhuti/src/parser/SubhutiLexer.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function testEs2020File(filePath: string) {
    console.log(`\n🧪 测试文件: ${filePath}`)
    console.log('='.repeat(60))
    
    try {
        // 读取测试文件
        const code = readFileSync(filePath, 'utf-8')
        console.log('📄 代码内容:')
        console.log(code.substring(0, 200) + '...\n')
        
        // 1. 词法分析
        console.log('⚙️  步骤 1: 词法分析...')
        const lexer = new SubhutiLexer(es2020Tokens)
        const tokens = lexer.lexer(code)
        console.log(`✅ 词法分析成功，Token 数量: ${tokens.length}`)
        
        // 2. 语法分析
        console.log('⚙️  步骤 2: 语法分析...')
        const parser = new Es2020Parser(tokens)
        const cst = parser.Program()
        console.log('✅ 语法分析成功')
        
        // 3. 检查 CST 结构
        console.log('⚙️  步骤 3: 检查 CST...')
        const cstInfo = {
            name: cst.name,
            hasChildren: !!cst.children,
            childrenCount: cst.children?.length || 0
        }
        console.log('✅ CST 结构:', JSON.stringify(cstInfo, null, 2))
        
        console.log('\n🎉 测试通过！')
        return { success: true }
        
    } catch (error: any) {
        console.error('\n❌ 测试失败!')
        console.error('错误类型:', error.constructor.name)
        console.error('错误信息:', error.message)
        if (error.stack) {
            console.error('堆栈信息:', error.stack.split('\n').slice(0, 5).join('\n'))
        }
        return { success: false, error }
    }
}

// 运行测试
const testFile = resolve(__dirname, './quick-test-p0-1.js')
const result = testEs2020File(testFile)

process.exit(result.success ? 0 : 1)






