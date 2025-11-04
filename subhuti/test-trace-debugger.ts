/**
 * 测试 SubhutiTraceDebugger
 * 
 * 测试场景：简单的 import 语句
 * import { name, age } from "./foo"
 */

import SubhutiLexer from './src/parser/SubhutiLexer.ts'
import { createKeywordToken, createRegToken, createValueRegToken } from './src/struct/SubhutiCreateToken.ts'
import SubhutiParser, { Subhuti, SubhutiRule } from './src/parser/SubhutiParser.ts'
import SubhutiTokenConsumer from './src/parser/SubhutiTokenConsumer.ts'

// ============================================
// 1. 定义 Tokens
// ============================================

const tokens = [
    createKeywordToken('ImportTok', 'import'),
    createKeywordToken('FromTok', 'from'),
    createKeywordToken('AsTok', 'as'),
    createKeywordToken('LBrace', '{'),
    createKeywordToken('RBrace', '}'),
    createKeywordToken('Comma', ','),
    createRegToken('Identifier', /[a-zA-Z_][a-zA-Z0-9_]*/),
    createRegToken('StringLiteral', /"[^"]*"/),
    createValueRegToken('WhiteSpace', /[ \t\r\n]+/, '', 'skip'),  // 忽略空白
]

// ============================================
// 2. 定义 Parser
// ============================================

class ImportTokenConsumer extends SubhutiTokenConsumer {
    ImportTok = () => this.instance.consumeToken('ImportTok')
    FromTok = () => this.instance.consumeToken('FromTok')
    AsTok = () => this.instance.consumeToken('AsTok')
    LBrace = () => this.instance.consumeToken('LBrace')
    RBrace = () => this.instance.consumeToken('RBrace')
    Comma = () => this.instance.consumeToken('Comma')
    Identifier = () => this.instance.consumeToken('Identifier')
    StringLiteral = () => this.instance.consumeToken('StringLiteral')
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
// 3. 测试
// ============================================

const sourceCode = 'import { name, age } from "./foo"'

console.log('📝 Source Code:')
console.log(sourceCode)
console.log()

// Lexer
const lexer = new SubhutiLexer(tokens)
const tokenStream = lexer.tokenize(sourceCode)

console.log('🔤 Tokens:')
tokenStream.forEach((token, i) => {
    console.log(`  [${i}] ${token.tokenName.padEnd(15)} ${token.tokenValue}`)
})
console.log()

// Parser with Debug
const parser = new ImportParser(tokenStream).debug()  // 使用默认调试器
const cst = parser.ImportDeclaration()

// 输出调试轨迹（使用便捷方法）
console.log(parser.getDebugTrace())

console.log()
console.log('✅ Test completed')

