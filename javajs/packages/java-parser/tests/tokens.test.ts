/**
 * Java Token 属性测试
 *
 * 测试 Token 正则模式的正确性
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { JavaTokensObj } from '../src/JavaTokens.ts'

// ============================================
// 辅助函数
// ============================================

/**
 * 测试正则是否完全匹配字符串
 */
function fullMatch(regex: RegExp, str: string): boolean {
    const match = str.match(regex)
    return match !== null && match[0] === str
}

// ============================================
// 生成器
// ============================================

/**
 * 生成十进制整数字面量
 */
const decimalLiteral = fc.tuple(
    fc.constantFrom('', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'),
    fc.stringOf(fc.constantFrom(...'0123456789_'.split('')), { minLength: 0, maxLength: 10 }),
    fc.constantFrom('', 'l', 'L')
).map(([first, rest, suffix]) => {
    if (first === '') return '0' + suffix
    if (first === '0') return '0' + suffix
    // 确保不以下划线结尾
    const cleanRest = rest.replace(/_+$/, '').replace(/^_+/, '')
    return first + cleanRest + suffix
}).filter(s => /^(?:0|[1-9][0-9_]*[0-9]?)[lL]?$/.test(s))

/**
 * 生成十六进制整数字面量
 */
const hexLiteral = fc.tuple(
    fc.constantFrom('0x', '0X'),
    fc.stringOf(fc.constantFrom(...'0123456789abcdefABCDEF'.split('')), { minLength: 1, maxLength: 8 }),
    fc.constantFrom('', 'l', 'L')
).map(([prefix, digits, suffix]) => prefix + digits + suffix)

/**
 * 生成二进制整数字面量
 */
const binaryLiteral = fc.tuple(
    fc.constantFrom('0b', '0B'),
    fc.stringOf(fc.constantFrom('0', '1'), { minLength: 1, maxLength: 16 }),
    fc.constantFrom('', 'l', 'L')
).map(([prefix, digits, suffix]) => prefix + digits + suffix)

/**
 * 生成八进制整数字面量
 */
const octalLiteral = fc.tuple(
    fc.constant('0'),
    fc.stringOf(fc.constantFrom(...'01234567'.split('')), { minLength: 1, maxLength: 8 }),
    fc.constantFrom('', 'l', 'L')
).map(([prefix, digits, suffix]) => prefix + digits + suffix)

/**
 * 生成浮点数字面量
 */
const floatLiteral = fc.oneof(
    // 1.0, 1.0f, 1.0d
    fc.tuple(
        fc.stringOf(fc.constantFrom(...'0123456789'.split('')), { minLength: 1, maxLength: 5 }),
        fc.constant('.'),
        fc.stringOf(fc.constantFrom(...'0123456789'.split('')), { minLength: 0, maxLength: 5 }),
        fc.constantFrom('', 'f', 'F', 'd', 'D')
    ).map(([int, dot, frac, suffix]) => int + dot + (frac || '0') + suffix),
    // .5, .5f
    fc.tuple(
        fc.constant('.'),
        fc.stringOf(fc.constantFrom(...'0123456789'.split('')), { minLength: 1, maxLength: 5 }),
        fc.constantFrom('', 'f', 'F', 'd', 'D')
    ).map(([dot, frac, suffix]) => dot + frac + suffix),
    // 1e10, 1E10
    fc.tuple(
        fc.stringOf(fc.constantFrom(...'0123456789'.split('')), { minLength: 1, maxLength: 5 }),
        fc.constantFrom('e', 'E'),
        fc.constantFrom('', '+', '-'),
        fc.stringOf(fc.constantFrom(...'0123456789'.split('')), { minLength: 1, maxLength: 3 }),
        fc.constantFrom('', 'f', 'F', 'd', 'D')
    ).map(([int, e, sign, exp, suffix]) => int + e + sign + exp + suffix),
    // 1f, 1d (整数带浮点后缀)
    fc.tuple(
        fc.stringOf(fc.constantFrom(...'0123456789'.split('')), { minLength: 1, maxLength: 5 }),
        fc.constantFrom('f', 'F', 'd', 'D')
    ).map(([int, suffix]) => int + suffix)
)

/**
 * 生成字符串字面量
 */
const stringLiteral = fc.stringOf(
    fc.oneof(
        fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 '.split('')),
        fc.constantFrom('\\n', '\\t', '\\r', '\\"', '\\\\')
    ),
    { minLength: 0, maxLength: 20 }
).map(s => `"${s}"`)

/**
 * 生成字符字面量
 */
const charLiteral = fc.oneof(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')),
    fc.constantFrom('\\n', '\\t', '\\r', "\\'", '\\\\')
).map(c => `'${c}'`)

/**
 * 生成有效的 Java 标识符
 */
const javaIdentifier = fc.tuple(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$'.split('')),
    fc.stringOf(
        fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$'.split('')),
        { minLength: 0, maxLength: 15 }
    )
).map(([first, rest]) => first + rest)

/**
 * Java 关键字列表
 */
const JAVA_KEYWORDS = new Set([
    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
    'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
    'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
    'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'package',
    'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
    'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient',
    'try', 'void', 'volatile', 'while', 'true', 'false', 'null', 'var', 'yield',
    'record', 'sealed', 'permits', 'module', 'open', 'requires', 'exports',
    'opens', 'to', 'uses', 'provides', 'with', 'transitive', 'when'
])

// ============================================
// 测试用例
// ============================================

describe('Java Token Property Tests', () => {
    /**
     * **Feature: java-parser, Property 1: 数字字面量正则匹配**
     * **Validates: Requirements 3.1**
     */
    describe('Property 1: 数字字面量正则匹配', () => {
        it('should match valid decimal literals', () => {
            fc.assert(
                fc.property(decimalLiteral, (literal) => {
                    const regex = JavaTokensObj.DECIMAL_LITERAL.pattern
                    return fullMatch(regex, literal)
                }),
                { numRuns: 100 }
            )
        })

        it('should match valid hex literals', () => {
            fc.assert(
                fc.property(hexLiteral, (literal) => {
                    const regex = JavaTokensObj.HEX_LITERAL.pattern
                    return fullMatch(regex, literal)
                }),
                { numRuns: 100 }
            )
        })

        it('should match valid binary literals', () => {
            fc.assert(
                fc.property(binaryLiteral, (literal) => {
                    const regex = JavaTokensObj.BINARY_LITERAL.pattern
                    return fullMatch(regex, literal)
                }),
                { numRuns: 100 }
            )
        })

        it('should match valid octal literals', () => {
            fc.assert(
                fc.property(octalLiteral, (literal) => {
                    const regex = JavaTokensObj.OCT_LITERAL.pattern
                    return fullMatch(regex, literal)
                }),
                { numRuns: 100 }
            )
        })

        it('should match valid float literals', () => {
            fc.assert(
                fc.property(floatLiteral, (literal) => {
                    const regex = JavaTokensObj.FLOAT_LITERAL.pattern
                    return fullMatch(regex, literal)
                }),
                { numRuns: 100 }
            )
        })
    })

    /**
     * **Feature: java-parser, Property 2: 字符串字面量正则匹配**
     * **Validates: Requirements 3.2**
     */
    describe('Property 2: 字符串字面量正则匹配', () => {
        it('should match valid string literals', () => {
            fc.assert(
                fc.property(stringLiteral, (literal) => {
                    const regex = JavaTokensObj.STRING_LITERAL.pattern
                    return fullMatch(regex, literal)
                }),
                { numRuns: 100 }
            )
        })

        it('should match valid char literals', () => {
            fc.assert(
                fc.property(charLiteral, (literal) => {
                    const regex = JavaTokensObj.CHAR_LITERAL.pattern
                    return fullMatch(regex, literal)
                }),
                { numRuns: 100 }
            )
        })
    })

    /**
     * **Feature: java-parser, Property 3: 标识符正则匹配**
     * **Validates: Requirements 3.5**
     */
    describe('Property 3: 标识符正则匹配', () => {
        it('should match valid identifiers', () => {
            fc.assert(
                fc.property(javaIdentifier, (id) => {
                    const regex = JavaTokensObj.IDENTIFIER.pattern
                    return fullMatch(regex, id)
                }),
                { numRuns: 100 }
            )
        })

        it('should not match identifiers starting with digit', () => {
            fc.assert(
                fc.property(
                    fc.tuple(
                        fc.constantFrom(...'0123456789'.split('')),
                        fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 5 })
                    ),
                    ([digit, rest]) => {
                        const invalid = digit + rest
                        const regex = JavaTokensObj.IDENTIFIER.pattern
                        // 应该不完全匹配（可能部分匹配）
                        const match = invalid.match(regex)
                        return match === null || match[0] !== invalid
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * **Feature: java-parser, Property 4: 关键字边界检查**
     * **Validates: Requirements 3.6**
     */
    describe('Property 4: 关键字边界检查', () => {
        it('keywords should not match when part of longer identifier', () => {
            const keywords = ['class', 'if', 'for', 'while', 'int', 'public', 'static']
            
            fc.assert(
                fc.property(
                    fc.constantFrom(...keywords),
                    fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 5 }),
                    (keyword, suffix) => {
                        const combined = keyword + suffix
                        // 组合后应该被识别为标识符，而不是关键字
                        const idRegex = JavaTokensObj.IDENTIFIER.pattern
                        return fullMatch(idRegex, combined)
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    describe('Specific Examples', () => {
        it('should match specific decimal literals', () => {
            const examples = ['0', '1', '123', '123L', '123l', '1_000', '1_000_000L']
            const regex = JavaTokensObj.DECIMAL_LITERAL.pattern
            for (const ex of examples) {
                expect(fullMatch(regex, ex), `Failed for: ${ex}`).toBe(true)
            }
        })

        it('should match specific hex literals', () => {
            const examples = ['0x0', '0x1', '0xFF', '0xCAFE', '0xCAFEL', '0X1A2B']
            const regex = JavaTokensObj.HEX_LITERAL.pattern
            for (const ex of examples) {
                expect(fullMatch(regex, ex), `Failed for: ${ex}`).toBe(true)
            }
        })

        it('should match specific string literals', () => {
            const examples = ['""', '"hello"', '"hello world"', '"line\\nbreak"', '"tab\\there"']
            const regex = JavaTokensObj.STRING_LITERAL.pattern
            for (const ex of examples) {
                expect(fullMatch(regex, ex), `Failed for: ${ex}`).toBe(true)
            }
        })
    })
})
