/**
 * Java Parser 往返一致性测试
 *
 * **Feature: java-parser, Property 11: 往返一致性**
 * **Validates: Requirements 17.2**
 *
 * 对于任意有效的 Java 源代码，解析后通过 JavaPrinter 打印，
 * 再次解析应该产生等效的 CST。
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import JavaParser from '../src/JavaParser.ts'
import JavaPrinter from '../src/JavaPrinter.ts'
import type SubhutiCst from 'subhuti/src/struct/SubhutiCst.ts'

// ============================================
// 辅助函数
// ============================================

/**
 * 解析 Java 代码
 */
function parse(code: string): SubhutiCst | undefined {
    const parser = new JavaParser(code)
    return parser.compilationUnit()
}

/**
 * 打印 CST 为 Java 代码
 */
function print(cst: SubhutiCst): string {
    const printer = new JavaPrinter()
    return printer.print(cst)
}

/**
 * 规范化 CST 用于比较（移除位置信息）
 */
function normalizeCst(cst: SubhutiCst | undefined): any {
    if (!cst) return null
    const result: any = { name: cst.name }
    if (cst.value !== undefined) {
        result.value = cst.value
    }
    if (cst.children && cst.children.length > 0) {
        result.children = cst.children.map(normalizeCst)
    }
    return result
}

/**
 * 比较两个 CST 是否等效
 */
function cstEqual(a: SubhutiCst | undefined, b: SubhutiCst | undefined): boolean {
    return JSON.stringify(normalizeCst(a)) === JSON.stringify(normalizeCst(b))
}

// ============================================
// 生成器
// ============================================

/**
 * 生成有效的 Java 标识符
 */
const javaIdentifier = fc.stringOf(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$'.split('')),
    { minLength: 1, maxLength: 10 }
).filter(s => !isJavaKeyword(s))

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
    'record', 'sealed', 'permits', 'non-sealed'
])

function isJavaKeyword(s: string): boolean {
    return JAVA_KEYWORDS.has(s.toLowerCase())
}

/**
 * 生成包声明
 */
const packageDeclaration = fc.tuple(
    javaIdentifier,
    fc.array(javaIdentifier, { minLength: 0, maxLength: 3 })
).map(([first, rest]) => {
    const parts = [first, ...rest]
    return `package ${parts.join('.')};`
})

/**
 * 生成导入声明
 */
const importDeclaration = fc.tuple(
    fc.boolean(), // static?
    javaIdentifier,
    fc.array(javaIdentifier, { minLength: 0, maxLength: 3 }),
    fc.boolean() // wildcard?
).map(([isStatic, first, rest, wildcard]) => {
    const parts = [first, ...rest]
    const staticPart = isStatic ? 'static ' : ''
    const wildcardPart = wildcard ? '.*' : ''
    return `import ${staticPart}${parts.join('.')}${wildcardPart};`
})

/**
 * 生成基本类型
 */
const primitiveType = fc.constantFrom(
    'boolean', 'byte', 'char', 'short', 'int', 'long', 'float', 'double'
)

/**
 * 生成简单类型（基本类型或类名）
 */
const simpleType = fc.oneof(
    primitiveType,
    javaIdentifier
)

/**
 * 生成字段声明
 */
const fieldDeclaration = fc.tuple(
    fc.constantFrom('', 'public ', 'private ', 'protected '),
    fc.constantFrom('', 'static ', 'final ', 'static final '),
    simpleType,
    javaIdentifier
).map(([visibility, modifier, type, name]) => {
    return `${visibility}${modifier}${type} ${name};`
})

/**
 * 生成方法声明
 */
const methodDeclaration = fc.tuple(
    fc.constantFrom('', 'public ', 'private ', 'protected '),
    fc.constantFrom('', 'static '),
    fc.constantFrom('void', 'int', 'String', 'boolean'),
    javaIdentifier
).map(([visibility, modifier, returnType, name]) => {
    return `${visibility}${modifier}${returnType} ${name}() {}`
})

/**
 * 生成简单类声明
 */
const simpleClassDeclaration = fc.tuple(
    fc.constantFrom('', 'public ', 'abstract ', 'final '),
    javaIdentifier,
    fc.array(fieldDeclaration, { minLength: 0, maxLength: 3 }),
    fc.array(methodDeclaration, { minLength: 0, maxLength: 2 })
).map(([modifier, className, fields, methods]) => {
    const members = [...fields, ...methods].join('\n    ')
    const body = members ? `\n    ${members}\n` : ''
    return `${modifier}class ${className} {${body}}`
})

/**
 * 生成完整的编译单元
 */
const compilationUnit = fc.tuple(
    fc.option(packageDeclaration, { nil: undefined }),
    fc.array(importDeclaration, { minLength: 0, maxLength: 3 }),
    simpleClassDeclaration
).map(([pkg, imports, cls]) => {
    const parts: string[] = []
    if (pkg) parts.push(pkg)
    parts.push(...imports)
    parts.push(cls)
    return parts.join('\n')
})

// ============================================
// 测试用例
// ============================================

describe('Java Parser Round-trip Tests', () => {
    describe('Property 11: 往返一致性', () => {
        it('should round-trip simple class declarations', () => {
            fc.assert(
                fc.property(simpleClassDeclaration, (code) => {
                    const cst1 = parse(code)
                    if (!cst1) return false // 解析失败

                    const printed = print(cst1)
                    const cst2 = parse(printed)
                    if (!cst2) return false // 重新解析失败

                    return cstEqual(cst1, cst2)
                }),
                { numRuns: 100 }
            )
        })

        it('should round-trip package declarations', () => {
            fc.assert(
                fc.property(packageDeclaration, (code) => {
                    const fullCode = `${code}\nclass Test {}`
                    const cst1 = parse(fullCode)
                    if (!cst1) return false

                    const printed = print(cst1)
                    const cst2 = parse(printed)
                    if (!cst2) return false

                    return cstEqual(cst1, cst2)
                }),
                { numRuns: 100 }
            )
        })

        it('should round-trip import declarations', () => {
            fc.assert(
                fc.property(
                    fc.array(importDeclaration, { minLength: 1, maxLength: 5 }),
                    (imports) => {
                        const code = imports.join('\n') + '\nclass Test {}'
                        const cst1 = parse(code)
                        if (!cst1) return false

                        const printed = print(cst1)
                        const cst2 = parse(printed)
                        if (!cst2) return false

                        return cstEqual(cst1, cst2)
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should round-trip full compilation units', () => {
            fc.assert(
                fc.property(compilationUnit, (code) => {
                    const cst1 = parse(code)
                    if (!cst1) return false

                    const printed = print(cst1)
                    const cst2 = parse(printed)
                    if (!cst2) return false

                    return cstEqual(cst1, cst2)
                }),
                { numRuns: 100 }
            )
        })
    })

    describe('Specific Examples', () => {
        const examples = [
            ['empty class', 'class Test {}'],
            ['class with field', 'class Test { int x; }'],
            ['class with method', 'class Test { void foo() {} }'],
            ['public class', 'public class Test {}'],
            ['class with extends', 'class Test extends Base {}'],
            ['class with implements', 'class Test implements Runnable {}'],
            ['package declaration', 'package com.example;\nclass Test {}'],
            ['import declaration', 'import java.util.List;\nclass Test {}'],
            ['static import', 'import static java.lang.Math.PI;\nclass Test {}'],
            ['wildcard import', 'import java.util.*;\nclass Test {}'],
        ]

        for (const [name, code] of examples) {
            it(`should round-trip: ${name}`, () => {
                const cst1 = parse(code)
                expect(cst1).toBeDefined()

                const printed = print(cst1!)
                const cst2 = parse(printed)
                expect(cst2).toBeDefined()

                expect(cstEqual(cst1, cst2)).toBe(true)
            })
        }
    })
})
