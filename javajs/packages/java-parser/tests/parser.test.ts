/**
 * Java Parser 属性测试
 *
 * 测试解析器规则的正确性
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import JavaParser from '../src/JavaParser.ts'
import type SubhutiCst from 'subhuti/src/struct/SubhutiCst.ts'

// ============================================
// 辅助函数
// ============================================

/**
 * 解析 Java 代码
 */
function parse(code: string): SubhutiCst | undefined {
    try {
        const parser = new JavaParser(code)
        return parser.compilationUnit()
    } catch {
        return undefined
    }
}

/**
 * 检查 CST 是否包含指定名称的节点
 */
function hasNode(cst: SubhutiCst | undefined, name: string): boolean {
    if (!cst) return false
    if (cst.name === name) return true
    if (cst.children) {
        return cst.children.some(child => hasNode(child, name))
    }
    return false
}

/**
 * 获取所有指定名称的节点
 */
function findNodes(cst: SubhutiCst | undefined, name: string): SubhutiCst[] {
    const result: SubhutiCst[] = []
    if (!cst) return result
    if (cst.name === name) result.push(cst)
    if (cst.children) {
        for (const child of cst.children) {
            result.push(...findNodes(child, name))
        }
    }
    return result
}

// ============================================
// 生成器
// ============================================

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
    'try', 'void', 'volatile', 'while', 'true', 'false', 'null'
])

/**
 * 生成有效的 Java 标识符
 */
const javaIdentifier = fc.stringOf(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'.split('')),
    { minLength: 1, maxLength: 10 }
).filter(s => !JAVA_KEYWORDS.has(s))

/**
 * 生成限定名 (qualified name)
 */
const qualifiedName = fc.tuple(
    javaIdentifier,
    fc.array(javaIdentifier, { minLength: 0, maxLength: 3 })
).map(([first, rest]) => [first, ...rest].join('.'))

/**
 * 生成包声明
 */
const packageDeclaration = qualifiedName.map(name => `package ${name};`)

/**
 * 生成导入声明
 */
const importDeclaration = fc.tuple(
    fc.boolean(), // static?
    qualifiedName,
    fc.boolean() // wildcard?
).map(([isStatic, name, wildcard]) => {
    const staticPart = isStatic ? 'static ' : ''
    const wildcardPart = wildcard ? '.*' : ''
    return `import ${staticPart}${name}${wildcardPart};`
})

/**
 * 生成基本类型
 */
const primitiveType = fc.constantFrom(
    'boolean', 'byte', 'char', 'short', 'int', 'long', 'float', 'double'
)

/**
 * 生成简单类型
 */
const simpleType = fc.oneof(primitiveType, javaIdentifier)

/**
 * 生成类修饰符
 */
const classModifier = fc.constantFrom('', 'public ', 'abstract ', 'final ')

/**
 * 生成方法修饰符
 */
const methodModifier = fc.tuple(
    fc.constantFrom('', 'public ', 'private ', 'protected '),
    fc.constantFrom('', 'static ')
).map(([vis, stat]) => vis + stat)

/**
 * 生成简单方法声明
 */
const methodDeclaration = fc.tuple(
    methodModifier,
    fc.constantFrom('void', 'int', 'String', 'boolean'),
    javaIdentifier
).map(([mod, ret, name]) => `${mod}${ret} ${name}() {}`)

/**
 * 生成简单字段声明
 */
const fieldDeclaration = fc.tuple(
    fc.constantFrom('', 'public ', 'private ', 'protected '),
    fc.constantFrom('', 'static ', 'final ', 'static final '),
    simpleType,
    javaIdentifier
).map(([vis, mod, type, name]) => `${vis}${mod}${type} ${name};`)

/**
 * 生成简单类声明
 */
const simpleClassDeclaration = fc.tuple(
    classModifier,
    javaIdentifier,
    fc.array(fieldDeclaration, { minLength: 0, maxLength: 2 }),
    fc.array(methodDeclaration, { minLength: 0, maxLength: 2 })
).map(([mod, name, fields, methods]) => {
    const members = [...fields, ...methods].join('\n    ')
    const body = members ? `\n    ${members}\n` : ''
    return `${mod}class ${name} {${body}}`
})

/**
 * 上下文关键字
 */
const contextualKeywords = ['var', 'yield', 'record', 'sealed', 'permits', 'module', 'open']

// ============================================
// 测试用例
// ============================================

describe('Java Parser Property Tests', () => {
    /**
     * **Feature: java-parser, Property 5: 包声明解析**
     * **Validates: Requirements 6.1**
     */
    describe('Property 5: 包声明解析', () => {
        it('should parse valid package declarations', () => {
            fc.assert(
                fc.property(packageDeclaration, (pkg) => {
                    const code = `${pkg}\nclass Test {}`
                    const cst = parse(code)
                    return cst !== undefined && hasNode(cst, 'packageDeclaration')
                }),
                { numRuns: 100 }
            )
        })

        it('should parse package with multiple parts', () => {
            fc.assert(
                fc.property(
                    fc.array(javaIdentifier, { minLength: 2, maxLength: 5 }),
                    (parts) => {
                        const pkg = `package ${parts.join('.')};`
                        const code = `${pkg}\nclass Test {}`
                        const cst = parse(code)
                        return cst !== undefined && hasNode(cst, 'packageDeclaration')
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * **Feature: java-parser, Property 6: 导入声明解析**
     * **Validates: Requirements 6.2**
     */
    describe('Property 6: 导入声明解析', () => {
        it('should parse valid import declarations', () => {
            fc.assert(
                fc.property(
                    fc.array(importDeclaration, { minLength: 1, maxLength: 5 }),
                    (imports) => {
                        const code = imports.join('\n') + '\nclass Test {}'
                        const cst = parse(code)
                        if (!cst) return false
                        const importNodes = findNodes(cst, 'importDeclaration')
                        return importNodes.length === imports.length
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should parse static imports', () => {
            fc.assert(
                fc.property(qualifiedName, (name) => {
                    const code = `import static ${name};\nclass Test {}`
                    const cst = parse(code)
                    return cst !== undefined && hasNode(cst, 'importDeclaration')
                }),
                { numRuns: 100 }
            )
        })

        it('should parse wildcard imports', () => {
            fc.assert(
                fc.property(qualifiedName, (name) => {
                    const code = `import ${name}.*;\nclass Test {}`
                    const cst = parse(code)
                    return cst !== undefined && hasNode(cst, 'importDeclaration')
                }),
                { numRuns: 100 }
            )
        })
    })

    /**
     * **Feature: java-parser, Property 7: 类声明解析**
     * **Validates: Requirements 7.1**
     */
    describe('Property 7: 类声明解析', () => {
        it('should parse valid class declarations', () => {
            fc.assert(
                fc.property(simpleClassDeclaration, (cls) => {
                    const cst = parse(cls)
                    return cst !== undefined && hasNode(cst, 'classDeclaration')
                }),
                { numRuns: 100 }
            )
        })

        it('should parse class with extends', () => {
            fc.assert(
                fc.property(
                    javaIdentifier,
                    javaIdentifier,
                    (className, baseName) => {
                        const code = `class ${className} extends ${baseName} {}`
                        const cst = parse(code)
                        return cst !== undefined && hasNode(cst, 'classDeclaration')
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should parse class with implements', () => {
            fc.assert(
                fc.property(
                    javaIdentifier,
                    fc.array(javaIdentifier, { minLength: 1, maxLength: 3 }),
                    (className, interfaces) => {
                        const code = `class ${className} implements ${interfaces.join(', ')} {}`
                        const cst = parse(code)
                        return cst !== undefined && hasNode(cst, 'classDeclaration')
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * **Feature: java-parser, Property 8: 方法声明解析**
     * **Validates: Requirements 8.2**
     */
    describe('Property 8: 方法声明解析', () => {
        it('should parse valid method declarations', () => {
            fc.assert(
                fc.property(methodDeclaration, (method) => {
                    const code = `class Test { ${method} }`
                    const cst = parse(code)
                    return cst !== undefined && hasNode(cst, 'methodDeclaration')
                }),
                { numRuns: 100 }
            )
        })

        it('should parse method with parameters', () => {
            fc.assert(
                fc.property(
                    javaIdentifier,
                    fc.array(
                        fc.tuple(simpleType, javaIdentifier),
                        { minLength: 1, maxLength: 3 }
                    ),
                    (methodName, params) => {
                        const paramStr = params.map(([t, n]) => `${t} ${n}`).join(', ')
                        const code = `class Test { void ${methodName}(${paramStr}) {} }`
                        const cst = parse(code)
                        return cst !== undefined && hasNode(cst, 'methodDeclaration')
                    }
                ),
                { numRuns: 100 }
            )
        })

        it('should parse method with throws', () => {
            fc.assert(
                fc.property(
                    javaIdentifier,
                    fc.array(javaIdentifier, { minLength: 1, maxLength: 2 }),
                    (methodName, exceptions) => {
                        const code = `class Test { void ${methodName}() throws ${exceptions.join(', ')} {} }`
                        const cst = parse(code)
                        return cst !== undefined && hasNode(cst, 'methodDeclaration')
                    }
                ),
                { numRuns: 100 }
            )
        })
    })

    /**
     * **Feature: java-parser, Property 10: 上下文关键字处理**
     * **Validates: Requirements 15.1, 15.2, 15.3, 15.4**
     */
    describe('Property 10: 上下文关键字处理', () => {
        it('contextual keywords should work as identifiers in non-keyword context', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(...contextualKeywords),
                    (keyword) => {
                        // 上下文关键字作为变量名
                        const code = `class Test { int ${keyword}; }`
                        const cst = parse(code)
                        return cst !== undefined && hasNode(cst, 'fieldDeclaration')
                    }
                ),
                { numRuns: 50 }
            )
        })

        it('contextual keywords should work as method names', () => {
            fc.assert(
                fc.property(
                    fc.constantFrom(...contextualKeywords),
                    (keyword) => {
                        const code = `class Test { void ${keyword}() {} }`
                        const cst = parse(code)
                        return cst !== undefined && hasNode(cst, 'methodDeclaration')
                    }
                ),
                { numRuns: 50 }
            )
        })

        it('contextual keywords should work as class names', () => {
            // 注意：record, sealed, permits 在类声明上下文中是关键字
            const safeKeywords = ['module', 'open', 'requires', 'exports', 'opens', 'to', 'uses', 'provides', 'with', 'transitive', 'when']
            fc.assert(
                fc.property(
                    fc.constantFrom(...safeKeywords),
                    (keyword) => {
                        const code = `class ${keyword} {}`
                        const cst = parse(code)
                        return cst !== undefined && hasNode(cst, 'classDeclaration')
                    }
                ),
                { numRuns: 50 }
            )
        })
    })

    describe('Specific Examples', () => {
        const examples = [
            ['empty class', 'class Test {}'],
            ['class with field', 'class Test { int x; }'],
            ['class with method', 'class Test { void foo() {} }'],
            ['class with constructor', 'class Test { Test() {} }'],
            ['interface', 'interface Test {}'],
            ['enum', 'enum Color { RED, GREEN, BLUE }'],
            ['record', 'record Point(int x, int y) {}'],
            ['annotation type', '@interface MyAnnotation {}'],
            ['generic class', 'class Box<T> {}'],
            ['nested class', 'class Outer { class Inner {} }'],
        ]

        for (const [name, code] of examples) {
            it(`should parse: ${name}`, () => {
                const cst = parse(code)
                expect(cst).toBeDefined()
            })
        }
    })
})
