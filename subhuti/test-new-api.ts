/**
 * 测试新的统一API
 * 
 * 展示4个功能开关：
 * - cache()       - 缓存
 * - debug()       - 调试
 * - profiling()   - 性能分析
 * - errorHandler() - 错误处理
 */

import SubhutiLexer from './src/SubhutiLexer.ts'
import { createKeywordToken, createRegToken, createValueRegToken } from './src/struct/SubhutiCreateToken.ts'
import SubhutiParser, { Subhuti, SubhutiRule } from './src/SubhutiParser.ts'
import SubhutiTokenConsumer from './src/SubhutiTokenConsumer.ts'

// ============================================
// 1. 定义 Tokens
// ============================================

const tokens = [
    createKeywordToken('ImportTok', 'import'),
    createKeywordToken('FromTok', 'from'),
    createKeywordToken('LBrace', '{'),
    createKeywordToken('RBrace', '}'),
    createKeywordToken('Comma', ','),
    createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
    createRegToken('StringLiteral', /"[^"]*"/),
    createValueRegToken('WhiteSpace', /[ \t\r\n]+/, '', 'skip'),
]

// ============================================
// 2. 定义 Parser
// ============================================

class ImportTokenConsumer extends SubhutiTokenConsumer {
    ImportTok = () => this.instance.consume('ImportTok')
    FromTok = () => this.instance.consume('FromTok')
    LBrace = () => this.instance.consume('LBrace')
    RBrace = () => this.instance.consume('RBrace')
    Comma = () => this.instance.consume('Comma')
    Identifier = () => this.instance.consume('Identifier')
    StringLiteral = () => this.instance.consume('StringLiteral')
}

@Subhuti
class ImportParser extends SubhutiParser<ImportTokenConsumer> {
    constructor(tokens: any[]) {
        super(tokens, ImportTokenConsumer)
    }
    
    @SubhutiRule
    ImportDeclaration() {
        this.tokenConsumer.ImportTok()
        this.ImportClause()
        this.tokenConsumer.FromTok()
        this.tokenConsumer.StringLiteral()
    }
    
    @SubhutiRule
    ImportClause() {
        this.tokenConsumer.LBrace()
        this.NamedImports()
        this.tokenConsumer.RBrace()
    }
    
    @SubhutiRule
    NamedImports() {
        this.ImportSpecifier()
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.ImportSpecifier()
        })
    }
    
    @SubhutiRule
    ImportSpecifier() {
        this.tokenConsumer.Identifier()
    }
}

// ============================================
// 3. 测试场景
// ============================================

console.log('='.repeat(60))
console.log('🧪 测试新API - 统一的链式调用')
console.log('='.repeat(60))
console.log()

const sourceCode = 'import { name, age, city } from "./foo"'

console.log('📝 Source Code:')
console.log(sourceCode)
console.log()

// Lexer
const lexer = new SubhutiLexer(tokens)
const tokenStream = lexer.tokenize(sourceCode)

console.log('🔤 Tokens:')
tokenStream.forEach((token, i) => {
    console.log(`  [${i}] ${token.tokenName.padEnd(15)} "${token.tokenValue}"`)
})
console.log()

// ============================================
// 场景1：默认配置（cache开启，其他关闭）
// ============================================

console.log('━'.repeat(60))
console.log('📍 场景1：默认配置')
console.log('   cache: 开启 | debug: 关闭 | profiling: 关闭 | errorHandler: 开启')
console.log('━'.repeat(60))

const parser1 = new ImportParser(tokenStream)  // 默认配置
const cst1 = parser1.ImportDeclaration()

console.log('✅ 解析成功')
console.log(`   CST节点: ${cst1?.name}`)
console.log()

// ============================================
// 场景2：开发模式（全开）
// ============================================

console.log('━'.repeat(60))
console.log('📍 场景2：开发模式（链式调用 - 全开）')
console.log('   cache: 开启 | debug: 开启 | profiling: 开启 | errorHandler: 开启')
console.log('━'.repeat(60))

const parser2 = new ImportParser(tokenStream)
    .cache()        // 开启缓存（默认true，可省略）
    .debug()        // 开启调试
    .profiling()    // 开启性能分析

const cst2 = parser2.ImportDeclaration()

console.log('✅ 解析成功')
console.log()

// 调试轨迹
console.log('🔍 调试轨迹（前10行）:')
const trace = parser2.getDebugTrace() || ''
console.log(trace.split('\n').slice(0, 10).join('\n'))
console.log('   ...')
console.log()

// 性能报告
console.log('⏱️  性能报告:')
console.log(parser2.getProfilingReport())
console.log()

// ============================================
// 场景3：生产模式（简化错误）
// ============================================

console.log('━'.repeat(60))
console.log('📍 场景3：生产模式（简化错误）')
console.log('   cache: 开启 | debug: 关闭 | profiling: 关闭 | errorHandler: 关闭')
console.log('━'.repeat(60))

const parser3 = new ImportParser(tokenStream)
    .errorHandler(false)  // 简化错误信息

const cst3 = parser3.ImportDeclaration()

console.log('✅ 解析成功（使用简化错误模式）')
console.log()

// ============================================
// 场景4：测试详细错误 vs 简单错误
// ============================================

console.log('━'.repeat(60))
console.log('📍 场景4：错误对比（详细 vs 简单）')
console.log('━'.repeat(60))

const badCode = 'import { name, age from "./foo"'  // 缺少 }
const badTokens = lexer.tokenize(badCode)

console.log('❌ 错误代码:', badCode)
console.log()

// 详细错误
console.log('【详细错误模式】')
try {
    const parser4a = new ImportParser(badTokens)
        .errorHandler()  // 详细错误（默认）
    parser4a.ImportDeclaration()
} catch (e: any) {
    console.log(e.toString())
}
console.log()

// 简单错误
console.log('【简单错误模式】')
try {
    const parser4b = new ImportParser(badTokens)
        .errorHandler(false)  // 简单错误
    parser4b.ImportDeclaration()
} catch (e: any) {
    console.log(e.toString())
}
console.log()

// ============================================
// 场景5：关闭缓存（性能测试）
// ============================================

console.log('━'.repeat(60))
console.log('📍 场景5：关闭缓存（看真实性能）')
console.log('   cache: 关闭 | debug: 关闭 | profiling: 开启 | errorHandler: 开启')
console.log('━'.repeat(60))

const parser5 = new ImportParser(tokenStream)
    .cache(false)   // 关闭缓存
    .profiling()    // 开启性能分析

const cst5 = parser5.ImportDeclaration()

console.log('✅ 解析成功（无缓存）')
console.log()
console.log('⏱️  性能报告（无缓存）:')
console.log(parser5.getProfilingReport())
console.log()

// ============================================
// 总结
// ============================================

console.log('='.repeat(60))
console.log('✅ 测试完成')
console.log('='.repeat(60))
console.log()
console.log('📝 新API特性：')
console.log('   1. ✅ 链式调用 - parser.cache().debug().profiling()')
console.log('   2. ✅ 统一风格 - 所有功能都是 method(enable = true)')
console.log('   3. ✅ 默认配置 - cache开启，其他关闭')
console.log('   4. ✅ 简洁方法 - getDebugTrace() 代替 debuggerInstance.getTrace()')
console.log('   5. ✅ 4个功能 - cache / debug / profiling / errorHandler')
console.log()

