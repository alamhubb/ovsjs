/**
 * Java 17 Parser - 基于 Subhuti PEG 框架的 Java 解析器
 *
 * 设计原则：
 * 1. 基于 ANTLR JavaParser.g4 语法实现
 * 2. 每个规则都是独立的方法，使用 @SubhutiRule 装饰器
 * 3. 使用 JavaTokenConsumer 提供类型安全的 token 消费
 */
import {
    SubhutiParser,
    Subhuti,
    SubhutiRule,
    type SubhutiParserOptions,
    type SubhutiTokenConsumerConstructor,
    type SubhutiCst
} from 'subhuti'
import JavaTokenConsumer from './JavaTokenConsumer.ts'
import { javaTokens } from './JavaTokens.ts'
import { JavaTokenType } from './JavaTokenType.ts'

// ============================================
// 上下文关键字集合
// 这些关键字在特定上下文中可以作为标识符使用
// ============================================

export const ContextualKeywords = new Set([
    'var', 'yield', 'record', 'sealed', 'permits',
    'module', 'open', 'requires', 'exports', 'opens',
    'to', 'uses', 'provides', 'with', 'transitive', 'when'
])

// ============================================
// JavaParser 主类
// ============================================

@Subhuti
export default class JavaParser<T extends JavaTokenConsumer = JavaTokenConsumer> extends SubhutiParser<T> {
    /**
     * 构造函数
     * @param sourceCode 原始源码
     * @param options 可选配置
     */
    constructor(sourceCode: string = '', options?: SubhutiParserOptions<T>) {
        const defaultTokenConsumer = JavaTokenConsumer as unknown as SubhutiTokenConsumerConstructor<T>
        super(sourceCode, {
            tokenConsumer: options?.tokenConsumer ?? defaultTokenConsumer,
            tokenDefinitions: options?.tokenDefinitions ?? javaTokens
        })
    }

    // ============================================
    // 辅助方法
    // ============================================

    /**
     * 检查当前 token 是否是指定的上下文关键字
     */
    protected isContextual(value: string): boolean {
        return this.match(JavaTokenType.IDENTIFIER) && this.curToken?.tokenValue === value
    }

    /**
     * 消费一个上下文关键字（作为标识符）
     */
    protected consumeContextual(value: string) {
        const token = this.curToken
        if (token?.tokenName === JavaTokenType.IDENTIFIER && token.tokenValue === value) {
            return this.consume(JavaTokenType.IDENTIFIER)
        }
        this._markParseFail()
        return undefined
    }

    // ============================================
    // 标识符规则
    // ============================================

    /**
     * identifier
     *     : IDENTIFIER
     *     | MODULE | OPEN | REQUIRES | EXPORTS | OPENS | TO | USES | PROVIDES | WITH | TRANSITIVE
     *     | SEALED | PERMITS | RECORD | VAR | YIELD | WHEN
     *     ;
     *
     * 上下文关键字在非关键字上下文中可以作为标识符使用
     */
    @SubhutiRule
    identifier(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.tokenConsumer.IDENTIFIER() },
            // 模块相关上下文关键字
            { alt: () => this.tokenConsumer.MODULE() },
            { alt: () => this.tokenConsumer.OPEN() },
            { alt: () => this.tokenConsumer.REQUIRES() },
            { alt: () => this.tokenConsumer.EXPORTS() },
            { alt: () => this.tokenConsumer.OPENS() },
            { alt: () => this.tokenConsumer.TO() },
            { alt: () => this.tokenConsumer.USES() },
            { alt: () => this.tokenConsumer.PROVIDES() },
            { alt: () => this.tokenConsumer.WITH() },
            { alt: () => this.tokenConsumer.TRANSITIVE() },
            // Java 17 上下文关键字
            { alt: () => this.tokenConsumer.SEALED() },
            { alt: () => this.tokenConsumer.PERMITS() },
            { alt: () => this.tokenConsumer.RECORD() },
            { alt: () => this.tokenConsumer.VAR() },
            { alt: () => this.tokenConsumer.YIELD() },
            { alt: () => this.tokenConsumer.WHEN() },
        ])
    }

    /**
     * typeIdentifier
     *     : IDENTIFIER
     *     | MODULE | OPEN | REQUIRES | EXPORTS | OPENS | TO | USES | PROVIDES | WITH | TRANSITIVE
     *     | SEALED | PERMITS | WHEN
     *     ;
     *
     * 类型声明中受限的标识符（不包括 RECORD, VAR, YIELD）
     */
    @SubhutiRule
    typeIdentifier(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.tokenConsumer.IDENTIFIER() },
            // 模块相关上下文关键字
            { alt: () => this.tokenConsumer.MODULE() },
            { alt: () => this.tokenConsumer.OPEN() },
            { alt: () => this.tokenConsumer.REQUIRES() },
            { alt: () => this.tokenConsumer.EXPORTS() },
            { alt: () => this.tokenConsumer.OPENS() },
            { alt: () => this.tokenConsumer.TO() },
            { alt: () => this.tokenConsumer.USES() },
            { alt: () => this.tokenConsumer.PROVIDES() },
            { alt: () => this.tokenConsumer.WITH() },
            { alt: () => this.tokenConsumer.TRANSITIVE() },
            // Java 17 上下文关键字（不包括 RECORD, VAR, YIELD）
            { alt: () => this.tokenConsumer.SEALED() },
            { alt: () => this.tokenConsumer.PERMITS() },
            { alt: () => this.tokenConsumer.WHEN() },
        ])
    }


    // ============================================
    // 编译单元和声明
    // ============================================

    /**
     * compilationUnit
     *     : packageDeclaration? (importDeclaration | ';')* (typeDeclaration | ';')* EOF
     *     | moduleDeclaration EOF
     *     ;
     */
    @SubhutiRule
    compilationUnit(): SubhutiCst | undefined {
        return this.Or([
            // 模块声明
            { alt: () => this.moduleDeclaration() },
            // 普通编译单元
            {
                alt: () => {
                    this.Option(() => this.packageDeclaration())
                    this.Many(() => this.Or([
                        { alt: () => this.importDeclaration() },
                        { alt: () => this.tokenConsumer.SEMI() }
                    ]))
                    this.Many(() => this.Or([
                        { alt: () => this.typeDeclaration() },
                        { alt: () => this.tokenConsumer.SEMI() }
                    ]))
                }
            }
        ])
    }

    /**
     * packageDeclaration
     *     : annotation* PACKAGE qualifiedName ';'
     *     ;
     */
    @SubhutiRule
    packageDeclaration(): SubhutiCst | undefined {
        this.Many(() => this.annotation())
        this.tokenConsumer.PACKAGE()
        this.qualifiedName()
        return this.tokenConsumer.SEMI()
    }

    /**
     * importDeclaration
     *     : IMPORT STATIC? qualifiedName ('.' '*')? ';'
     *     ;
     */
    @SubhutiRule
    importDeclaration(): SubhutiCst | undefined {
        this.tokenConsumer.IMPORT()
        this.Option(() => this.tokenConsumer.STATIC())
        this.qualifiedName()
        this.Option(() => {
            this.tokenConsumer.DOT()
            this.tokenConsumer.MUL()
        })
        return this.tokenConsumer.SEMI()
    }

    /**
     * qualifiedName
     *     : identifier ('.' identifier)*
     *     ;
     */
    @SubhutiRule
    qualifiedName(): SubhutiCst | undefined {
        this.identifier()
        this.Many(() => {
            this.tokenConsumer.DOT()
            this.identifier()
        })
        return this.curCst
    }

    // ============================================
    // 类型声明
    // ============================================

    /**
     * typeDeclaration
     *     : classOrInterfaceModifier* (classDeclaration | enumDeclaration | interfaceDeclaration | annotationTypeDeclaration | recordDeclaration)
     *     ;
     */
    @SubhutiRule
    typeDeclaration(): SubhutiCst | undefined {
        this.Many(() => this.classOrInterfaceModifier())
        return this.Or([
            { alt: () => this.classDeclaration() },
            { alt: () => this.enumDeclaration() },
            { alt: () => this.interfaceDeclaration() },
            { alt: () => this.annotationTypeDeclaration() },
            { alt: () => this.recordDeclaration() },
        ])
    }

    /**
     * classOrInterfaceModifier
     *     : annotation
     *     | PUBLIC | PROTECTED | PRIVATE | ABSTRACT | STATIC | FINAL | STRICTFP
     *     | SEALED | NON_SEALED
     *     ;
     */
    @SubhutiRule
    classOrInterfaceModifier(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.annotation() },
            { alt: () => this.tokenConsumer.PUBLIC() },
            { alt: () => this.tokenConsumer.PROTECTED() },
            { alt: () => this.tokenConsumer.PRIVATE() },
            { alt: () => this.tokenConsumer.ABSTRACT() },
            { alt: () => this.tokenConsumer.STATIC() },
            { alt: () => this.tokenConsumer.FINAL() },
            { alt: () => this.tokenConsumer.STRICTFP() },
            { alt: () => this.tokenConsumer.SEALED() },
            { alt: () => this.tokenConsumer.NON_SEALED() },
        ])
    }

    /**
     * classDeclaration
     *     : CLASS typeIdentifier typeParameters? (EXTENDS typeType)? (IMPLEMENTS typeList)? (PERMITS typeList)? classBody
     *     ;
     */
    @SubhutiRule
    classDeclaration(): SubhutiCst | undefined {
        this.tokenConsumer.CLASS()
        this.typeIdentifier()
        this.Option(() => this.typeParameters())
        this.Option(() => {
            this.tokenConsumer.EXTENDS()
            this.typeType()
        })
        this.Option(() => {
            this.tokenConsumer.IMPLEMENTS()
            this.typeList()
        })
        this.Option(() => {
            this.tokenConsumer.PERMITS()
            this.typeList()
        })
        return this.classBody()
    }

    /**
     * interfaceDeclaration
     *     : INTERFACE typeIdentifier typeParameters? (EXTENDS typeList)? (PERMITS typeList)? interfaceBody
     *     ;
     */
    @SubhutiRule
    interfaceDeclaration(): SubhutiCst | undefined {
        this.tokenConsumer.INTERFACE()
        this.typeIdentifier()
        this.Option(() => this.typeParameters())
        this.Option(() => {
            this.tokenConsumer.EXTENDS()
            this.typeList()
        })
        this.Option(() => {
            this.tokenConsumer.PERMITS()
            this.typeList()
        })
        return this.interfaceBody()
    }

    /**
     * enumDeclaration
     *     : ENUM typeIdentifier (IMPLEMENTS typeList)? '{' enumConstants? ','? enumBodyDeclarations? '}'
     *     ;
     */
    @SubhutiRule
    enumDeclaration(): SubhutiCst | undefined {
        this.tokenConsumer.ENUM()
        this.typeIdentifier()
        this.Option(() => {
            this.tokenConsumer.IMPLEMENTS()
            this.typeList()
        })
        this.tokenConsumer.LBRACE()
        this.Option(() => this.enumConstants())
        this.Option(() => this.tokenConsumer.COMMA())
        this.Option(() => this.enumBodyDeclarations())
        return this.tokenConsumer.RBRACE()
    }

    /**
     * recordDeclaration
     *     : RECORD typeIdentifier typeParameters? recordHeader (IMPLEMENTS typeList)? recordBody
     *     ;
     */
    @SubhutiRule
    recordDeclaration(): SubhutiCst | undefined {
        this.tokenConsumer.RECORD()
        this.typeIdentifier()
        this.Option(() => this.typeParameters())
        this.recordHeader()
        this.Option(() => {
            this.tokenConsumer.IMPLEMENTS()
            this.typeList()
        })
        return this.recordBody()
    }

    /**
     * annotationTypeDeclaration
     *     : '@' INTERFACE typeIdentifier annotationTypeBody
     *     ;
     */
    @SubhutiRule
    annotationTypeDeclaration(): SubhutiCst | undefined {
        this.tokenConsumer.AT()
        this.tokenConsumer.INTERFACE()
        this.typeIdentifier()
        return this.annotationTypeBody()
    }


    // ============================================
    // 类体和成员声明
    // ============================================

    /**
     * classBody
     *     : '{' classBodyDeclaration* '}'
     *     ;
     */
    @SubhutiRule
    classBody(): SubhutiCst | undefined {
        this.tokenConsumer.LBRACE()
        this.Many(() => this.classBodyDeclaration())
        return this.tokenConsumer.RBRACE()
    }

    /**
     * classBodyDeclaration
     *     : ';'
     *     | STATIC? block
     *     | modifier* memberDeclaration
     *     ;
     */
    @SubhutiRule
    classBodyDeclaration(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.tokenConsumer.SEMI() },
            {
                alt: () => {
                    this.Option(() => this.tokenConsumer.STATIC())
                    this.block()
                }
            },
            {
                alt: () => {
                    this.Many(() => this.modifier())
                    this.memberDeclaration()
                }
            }
        ])
    }

    /**
     * memberDeclaration
     *     : recordDeclaration
     *     | methodDeclaration
     *     | genericMethodDeclaration
     *     | fieldDeclaration
     *     | constructorDeclaration
     *     | genericConstructorDeclaration
     *     | interfaceDeclaration
     *     | annotationTypeDeclaration
     *     | classDeclaration
     *     | enumDeclaration
     *     ;
     */
    @SubhutiRule
    memberDeclaration(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.recordDeclaration() },
            { alt: () => this.genericMethodDeclaration() },
            { alt: () => this.methodDeclaration() },
            { alt: () => this.fieldDeclaration() },
            { alt: () => this.genericConstructorDeclaration() },
            { alt: () => this.constructorDeclaration() },
            { alt: () => this.interfaceDeclaration() },
            { alt: () => this.annotationTypeDeclaration() },
            { alt: () => this.classDeclaration() },
            { alt: () => this.enumDeclaration() },
        ])
    }


    /**
     * methodDeclaration
     *     : typeTypeOrVoid identifier formalParameters ('[' ']')* (THROWS qualifiedNameList)? methodBody
     *     ;
     */
    @SubhutiRule
    methodDeclaration(): SubhutiCst | undefined {
        this.typeTypeOrVoid()
        this.identifier()
        this.formalParameters()
        this.Many(() => {
            this.tokenConsumer.LBRACK()
            this.tokenConsumer.RBRACK()
        })
        this.Option(() => {
            this.tokenConsumer.THROWS()
            this.qualifiedNameList()
        })
        return this.methodBody()
    }

    /**
     * genericMethodDeclaration
     *     : typeParameters methodDeclaration
     *     ;
     */
    @SubhutiRule
    genericMethodDeclaration(): SubhutiCst | undefined {
        this.typeParameters()
        return this.methodDeclaration()
    }

    /**
     * constructorDeclaration
     *     : identifier formalParameters (THROWS qualifiedNameList)? constructorBody=block
     *     ;
     */
    @SubhutiRule
    constructorDeclaration(): SubhutiCst | undefined {
        this.identifier()
        this.formalParameters()
        this.Option(() => {
            this.tokenConsumer.THROWS()
            this.qualifiedNameList()
        })
        return this.block()
    }

    /**
     * genericConstructorDeclaration
     *     : typeParameters constructorDeclaration
     *     ;
     */
    @SubhutiRule
    genericConstructorDeclaration(): SubhutiCst | undefined {
        this.typeParameters()
        return this.constructorDeclaration()
    }


    /**
     * fieldDeclaration
     *     : typeType variableDeclarators ';'
     *     ;
     */
    @SubhutiRule
    fieldDeclaration(): SubhutiCst | undefined {
        this.typeType()
        this.variableDeclarators()
        return this.tokenConsumer.SEMI()
    }

    /**
     * modifier
     *     : classOrInterfaceModifier
     *     | NATIVE | SYNCHRONIZED | TRANSIENT | VOLATILE
     *     ;
     */
    @SubhutiRule
    modifier(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.classOrInterfaceModifier() },
            { alt: () => this.tokenConsumer.NATIVE() },
            { alt: () => this.tokenConsumer.SYNCHRONIZED() },
            { alt: () => this.tokenConsumer.TRANSIENT() },
            { alt: () => this.tokenConsumer.VOLATILE() },
        ])
    }

    /**
     * variableModifier
     *     : FINAL | annotation
     *     ;
     */
    @SubhutiRule
    variableModifier(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.tokenConsumer.FINAL() },
            { alt: () => this.annotation() },
        ])
    }

    // ============================================
    // 类型系统
    // ============================================

    /**
     * typeType
     *     : annotation* (classOrInterfaceType | primitiveType) (annotation* '[' ']')*
     *     ;
     */
    @SubhutiRule
    typeType(): SubhutiCst | undefined {
        this.Many(() => this.annotation())
        this.Or([
            { alt: () => this.classOrInterfaceType() },
            { alt: () => this.primitiveType() },
        ])
        this.Many(() => {
            this.Many(() => this.annotation())
            this.tokenConsumer.LBRACK()
            this.tokenConsumer.RBRACK()
        })
        return this.curCst
    }


    /**
     * typeTypeOrVoid
     *     : typeType | VOID
     *     ;
     */
    @SubhutiRule
    typeTypeOrVoid(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.typeType() },
            { alt: () => this.tokenConsumer.VOID() },
        ])
    }

    /**
     * primitiveType
     *     : BOOLEAN | CHAR | BYTE | SHORT | INT | LONG | FLOAT | DOUBLE
     *     ;
     */
    @SubhutiRule
    primitiveType(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.tokenConsumer.BOOLEAN() },
            { alt: () => this.tokenConsumer.CHAR() },
            { alt: () => this.tokenConsumer.BYTE() },
            { alt: () => this.tokenConsumer.SHORT() },
            { alt: () => this.tokenConsumer.INT() },
            { alt: () => this.tokenConsumer.LONG() },
            { alt: () => this.tokenConsumer.FLOAT() },
            { alt: () => this.tokenConsumer.DOUBLE() },
        ])
    }

    /**
     * classOrInterfaceType
     *     : (typeIdentifier typeArguments?) ('.' typeIdentifier typeArguments?)*
     *     ;
     */
    @SubhutiRule
    classOrInterfaceType(): SubhutiCst | undefined {
        this.typeIdentifier()
        this.Option(() => this.typeArguments())
        this.Many(() => {
            this.tokenConsumer.DOT()
            this.typeIdentifier()
            this.Option(() => this.typeArguments())
        })
        return this.curCst
    }

    /**
     * typeParameters
     *     : '<' typeParameter (',' typeParameter)* '>'
     *     ;
     */
    @SubhutiRule
    typeParameters(): SubhutiCst | undefined {
        this.tokenConsumer.LT()
        this.typeParameter()
        this.Many(() => {
            this.tokenConsumer.COMMA()
            this.typeParameter()
        })
        return this.tokenConsumer.GT()
    }


    /**
     * typeParameter
     *     : annotation* typeIdentifier (EXTENDS annotation* typeBound)?
     *     ;
     */
    @SubhutiRule
    typeParameter(): SubhutiCst | undefined {
        this.Many(() => this.annotation())
        this.typeIdentifier()
        this.Option(() => {
            this.tokenConsumer.EXTENDS()
            this.Many(() => this.annotation())
            this.typeBound()
        })
        return this.curCst
    }

    /**
     * typeBound
     *     : typeType ('&' typeType)*
     *     ;
     */
    @SubhutiRule
    typeBound(): SubhutiCst | undefined {
        this.typeType()
        this.Many(() => {
            this.tokenConsumer.BITAND()
            this.typeType()
        })
        return this.curCst
    }

    /**
     * typeArguments
     *     : '<' typeArgument (',' typeArgument)* '>'
     *     ;
     */
    @SubhutiRule
    typeArguments(): SubhutiCst | undefined {
        this.tokenConsumer.LT()
        this.typeArgument()
        this.Many(() => {
            this.tokenConsumer.COMMA()
            this.typeArgument()
        })
        return this.tokenConsumer.GT()
    }

    /**
     * typeArgument
     *     : typeType
     *     | annotation* '?' ((EXTENDS | SUPER) typeType)?
     *     ;
     */
    @SubhutiRule
    typeArgument(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.typeType() },
            {
                alt: () => {
                    this.Many(() => this.annotation())
                    this.tokenConsumer.QUESTION()
                    this.Option(() => {
                        this.Or([
                            { alt: () => this.tokenConsumer.EXTENDS() },
                            { alt: () => this.tokenConsumer.SUPER() },
                        ])
                        this.typeType()
                    })
                }
            }
        ])
    }


    /**
     * typeList
     *     : typeType (',' typeType)*
     *     ;
     */
    @SubhutiRule
    typeList(): SubhutiCst | undefined {
        this.typeType()
        this.Many(() => {
            this.tokenConsumer.COMMA()
            this.typeType()
        })
        return this.curCst
    }

    /**
     * qualifiedNameList
     *     : qualifiedName (',' qualifiedName)*
     *     ;
     */
    @SubhutiRule
    qualifiedNameList(): SubhutiCst | undefined {
        this.qualifiedName()
        this.Many(() => {
            this.tokenConsumer.COMMA()
            this.qualifiedName()
        })
        return this.curCst
    }

    // ============================================
    // 方法参数
    // ============================================

    /**
     * formalParameters
     *     : '(' (receiverParameter? | formalParameterList? | receiverParameter (',' formalParameterList)?) ')'
     *     ;
     */
    @SubhutiRule
    formalParameters(): SubhutiCst | undefined {
        this.tokenConsumer.LPAREN()
        this.Option(() => this.Or([
            { alt: () => this.formalParameterList() },
            {
                alt: () => {
                    this.receiverParameter()
                    this.Option(() => {
                        this.tokenConsumer.COMMA()
                        this.formalParameterList()
                    })
                }
            }
        ]))
        return this.tokenConsumer.RPAREN()
    }

    /**
     * receiverParameter
     *     : typeType (identifier '.')? THIS
     *     ;
     */
    @SubhutiRule
    receiverParameter(): SubhutiCst | undefined {
        this.typeType()
        this.Option(() => {
            this.identifier()
            this.tokenConsumer.DOT()
        })
        return this.tokenConsumer.THIS()
    }


    /**
     * formalParameterList
     *     : formalParameter (',' formalParameter)* (',' lastFormalParameter)?
     *     | lastFormalParameter
     *     ;
     */
    @SubhutiRule
    formalParameterList(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.formalParameter()
                    this.Many(() => {
                        this.tokenConsumer.COMMA()
                        this.formalParameter()
                    })
                    this.Option(() => {
                        this.tokenConsumer.COMMA()
                        this.lastFormalParameter()
                    })
                }
            },
            { alt: () => this.lastFormalParameter() }
        ])
    }

    /**
     * formalParameter
     *     : variableModifier* typeType variableDeclaratorId
     *     ;
     */
    @SubhutiRule
    formalParameter(): SubhutiCst | undefined {
        this.Many(() => this.variableModifier())
        this.typeType()
        return this.variableDeclaratorId()
    }

    /**
     * lastFormalParameter
     *     : variableModifier* typeType annotation* '...' variableDeclaratorId
     *     ;
     */
    @SubhutiRule
    lastFormalParameter(): SubhutiCst | undefined {
        this.Many(() => this.variableModifier())
        this.typeType()
        this.Many(() => this.annotation())
        this.tokenConsumer.ELLIPSIS()
        return this.variableDeclaratorId()
    }

    // ============================================
    // 变量声明
    // ============================================

    /**
     * variableDeclarators
     *     : variableDeclarator (',' variableDeclarator)*
     *     ;
     */
    @SubhutiRule
    variableDeclarators(): SubhutiCst | undefined {
        this.variableDeclarator()
        this.Many(() => {
            this.tokenConsumer.COMMA()
            this.variableDeclarator()
        })
        return this.curCst
    }


    /**
     * variableDeclarator
     *     : variableDeclaratorId ('=' variableInitializer)?
     *     ;
     */
    @SubhutiRule
    variableDeclarator(): SubhutiCst | undefined {
        this.variableDeclaratorId()
        this.Option(() => {
            this.tokenConsumer.ASSIGN()
            this.variableInitializer()
        })
        return this.curCst
    }

    /**
     * variableDeclaratorId
     *     : identifier ('[' ']')*
     *     ;
     */
    @SubhutiRule
    variableDeclaratorId(): SubhutiCst | undefined {
        this.identifier()
        this.Many(() => {
            this.tokenConsumer.LBRACK()
            this.tokenConsumer.RBRACK()
        })
        return this.curCst
    }

    /**
     * variableInitializer
     *     : arrayInitializer
     *     | expression
     *     ;
     */
    @SubhutiRule
    variableInitializer(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.arrayInitializer() },
            { alt: () => this.expression() },
        ])
    }

    /**
     * arrayInitializer
     *     : '{' (variableInitializer (',' variableInitializer)* ','?)? '}'
     *     ;
     */
    @SubhutiRule
    arrayInitializer(): SubhutiCst | undefined {
        this.tokenConsumer.LBRACE()
        this.Option(() => {
            this.variableInitializer()
            this.Many(() => {
                this.tokenConsumer.COMMA()
                this.variableInitializer()
            })
            this.Option(() => this.tokenConsumer.COMMA())
        })
        return this.tokenConsumer.RBRACE()
    }


    // ============================================
    // 语句
    // ============================================

    /**
     * block
     *     : '{' blockStatement* '}'
     *     ;
     */
    @SubhutiRule
    block(): SubhutiCst | undefined {
        this.tokenConsumer.LBRACE()
        this.Many(() => this.blockStatement())
        return this.tokenConsumer.RBRACE()
    }

    /**
     * blockStatement
     *     : localVariableDeclaration ';'
     *     | localTypeDeclaration
     *     | statement
     *     ;
     */
    @SubhutiRule
    blockStatement(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.localVariableDeclaration()
                    this.tokenConsumer.SEMI()
                }
            },
            { alt: () => this.localTypeDeclaration() },
            { alt: () => this.statement() },
        ])
    }

    /**
     * localVariableDeclaration
     *     : variableModifier* (VAR identifier '=' expression | typeType variableDeclarators)
     *     ;
     */
    @SubhutiRule
    localVariableDeclaration(): SubhutiCst | undefined {
        this.Many(() => this.variableModifier())
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.VAR()
                    this.identifier()
                    this.tokenConsumer.ASSIGN()
                    this.expression()
                }
            },
            {
                alt: () => {
                    this.typeType()
                    this.variableDeclarators()
                }
            }
        ])
    }

    /**
     * localTypeDeclaration
     *     : classOrInterfaceModifier* (classDeclaration | interfaceDeclaration | recordDeclaration)
     *     | ';'
     *     ;
     */
    @SubhutiRule
    localTypeDeclaration(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.Many(() => this.classOrInterfaceModifier())
                    this.Or([
                        { alt: () => this.classDeclaration() },
                        { alt: () => this.interfaceDeclaration() },
                        { alt: () => this.recordDeclaration() },
                    ])
                }
            },
            { alt: () => this.tokenConsumer.SEMI() }
        ])
    }


    /**
     * statement - 简化版本，包含主要语句类型
     */
    @SubhutiRule
    statement(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.block() },
            {
                alt: () => {
                    this.tokenConsumer.IF()
                    this.parExpression()
                    this.statement()
                    this.Option(() => {
                        this.tokenConsumer.ELSE()
                        this.statement()
                    })
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.FOR()
                    this.tokenConsumer.LPAREN()
                    this.forControl()
                    this.tokenConsumer.RPAREN()
                    this.statement()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.WHILE()
                    this.parExpression()
                    this.statement()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.DO()
                    this.statement()
                    this.tokenConsumer.WHILE()
                    this.parExpression()
                    this.tokenConsumer.SEMI()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.TRY()
                    this.block()
                    this.Or([
                        { alt: () => this.catchClause() },
                        { alt: () => this.finallyBlock() },
                    ])
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.TRY()
                    this.resourceSpecification()
                    this.block()
                    this.Many(() => this.catchClause())
                    this.Option(() => this.finallyBlock())
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.SWITCH()
                    this.parExpression()
                    this.tokenConsumer.LBRACE()
                    this.Many(() => this.switchBlockStatementGroup())
                    this.tokenConsumer.RBRACE()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.SYNCHRONIZED()
                    this.parExpression()
                    this.block()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.RETURN()
                    this.Option(() => this.expression())
                    this.tokenConsumer.SEMI()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.THROW()
                    this.expression()
                    this.tokenConsumer.SEMI()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.BREAK()
                    this.Option(() => this.identifier())
                    this.tokenConsumer.SEMI()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.CONTINUE()
                    this.Option(() => this.identifier())
                    this.tokenConsumer.SEMI()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.YIELD()
                    this.expression()
                    this.tokenConsumer.SEMI()
                }
            },
            { alt: () => this.tokenConsumer.SEMI() },
            {
                alt: () => {
                    this.expression()
                    this.tokenConsumer.SEMI()
                }
            },
            {
                alt: () => {
                    this.identifier()
                    this.tokenConsumer.COLON()
                    this.statement()
                }
            },
        ])
    }


    /**
     * parExpression
     *     : '(' expression ')'
     *     ;
     */
    @SubhutiRule
    parExpression(): SubhutiCst | undefined {
        this.tokenConsumer.LPAREN()
        this.expression()
        return this.tokenConsumer.RPAREN()
    }

    /**
     * forControl
     *     : enhancedForControl
     *     | forInit? ';' expression? ';' expressionList?
     *     ;
     */
    @SubhutiRule
    forControl(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.enhancedForControl() },
            {
                alt: () => {
                    this.Option(() => this.forInit())
                    this.tokenConsumer.SEMI()
                    this.Option(() => this.expression())
                    this.tokenConsumer.SEMI()
                    this.Option(() => this.expressionList())
                }
            }
        ])
    }

    /**
     * forInit
     *     : localVariableDeclaration
     *     | expressionList
     *     ;
     */
    @SubhutiRule
    forInit(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.localVariableDeclaration() },
            { alt: () => this.expressionList() },
        ])
    }

    /**
     * enhancedForControl
     *     : variableModifier* (VAR identifier | typeType variableDeclaratorId) ':' expression
     *     ;
     */
    @SubhutiRule
    enhancedForControl(): SubhutiCst | undefined {
        this.Many(() => this.variableModifier())
        this.Or([
            {
                alt: () => {
                    this.tokenConsumer.VAR()
                    this.identifier()
                }
            },
            {
                alt: () => {
                    this.typeType()
                    this.variableDeclaratorId()
                }
            }
        ])
        this.tokenConsumer.COLON()
        return this.expression()
    }


    /**
     * catchClause
     *     : CATCH '(' variableModifier* catchType identifier ')' block
     *     ;
     */
    @SubhutiRule
    catchClause(): SubhutiCst | undefined {
        this.tokenConsumer.CATCH()
        this.tokenConsumer.LPAREN()
        this.Many(() => this.variableModifier())
        this.catchType()
        this.identifier()
        this.tokenConsumer.RPAREN()
        return this.block()
    }

    /**
     * catchType
     *     : qualifiedName ('|' qualifiedName)*
     *     ;
     */
    @SubhutiRule
    catchType(): SubhutiCst | undefined {
        this.qualifiedName()
        this.Many(() => {
            this.tokenConsumer.BITOR()
            this.qualifiedName()
        })
        return this.curCst
    }

    /**
     * finallyBlock
     *     : FINALLY block
     *     ;
     */
    @SubhutiRule
    finallyBlock(): SubhutiCst | undefined {
        this.tokenConsumer.FINALLY()
        return this.block()
    }

    /**
     * resourceSpecification
     *     : '(' resources ';'? ')'
     *     ;
     */
    @SubhutiRule
    resourceSpecification(): SubhutiCst | undefined {
        this.tokenConsumer.LPAREN()
        this.resources()
        this.Option(() => this.tokenConsumer.SEMI())
        return this.tokenConsumer.RPAREN()
    }

    /**
     * resources
     *     : resource (';' resource)*
     *     ;
     */
    @SubhutiRule
    resources(): SubhutiCst | undefined {
        this.resource()
        this.Many(() => {
            this.tokenConsumer.SEMI()
            this.resource()
        })
        return this.curCst
    }


    /**
     * resource
     *     : variableModifier* (classOrInterfaceType variableDeclaratorId | VAR identifier) '=' expression
     *     | qualifiedName
     *     ;
     */
    @SubhutiRule
    resource(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.Many(() => this.variableModifier())
                    this.Or([
                        {
                            alt: () => {
                                this.classOrInterfaceType()
                                this.variableDeclaratorId()
                            }
                        },
                        {
                            alt: () => {
                                this.tokenConsumer.VAR()
                                this.identifier()
                            }
                        }
                    ])
                    this.tokenConsumer.ASSIGN()
                    this.expression()
                }
            },
            { alt: () => this.qualifiedName() }
        ])
    }

    /**
     * switchBlockStatementGroup
     *     : switchLabel+ blockStatement*
     *     ;
     */
    @SubhutiRule
    switchBlockStatementGroup(): SubhutiCst | undefined {
        this.AtLeastOne(() => this.switchLabel())
        this.Many(() => this.blockStatement())
        return this.curCst
    }

    /**
     * switchLabel
     *     : CASE (constantExpression | enumConstantName | typeType identifier) ':'
     *     | DEFAULT ':'
     *     ;
     */
    @SubhutiRule
    switchLabel(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.CASE()
                    this.Or([
                        { alt: () => this.expression() },
                        {
                            alt: () => {
                                this.typeType()
                                this.identifier()
                            }
                        }
                    ])
                    this.tokenConsumer.COLON()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.DEFAULT()
                    this.tokenConsumer.COLON()
                }
            }
        ])
    }


    // ============================================
    // 表达式
    // ============================================

    /**
     * expression - 简化版本
     */
    @SubhutiRule
    expression(): SubhutiCst | undefined {
        return this.assignmentExpression()
    }

    /**
     * assignmentExpression
     *     : conditionalExpression (assignmentOperator expression)?
     *     ;
     */
    @SubhutiRule
    assignmentExpression(): SubhutiCst | undefined {
        this.conditionalExpression()
        this.Option(() => {
            this.assignmentOperator()
            this.expression()
        })
        return this.curCst
    }

    /**
     * assignmentOperator
     *     : '=' | '+=' | '-=' | '*=' | '/=' | '&=' | '|=' | '^=' | '%=' | '<<=' | '>>=' | '>>>='
     *     ;
     */
    @SubhutiRule
    assignmentOperator(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.tokenConsumer.ASSIGN() },
            { alt: () => this.tokenConsumer.ADD_ASSIGN() },
            { alt: () => this.tokenConsumer.SUB_ASSIGN() },
            { alt: () => this.tokenConsumer.MUL_ASSIGN() },
            { alt: () => this.tokenConsumer.DIV_ASSIGN() },
            { alt: () => this.tokenConsumer.AND_ASSIGN() },
            { alt: () => this.tokenConsumer.OR_ASSIGN() },
            { alt: () => this.tokenConsumer.XOR_ASSIGN() },
            { alt: () => this.tokenConsumer.MOD_ASSIGN() },
            { alt: () => this.tokenConsumer.LSHIFT_ASSIGN() },
            { alt: () => this.tokenConsumer.RSHIFT_ASSIGN() },
            { alt: () => this.tokenConsumer.URSHIFT_ASSIGN() },
        ])
    }

    /**
     * conditionalExpression
     *     : conditionalOrExpression ('?' expression ':' conditionalExpression)?
     *     ;
     */
    @SubhutiRule
    conditionalExpression(): SubhutiCst | undefined {
        this.conditionalOrExpression()
        this.Option(() => {
            this.tokenConsumer.QUESTION()
            this.expression()
            this.tokenConsumer.COLON()
            this.conditionalExpression()
        })
        return this.curCst
    }


    /**
     * conditionalOrExpression
     *     : conditionalAndExpression ('||' conditionalAndExpression)*
     *     ;
     */
    @SubhutiRule
    conditionalOrExpression(): SubhutiCst | undefined {
        this.conditionalAndExpression()
        this.Many(() => {
            this.tokenConsumer.OR()
            this.conditionalAndExpression()
        })
        return this.curCst
    }

    /**
     * conditionalAndExpression
     *     : inclusiveOrExpression ('&&' inclusiveOrExpression)*
     *     ;
     */
    @SubhutiRule
    conditionalAndExpression(): SubhutiCst | undefined {
        this.inclusiveOrExpression()
        this.Many(() => {
            this.tokenConsumer.AND()
            this.inclusiveOrExpression()
        })
        return this.curCst
    }

    /**
     * inclusiveOrExpression
     *     : exclusiveOrExpression ('|' exclusiveOrExpression)*
     *     ;
     */
    @SubhutiRule
    inclusiveOrExpression(): SubhutiCst | undefined {
        this.exclusiveOrExpression()
        this.Many(() => {
            this.tokenConsumer.BITOR()
            this.exclusiveOrExpression()
        })
        return this.curCst
    }

    /**
     * exclusiveOrExpression
     *     : andExpression ('^' andExpression)*
     *     ;
     */
    @SubhutiRule
    exclusiveOrExpression(): SubhutiCst | undefined {
        this.andExpression()
        this.Many(() => {
            this.tokenConsumer.CARET()
            this.andExpression()
        })
        return this.curCst
    }


    /**
     * andExpression
     *     : equalityExpression ('&' equalityExpression)*
     *     ;
     */
    @SubhutiRule
    andExpression(): SubhutiCst | undefined {
        this.equalityExpression()
        this.Many(() => {
            this.tokenConsumer.BITAND()
            this.equalityExpression()
        })
        return this.curCst
    }

    /**
     * equalityExpression
     *     : relationalExpression (('==' | '!=') relationalExpression)*
     *     ;
     */
    @SubhutiRule
    equalityExpression(): SubhutiCst | undefined {
        this.relationalExpression()
        this.Many(() => {
            this.Or([
                { alt: () => this.tokenConsumer.EQUAL() },
                { alt: () => this.tokenConsumer.NOTEQUAL() },
            ])
            this.relationalExpression()
        })
        return this.curCst
    }

    /**
     * relationalExpression
     *     : shiftExpression (('<' | '>' | '<=' | '>=') shiftExpression | INSTANCEOF (typeType | pattern))*
     *     ;
     */
    @SubhutiRule
    relationalExpression(): SubhutiCst | undefined {
        this.shiftExpression()
        this.Many(() => {
            this.Or([
                {
                    alt: () => {
                        this.Or([
                            { alt: () => this.tokenConsumer.LT() },
                            { alt: () => this.tokenConsumer.GT() },
                            { alt: () => this.tokenConsumer.LE() },
                            { alt: () => this.tokenConsumer.GE() },
                        ])
                        this.shiftExpression()
                    }
                },
                {
                    alt: () => {
                        this.tokenConsumer.INSTANCEOF()
                        this.Or([
                            { alt: () => this.pattern() },
                            { alt: () => this.typeType() },
                        ])
                    }
                }
            ])
        })
        return this.curCst
    }


    /**
     * shiftExpression
     *     : additiveExpression (('<<' | '>>' | '>>>') additiveExpression)*
     *     ;
     */
    @SubhutiRule
    shiftExpression(): SubhutiCst | undefined {
        this.additiveExpression()
        this.Many(() => {
            // 注意：Java 中 >> 和 >>> 需要特殊处理，因为泛型中 >> 可能是两个 >
            this.Or([
                {
                    alt: () => {
                        this.tokenConsumer.LT()
                        this.tokenConsumer.LT()
                    }
                },
                {
                    alt: () => {
                        this.tokenConsumer.GT()
                        this.tokenConsumer.GT()
                        this.tokenConsumer.GT()
                    }
                },
                {
                    alt: () => {
                        this.tokenConsumer.GT()
                        this.tokenConsumer.GT()
                    }
                },
            ])
            this.additiveExpression()
        })
        return this.curCst
    }

    /**
     * additiveExpression
     *     : multiplicativeExpression (('+' | '-') multiplicativeExpression)*
     *     ;
     */
    @SubhutiRule
    additiveExpression(): SubhutiCst | undefined {
        this.multiplicativeExpression()
        this.Many(() => {
            this.Or([
                { alt: () => this.tokenConsumer.ADD() },
                { alt: () => this.tokenConsumer.SUB() },
            ])
            this.multiplicativeExpression()
        })
        return this.curCst
    }

    /**
     * multiplicativeExpression
     *     : unaryExpression (('*' | '/' | '%') unaryExpression)*
     *     ;
     */
    @SubhutiRule
    multiplicativeExpression(): SubhutiCst | undefined {
        this.unaryExpression()
        this.Many(() => {
            this.Or([
                { alt: () => this.tokenConsumer.MUL() },
                { alt: () => this.tokenConsumer.DIV() },
                { alt: () => this.tokenConsumer.MOD() },
            ])
            this.unaryExpression()
        })
        return this.curCst
    }


    /**
     * unaryExpression
     *     : ('+' | '-') unaryExpression
     *     | '++' unaryExpression
     *     | '--' unaryExpression
     *     | unaryExpressionNotPlusMinus
     *     ;
     */
    @SubhutiRule
    unaryExpression(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.Or([
                        { alt: () => this.tokenConsumer.ADD() },
                        { alt: () => this.tokenConsumer.SUB() },
                    ])
                    this.unaryExpression()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.INC()
                    this.unaryExpression()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.DEC()
                    this.unaryExpression()
                }
            },
            { alt: () => this.unaryExpressionNotPlusMinus() },
        ])
    }

    /**
     * unaryExpressionNotPlusMinus
     *     : '~' unaryExpression
     *     | '!' unaryExpression
     *     | castExpression
     *     | switchExpression
     *     | postfixExpression
     *     ;
     */
    @SubhutiRule
    unaryExpressionNotPlusMinus(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.TILDE()
                    this.unaryExpression()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.BANG()
                    this.unaryExpression()
                }
            },
            { alt: () => this.castExpression() },
            { alt: () => this.switchExpression() },
            { alt: () => this.postfixExpression() },
        ])
    }


    /**
     * castExpression
     *     : '(' annotation* typeType ('&' typeType)* ')' (lambdaExpression | unaryExpressionNotPlusMinus)
     *     | '(' primitiveType ')' unaryExpression
     *     ;
     */
    @SubhutiRule
    castExpression(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.LPAREN()
                    this.primitiveType()
                    this.tokenConsumer.RPAREN()
                    this.unaryExpression()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.LPAREN()
                    this.Many(() => this.annotation())
                    this.typeType()
                    this.Many(() => {
                        this.tokenConsumer.BITAND()
                        this.typeType()
                    })
                    this.tokenConsumer.RPAREN()
                    this.Or([
                        { alt: () => this.lambdaExpression() },
                        { alt: () => this.unaryExpressionNotPlusMinus() },
                    ])
                }
            }
        ])
    }

    /**
     * postfixExpression
     *     : primary (postfixOp)*
     *     ;
     */
    @SubhutiRule
    postfixExpression(): SubhutiCst | undefined {
        this.primary()
        this.Many(() => this.postfixOp())
        return this.curCst
    }

    /**
     * postfixOp
     *     : '++' | '--'
     *     | '.' (identifier | methodCall | THIS | NEW nonWildcardTypeArguments? innerCreator | SUPER superSuffix | explicitGenericInvocation)
     *     | '[' expression ']'
     *     | '::' typeArguments? identifier
     *     ;
     */
    @SubhutiRule
    postfixOp(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.tokenConsumer.INC() },
            { alt: () => this.tokenConsumer.DEC() },
            {
                alt: () => {
                    this.tokenConsumer.DOT()
                    this.Or([
                        { alt: () => this.methodCall() },
                        { alt: () => this.identifier() },
                        { alt: () => this.tokenConsumer.THIS() },
                        {
                            alt: () => {
                                this.tokenConsumer.NEW()
                                this.Option(() => this.nonWildcardTypeArguments())
                                this.innerCreator()
                            }
                        },
                        {
                            alt: () => {
                                this.tokenConsumer.SUPER()
                                this.superSuffix()
                            }
                        },
                        { alt: () => this.explicitGenericInvocation() },
                    ])
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.LBRACK()
                    this.expression()
                    this.tokenConsumer.RBRACK()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.COLONCOLON()
                    this.Option(() => this.typeArguments())
                    this.Or([
                        { alt: () => this.identifier() },
                        { alt: () => this.tokenConsumer.NEW() },
                    ])
                }
            },
        ])
    }


    /**
     * primary
     *     : '(' expression ')'
     *     | THIS
     *     | SUPER
     *     | literal
     *     | identifier
     *     | typeTypeOrVoid '.' CLASS
     *     | nonWildcardTypeArguments (explicitGenericInvocationSuffix | THIS arguments)
     *     | methodCall
     *     | creator
     *     ;
     */
    @SubhutiRule
    primary(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.LPAREN()
                    this.expression()
                    this.tokenConsumer.RPAREN()
                }
            },
            { alt: () => this.tokenConsumer.THIS() },
            { alt: () => this.tokenConsumer.SUPER() },
            { alt: () => this.literal() },
            { alt: () => this.methodCall() },
            { alt: () => this.creator() },
            {
                alt: () => {
                    this.typeTypeOrVoid()
                    this.tokenConsumer.DOT()
                    this.tokenConsumer.CLASS()
                }
            },
            {
                alt: () => {
                    this.nonWildcardTypeArguments()
                    this.Or([
                        { alt: () => this.explicitGenericInvocationSuffix() },
                        {
                            alt: () => {
                                this.tokenConsumer.THIS()
                                this.arguments()
                            }
                        }
                    ])
                }
            },
            { alt: () => this.identifier() },
        ])
    }

    /**
     * literal
     *     : integerLiteral | floatLiteral | CHAR_LITERAL | STRING_LITERAL | BOOL_LITERAL | NULL_LITERAL | TEXT_BLOCK
     *     ;
     */
    @SubhutiRule
    literal(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.integerLiteral() },
            { alt: () => this.floatLiteral() },
            { alt: () => this.tokenConsumer.CHAR_LITERAL() },
            { alt: () => this.tokenConsumer.STRING_LITERAL() },
            { alt: () => this.tokenConsumer.BOOL_LITERAL() },
            { alt: () => this.tokenConsumer.NULL_LITERAL() },
            { alt: () => this.tokenConsumer.TEXT_BLOCK() },
        ])
    }


    /**
     * integerLiteral
     *     : DECIMAL_LITERAL | HEX_LITERAL | OCT_LITERAL | BINARY_LITERAL
     *     ;
     */
    @SubhutiRule
    integerLiteral(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.tokenConsumer.DECIMAL_LITERAL() },
            { alt: () => this.tokenConsumer.HEX_LITERAL() },
            { alt: () => this.tokenConsumer.OCT_LITERAL() },
            { alt: () => this.tokenConsumer.BINARY_LITERAL() },
        ])
    }

    /**
     * floatLiteral
     *     : FLOAT_LITERAL | HEX_FLOAT_LITERAL
     *     ;
     */
    @SubhutiRule
    floatLiteral(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.tokenConsumer.FLOAT_LITERAL() },
            { alt: () => this.tokenConsumer.HEX_FLOAT_LITERAL() },
        ])
    }

    /**
     * expressionList
     *     : expression (',' expression)*
     *     ;
     */
    @SubhutiRule
    expressionList(): SubhutiCst | undefined {
        this.expression()
        this.Many(() => {
            this.tokenConsumer.COMMA()
            this.expression()
        })
        return this.curCst
    }

    /**
     * methodCall
     *     : identifier arguments
     *     | THIS arguments
     *     | SUPER arguments
     *     ;
     */
    @SubhutiRule
    methodCall(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.identifier()
                    this.arguments()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.THIS()
                    this.arguments()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.SUPER()
                    this.arguments()
                }
            },
        ])
    }


    /**
     * arguments
     *     : '(' expressionList? ')'
     *     ;
     */
    @SubhutiRule
    arguments(): SubhutiCst | undefined {
        this.tokenConsumer.LPAREN()
        this.Option(() => this.expressionList())
        return this.tokenConsumer.RPAREN()
    }

    // ============================================
    // Lambda 表达式
    // ============================================

    /**
     * lambdaExpression
     *     : lambdaParameters '->' lambdaBody
     *     ;
     */
    @SubhutiRule
    lambdaExpression(): SubhutiCst | undefined {
        this.lambdaParameters()
        this.tokenConsumer.ARROW()
        return this.lambdaBody()
    }

    /**
     * lambdaParameters
     *     : identifier
     *     | '(' formalParameterList? ')'
     *     | '(' identifier (',' identifier)* ')'
     *     | '(' lambdaLVTIList? ')'
     *     ;
     */
    @SubhutiRule
    lambdaParameters(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.identifier() },
            {
                alt: () => {
                    this.tokenConsumer.LPAREN()
                    this.Option(() => this.formalParameterList())
                    this.tokenConsumer.RPAREN()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.LPAREN()
                    this.identifier()
                    this.Many(() => {
                        this.tokenConsumer.COMMA()
                        this.identifier()
                    })
                    this.tokenConsumer.RPAREN()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.LPAREN()
                    this.Option(() => this.lambdaLVTIList())
                    this.tokenConsumer.RPAREN()
                }
            },
        ])
    }


    /**
     * lambdaBody
     *     : expression
     *     | block
     *     ;
     */
    @SubhutiRule
    lambdaBody(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.expression() },
            { alt: () => this.block() },
        ])
    }

    /**
     * lambdaLVTIList
     *     : lambdaLVTIParameter (',' lambdaLVTIParameter)*
     *     ;
     */
    @SubhutiRule
    lambdaLVTIList(): SubhutiCst | undefined {
        this.lambdaLVTIParameter()
        this.Many(() => {
            this.tokenConsumer.COMMA()
            this.lambdaLVTIParameter()
        })
        return this.curCst
    }

    /**
     * lambdaLVTIParameter
     *     : variableModifier* VAR identifier
     *     ;
     */
    @SubhutiRule
    lambdaLVTIParameter(): SubhutiCst | undefined {
        this.Many(() => this.variableModifier())
        this.tokenConsumer.VAR()
        return this.identifier()
    }

    // ============================================
    // Switch 表达式
    // ============================================

    /**
     * switchExpression
     *     : SWITCH parExpression '{' switchLabeledRule* '}'
     *     ;
     */
    @SubhutiRule
    switchExpression(): SubhutiCst | undefined {
        this.tokenConsumer.SWITCH()
        this.parExpression()
        this.tokenConsumer.LBRACE()
        this.Many(() => this.switchLabeledRule())
        return this.tokenConsumer.RBRACE()
    }

    /**
     * switchLabeledRule
     *     : CASE (expressionList | NULL_LITERAL | guardedPattern) ('->' | ':') switchRuleOutcome
     *     | DEFAULT ('->' | ':') switchRuleOutcome
     *     ;
     */
    @SubhutiRule
    switchLabeledRule(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.CASE()
                    this.Or([
                        { alt: () => this.guardedPattern() },
                        { alt: () => this.tokenConsumer.NULL_LITERAL() },
                        { alt: () => this.expressionList() },
                    ])
                    this.Or([
                        { alt: () => this.tokenConsumer.ARROW() },
                        { alt: () => this.tokenConsumer.COLON() },
                    ])
                    this.switchRuleOutcome()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.DEFAULT()
                    this.Or([
                        { alt: () => this.tokenConsumer.ARROW() },
                        { alt: () => this.tokenConsumer.COLON() },
                    ])
                    this.switchRuleOutcome()
                }
            }
        ])
    }


    /**
     * switchRuleOutcome
     *     : block
     *     | blockStatement*
     *     ;
     */
    @SubhutiRule
    switchRuleOutcome(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.block() },
            { alt: () => this.Many(() => this.blockStatement()) },
        ])
    }

    /**
     * guardedPattern
     *     : '(' guardedPattern ')'
     *     | variableModifier* typeType annotation* identifier ('&&' expression)*
     *     | guardedPattern '&&' expression
     *     ;
     */
    @SubhutiRule
    guardedPattern(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.LPAREN()
                    this.guardedPattern()
                    this.tokenConsumer.RPAREN()
                }
            },
            {
                alt: () => {
                    this.Many(() => this.variableModifier())
                    this.typeType()
                    this.Many(() => this.annotation())
                    this.identifier()
                    this.Many(() => {
                        this.tokenConsumer.AND()
                        this.expression()
                    })
                }
            }
        ])
    }

    // ============================================
    // 模式匹配
    // ============================================

    /**
     * pattern
     *     : variableModifier* typeType annotation* identifier
     *     ;
     */
    @SubhutiRule
    pattern(): SubhutiCst | undefined {
        this.Many(() => this.variableModifier())
        this.typeType()
        this.Many(() => this.annotation())
        return this.identifier()
    }


    // ============================================
    // 对象创建
    // ============================================

    /**
     * creator
     *     : nonWildcardTypeArguments createdName classCreatorRest
     *     | createdName (arrayCreatorRest | classCreatorRest)
     *     ;
     */
    @SubhutiRule
    creator(): SubhutiCst | undefined {
        this.tokenConsumer.NEW()
        return this.Or([
            {
                alt: () => {
                    this.nonWildcardTypeArguments()
                    this.createdName()
                    this.classCreatorRest()
                }
            },
            {
                alt: () => {
                    this.createdName()
                    this.Or([
                        { alt: () => this.arrayCreatorRest() },
                        { alt: () => this.classCreatorRest() },
                    ])
                }
            }
        ])
    }

    /**
     * createdName
     *     : identifier typeArgumentsOrDiamond? ('.' identifier typeArgumentsOrDiamond?)*
     *     | primitiveType
     *     ;
     */
    @SubhutiRule
    createdName(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.identifier()
                    this.Option(() => this.typeArgumentsOrDiamond())
                    this.Many(() => {
                        this.tokenConsumer.DOT()
                        this.identifier()
                        this.Option(() => this.typeArgumentsOrDiamond())
                    })
                }
            },
            { alt: () => this.primitiveType() }
        ])
    }

    /**
     * innerCreator
     *     : identifier nonWildcardTypeArgumentsOrDiamond? classCreatorRest
     *     ;
     */
    @SubhutiRule
    innerCreator(): SubhutiCst | undefined {
        this.identifier()
        this.Option(() => this.nonWildcardTypeArgumentsOrDiamond())
        return this.classCreatorRest()
    }


    /**
     * arrayCreatorRest
     *     : '[' (']' ('[' ']')* arrayInitializer | expression ']' ('[' expression ']')* ('[' ']')*)
     *     ;
     */
    @SubhutiRule
    arrayCreatorRest(): SubhutiCst | undefined {
        this.tokenConsumer.LBRACK()
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.RBRACK()
                    this.Many(() => {
                        this.tokenConsumer.LBRACK()
                        this.tokenConsumer.RBRACK()
                    })
                    this.arrayInitializer()
                }
            },
            {
                alt: () => {
                    this.expression()
                    this.tokenConsumer.RBRACK()
                    this.Many(() => {
                        this.tokenConsumer.LBRACK()
                        this.expression()
                        this.tokenConsumer.RBRACK()
                    })
                    this.Many(() => {
                        this.tokenConsumer.LBRACK()
                        this.tokenConsumer.RBRACK()
                    })
                }
            }
        ])
    }

    /**
     * classCreatorRest
     *     : arguments classBody?
     *     ;
     */
    @SubhutiRule
    classCreatorRest(): SubhutiCst | undefined {
        this.arguments()
        this.Option(() => this.classBody())
        return this.curCst
    }

    /**
     * typeArgumentsOrDiamond
     *     : '<' '>'
     *     | typeArguments
     *     ;
     */
    @SubhutiRule
    typeArgumentsOrDiamond(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.LT()
                    this.tokenConsumer.GT()
                }
            },
            { alt: () => this.typeArguments() }
        ])
    }


    /**
     * nonWildcardTypeArguments
     *     : '<' typeList '>'
     *     ;
     */
    @SubhutiRule
    nonWildcardTypeArguments(): SubhutiCst | undefined {
        this.tokenConsumer.LT()
        this.typeList()
        return this.tokenConsumer.GT()
    }

    /**
     * nonWildcardTypeArgumentsOrDiamond
     *     : '<' '>'
     *     | nonWildcardTypeArguments
     *     ;
     */
    @SubhutiRule
    nonWildcardTypeArgumentsOrDiamond(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.LT()
                    this.tokenConsumer.GT()
                }
            },
            { alt: () => this.nonWildcardTypeArguments() }
        ])
    }

    /**
     * superSuffix
     *     : arguments
     *     | '.' typeArguments? identifier arguments?
     *     ;
     */
    @SubhutiRule
    superSuffix(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.arguments() },
            {
                alt: () => {
                    this.tokenConsumer.DOT()
                    this.Option(() => this.typeArguments())
                    this.identifier()
                    this.Option(() => this.arguments())
                }
            }
        ])
    }

    /**
     * explicitGenericInvocation
     *     : nonWildcardTypeArguments explicitGenericInvocationSuffix
     *     ;
     */
    @SubhutiRule
    explicitGenericInvocation(): SubhutiCst | undefined {
        this.nonWildcardTypeArguments()
        return this.explicitGenericInvocationSuffix()
    }

    /**
     * explicitGenericInvocationSuffix
     *     : SUPER superSuffix
     *     | identifier arguments
     *     ;
     */
    @SubhutiRule
    explicitGenericInvocationSuffix(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.SUPER()
                    this.superSuffix()
                }
            },
            {
                alt: () => {
                    this.identifier()
                    this.arguments()
                }
            }
        ])
    }


    // ============================================
    // 注解
    // ============================================

    /**
     * annotation
     *     : '@' qualifiedName ('(' (elementValuePairs | elementValue)? ')')?
     *     ;
     */
    @SubhutiRule
    annotation(): SubhutiCst | undefined {
        this.tokenConsumer.AT()
        this.qualifiedName()
        this.Option(() => {
            this.tokenConsumer.LPAREN()
            this.Option(() => this.Or([
                { alt: () => this.elementValuePairs() },
                { alt: () => this.elementValue() },
            ]))
            this.tokenConsumer.RPAREN()
        })
        return this.curCst
    }

    /**
     * elementValuePairs
     *     : elementValuePair (',' elementValuePair)*
     *     ;
     */
    @SubhutiRule
    elementValuePairs(): SubhutiCst | undefined {
        this.elementValuePair()
        this.Many(() => {
            this.tokenConsumer.COMMA()
            this.elementValuePair()
        })
        return this.curCst
    }

    /**
     * elementValuePair
     *     : identifier '=' elementValue
     *     ;
     */
    @SubhutiRule
    elementValuePair(): SubhutiCst | undefined {
        this.identifier()
        this.tokenConsumer.ASSIGN()
        return this.elementValue()
    }

    /**
     * elementValue
     *     : expression
     *     | annotation
     *     | elementValueArrayInitializer
     *     ;
     */
    @SubhutiRule
    elementValue(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.expression() },
            { alt: () => this.annotation() },
            { alt: () => this.elementValueArrayInitializer() },
        ])
    }


    /**
     * elementValueArrayInitializer
     *     : '{' (elementValue (',' elementValue)*)? ','? '}'
     *     ;
     */
    @SubhutiRule
    elementValueArrayInitializer(): SubhutiCst | undefined {
        this.tokenConsumer.LBRACE()
        this.Option(() => {
            this.elementValue()
            this.Many(() => {
                this.tokenConsumer.COMMA()
                this.elementValue()
            })
        })
        this.Option(() => this.tokenConsumer.COMMA())
        return this.tokenConsumer.RBRACE()
    }

    /**
     * annotationTypeBody
     *     : '{' annotationTypeElementDeclaration* '}'
     *     ;
     */
    @SubhutiRule
    annotationTypeBody(): SubhutiCst | undefined {
        this.tokenConsumer.LBRACE()
        this.Many(() => this.annotationTypeElementDeclaration())
        return this.tokenConsumer.RBRACE()
    }

    /**
     * annotationTypeElementDeclaration
     *     : modifier* annotationTypeElementRest
     *     | ';'
     *     ;
     */
    @SubhutiRule
    annotationTypeElementDeclaration(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.Many(() => this.modifier())
                    this.annotationTypeElementRest()
                }
            },
            { alt: () => this.tokenConsumer.SEMI() }
        ])
    }

    /**
     * annotationTypeElementRest
     *     : typeType annotationMethodOrConstantRest ';'
     *     | classDeclaration ';'?
     *     | interfaceDeclaration ';'?
     *     | enumDeclaration ';'?
     *     | annotationTypeDeclaration ';'?
     *     | recordDeclaration ';'?
     *     ;
     */
    @SubhutiRule
    annotationTypeElementRest(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.typeType()
                    this.annotationMethodOrConstantRest()
                    this.tokenConsumer.SEMI()
                }
            },
            {
                alt: () => {
                    this.classDeclaration()
                    this.Option(() => this.tokenConsumer.SEMI())
                }
            },
            {
                alt: () => {
                    this.interfaceDeclaration()
                    this.Option(() => this.tokenConsumer.SEMI())
                }
            },
            {
                alt: () => {
                    this.enumDeclaration()
                    this.Option(() => this.tokenConsumer.SEMI())
                }
            },
            {
                alt: () => {
                    this.annotationTypeDeclaration()
                    this.Option(() => this.tokenConsumer.SEMI())
                }
            },
            {
                alt: () => {
                    this.recordDeclaration()
                    this.Option(() => this.tokenConsumer.SEMI())
                }
            },
        ])
    }


    /**
     * annotationMethodOrConstantRest
     *     : annotationMethodRest
     *     | annotationConstantRest
     *     ;
     */
    @SubhutiRule
    annotationMethodOrConstantRest(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.annotationMethodRest() },
            { alt: () => this.annotationConstantRest() },
        ])
    }

    /**
     * annotationMethodRest
     *     : identifier '(' ')' defaultValue?
     *     ;
     */
    @SubhutiRule
    annotationMethodRest(): SubhutiCst | undefined {
        this.identifier()
        this.tokenConsumer.LPAREN()
        this.tokenConsumer.RPAREN()
        this.Option(() => this.defaultValue())
        return this.curCst
    }

    /**
     * annotationConstantRest
     *     : variableDeclarators
     *     ;
     */
    @SubhutiRule
    annotationConstantRest(): SubhutiCst | undefined {
        return this.variableDeclarators()
    }

    /**
     * defaultValue
     *     : DEFAULT elementValue
     *     ;
     */
    @SubhutiRule
    defaultValue(): SubhutiCst | undefined {
        this.tokenConsumer.DEFAULT()
        return this.elementValue()
    }

    // ============================================
    // 模块系统
    // ============================================

    /**
     * moduleDeclaration
     *     : annotation* OPEN? MODULE qualifiedName '{' moduleDirective* '}'
     *     ;
     */
    @SubhutiRule
    moduleDeclaration(): SubhutiCst | undefined {
        this.Many(() => this.annotation())
        this.Option(() => this.tokenConsumer.OPEN())
        this.tokenConsumer.MODULE()
        this.qualifiedName()
        this.tokenConsumer.LBRACE()
        this.Many(() => this.moduleDirective())
        return this.tokenConsumer.RBRACE()
    }


    /**
     * moduleDirective
     *     : REQUIRES requiresModifier* qualifiedName ';'
     *     | EXPORTS qualifiedName (TO qualifiedName (',' qualifiedName)*)? ';'
     *     | OPENS qualifiedName (TO qualifiedName (',' qualifiedName)*)? ';'
     *     | USES qualifiedName ';'
     *     | PROVIDES qualifiedName WITH qualifiedName (',' qualifiedName)* ';'
     *     ;
     */
    @SubhutiRule
    moduleDirective(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.REQUIRES()
                    this.Many(() => this.requiresModifier())
                    this.qualifiedName()
                    this.tokenConsumer.SEMI()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.EXPORTS()
                    this.qualifiedName()
                    this.Option(() => {
                        this.tokenConsumer.TO()
                        this.qualifiedName()
                        this.Many(() => {
                            this.tokenConsumer.COMMA()
                            this.qualifiedName()
                        })
                    })
                    this.tokenConsumer.SEMI()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.OPENS()
                    this.qualifiedName()
                    this.Option(() => {
                        this.tokenConsumer.TO()
                        this.qualifiedName()
                        this.Many(() => {
                            this.tokenConsumer.COMMA()
                            this.qualifiedName()
                        })
                    })
                    this.tokenConsumer.SEMI()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.USES()
                    this.qualifiedName()
                    this.tokenConsumer.SEMI()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.PROVIDES()
                    this.qualifiedName()
                    this.tokenConsumer.WITH()
                    this.qualifiedName()
                    this.Many(() => {
                        this.tokenConsumer.COMMA()
                        this.qualifiedName()
                    })
                    this.tokenConsumer.SEMI()
                }
            }
        ])
    }

    /**
     * requiresModifier
     *     : TRANSITIVE | STATIC
     *     ;
     */
    @SubhutiRule
    requiresModifier(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.tokenConsumer.TRANSITIVE() },
            { alt: () => this.tokenConsumer.STATIC() },
        ])
    }


    // ============================================
    // Record 相关
    // ============================================

    /**
     * recordHeader
     *     : '(' recordComponentList? ')'
     *     ;
     */
    @SubhutiRule
    recordHeader(): SubhutiCst | undefined {
        this.tokenConsumer.LPAREN()
        this.Option(() => this.recordComponentList())
        return this.tokenConsumer.RPAREN()
    }

    /**
     * recordComponentList
     *     : recordComponent (',' recordComponent)*
     *     ;
     */
    @SubhutiRule
    recordComponentList(): SubhutiCst | undefined {
        this.recordComponent()
        this.Many(() => {
            this.tokenConsumer.COMMA()
            this.recordComponent()
        })
        return this.curCst
    }

    /**
     * recordComponent
     *     : typeType identifier
     *     ;
     */
    @SubhutiRule
    recordComponent(): SubhutiCst | undefined {
        this.typeType()
        return this.identifier()
    }

    /**
     * recordBody
     *     : '{' classBodyDeclaration* '}'
     *     ;
     */
    @SubhutiRule
    recordBody(): SubhutiCst | undefined {
        this.tokenConsumer.LBRACE()
        this.Many(() => this.classBodyDeclaration())
        return this.tokenConsumer.RBRACE()
    }

    // ============================================
    // 枚举相关
    // ============================================

    /**
     * enumConstants
     *     : enumConstant (',' enumConstant)*
     *     ;
     */
    @SubhutiRule
    enumConstants(): SubhutiCst | undefined {
        this.enumConstant()
        this.Many(() => {
            this.tokenConsumer.COMMA()
            this.enumConstant()
        })
        return this.curCst
    }

    /**
     * enumConstant
     *     : annotation* identifier arguments? classBody?
     *     ;
     */
    @SubhutiRule
    enumConstant(): SubhutiCst | undefined {
        this.Many(() => this.annotation())
        this.identifier()
        this.Option(() => this.arguments())
        this.Option(() => this.classBody())
        return this.curCst
    }

    /**
     * enumBodyDeclarations
     *     : ';' classBodyDeclaration*
     *     ;
     */
    @SubhutiRule
    enumBodyDeclarations(): SubhutiCst | undefined {
        this.tokenConsumer.SEMI()
        this.Many(() => this.classBodyDeclaration())
        return this.curCst
    }


    // ============================================
    // 接口相关
    // ============================================

    /**
     * interfaceBody
     *     : '{' interfaceBodyDeclaration* '}'
     *     ;
     */
    @SubhutiRule
    interfaceBody(): SubhutiCst | undefined {
        this.tokenConsumer.LBRACE()
        this.Many(() => this.interfaceBodyDeclaration())
        return this.tokenConsumer.RBRACE()
    }

    /**
     * interfaceBodyDeclaration
     *     : modifier* interfaceMemberDeclaration
     *     | ';'
     *     ;
     */
    @SubhutiRule
    interfaceBodyDeclaration(): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.Many(() => this.modifier())
                    this.interfaceMemberDeclaration()
                }
            },
            { alt: () => this.tokenConsumer.SEMI() }
        ])
    }

    /**
     * interfaceMemberDeclaration
     *     : constDeclaration
     *     | interfaceMethodDeclaration
     *     | genericInterfaceMethodDeclaration
     *     | interfaceDeclaration
     *     | annotationTypeDeclaration
     *     | classDeclaration
     *     | enumDeclaration
     *     | recordDeclaration
     *     ;
     */
    @SubhutiRule
    interfaceMemberDeclaration(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.constDeclaration() },
            { alt: () => this.genericInterfaceMethodDeclaration() },
            { alt: () => this.interfaceMethodDeclaration() },
            { alt: () => this.interfaceDeclaration() },
            { alt: () => this.annotationTypeDeclaration() },
            { alt: () => this.classDeclaration() },
            { alt: () => this.enumDeclaration() },
            { alt: () => this.recordDeclaration() },
        ])
    }

    /**
     * constDeclaration
     *     : typeType constantDeclarator (',' constantDeclarator)* ';'
     *     ;
     */
    @SubhutiRule
    constDeclaration(): SubhutiCst | undefined {
        this.typeType()
        this.constantDeclarator()
        this.Many(() => {
            this.tokenConsumer.COMMA()
            this.constantDeclarator()
        })
        return this.tokenConsumer.SEMI()
    }


    /**
     * constantDeclarator
     *     : identifier ('[' ']')* '=' variableInitializer
     *     ;
     */
    @SubhutiRule
    constantDeclarator(): SubhutiCst | undefined {
        this.identifier()
        this.Many(() => {
            this.tokenConsumer.LBRACK()
            this.tokenConsumer.RBRACK()
        })
        this.tokenConsumer.ASSIGN()
        return this.variableInitializer()
    }

    /**
     * interfaceMethodDeclaration
     *     : interfaceMethodModifier* interfaceCommonBodyDeclaration
     *     ;
     */
    @SubhutiRule
    interfaceMethodDeclaration(): SubhutiCst | undefined {
        this.Many(() => this.interfaceMethodModifier())
        return this.interfaceCommonBodyDeclaration()
    }

    /**
     * interfaceMethodModifier
     *     : annotation | PUBLIC | ABSTRACT | DEFAULT | STATIC | STRICTFP
     *     ;
     */
    @SubhutiRule
    interfaceMethodModifier(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.annotation() },
            { alt: () => this.tokenConsumer.PUBLIC() },
            { alt: () => this.tokenConsumer.ABSTRACT() },
            { alt: () => this.tokenConsumer.DEFAULT() },
            { alt: () => this.tokenConsumer.STATIC() },
            { alt: () => this.tokenConsumer.STRICTFP() },
        ])
    }

    /**
     * genericInterfaceMethodDeclaration
     *     : interfaceMethodModifier* typeParameters interfaceCommonBodyDeclaration
     *     ;
     */
    @SubhutiRule
    genericInterfaceMethodDeclaration(): SubhutiCst | undefined {
        this.Many(() => this.interfaceMethodModifier())
        this.typeParameters()
        return this.interfaceCommonBodyDeclaration()
    }

    /**
     * interfaceCommonBodyDeclaration
     *     : annotation* typeTypeOrVoid identifier formalParameters ('[' ']')* (THROWS qualifiedNameList)? methodBody
     *     ;
     */
    @SubhutiRule
    interfaceCommonBodyDeclaration(): SubhutiCst | undefined {
        this.Many(() => this.annotation())
        this.typeTypeOrVoid()
        this.identifier()
        this.formalParameters()
        this.Many(() => {
            this.tokenConsumer.LBRACK()
            this.tokenConsumer.RBRACK()
        })
        this.Option(() => {
            this.tokenConsumer.THROWS()
            this.qualifiedNameList()
        })
        return this.methodBody()
    }

    /**
     * methodBody
     *     : block
     *     | ';'
     *     ;
     */
    @SubhutiRule
    methodBody(): SubhutiCst | undefined {
        return this.Or([
            { alt: () => this.block() },
            { alt: () => this.tokenConsumer.SEMI() },
        ])
    }
}
