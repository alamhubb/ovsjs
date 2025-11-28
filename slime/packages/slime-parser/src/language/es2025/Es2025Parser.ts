/**
 * ES2025 Parser - 完全符合 ECMAScript® 2025 规范的 Parser
 * 规范：https://tc39.es/ecma262/2025/#sec-grammar-summary
 *
 * 设计原则：
 * 1. 完全按照规范语法实现，一对一映射
 * 2. 每个规则都是独立的方法，使用 @SubhutiRule 装饰器
 * 3. 使用 Es2025TokenConsumer 提供类型安全的 token 消费
 * 4. 支持所有参数化规则 [Yield, Await, In, Return, Default, Tagged]
 *
 * @version 1.0.0
 */

import SubhutiParser, {Subhuti, SubhutiRule} from "subhuti/src/SubhutiParser.ts"
import type SubhutiCst from "subhuti/src/struct/SubhutiCst.ts"
import type SubhutiMatchToken from "subhuti/src/struct/SubhutiMatchToken.ts"
import Es2025TokenConsumer from "./Es2025TokenConsumer.ts"
import {ReservedWords} from "./Es2025Tokens.ts"

// ============================================
// 参数化规则的参数接口
// ============================================

interface ExpressionParams {
    In?: boolean      // 是否允许 in 运算符
    Yield?: boolean   // 是否在 Generator 上下文
    Await?: boolean   // 是否在 Async 上下文
}

interface StatementParams {
    Yield?: boolean   // 是否在 Generator 上下文
    Await?: boolean   // 是否在 Async 上下文
    Return?: boolean  // 是否允许 return 语句
}

interface DeclarationParams {
    Yield?: boolean   // 是否在 Generator 上下文
    Await?: boolean   // 是否在 Async 上下文
    Default?: boolean // 是否是默认导出
}

interface TemplateLiteralParams {
    Yield?: boolean   // 是否在 Generator 上下文
    Await?: boolean   // 是否在 Async 上下文
    Tagged?: boolean  // 是否是 Tagged 模板
}

// ============================================
// Es2025Parser 主类
// ============================================

@Subhuti
export default class Es2025Parser extends SubhutiParser<Es2025TokenConsumer> {
    constructor(tokens: SubhutiMatchToken[] = []) {
        super(tokens, Es2025TokenConsumer)
    }

    // ============================================
    // A.2 Expressions
    // ============================================

    // ----------------------------------------
    // A.2.1 Identifier References
    // ----------------------------------------

    /**
     * IdentifierReference[Yield, Await] :
     *     Identifier
     *     [~Yield] yield
     *     [~Await] await
     */
    @SubhutiRule
    IdentifierReference(params: ExpressionParams = {}): SubhutiCst | undefined {
        const {Yield = false, Await = false} = params

        return this.Or([
            // Identifier (排除保留字)
            {alt: () => this.Identifier()},
            // [~Yield] yield - 条件展开
            ...(!Yield ? [{alt: () => this.tokenConsumer.YieldTok()}] : []),
            // [~Await] await - 条件展开
            ...(!Await ? [{alt: () => this.tokenConsumer.AwaitTok()}] : [])
        ])
    }

    /**
     * BindingIdentifier[Yield, Await] :
     *     Identifier
     *     yield
     *     await
     */
    @SubhutiRule
    BindingIdentifier(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.Identifier()},
            {alt: () => this.tokenConsumer.YieldTok()},
            {alt: () => this.tokenConsumer.AwaitTok()}
        ])
    }

    /**
     * LabelIdentifier[Yield, Await] :
     *     Identifier
     *     [~Yield] yield
     *     [~Await] await
     */
    @SubhutiRule
    LabelIdentifier(params: ExpressionParams = {}): SubhutiCst | undefined {
        const {Yield = false, Await = false} = params

        return this.Or([
            {alt: () => this.Identifier()},
            // [~Yield] yield - 条件展开
            ...(!Yield ? [{alt: () => this.tokenConsumer.YieldTok()}] : []),
            // [~Await] await - 条件展开
            ...(!Await ? [{alt: () => this.tokenConsumer.AwaitTok()}] : [])
        ])
    }

    /**
     * Identifier :
     *     IdentifierName but not ReservedWord
     */
    @SubhutiRule
    Identifier(): SubhutiCst | undefined {
        const cst = this.tokenConsumer.IdentifierNameTok()
        if (cst && ReservedWords.has(cst.value!)) {
            // 是保留字，解析失败
            return this.parserFail()
        }
        return cst
    }

    /**
     * IdentifierName - 语法层规则
     *
     * 按照 ES2025 规范，IdentifierName 包括所有标识符字符序列（包括关键字）
     * 用于：属性名、成员访问、ModuleExportName 等场景
     *
     * 注意：词法层的 IdentifierNameTok 只匹配非关键字标识符，
     * 所以这里需要显式包含所有关键字 token
     */
    @SubhutiRule
    IdentifierName(): SubhutiCst | undefined {
        return this.Or([
            // 普通标识符
            {alt: () => this.tokenConsumer.IdentifierNameTok()},
            // 所有 ReservedWord 都可以作为 IdentifierName
            {alt: () => this.tokenConsumer.AwaitTok()},
            {alt: () => this.tokenConsumer.BreakTok()},
            {alt: () => this.tokenConsumer.CaseTok()},
            {alt: () => this.tokenConsumer.CatchTok()},
            {alt: () => this.tokenConsumer.ClassTok()},
            {alt: () => this.tokenConsumer.ConstTok()},
            {alt: () => this.tokenConsumer.ContinueTok()},
            {alt: () => this.tokenConsumer.DebuggerTok()},
            {alt: () => this.tokenConsumer.DefaultTok()},
            {alt: () => this.tokenConsumer.DeleteTok()},
            {alt: () => this.tokenConsumer.DoTok()},
            {alt: () => this.tokenConsumer.ElseTok()},
            {alt: () => this.tokenConsumer.EnumTok()},
            {alt: () => this.tokenConsumer.ExportTok()},
            {alt: () => this.tokenConsumer.ExtendsTok()},
            {alt: () => this.tokenConsumer.FalseTok()},
            {alt: () => this.tokenConsumer.FinallyTok()},
            {alt: () => this.tokenConsumer.ForTok()},
            {alt: () => this.tokenConsumer.FunctionTok()},
            {alt: () => this.tokenConsumer.IfTok()},
            {alt: () => this.tokenConsumer.ImportTok()},
            {alt: () => this.tokenConsumer.InTok()},
            {alt: () => this.tokenConsumer.InstanceofTok()},
            {alt: () => this.tokenConsumer.NewTok()},
            {alt: () => this.tokenConsumer.NullTok()},
            {alt: () => this.tokenConsumer.ReturnTok()},
            {alt: () => this.tokenConsumer.SuperTok()},
            {alt: () => this.tokenConsumer.SwitchTok()},
            {alt: () => this.tokenConsumer.ThisTok()},
            {alt: () => this.tokenConsumer.ThrowTok()},
            {alt: () => this.tokenConsumer.TrueTok()},
            {alt: () => this.tokenConsumer.TryTok()},
            {alt: () => this.tokenConsumer.TypeofTok()},
            {alt: () => this.tokenConsumer.VarTok()},
            {alt: () => this.tokenConsumer.VoidTok()},
            {alt: () => this.tokenConsumer.WhileTok()},
            {alt: () => this.tokenConsumer.WithTok()},
            {alt: () => this.tokenConsumer.YieldTok()},
            // 上下文关键字（虽然在词法层是 keyword token，但也可能出现在这些场景）
            {alt: () => this.tokenConsumer.AsyncTok()},
            {alt: () => this.tokenConsumer.LetTok()},
            {alt: () => this.tokenConsumer.StaticTok()},
            {alt: () => this.tokenConsumer.AsTok()},
            // 软关键字（get, set, of, target, meta, from）
            // 这些已经返回 IdentifierNameTok，所以被第一个分支覆盖
        ])
    }

    // ----------------------------------------
    // A.2.2 Primary Expressions
    // ----------------------------------------

    /**
     * PrimaryExpression[Yield, Await] :
     *     this
     *     IdentifierReference[?Yield, ?Await]
     *     Literal
     *     ArrayLiteral[?Yield, ?Await]
     *     ObjectLiteral[?Yield, ?Await]
     *     FunctionExpression
     *     ClassExpression[?Yield, ?Await]
     *     GeneratorExpression
     *     AsyncFunctionExpression
     *     AsyncGeneratorExpression
     *     RegularExpressionLiteral
     *     TemplateLiteral[?Yield, ?Await, ~Tagged]
     *     CoverParenthesizedExpressionAndArrowParameterList[?Yield, ?Await]
     */
    @SubhutiRule
    PrimaryExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.tokenConsumer.ThisTok()},
            {alt: () => this.IdentifierReference(params)},
            {alt: () => this.Literal()},
            {alt: () => this.ArrayLiteral(params)},
            {alt: () => this.ObjectLiteral(params)},
            {alt: () => this.FunctionExpression()},
            {alt: () => this.ClassExpression(params)},
            {alt: () => this.GeneratorExpression()},
            {alt: () => this.AsyncFunctionExpression()},
            {alt: () => this.AsyncGeneratorExpression()},
            {alt: () => this.tokenConsumer.RegularExpression()},
            {alt: () => this.TemplateLiteral({...params, Tagged: false})},
            {alt: () => this.CoverParenthesizedExpressionAndArrowParameterList(params)}
        ])
    }

    /**
     * CoverParenthesizedExpressionAndArrowParameterList[Yield, Await] :
     *     ( Expression[+In, ?Yield, ?Await] )
     *     ( Expression[+In, ?Yield, ?Await] , )
     *     ( )
     *     ( ... BindingIdentifier[?Yield, ?Await] )
     *     ( ... BindingPattern[?Yield, ?Await] )
     *     ( Expression[+In, ?Yield, ?Await] , ... BindingIdentifier[?Yield, ?Await] )
     *     ( Expression[+In, ?Yield, ?Await] , ... BindingPattern[?Yield, ?Await] )
     */
    @SubhutiRule
    CoverParenthesizedExpressionAndArrowParameterList(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // ( Expression[+In, ?Yield, ?Await] )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RParen()
                }
            },
            // ( Expression[+In, ?Yield, ?Await] , )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.Comma()
                    this.tokenConsumer.RParen()
                }
            },
            // ( )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.tokenConsumer.RParen()
                }
            },
            // ( ... BindingIdentifier[?Yield, ?Await] )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.tokenConsumer.Ellipsis()
                    this.BindingIdentifier(params)
                    this.tokenConsumer.RParen()
                }
            },
            // ( ... BindingPattern[?Yield, ?Await] )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.tokenConsumer.Ellipsis()
                    this.BindingPattern(params)
                    this.tokenConsumer.RParen()
                }
            },
            // ( Expression[+In, ?Yield, ?Await] , ... BindingIdentifier[?Yield, ?Await] )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.Comma()
                    this.tokenConsumer.Ellipsis()
                    this.BindingIdentifier(params)
                    this.tokenConsumer.RParen()
                }
            },
            // ( Expression[+In, ?Yield, ?Await] , ... BindingPattern[?Yield, ?Await] )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.Comma()
                    this.tokenConsumer.Ellipsis()
                    this.BindingPattern(params)
                    this.tokenConsumer.RParen()
                }
            }
        ])
    }

    /**
     * ParenthesizedExpression[Yield, Await] :
     *     ( Expression[+In, ?Yield, ?Await] )
     *
     * Supplemental Syntax:
     * When processing PrimaryExpression : CoverParenthesizedExpressionAndArrowParameterList,
     * the interpretation is refined using this rule.
     *
     * 注意：此方法是 Cover Grammar 的精化版本，与规范完全对应。
     */
    @SubhutiRule
    ParenthesizedExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.LParen()
        this.Expression({...params, In: true})
        return this.tokenConsumer.RParen()
    }

    // ----------------------------------------
    // A.2.3 Literals
    // ----------------------------------------

    /**
     * Literal :
     *     NullLiteral
     *     BooleanLiteral
     *     NumericLiteral
     *     StringLiteral
     */
    @SubhutiRule
    Literal(): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.tokenConsumer.NullTok()},
            {alt: () => this.tokenConsumer.TrueTok()},
            {alt: () => this.tokenConsumer.FalseTok()},
            {alt: () => this.tokenConsumer.Number()},
            {alt: () => this.tokenConsumer.String()}
        ])
    }

    /**
     * ArrayLiteral[Yield, Await] :
     *     [ Elision_opt ]
     *     [ ElementList[?Yield, ?Await] ]
     *     [ ElementList[?Yield, ?Await] , Elision_opt ]
     */
    @SubhutiRule
    ArrayLiteral(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // [ Elision_opt ]
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.Option(() => this.Elision())
                    this.tokenConsumer.RBracket()
                }
            },
            // [ ElementList[?Yield, ?Await] , Elision_opt ]
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.ElementList(params)
                    this.tokenConsumer.Comma()
                    this.Option(() => this.Elision())
                    this.tokenConsumer.RBracket()
                }
            },
            // [ ElementList[?Yield, ?Await] ]
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.ElementList(params)
                    this.tokenConsumer.RBracket()
                }
            }
        ])
    }

    /**
     * ElementList[Yield, Await] :
     *     Elision_opt AssignmentExpression[+In, ?Yield, ?Await]
     *     Elision_opt SpreadElement[?Yield, ?Await]
     *     ElementList[?Yield, ?Await] , Elision_opt AssignmentExpression[+In, ?Yield, ?Await]
     *     ElementList[?Yield, ?Await] , Elision_opt SpreadElement[?Yield, ?Await]
     */
    @SubhutiRule
    ElementList(params: ExpressionParams = {}): SubhutiCst | undefined {
        // 第一个元素
        this.Option(() => this.Elision())
        this.Or([
            {alt: () => this.AssignmentExpression({...params, In: true})},
            {alt: () => this.SpreadElement(params)}
        ])

        // 后续元素 (0个或多个)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.Option(() => this.Elision())
            this.Or([
                {alt: () => this.AssignmentExpression({...params, In: true})},
                {alt: () => this.SpreadElement(params)}
            ])
        })

        return this.curCst
    }

    /**
     * Elision :
     *     ,
     *     Elision ,
     */
    @SubhutiRule
    Elision(): SubhutiCst | undefined {
        this.tokenConsumer.Comma()
        this.Many(() => this.tokenConsumer.Comma())
        return this.curCst
    }

    /**
     * SpreadElement[Yield, Await] :
     *     ... AssignmentExpression[+In, ?Yield, ?Await]
     */
    @SubhutiRule
    SpreadElement(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Ellipsis()
        return this.AssignmentExpression({...params, In: true})
    }

    /**
     * ObjectLiteral[Yield, Await] :
     *     { }
     *     { PropertyDefinitionList[?Yield, ?Await] }
     *     { PropertyDefinitionList[?Yield, ?Await] , }
     */
    @SubhutiRule
    ObjectLiteral(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // { }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.tokenConsumer.RBrace()
                }
            },
            // { PropertyDefinitionList[?Yield, ?Await] , }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.PropertyDefinitionList(params)
                    this.tokenConsumer.Comma()
                    this.tokenConsumer.RBrace()
                }
            },
            // { PropertyDefinitionList[?Yield, ?Await] }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.PropertyDefinitionList(params)
                    this.tokenConsumer.RBrace()
                }
            }
        ])
    }

    /**
     * PropertyDefinitionList[Yield, Await] :
     *     PropertyDefinition[?Yield, ?Await]
     *     PropertyDefinitionList[?Yield, ?Await] , PropertyDefinition[?Yield, ?Await]
     */
    @SubhutiRule
    PropertyDefinitionList(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.PropertyDefinition(params)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.PropertyDefinition(params)
        })
        return this.curCst
    }

    /**
     * PropertyDefinition[Yield, Await] :
     *     IdentifierReference[?Yield, ?Await]
     *     CoverInitializedName[?Yield, ?Await]
     *     PropertyName[?Yield, ?Await] : AssignmentExpression[+In, ?Yield, ?Await]
     *     MethodDefinition[?Yield, ?Await]
     *     ... AssignmentExpression[+In, ?Yield, ?Await]
     *
     * ⚠️ Or 顺序调整：
     * 为了正确处理 PEG 的贪婪匹配，将更具体的规则（带明确分隔符的）放在前面：
     * 1. ... AssignmentExpression - 有明确的 `...` 前缀
     * 2. PropertyName : AssignmentExpression - 有明确的 `:` 分隔符
     * 3. CoverInitializedName - 有明确的 `=` 分隔符
     * 4. MethodDefinition - 有明确的函数签名
     * 5. IdentifierReference - 简写属性，最宽松，放最后
     */
    @SubhutiRule
    PropertyDefinition(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // 1. ... AssignmentExpression - 扩展属性（最明确）
            {
                alt: () => {
                    this.tokenConsumer.Ellipsis()
                    this.AssignmentExpression({...params, In: true})
                }
            },
            // 2. PropertyName : AssignmentExpression - 完整属性（有 : 分隔符）
            {
                alt: () => {
                    this.PropertyName(params)
                    this.tokenConsumer.Colon()
                    this.AssignmentExpression({...params, In: true})
                }
            },
            // 3. CoverInitializedName - 带默认值的简写（有 = 分隔符）
            {alt: () => this.CoverInitializedName(params)},
            // 4. MethodDefinition - 方法定义
            {alt: () => this.MethodDefinition(params)},
            // 5. IdentifierReference - 简写属性（最后尝试）
            {alt: () => this.IdentifierReference(params)}
        ])
    }

    /**
     * PropertyName[Yield, Await] :
     *     LiteralPropertyName
     *     ComputedPropertyName[?Yield, ?Await]
     */
    @SubhutiRule
    PropertyName(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.LiteralPropertyName()},
            {alt: () => this.ComputedPropertyName(params)}
        ])
    }

    /**
     * LiteralPropertyName :
     *     IdentifierName
     *     StringLiteral
     *     NumericLiteral
     */
    @SubhutiRule
    LiteralPropertyName(): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.IdentifierName()},
            {alt: () => this.tokenConsumer.String()},
            {alt: () => this.tokenConsumer.Number()}
        ])
    }

    /**
     * ComputedPropertyName[Yield, Await] :
     *     [ AssignmentExpression[+In, ?Yield, ?Await] ]
     */
    @SubhutiRule
    ComputedPropertyName(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.LBracket()
        this.AssignmentExpression({...params, In: true})
        return this.tokenConsumer.RBracket()
    }

    /**
     * CoverInitializedName[Yield, Await] :
     *     IdentifierReference[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]
     */
    @SubhutiRule
    CoverInitializedName(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.IdentifierReference(params)
        return this.Initializer({...params, In: true})
    }

    /**
     * Initializer[In, Yield, Await] :
     *     = AssignmentExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    Initializer(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Assign()
        return this.AssignmentExpression(params)
    }

    // ----------------------------------------
    // A.2.4 Template Literals
    // ----------------------------------------

    /**
     * TemplateLiteral[Yield, Await, Tagged] :
     *     NoSubstitutionTemplate
     *     SubstitutionTemplate[?Yield, ?Await, ?Tagged]
     */
    @SubhutiRule
    TemplateLiteral(params: TemplateLiteralParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.tokenConsumer.NoSubstitutionTemplate()},
            {alt: () => this.SubstitutionTemplate(params)}
        ])
    }

    /**
     * SubstitutionTemplate[Yield, Await, Tagged] :
     *     TemplateHead Expression[+In, ?Yield, ?Await] TemplateSpans[?Yield, ?Await, ?Tagged]
     */
    @SubhutiRule
    SubstitutionTemplate(params: TemplateLiteralParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.TemplateHead()
        this.Expression({...params, In: true})
        return this.TemplateSpans(params)
    }

    /**
     * TemplateSpans[Yield, Await, Tagged] :
     *     TemplateTail
     *     TemplateMiddleList[?Yield, ?Await, ?Tagged] TemplateTail
     */
    @SubhutiRule
    TemplateSpans(params: TemplateLiteralParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.tokenConsumer.TemplateTail()},
            {
                alt: () => {
                    this.TemplateMiddleList(params)
                    this.tokenConsumer.TemplateTail()
                }
            }
        ])
    }

    /**
     * TemplateMiddleList[Yield, Await, Tagged] :
     *     TemplateMiddle Expression[+In, ?Yield, ?Await]
     *     TemplateMiddleList[?Yield, ?Await, ?Tagged] TemplateMiddle Expression[+In, ?Yield, ?Await]
     */
    @SubhutiRule
    TemplateMiddleList(params: TemplateLiteralParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.TemplateMiddle()
        this.Expression({...params, In: true})

        this.Many(() => {
            this.tokenConsumer.TemplateMiddle()
            this.Expression({...params, In: true})
        })

        return this.curCst
    }

    // ----------------------------------------
    // A.2.5 Member Expressions
    // ----------------------------------------

    /**
     * MemberExpression[Yield, Await] :
     *     PrimaryExpression[?Yield, ?Await]
     *     MemberExpression[?Yield, ?Await] [ Expression[+In, ?Yield, ?Await] ]
     *     MemberExpression[?Yield, ?Await] . IdentifierName
     *     MemberExpression[?Yield, ?Await] TemplateLiteral[?Yield, ?Await, +Tagged]
     *     SuperProperty[?Yield, ?Await]
     *     MetaProperty
     *     new MemberExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
     *     MemberExpression[?Yield, ?Await] . PrivateIdentifier
     */
    @SubhutiRule
    MemberExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        // 基础表达式
        this.Or([
            {alt: () => this.PrimaryExpression(params)},
            {alt: () => this.SuperProperty(params)},
            {alt: () => this.MetaProperty()},
            {
                alt: () => {
                    this.tokenConsumer.NewTok()
                    this.MemberExpression(params)
                    this.Arguments(params)
                }
            }
        ])

        // 后缀操作符 (0个或多个)
        this.Many(() => this.Or([
            // [ Expression[+In, ?Yield, ?Await] ]
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RBracket()
                }
            },
            // . IdentifierName
            {
                alt: () => {
                    this.tokenConsumer.Dot()
                    this.IdentifierName()
                }
            },
            // TemplateLiteral[?Yield, ?Await, +Tagged]
            {alt: () => this.TemplateLiteral({...params, Tagged: true})},
            // . PrivateIdentifier
            {
                alt: () => {
                    this.tokenConsumer.Dot()
                    this.tokenConsumer.PrivateIdentifier()
                }
            }
        ]))

        return this.curCst
    }

    /**
     * SuperProperty[Yield, Await] :
     *     super [ Expression[+In, ?Yield, ?Await] ]
     *     super . IdentifierName
     */
    @SubhutiRule
    SuperProperty(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.SuperTok()
                    this.tokenConsumer.LBracket()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RBracket()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.SuperTok()
                    this.tokenConsumer.Dot()
                    this.IdentifierName()
                }
            }
        ])
    }

    /**
     * MetaProperty :
     *     NewTarget
     *     ImportMeta
     */
    @SubhutiRule
    MetaProperty(): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.NewTarget()},
            {alt: () => this.ImportMeta()}
        ])
    }

    /**
     * NewTarget :
     *     new . target
     */
    @SubhutiRule
    NewTarget(): SubhutiCst | undefined {
        this.tokenConsumer.NewTok()
        this.tokenConsumer.Dot()
        return this.tokenConsumer.TargetTok()
    }

    /**
     * ImportMeta :
     *     import . meta
     */
    @SubhutiRule
    ImportMeta(): SubhutiCst | undefined {
        this.tokenConsumer.ImportTok()
        this.tokenConsumer.Dot()
        return this.tokenConsumer.MetaTok()
    }

    /**
     * NewExpression[Yield, Await] :
     *     MemberExpression[?Yield, ?Await]
     *     new NewExpression[?Yield, ?Await]
     */
    @SubhutiRule
    NewExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.MemberExpression(params)},
            {
                alt: () => {
                    this.tokenConsumer.NewTok()
                    this.NewExpression(params)
                }
            }
        ])
    }

    // ----------------------------------------
    // A.2.6 Call Expressions
    // ----------------------------------------

    /**
     * CallExpression[Yield, Await] :
     *     CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await]
     *     SuperCall[?Yield, ?Await]
     *     ImportCall[?Yield, ?Await]
     *     CallExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
     *     CallExpression[?Yield, ?Await] [ Expression[+In, ?Yield, ?Await] ]
     *     CallExpression[?Yield, ?Await] . IdentifierName
     *     CallExpression[?Yield, ?Await] TemplateLiteral[?Yield, ?Await, +Tagged]
     *     CallExpression[?Yield, ?Await] . PrivateIdentifier
     */
    @SubhutiRule
    CallExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        // 基础调用表达式
        this.Or([
            {alt: () => this.CoverCallExpressionAndAsyncArrowHead(params)},
            {alt: () => this.SuperCall(params)},
            {alt: () => this.ImportCall(params)}
        ])

        // 后缀操作符 (0个或多个)
        this.Many(() => this.Or([
            // Arguments[?Yield, ?Await]
            {alt: () => this.Arguments(params)},
            // [ Expression[+In, ?Yield, ?Await] ]
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RBracket()
                }
            },
            // . IdentifierName
            {
                alt: () => {
                    this.tokenConsumer.Dot()
                    this.IdentifierName()
                }
            },
            // TemplateLiteral[?Yield, ?Await, +Tagged]
            {alt: () => this.TemplateLiteral({...params, Tagged: true})},
            // . PrivateIdentifier
            {
                alt: () => {
                    this.tokenConsumer.Dot()
                    this.tokenConsumer.PrivateIdentifier()
                }
            }
        ]))

        return this.curCst
    }

    /**
     * CoverCallExpressionAndAsyncArrowHead[Yield, Await] :
     *     MemberExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
     *
     * 这是一个 Cover Grammar，用于覆盖：
     * 1. 函数调用：func(args)
     * 2. Async 箭头函数头：async (args) => {}
     */
    @SubhutiRule
    CoverCallExpressionAndAsyncArrowHead(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.MemberExpression(params)
        return this.Arguments(params)
    }

    /**
     * CallMemberExpression[Yield, Await] :
     *     MemberExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
     *
     * Supplemental Syntax:
     * When processing CallExpression : CoverCallExpressionAndAsyncArrowHead,
     * the interpretation is refined using this rule.
     *
     * 注意：虽然此方法与 CoverCallExpressionAndAsyncArrowHead 实现完全相同，
     * 但为了与 ES2025 规范完全一致，保留此方法。
     * 规范中 CallMemberExpression 是 Supplemental Syntax，用于语义分析时精化 Cover Grammar。
     */
    @SubhutiRule
    CallMemberExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.MemberExpression(params)
        return this.Arguments(params)
    }

    /**
     * SuperCall[Yield, Await] :
     *     super Arguments[?Yield, ?Await]
     */
    @SubhutiRule
    SuperCall(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.SuperTok()
        return this.Arguments(params)
    }

    /**
     * ImportCall[Yield, Await] :
     *     import ( AssignmentExpression[+In, ?Yield, ?Await] ,_opt )
     *     import ( AssignmentExpression[+In, ?Yield, ?Await] , AssignmentExpression[+In, ?Yield, ?Await] ,_opt )
     */
    @SubhutiRule
    ImportCall(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // import ( AssignmentExpression[+In, ?Yield, ?Await] , AssignmentExpression[+In, ?Yield, ?Await] ,_opt )
            {
                alt: () => {
                    this.tokenConsumer.ImportTok()
                    this.tokenConsumer.LParen()
                    this.AssignmentExpression({...params, In: true})
                    this.tokenConsumer.Comma()
                    this.AssignmentExpression({...params, In: true})
                    this.Option(() => this.tokenConsumer.Comma())
                    this.tokenConsumer.RParen()
                }
            },
            // import ( AssignmentExpression[+In, ?Yield, ?Await] ,_opt )
            {
                alt: () => {
                    this.tokenConsumer.ImportTok()
                    this.tokenConsumer.LParen()
                    this.AssignmentExpression({...params, In: true})
                    this.Option(() => this.tokenConsumer.Comma())
                    this.tokenConsumer.RParen()
                }
            }
        ])
    }

    /**
     * Arguments[Yield, Await] :
     *     ( )
     *     ( ArgumentList[?Yield, ?Await] )
     *     ( ArgumentList[?Yield, ?Await] , )
     */
    @SubhutiRule
    Arguments(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // ( )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.tokenConsumer.RParen()
                }
            },
            // ( ArgumentList[?Yield, ?Await] , )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.ArgumentList(params)
                    this.tokenConsumer.Comma()
                    this.tokenConsumer.RParen()
                }
            },
            // ( ArgumentList[?Yield, ?Await] )
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.ArgumentList(params)
                    this.tokenConsumer.RParen()
                }
            }
        ])
    }

    /**
     * ArgumentList[Yield, Await] :
     *     AssignmentExpression[+In, ?Yield, ?Await]
     *     ... AssignmentExpression[+In, ?Yield, ?Await]
     *     ArgumentList[?Yield, ?Await] , AssignmentExpression[+In, ?Yield, ?Await]
     *     ArgumentList[?Yield, ?Await] , ... AssignmentExpression[+In, ?Yield, ?Await]
     */
    @SubhutiRule
    ArgumentList(params: ExpressionParams = {}): SubhutiCst | undefined {
        // 第一个参数
        this.Or([
            {alt: () => this.AssignmentExpression({...params, In: true})},
            {
                alt: () => {
                    this.tokenConsumer.Ellipsis()
                    this.AssignmentExpression({...params, In: true})
                }
            }
        ])

        // 后续参数 (0个或多个)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.Or([
                {alt: () => this.AssignmentExpression({...params, In: true})},
                {
                    alt: () => {
                        this.tokenConsumer.Ellipsis()
                        this.AssignmentExpression({...params, In: true})
                    }
                }
            ])
        })

        return this.curCst
    }

    // ----------------------------------------
    // A.2.7 Optional Chaining
    // ----------------------------------------

    /**
     * OptionalExpression[Yield, Await] :
     *     MemberExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]
     *     CallExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]
     *     OptionalExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]
     */
    @SubhutiRule
    OptionalExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.Or([
            {alt: () => this.MemberExpression(params)},
            {alt: () => this.CallExpression(params)}
        ])

        this.OptionalChain(params)

        this.Many(() => this.OptionalChain(params))

        return this.curCst
    }

    /**
     * OptionalChain[Yield, Await] :
     *     ?. Arguments[?Yield, ?Await]
     *     ?. [ Expression[+In, ?Yield, ?Await] ]
     *     ?. IdentifierName
     *     ?. TemplateLiteral[?Yield, ?Await, +Tagged]
     *     ?. PrivateIdentifier
     *     OptionalChain[?Yield, ?Await] Arguments[?Yield, ?Await]
     *     OptionalChain[?Yield, ?Await] [ Expression[+In, ?Yield, ?Await] ]
     *     OptionalChain[?Yield, ?Await] . IdentifierName
     *     OptionalChain[?Yield, ?Await] TemplateLiteral[?Yield, ?Await, +Tagged]
     *     OptionalChain[?Yield, ?Await] . PrivateIdentifier
     */
    @SubhutiRule
    OptionalChain(params: ExpressionParams = {}): SubhutiCst | undefined {
        // 第一个 ?. 操作
        this.Or([
            {
                alt: () => {
                    this.tokenConsumer.OptionalChaining()
                    this.Arguments(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.OptionalChaining()
                    this.tokenConsumer.LBracket()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RBracket()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.OptionalChaining()
                    this.IdentifierName()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.OptionalChaining()
                    this.TemplateLiteral({...params, Tagged: true})
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.OptionalChaining()
                    this.tokenConsumer.PrivateIdentifier()
                }
            }
        ])

        // 后续操作 (0个或多个)
        this.Many(() => this.Or([
            {alt: () => this.Arguments(params)},
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RBracket()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.Dot()
                    this.IdentifierName()
                }
            },
            {alt: () => this.TemplateLiteral({...params, Tagged: true})},
            {
                alt: () => {
                    this.tokenConsumer.Dot()
                    this.tokenConsumer.PrivateIdentifier()
                }
            }
        ]))

        return this.curCst
    }

    /**
     * LeftHandSideExpression[Yield, Await] :
     *     NewExpression[?Yield, ?Await]
     *     CallExpression[?Yield, ?Await]
     *     OptionalExpression[?Yield, ?Await]
     *
     * PEG 实现注意事项：
     *
     * 规范中的三个产生式在语义上是互斥的：
     * - CallExpression: 必须包含至少一个 Arguments（函数调用 `()`）
     * - OptionalExpression: 必须包含至少一个 OptionalChain（可选链 `?.`）
     * - NewExpression: 不包含 Arguments 或 OptionalChain
     *
     * 但在 PEG 中，由于顺序选择的特性，如果按规范顺序实现会导致问题：
     * - NewExpression 包含 MemberExpression，会匹配 `console.log`
     * - 然后 NewExpression 结束，`(x)` 无法被消耗
     * - 导致解析失败或无限循环
     *
     * 解决方案：调整分支顺序，将"更长"的规则放在前面
     * - CallExpression 在前：优先匹配函数调用（如 `console.log(x)`）
     * - OptionalExpression 次之：匹配可选链（如 `obj?.method()`）
     * - NewExpression 最后：匹配其他情况（如 `this`、`obj.prop`）
     *
     * 这与规范顺序不一致，但在 PEG 中是必要的。
     */
    @SubhutiRule
    LeftHandSideExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.CallExpression(params)},      // 第1位 - 最长，包含 Arguments
            {alt: () => this.OptionalExpression(params)},  // 第2位 - 包含 OptionalChain
            {alt: () => this.NewExpression(params)},       // 第3位 - 最短，仅 MemberExpression
        ])
    }

    // ----------------------------------------
    // A.2.8 Update Expressions
    // ----------------------------------------

    /**
     * UpdateExpression[Yield, Await] :
     *     LeftHandSideExpression[?Yield, ?Await]
     *     LeftHandSideExpression[?Yield, ?Await] [no LineTerminator here] ++
     *     LeftHandSideExpression[?Yield, ?Await] [no LineTerminator here] --
     *     ++ UnaryExpression[?Yield, ?Await]
     *     -- UnaryExpression[?Yield, ?Await]
     */
    @SubhutiRule
    UpdateExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // LeftHandSideExpression[?Yield, ?Await] [no LineTerminator here] ++
            {
                alt: () => {
                    this.LeftHandSideExpression(params)
                    // [no LineTerminator here]
                    this.assertNoLineBreak()
                    this.tokenConsumer.Increment()
                }
            },
            // LeftHandSideExpression[?Yield, ?Await] [no LineTerminator here] --
            {
                alt: () => {
                    this.LeftHandSideExpression(params)
                    // [no LineTerminator here]
                    this.assertNoLineBreak()
                    this.tokenConsumer.Decrement()
                }
            },
            // ++ UnaryExpression[?Yield, ?Await]
            {
                alt: () => {
                    this.tokenConsumer.Increment()
                    this.UnaryExpression(params)
                }
            },
            // -- UnaryExpression[?Yield, ?Await]
            {
                alt: () => {
                    this.tokenConsumer.Decrement()
                    this.UnaryExpression(params)
                }
            },
            // LeftHandSideExpression[?Yield, ?Await]
            {alt: () => this.LeftHandSideExpression(params)}
        ])
    }

    // ----------------------------------------
    // A.2.9 Unary Expressions
    // ----------------------------------------

    /**
     * UnaryExpression[Yield, Await] :
     *     UpdateExpression[?Yield, ?Await]
     *     delete UnaryExpression[?Yield, ?Await]
     *     void UnaryExpression[?Yield, ?Await]
     *     typeof UnaryExpression[?Yield, ?Await]
     *     + UnaryExpression[?Yield, ?Await]
     *     - UnaryExpression[?Yield, ?Await]
     *     ~ UnaryExpression[?Yield, ?Await]
     *     ! UnaryExpression[?Yield, ?Await]
     *     [+Await] AwaitExpression[?Yield]
     */
    @SubhutiRule
    UnaryExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        const {Await = false} = params

        return this.Or([
            {alt: () => this.UpdateExpression(params)},
            {
                alt: () => {
                    this.tokenConsumer.DeleteTok()
                    this.UnaryExpression(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.VoidTok()
                    this.UnaryExpression(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.TypeofTok()
                    this.UnaryExpression(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.Plus()
                    this.UnaryExpression(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.Minus()
                    this.UnaryExpression(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.BitwiseNot()
                    this.UnaryExpression(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.LogicalNot()
                    this.UnaryExpression(params)
                }
            },
            // [+Await] AwaitExpression - 条件展开
            ...(Await ? [{alt: () => this.AwaitExpression(params)}] : [])
        ])
    }

    /**
     * AwaitExpression[Yield] :
     *     await UnaryExpression[?Yield, +Await]
     */
    @SubhutiRule
    AwaitExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.AwaitTok()
        return this.UnaryExpression({...params, Await: true})
    }

    // ----------------------------------------
    // A.2.10 Binary Expressions
    // ----------------------------------------

    /**
     * ExponentiationExpression[Yield, Await] :
     *     UnaryExpression[?Yield, ?Await]
     *     UpdateExpression[?Yield, ?Await] ** ExponentiationExpression[?Yield, ?Await]
     */
    @SubhutiRule
    ExponentiationExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.UpdateExpression(params)
                    this.tokenConsumer.Exponentiation()
                    this.ExponentiationExpression(params)
                }
            },
            {alt: () => this.UnaryExpression(params)}
        ])
    }

    /**
     * MultiplicativeExpression[Yield, Await] :
     *     ExponentiationExpression[?Yield, ?Await]
     *     MultiplicativeExpression[?Yield, ?Await] MultiplicativeOperator ExponentiationExpression[?Yield, ?Await]
     *
     * MultiplicativeOperator : one of
     *     * / %
     */
    @SubhutiRule
    MultiplicativeExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.ExponentiationExpression(params)

        this.Many(() => {
            this.Or([
                {alt: () => this.tokenConsumer.Asterisk()},
                {alt: () => this.tokenConsumer.Slash()},
                {alt: () => this.tokenConsumer.Modulo()}
            ])
            this.ExponentiationExpression(params)
        })

        return this.curCst
    }

    /**
     * AdditiveExpression[Yield, Await] :
     *     MultiplicativeExpression[?Yield, ?Await]
     *     AdditiveExpression[?Yield, ?Await] + MultiplicativeExpression[?Yield, ?Await]
     *     AdditiveExpression[?Yield, ?Await] - MultiplicativeExpression[?Yield, ?Await]
     */
    @SubhutiRule
    AdditiveExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.MultiplicativeExpression(params)

        this.Many(() => {
            this.Or([
                {alt: () => this.tokenConsumer.Plus()},
                {alt: () => this.tokenConsumer.Minus()}
            ])
            this.MultiplicativeExpression(params)
        })

        return this.curCst
    }

    /**
     * ShiftExpression[Yield, Await] :
     *     AdditiveExpression[?Yield, ?Await]
     *     ShiftExpression[?Yield, ?Await] << AdditiveExpression[?Yield, ?Await]
     *     ShiftExpression[?Yield, ?Await] >> AdditiveExpression[?Yield, ?Await]
     *     ShiftExpression[?Yield, ?Await] >>> AdditiveExpression[?Yield, ?Await]
     */
    @SubhutiRule
    ShiftExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.AdditiveExpression(params)

        this.Many(() => {
            this.Or([
                {alt: () => this.tokenConsumer.LeftShift()},
                {alt: () => this.tokenConsumer.SignedRightShift()},
                {alt: () => this.tokenConsumer.UnsignedRightShift()}
            ])
            this.AdditiveExpression(params)
        })

        return this.curCst
    }

    /**
     * RelationalExpression[In, Yield, Await] :
     *     ShiftExpression[?Yield, ?Await]
     *     RelationalExpression[?In, ?Yield, ?Await] < ShiftExpression[?Yield, ?Await]
     *     RelationalExpression[?In, ?Yield, ?Await] > ShiftExpression[?Yield, ?Await]
     *     RelationalExpression[?In, ?Yield, ?Await] <= ShiftExpression[?Yield, ?Await]
     *     RelationalExpression[?In, ?Yield, ?Await] >= ShiftExpression[?Yield, ?Await]
     *     RelationalExpression[?In, ?Yield, ?Await] instanceof ShiftExpression[?Yield, ?Await]
     *     [+In] RelationalExpression[+In, ?Yield, ?Await] in ShiftExpression[?Yield, ?Await]
     *     [+In] PrivateIdentifier in ShiftExpression[?Yield, ?Await]
     */
    @SubhutiRule
    RelationalExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        const {In = false} = params

        // 处理 [+In] PrivateIdentifier in ShiftExpression
        if (In && this.lookahead('PrivateIdentifier', 1)) {
            this.tokenConsumer.PrivateIdentifier()
            this.tokenConsumer.InTok()
            this.ShiftExpression(params)
            return this.curCst
        }

        this.ShiftExpression(params)

        this.Many(() => {
            this.Or([
                {alt: () => this.tokenConsumer.LessThan()},
                {alt: () => this.tokenConsumer.GreaterThan()},
                {alt: () => this.tokenConsumer.LessThanOrEqual()},
                {alt: () => this.tokenConsumer.GreaterThanOrEqual()},
                {alt: () => this.tokenConsumer.InstanceofTok()},
                // [+In] in - 条件展开，只在 In=true 时才有这个分支
                ...(In ? [{alt: () => this.tokenConsumer.InTok()}] : [])
            ])
            this.ShiftExpression(params)
        })

        return this.curCst
    }

    /**
     * EqualityExpression[In, Yield, Await] :
     *     RelationalExpression[?In, ?Yield, ?Await]
     *     EqualityExpression[?In, ?Yield, ?Await] == RelationalExpression[?In, ?Yield, ?Await]
     *     EqualityExpression[?In, ?Yield, ?Await] != RelationalExpression[?In, ?Yield, ?Await]
     *     EqualityExpression[?In, ?Yield, ?Await] === RelationalExpression[?In, ?Yield, ?Await]
     *     EqualityExpression[?In, ?Yield, ?Await] !== RelationalExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    EqualityExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.RelationalExpression(params)

        this.Many(() => {
            this.Or([
                {alt: () => this.tokenConsumer.StrictEqual()},
                {alt: () => this.tokenConsumer.StrictNotEqual()},
                {alt: () => this.tokenConsumer.Equal()},
                {alt: () => this.tokenConsumer.NotEqual()}
            ])
            this.RelationalExpression(params)
        })

        return this.curCst
    }

    /**
     * BitwiseANDExpression[In, Yield, Await] :
     *     EqualityExpression[?In, ?Yield, ?Await]
     *     BitwiseANDExpression[?In, ?Yield, ?Await] & EqualityExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    BitwiseANDExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.EqualityExpression(params)

        this.Many(() => {
            this.tokenConsumer.BitwiseAnd()
            this.EqualityExpression(params)
        })

        return this.curCst
    }

    /**
     * BitwiseXORExpression[In, Yield, Await] :
     *     BitwiseANDExpression[?In, ?Yield, ?Await]
     *     BitwiseXORExpression[?In, ?Yield, ?Await] ^ BitwiseANDExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    BitwiseXORExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.BitwiseANDExpression(params)

        this.Many(() => {
            this.tokenConsumer.BitwiseXor()
            this.BitwiseANDExpression(params)
        })

        return this.curCst
    }

    /**
     * BitwiseORExpression[In, Yield, Await] :
     *     BitwiseXORExpression[?In, ?Yield, ?Await]
     *     BitwiseORExpression[?In, ?Yield, ?Await] | BitwiseXORExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    BitwiseORExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.BitwiseXORExpression(params)

        this.Many(() => {
            this.tokenConsumer.BitwiseOr()
            this.BitwiseXORExpression(params)
        })

        return this.curCst
    }

    /**
     * LogicalANDExpression[In, Yield, Await] :
     *     BitwiseORExpression[?In, ?Yield, ?Await]
     *     LogicalANDExpression[?In, ?Yield, ?Await] && BitwiseORExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    LogicalANDExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.BitwiseORExpression(params)

        this.Many(() => {
            this.tokenConsumer.LogicalAnd()
            this.BitwiseORExpression(params)
        })

        return this.curCst
    }

    /**
     * LogicalORExpression[In, Yield, Await] :
     *     LogicalANDExpression[?In, ?Yield, ?Await]
     *     LogicalORExpression[?In, ?Yield, ?Await] || LogicalANDExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    LogicalORExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.LogicalANDExpression(params)

        this.Many(() => {
            this.tokenConsumer.LogicalOr()
            this.LogicalANDExpression(params)
        })

        return this.curCst
    }

    /**
     * CoalesceExpression[In, Yield, Await] :
     *     CoalesceExpressionHead[?In, ?Yield, ?Await] ?? BitwiseORExpression[?In, ?Yield, ?Await]
     *
     * CoalesceExpressionHead[In, Yield, Await] :
     *     CoalesceExpression[?In, ?Yield, ?Await]
     *     BitwiseORExpression[?In, ?Yield, ?Await]
     *
     * ⚠️ 左递归改写说明：
     *
     * 规范使用左递归表达左结合性：
     *   CoalesceExpression → CoalesceExpressionHead → CoalesceExpression (循环！)
     *
     * PEG Parser 不支持左递归，需改写为迭代形式：
     *   原语义：a ?? b ?? c ?? d  (左结合)
     *   PEG改写：BaseExpression ( ?? BaseExpression )*
     *
     * 改写方案：
     *   1. 先匹配基础表达式（BitwiseORExpression）
     *   2. 使用 Many 循环匹配后续的 ?? BitwiseORExpression
     *   3. 删除 CoalesceExpressionHead（不再需要）
     *
     * 这样既符合 PEG 语法，又保持了左结合语义。
     */
    @SubhutiRule
    CoalesceExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        // 基础表达式
        this.BitwiseORExpression(params)

        // 后续的 ?? 运算符（0次或多次）
        this.Many(() => {
            this.tokenConsumer.NullishCoalescing()  // ??
            this.BitwiseORExpression(params)        // 右操作数
        })

        return this.curCst
    }

    /**
     * CoalesceExpressionHead[In, Yield, Await] :
     *     CoalesceExpression[?In, ?Yield, ?Await]
     *     BitwiseORExpression[?In, ?Yield, ?Await]
     *
     * ⚠️ 已废弃：此规则仅用于规范中的左递归表达
     * 在 PEG 实现中，CoalesceExpression 直接使用 Many 改写，不再需要此规则。
     *
     * 保留此方法仅为文档目的，实际不会被调用。
     */
    @SubhutiRule
    CoalesceExpressionHead(params: ExpressionParams = {}): SubhutiCst | undefined {
        // 此方法已废弃，不应被调用
        throw new Error('CoalesceExpressionHead 已废弃，请使用 CoalesceExpression')
    }

    /**
     * ShortCircuitExpression[In, Yield, Await] :
     *     LogicalORExpression[?In, ?Yield, ?Await]
     *     CoalesceExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    ShortCircuitExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.LogicalORExpression(params)},
            {alt: () => this.CoalesceExpression(params)}
        ])
    }

    /**
     * ConditionalExpression[In, Yield, Await] :
     *     ShortCircuitExpression[?In, ?Yield, ?Await]
     *     ShortCircuitExpression[?In, ?Yield, ?Await] ? AssignmentExpression[+In, ?Yield, ?Await] : AssignmentExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    ConditionalExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.ShortCircuitExpression(params)
                    this.tokenConsumer.Question()
                    this.AssignmentExpression({...params, In: true})
                    this.tokenConsumer.Colon()
                    this.AssignmentExpression(params)
                }
            },
            {alt: () => this.ShortCircuitExpression(params)}
        ])
    }

    // ----------------------------------------
    // A.2.11 Assignment Expressions
    // ----------------------------------------

    /**
     * AssignmentExpression[In, Yield, Await] :
     *     ConditionalExpression[?In, ?Yield, ?Await]
     *     [+Yield] YieldExpression[?In, ?Await]
     *     ArrowFunction[?In, ?Yield, ?Await]
     *     AsyncArrowFunction[?In, ?Yield, ?Await]
     *     LeftHandSideExpression[?Yield, ?Await] = AssignmentExpression[?In, ?Yield, ?Await]
     *     LeftHandSideExpression[?Yield, ?Await] AssignmentOperator AssignmentExpression[?In, ?Yield, ?Await]
     *     LeftHandSideExpression[?Yield, ?Await] &&= AssignmentExpression[?In, ?Yield, ?Await]
     *     LeftHandSideExpression[?Yield, ?Await] ||= AssignmentExpression[?In, ?Yield, ?Await]
     *     LeftHandSideExpression[?Yield, ?Await] ??= AssignmentExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    AssignmentExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        const {Yield = false} = params

        return this.Or([
            // ⚠️ 箭头函数必须在 ConditionalExpression 之前！
            // 因为 (a, b) 可以同时匹配括号表达式和箭头函数参数，
            // 只有通过后续的 => 才能区分，所以需要先尝试箭头函数
            {alt: () => this.ArrowFunction(params)},
            {alt: () => this.AsyncArrowFunction(params)},
            // [+Yield] YieldExpression
            ...(Yield ? [{alt: () => this.YieldExpression(params)}] : []),
            // 赋值表达式放在 ConditionalExpression 之前，防止其抢先匹配 LeftHandSideExpression
            {
                alt: () => {
                    this.LeftHandSideExpression(params)
                    this.tokenConsumer.Assign()
                    this.AssignmentExpression(params)
                }
            },
            {
                alt: () => {
                    this.LeftHandSideExpression(params)
                    this.AssignmentOperator()
                    this.AssignmentExpression(params)
                }
            },
            {
                alt: () => {
                    this.LeftHandSideExpression(params)
                    this.tokenConsumer.LogicalAndAssign()
                    this.AssignmentExpression(params)
                }
            },
            {
                alt: () => {
                    this.LeftHandSideExpression(params)
                    this.tokenConsumer.LogicalOrAssign()
                    this.AssignmentExpression(params)
                }
            },
            {
                alt: () => {
                    this.LeftHandSideExpression(params)
                    this.tokenConsumer.NullishCoalescingAssign()
                    this.AssignmentExpression(params)
                }
            },
            // 条件表达式放在最后作为兜底
            {alt: () => this.ConditionalExpression(params)}
        ])
    }

    /**
     * AssignmentOperator : one of
     *     *= /= %= += -= <<= >>= >>>= &= ^= |= **=
     */
    @SubhutiRule
    AssignmentOperator(): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.tokenConsumer.MultiplyAssign()},
            {alt: () => this.tokenConsumer.DivideAssign()},
            {alt: () => this.tokenConsumer.ModuloAssign()},
            {alt: () => this.tokenConsumer.PlusAssign()},
            {alt: () => this.tokenConsumer.MinusAssign()},
            {alt: () => this.tokenConsumer.LeftShiftAssign()},
            {alt: () => this.tokenConsumer.SignedRightShiftAssign()},
            {alt: () => this.tokenConsumer.UnsignedRightShiftAssign()},
            {alt: () => this.tokenConsumer.BitwiseAndAssign()},
            {alt: () => this.tokenConsumer.BitwiseXorAssign()},
            {alt: () => this.tokenConsumer.BitwiseOrAssign()},
            {alt: () => this.tokenConsumer.ExponentiationAssign()}
        ])
    }

    // ----------------------------------------
    // A.2.12 Comma Expression
    // ----------------------------------------

    /**
     * Expression[In, Yield, Await] :
     *     AssignmentExpression[?In, ?Yield, ?Await]
     *     Expression[?In, ?Yield, ?Await] , AssignmentExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    Expression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.AssignmentExpression(params)

        this.Many(() => {
            this.tokenConsumer.Comma()
            this.AssignmentExpression(params)
        })

        return this.curCst
    }

    // ============================================
    // A.3 Statements
    // ============================================

    // ----------------------------------------
    // A.3.1 General
    // ----------------------------------------

    /**
     * Statement[Yield, Await, Return] :
     *     BlockStatement[?Yield, ?Await, ?Return]
     *     VariableStatement[?Yield, ?Await]
     *     EmptyStatement
     *     ExpressionStatement[?Yield, ?Await]
     *     IfStatement[?Yield, ?Await, ?Return]
     *     BreakableStatement[?Yield, ?Await, ?Return]
     *     ContinueStatement[?Yield, ?Await]
     *     BreakStatement[?Yield, ?Await]
     *     [+Return] ReturnStatement[?Yield, ?Await]
     *     WithStatement[?Yield, ?Await, ?Return]
     *     LabelledStatement[?Yield, ?Await, ?Return]
     *     ThrowStatement[?Yield, ?Await]
     *     TryStatement[?Yield, ?Await, ?Return]
     *     DebuggerStatement
     */
    @SubhutiRule
    Statement(params: StatementParams = {}): SubhutiCst | undefined {
        const {Return = false} = params

        return this.Or([
            {alt: () => this.BlockStatement(params)},
            {alt: () => this.VariableStatement(params)},
            {alt: () => this.EmptyStatement()},
            {alt: () => this.ExpressionStatement(params)},
            {alt: () => this.IfStatement(params)},
            {alt: () => this.BreakableStatement(params)},
            {alt: () => this.ContinueStatement(params)},
            {alt: () => this.BreakStatement(params)},
            // [+Return] ReturnStatement - 条件展开
            ...(Return ? [{alt: () => this.ReturnStatement(params)}] : []),
            {alt: () => this.WithStatement(params)},
            {alt: () => this.LabelledStatement(params)},
            {alt: () => this.ThrowStatement(params)},
            {alt: () => this.TryStatement(params)},
            {alt: () => this.DebuggerStatement()}
        ])
    }

    /**
     * Declaration[Yield, Await] :
     *     HoistableDeclaration[?Yield, ?Await, ~Default]
     *     ClassDeclaration[?Yield, ?Await, ~Default]
     *     LexicalDeclaration[+In, ?Yield, ?Await]
     */
    @SubhutiRule
    Declaration(params: DeclarationParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.HoistableDeclaration({...params, Default: false})},
            {alt: () => this.ClassDeclaration({...params, Default: false})},
            {alt: () => this.LexicalDeclaration({...params, In: true})}
        ])
    }

    /**
     * HoistableDeclaration[Yield, Await, Default] :
     *     FunctionDeclaration[?Yield, ?Await, ?Default]
     *     GeneratorDeclaration[?Yield, ?Await, ?Default]
     *     AsyncFunctionDeclaration[?Yield, ?Await, ?Default]
     *     AsyncGeneratorDeclaration[?Yield, ?Await, ?Default]
     */
    @SubhutiRule
    HoistableDeclaration(params: DeclarationParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.FunctionDeclaration(params)},
            {alt: () => this.GeneratorDeclaration(params)},
            {alt: () => this.AsyncFunctionDeclaration(params)},
            {alt: () => this.AsyncGeneratorDeclaration(params)}
        ])
    }

    /**
     * BreakableStatement[Yield, Await, Return] :
     *     IterationStatement[?Yield, ?Await, ?Return]
     *     SwitchStatement[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    BreakableStatement(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.IterationStatement(params)},
            {alt: () => this.SwitchStatement(params)}
        ])
    }

    // ----------------------------------------
    // A.3.2 Block
    // ----------------------------------------

    /**
     * BlockStatement[Yield, Await, Return] :
     *     Block[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    BlockStatement(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Block(params)
    }

    /**
     * Block[Yield, Await, Return] :
     *     { StatementList[?Yield, ?Await, ?Return]_opt }
     */
    @SubhutiRule
    Block(params: StatementParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.LBrace()
        this.Option(() => this.StatementList(params))
        return this.tokenConsumer.RBrace()
    }

    /**
     * StatementList[Yield, Await, Return] :
     *     StatementListItem[?Yield, ?Await, ?Return]
     *     StatementList[?Yield, ?Await, ?Return] StatementListItem[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    StatementList(params: StatementParams = {}): SubhutiCst | undefined {
        this.AtLeastOne(() => this.StatementListItem(params))
        return this.curCst
    }

    /**
     * StatementListItem[Yield, Await, Return] :
     *     Statement[?Yield, ?Await, ?Return]
     *     Declaration[?Yield, ?Await]
     */
    @SubhutiRule
    StatementListItem(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.Statement(params)},
            {alt: () => this.Declaration(params)}
        ])
    }

    // ----------------------------------------
    // A.3.3 Variable Declarations
    // ----------------------------------------

    /**
     * LexicalDeclaration[In, Yield, Await] :
     *     LetOrConst BindingList[?In, ?Yield, ?Await] ;
     */
    @SubhutiRule
    LexicalDeclaration(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.LetOrConst()
        this.BindingList(params)
        return this.SemicolonASI()
    }

    /**
     * LetOrConst :
     *     let
     *     const
     */
    @SubhutiRule
    LetOrConst(): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.tokenConsumer.LetTok()},
            {alt: () => this.tokenConsumer.ConstTok()}
        ])
    }

    /**
     * BindingList[In, Yield, Await] :
     *     LexicalBinding[?In, ?Yield, ?Await]
     *     BindingList[?In, ?Yield, ?Await] , LexicalBinding[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    BindingList(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.LexicalBinding(params)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.LexicalBinding(params)
        })
        return this.curCst
    }

    /**
     * LexicalBinding[In, Yield, Await] :
     *     BindingIdentifier[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]_opt
     *     BindingPattern[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    LexicalBinding(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.BindingIdentifier(params)
                    this.Option(() => this.Initializer(params))
                }
            },
            {
                alt: () => {
                    this.BindingPattern(params)
                    this.Initializer(params)
                }
            }
        ])
    }

    /**
     * VariableStatement[Yield, Await] :
     *     var VariableDeclarationList[+In, ?Yield, ?Await] ;
     */
    @SubhutiRule
    VariableStatement(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.VarTok()
        this.VariableDeclarationList({...params, In: true})
        return this.SemicolonASI()
    }

    /**
     * VariableDeclarationList[In, Yield, Await] :
     *     VariableDeclaration[?In, ?Yield, ?Await]
     *     VariableDeclarationList[?In, ?Yield, ?Await] , VariableDeclaration[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    VariableDeclarationList(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.VariableDeclaration(params)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.VariableDeclaration(params)
        })
        return this.curCst
    }

    /**
     * VariableDeclaration[In, Yield, Await] :
     *     BindingIdentifier[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]_opt
     *     BindingPattern[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    VariableDeclaration(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.BindingIdentifier(params)
                    this.Option(() => this.Initializer(params))
                }
            },
            {
                alt: () => {
                    this.BindingPattern(params)
                    this.Initializer(params)
                }
            }
        ])
    }

    // ----------------------------------------
    // A.3.4 Binding Patterns
    // ----------------------------------------

    /**
     * BindingPattern[Yield, Await] :
     *     ObjectBindingPattern[?Yield, ?Await]
     *     ArrayBindingPattern[?Yield, ?Await]
     */
    @SubhutiRule
    BindingPattern(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.ObjectBindingPattern(params)},
            {alt: () => this.ArrayBindingPattern(params)}
        ])
    }

    /**
     * ObjectBindingPattern[Yield, Await] :
     *     { }
     *     { BindingRestProperty[?Yield, ?Await] }
     *     { BindingPropertyList[?Yield, ?Await] }
     *     { BindingPropertyList[?Yield, ?Await] , BindingRestProperty[?Yield, ?Await]_opt }
     */
    @SubhutiRule
    ObjectBindingPattern(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.tokenConsumer.RBrace()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.BindingRestProperty(params)
                    this.tokenConsumer.RBrace()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.BindingPropertyList(params)
                    this.tokenConsumer.Comma()
                    this.Option(() => this.BindingRestProperty(params))
                    this.tokenConsumer.RBrace()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.BindingPropertyList(params)
                    this.tokenConsumer.RBrace()
                }
            }
        ])
    }

    /**
     * ArrayBindingPattern[Yield, Await] :
     *     [ Elision_opt BindingRestElement[?Yield, ?Await]_opt ]
     *     [ BindingElementList[?Yield, ?Await] ]
     *     [ BindingElementList[?Yield, ?Await] , Elision_opt BindingRestElement[?Yield, ?Await]_opt ]
     */
    @SubhutiRule
    ArrayBindingPattern(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // [ Elision_opt BindingRestElement_opt ] - 空数组或只有 rest
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.Option(() => this.Elision())
                    this.Option(() => this.BindingRestElement(params))
                    this.tokenConsumer.RBracket()
                }
            },
            // [ BindingElementList ] - 普通解构，必须在带尾逗号的分支之前
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.BindingElementList(params)
                    this.tokenConsumer.RBracket()
                }
            },
            // [ BindingElementList , Elision_opt BindingRestElement_opt ] - 带尾逗号
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.BindingElementList(params)
                    this.tokenConsumer.Comma()
                    this.Option(() => this.Elision())
                    this.Option(() => this.BindingRestElement(params))
                    this.tokenConsumer.RBracket()
                }
            }
        ])
    }

    /**
     * BindingRestProperty[Yield, Await] :
     *     ... BindingIdentifier[?Yield, ?Await]
     */
    @SubhutiRule
    BindingRestProperty(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Ellipsis()
        return this.BindingIdentifier(params)
    }

    /**
     * BindingPropertyList[Yield, Await] :
     *     BindingProperty[?Yield, ?Await]
     *     BindingPropertyList[?Yield, ?Await] , BindingProperty[?Yield, ?Await]
     */
    @SubhutiRule
    BindingPropertyList(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.BindingProperty(params)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.BindingProperty(params)
        })
        return this.curCst
    }

    /**
     * BindingElementList[Yield, Await] :
     *     BindingElisionElement[?Yield, ?Await]
     *     BindingElementList[?Yield, ?Await] , BindingElisionElement[?Yield, ?Await]
     */
    @SubhutiRule
    BindingElementList(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.BindingElisionElement(params)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.BindingElisionElement(params)
        })
        return this.curCst
    }

    /**
     * BindingElisionElement[Yield, Await] :
     *     Elision_opt BindingElement[?Yield, ?Await]
     */
    @SubhutiRule
    BindingElisionElement(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.Option(() => this.Elision())
        return this.BindingElement(params)
    }

    /**
     * BindingProperty[Yield, Await] :
     *     SingleNameBinding[?Yield, ?Await]
     *     PropertyName[?Yield, ?Await] : BindingElement[?Yield, ?Await]
     */
    @SubhutiRule
    BindingProperty(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.PropertyName(params)
                    this.tokenConsumer.Colon()
                    this.BindingElement(params)
                }
            },
            {alt: () => this.SingleNameBinding(params)}
        ])
    }

    /**
     * BindingElement[Yield, Await] :
     *     SingleNameBinding[?Yield, ?Await]
     *     BindingPattern[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt
     */
    @SubhutiRule
    BindingElement(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.SingleNameBinding(params)},
            {
                alt: () => {
                    this.BindingPattern(params)
                    this.Option(() => this.Initializer({...params, In: true}))
                }
            }
        ])
    }

    /**
     * SingleNameBinding[Yield, Await] :
     *     BindingIdentifier[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt
     */
    @SubhutiRule
    SingleNameBinding(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.BindingIdentifier(params)
        this.Option(() => this.Initializer({...params, In: true}))
        return this.curCst
    }

    /**
     * BindingRestElement[Yield, Await] :
     *     ... BindingIdentifier[?Yield, ?Await]
     *     ... BindingPattern[?Yield, ?Await]
     */
    @SubhutiRule
    BindingRestElement(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.Ellipsis()
                    this.BindingIdentifier(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.Ellipsis()
                    this.BindingPattern(params)
                }
            }
        ])
    }

    // ----------------------------------------
    // A.3.5 Simple Statements
    // ----------------------------------------

    /**
     * Automatic Semicolon Insertion (ASI)
     *
     * ECMAScript 规范 11.9: Automatic Semicolon Insertion
     *
     * 在以下情况下允许省略分号（自动插入）：
     * 1. 遇到换行符（Line Terminator）
     * 2. 遇到文件结束符（EOF）
     * 3. 遇到右大括号 }
     *
     * 实现方式：
     * - 如果有显式分号，消费它
     * - 否则检查是否满足 ASI 条件
     * - 如果不满足 ASI 条件，则失败
     */
    @SubhutiRule
    SemicolonASI(): SubhutiCst | undefined {
        // 检查当前 token 是否是分号
        if (this.curToken?.tokenName === 'Semicolon') {
            this.tokenConsumer.Semicolon()
            return this.curCst
        }

        // 没有显式分号，检查是否满足 ASI 条件
        const canInsertSemicolon = this.canAutoInsertSemicolon()

        if (!canInsertSemicolon) {
            // 不满足 ASI 条件，标记失败
            return this.parserFail()
        }

        // 满足 ASI 条件，返回成功
        return this.curCst
    }

    /**
     * 检查是否可以自动插入分号
     *
     * ASI 条件：
     * 1. 当前 token 前有换行符
     * 2. 当前 token 是 }
     * 3. 已到达文件末尾（EOF）
     */
    private canAutoInsertSemicolon(): boolean {
        // 条件 3：EOF
        if (this.tokenIndex >= this._tokens.length) {
            return true
        }

        const currentToken = this.curToken
        if (!currentToken) {
            return true
        }

        // 条件 1：当前 token 前有换行符
        if (currentToken.hasLineBreakBefore) {
            return true
        }

        // 条件 2：当前 token 是 }
        if (currentToken.tokenName === 'RBrace') {
            return true
        }

        return false
    }

    /**
     * EmptyStatement :
     *     ;
     */
    @SubhutiRule
    EmptyStatement(): SubhutiCst | undefined {
        return this.tokenConsumer.Semicolon()
    }

    /**
     * ExpressionStatement[Yield, Await] :
     *     [lookahead ∉ {{, function, async [no LineTerminator here] function, class, let [}]
     *     Expression[+In, ?Yield, ?Await] ;
     */
    @SubhutiRule
    ExpressionStatement(params: StatementParams = {}): SubhutiCst | undefined {
        // [lookahead ∉ {{, function, async [no LineTerminator here] function, class, let [}]
        this.assertLookaheadNotIn(['LBrace', 'FunctionTok', 'ClassTok'])
        this.assertLookaheadNotSequenceNoLT(['AsyncTok', 'FunctionTok'])
        this.assertLookaheadNotSequence(['LetTok', 'LBracket'])

        this.Expression({...params, In: true})
        return this.SemicolonASI()
    }

    // ----------------------------------------
    // A.3.6 If Statement
    // ----------------------------------------

    /**
     * IfStatement[Yield, Await, Return] :
     *     if ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return] else Statement[?Yield, ?Await, ?Return]
     *     if ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return] [lookahead ≠ else]
     */
    @SubhutiRule
    IfStatement(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.IfTok()
                    this.tokenConsumer.LParen()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                    this.tokenConsumer.ElseTok()
                    this.Statement(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.IfTok()
                    this.tokenConsumer.LParen()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                    this.assertLookaheadNot('ElseTok')  // [lookahead ≠ else]
                }
            }
        ])
    }

    // ----------------------------------------
    // A.3.7 Iteration Statements
    // ----------------------------------------

    /**
     * IterationStatement[Yield, Await, Return] :
     *     DoWhileStatement[?Yield, ?Await, ?Return]
     *     WhileStatement[?Yield, ?Await, ?Return]
     *     ForStatement[?Yield, ?Await, ?Return]
     *     ForInOfStatement[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    IterationStatement(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.DoWhileStatement(params)},
            {alt: () => this.WhileStatement(params)},
            {alt: () => this.ForStatement(params)},
            {alt: () => this.ForInOfStatement(params)}
        ])
    }

    /**
     * DoWhileStatement[Yield, Await, Return] :
     *     do Statement[?Yield, ?Await, ?Return] while ( Expression[+In, ?Yield, ?Await] ) ;
     */
    @SubhutiRule
    DoWhileStatement(params: StatementParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.DoTok()
        this.Statement(params)
        this.tokenConsumer.WhileTok()
        this.tokenConsumer.LParen()
        this.Expression({...params, In: true})
        this.tokenConsumer.RParen()
        return this.SemicolonASI()
    }

    /**
     * WhileStatement[Yield, Await, Return] :
     *     while ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    WhileStatement(params: StatementParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.WhileTok()
        this.tokenConsumer.LParen()
        this.Expression({...params, In: true})
        this.tokenConsumer.RParen()
        return this.Statement(params)
    }

    /**
     * ForStatement[Yield, Await, Return] :
     *     for ( [lookahead ≠ let [] Expression[~In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ) Statement[?Yield, ?Await, ?Return]
     *     for ( var VariableDeclarationList[~In, ?Yield, ?Await] ; Expression[+In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ) Statement[?Yield, ?Await, ?Return]
     *     for ( LexicalDeclaration[~In, ?Yield, ?Await] Expression[+In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ) Statement[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    ForStatement(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            // for ( var VariableDeclarationList[~In, ?Yield, ?Await] ; Expression[+In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ) Statement[?Yield, ?Await, ?Return]
            {
                alt: () => {
                    this.tokenConsumer.ForTok()
                    this.tokenConsumer.LParen()
                    this.tokenConsumer.VarTok()
                    this.VariableDeclarationList({...params, In: false})
                    this.tokenConsumer.Semicolon()
                    this.Option(() => this.Expression({...params, In: true}))
                    this.tokenConsumer.Semicolon()
                    this.Option(() => this.Expression({...params, In: true}))
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            },
            // for ( LexicalDeclaration[~In, ?Yield, ?Await] Expression[+In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ) Statement[?Yield, ?Await, ?Return]
            {
                alt: () => {
                    this.tokenConsumer.ForTok()
                    this.tokenConsumer.LParen()
                    this.LexicalDeclaration({...params, In: false})
                    this.Option(() => this.Expression({...params, In: true}))
                    this.tokenConsumer.Semicolon()
                    this.Option(() => this.Expression({...params, In: true}))
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            },
            // for ( [lookahead ≠ let [] Expression[~In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ) Statement[?Yield, ?Await, ?Return]
            {
                alt: () => {
                    this.tokenConsumer.ForTok()
                    this.tokenConsumer.LParen()
                    // [lookahead ≠ let []
                    this.assertLookaheadNotSequence(['LetTok', 'LBracket'])
                    this.Option(() => this.Expression({...params, In: false}))
                    this.tokenConsumer.Semicolon()
                    this.Option(() => this.Expression({...params, In: true}))
                    this.tokenConsumer.Semicolon()
                    this.Option(() => this.Expression({...params, In: true}))
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            }
        ])
    }

    /**
     * ForInOfStatement[Yield, Await, Return] :
     *     for ( [lookahead ≠ let [] LeftHandSideExpression[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     *     for ( var ForBinding[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     *     for ( ForDeclaration[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     *     for ( [lookahead ∉ {let, async of}] LeftHandSideExpression[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     *     for ( var ForBinding[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     *     for ( ForDeclaration[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     *     [+Await] for await ( [lookahead ≠ let] LeftHandSideExpression[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     *     [+Await] for await ( var ForBinding[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     *     [+Await] for await ( ForDeclaration[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    ForInOfStatement(params: StatementParams = {}): SubhutiCst | undefined {
        const {Await = false} = params

        return this.Or([
            // for ( var ForBinding[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
            {
                alt: () => {
                    this.tokenConsumer.ForTok()
                    this.tokenConsumer.LParen()
                    this.tokenConsumer.VarTok()
                    this.ForBinding(params)
                    this.tokenConsumer.InTok()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            },
            // for ( [lookahead ≠ let [] LeftHandSideExpression[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
            {
                alt: () => {
                    this.tokenConsumer.ForTok()
                    this.tokenConsumer.LParen()
                    this.assertLookaheadNotSequence(['LetTok', 'LBracket'])
                    this.LeftHandSideExpression(params)
                    this.tokenConsumer.InTok()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            },
            // for ( ForDeclaration[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
            {
                alt: () => {
                    this.tokenConsumer.ForTok()
                    this.tokenConsumer.LParen()
                    this.ForDeclaration(params)
                    this.tokenConsumer.InTok()
                    this.Expression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            },
            // for ( var ForBinding[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
            {
                alt: () => {
                    this.tokenConsumer.ForTok()
                    this.tokenConsumer.LParen()
                    this.tokenConsumer.VarTok()
                    this.ForBinding(params)
                    this.tokenConsumer.OfTok()
                    this.AssignmentExpression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            },
            // for ( ForDeclaration[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
            {
                alt: () => {
                    this.tokenConsumer.ForTok()
                    this.tokenConsumer.LParen()
                    this.ForDeclaration(params)
                    this.tokenConsumer.OfTok()
                    this.AssignmentExpression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            },
            // for ( [lookahead ∉ {let, async of}] LeftHandSideExpression[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
            {
                alt: () => {
                    this.tokenConsumer.ForTok()
                    this.tokenConsumer.LParen()
                    // [lookahead ∉ {let, async of}]
                    this.assertLookaheadNotIn(['LetTok'])
                    this.assertLookaheadNotSequence(['AsyncTok', 'OfTok'])
                    this.LeftHandSideExpression(params)
                    this.tokenConsumer.OfTok()
                    this.AssignmentExpression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            },
            // [+Await] for await ( var ForBinding[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
            ...(Await ? [{
                alt: () => {
                    this.tokenConsumer.ForTok()
                    this.tokenConsumer.AwaitTok()
                    this.tokenConsumer.LParen()
                    this.tokenConsumer.VarTok()
                    this.ForBinding(params)
                    this.tokenConsumer.OfTok()
                    this.AssignmentExpression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            }] : []),
            // [+Await] for await ( ForDeclaration[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
            ...(Await ? [{
                alt: () => {
                    this.tokenConsumer.ForTok()
                    this.tokenConsumer.AwaitTok()
                    this.tokenConsumer.LParen()
                    this.ForDeclaration(params)
                    this.tokenConsumer.OfTok()
                    this.AssignmentExpression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            }] : []),
            // [+Await] for await ( [lookahead ≠ let] LeftHandSideExpression[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
            ...(Await ? [{
                alt: () => {
                    this.tokenConsumer.ForTok()
                    this.tokenConsumer.AwaitTok()
                    this.tokenConsumer.LParen()
                    // [lookahead ≠ let]
                    this.assertLookaheadNot('LetTok')
                    this.LeftHandSideExpression(params)
                    this.tokenConsumer.OfTok()
                    this.AssignmentExpression({...params, In: true})
                    this.tokenConsumer.RParen()
                    this.Statement(params)
                }
            }] : [])
        ])
    }

    /**
     * ForDeclaration[Yield, Await] :
     *     LetOrConst ForBinding[?Yield, ?Await]
     */
    @SubhutiRule
    ForDeclaration(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.LetOrConst()
        return this.ForBinding(params)
    }

    /**
     * ForBinding[Yield, Await] :
     *     BindingIdentifier[?Yield, ?Await]
     *     BindingPattern[?Yield, ?Await]
     */
    @SubhutiRule
    ForBinding(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.BindingIdentifier(params)},
            {alt: () => this.BindingPattern(params)}
        ])
    }

    // ----------------------------------------
    // A.3.8 Control Flow Statements
    // ----------------------------------------

    /**
     * ContinueStatement[Yield, Await] :
     *     continue ;
     *     continue [no LineTerminator here] LabelIdentifier[?Yield, ?Await] ;
     */
    @SubhutiRule
    ContinueStatement(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.ContinueTok()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.LabelIdentifier(params)
                    this.SemicolonASI()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.ContinueTok()
                    this.SemicolonASI()
                }
            }
        ])
    }

    /**
     * BreakStatement[Yield, Await] :
     *     break ;
     *     break [no LineTerminator here] LabelIdentifier[?Yield, ?Await] ;
     */
    @SubhutiRule
    BreakStatement(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.BreakTok()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.LabelIdentifier(params)
                    this.SemicolonASI()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.BreakTok()
                    this.SemicolonASI()
                }
            }
        ])
    }

    /**
     * ReturnStatement[Yield, Await] :
     *     return ;
     *     return [no LineTerminator here] Expression[+In, ?Yield, ?Await] ;
     */
    @SubhutiRule
    ReturnStatement(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.ReturnTok()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.Expression({...params, In: true})
                    this.SemicolonASI()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.ReturnTok()
                    this.SemicolonASI()
                }
            }
        ])
    }

    // ----------------------------------------
    // A.3.9 With Statement
    // ----------------------------------------

    /**
     * WithStatement[Yield, Await, Return] :
     *     with ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    WithStatement(params: StatementParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.WithTok()
        this.tokenConsumer.LParen()
        this.Expression({...params, In: true})
        this.tokenConsumer.RParen()
        return this.Statement(params)
    }

    // ----------------------------------------
    // A.3.10 Switch Statement
    // ----------------------------------------

    /**
     * SwitchStatement[Yield, Await, Return] :
     *     switch ( Expression[+In, ?Yield, ?Await] ) CaseBlock[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    SwitchStatement(params: StatementParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.SwitchTok()
        this.tokenConsumer.LParen()
        this.Expression({...params, In: true})
        this.tokenConsumer.RParen()
        return this.CaseBlock(params)
    }

    /**
     * CaseBlock[Yield, Await, Return] :
     *     { CaseClauses[?Yield, ?Await, ?Return]_opt }
     *     { CaseClauses[?Yield, ?Await, ?Return]_opt DefaultClause[?Yield, ?Await, ?Return] CaseClauses[?Yield, ?Await, ?Return]_opt }
     */
    @SubhutiRule
    CaseBlock(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.Option(() => this.CaseClauses(params))
                    this.DefaultClause(params)
                    this.Option(() => this.CaseClauses(params))
                    this.tokenConsumer.RBrace()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.Option(() => this.CaseClauses(params))
                    this.tokenConsumer.RBrace()
                }
            }
        ])
    }

    /**
     * CaseClauses[Yield, Await, Return] :
     *     CaseClause[?Yield, ?Await, ?Return]
     *     CaseClauses[?Yield, ?Await, ?Return] CaseClause[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    CaseClauses(params: StatementParams = {}): SubhutiCst | undefined {
        this.AtLeastOne(() => this.CaseClause(params))
        return this.curCst
    }

    /**
     * CaseClause[Yield, Await, Return] :
     *     case Expression[+In, ?Yield, ?Await] : StatementList[?Yield, ?Await, ?Return]_opt
     */
    @SubhutiRule
    CaseClause(params: StatementParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.CaseTok()
        this.Expression({...params, In: true})
        this.tokenConsumer.Colon()
        this.Option(() => this.StatementList(params))
        return this.curCst
    }

    /**
     * DefaultClause[Yield, Await, Return] :
     *     default : StatementList[?Yield, ?Await, ?Return]_opt
     */
    @SubhutiRule
    DefaultClause(params: StatementParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.DefaultTok()
        this.tokenConsumer.Colon()
        this.Option(() => this.StatementList(params))
        return this.curCst
    }

    // ----------------------------------------
    // A.3.11 Labelled Statement
    // ----------------------------------------

    /**
     * LabelledStatement[Yield, Await, Return] :
     *     LabelIdentifier[?Yield, ?Await] : LabelledItem[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    LabelledStatement(params: StatementParams = {}): SubhutiCst | undefined {
        this.LabelIdentifier(params)
        this.tokenConsumer.Colon()
        return this.LabelledItem(params)
    }

    /**
     * LabelledItem[Yield, Await, Return] :
     *     Statement[?Yield, ?Await, ?Return]
     *     FunctionDeclaration[?Yield, ?Await, ~Default]
     */
    @SubhutiRule
    LabelledItem(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.Statement(params)},
            {alt: () => this.FunctionDeclaration({...params, Default: false})}
        ])
    }

    // ----------------------------------------
    // A.3.12 Throw Statement
    // ----------------------------------------

    /**
     * ThrowStatement[Yield, Await] :
     *     throw [no LineTerminator here] Expression[+In, ?Yield, ?Await] ;
     */
    @SubhutiRule
    ThrowStatement(params: StatementParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.ThrowTok()
        this.assertNoLineBreak()  // [no LineTerminator here]
        this.Expression({...params, In: true})
        return this.SemicolonASI()
    }

    // ----------------------------------------
    // A.3.13 Try Statement
    // ----------------------------------------

    /**
     * TryStatement[Yield, Await, Return] :
     *     try Block[?Yield, ?Await, ?Return] Catch[?Yield, ?Await, ?Return]
     *     try Block[?Yield, ?Await, ?Return] Finally[?Yield, ?Await, ?Return]
     *     try Block[?Yield, ?Await, ?Return] Catch[?Yield, ?Await, ?Return] Finally[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    TryStatement(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.TryTok()
                    this.Block(params)
                    this.Catch(params)
                    this.Finally(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.TryTok()
                    this.Block(params)
                    this.Catch(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.TryTok()
                    this.Block(params)
                    this.Finally(params)
                }
            }
        ])
    }

    /**
     * Catch[Yield, Await, Return] :
     *     catch ( CatchParameter[?Yield, ?Await] ) Block[?Yield, ?Await, ?Return]
     *     catch Block[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    Catch(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.CatchTok()
                    this.tokenConsumer.LParen()
                    this.CatchParameter(params)
                    this.tokenConsumer.RParen()
                    this.Block(params)
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.CatchTok()
                    this.Block(params)
                }
            }
        ])
    }

    /**
     * Finally[Yield, Await, Return] :
     *     finally Block[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    Finally(params: StatementParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.FinallyTok()
        return this.Block(params)
    }

    /**
     * CatchParameter[Yield, Await] :
     *     BindingIdentifier[?Yield, ?Await]
     *     BindingPattern[?Yield, ?Await]
     */
    @SubhutiRule
    CatchParameter(params: StatementParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.BindingIdentifier(params)},
            {alt: () => this.BindingPattern(params)}
        ])
    }

    // ----------------------------------------
    // A.3.14 Debugger Statement
    // ----------------------------------------

    /**
     * DebuggerStatement :
     *     debugger ;
     */
    @SubhutiRule
    DebuggerStatement(): SubhutiCst | undefined {
        this.tokenConsumer.DebuggerTok()
        return this.SemicolonASI()
    }

    // ============================================
    // A.4 Functions and Classes
    // ============================================

    /**
     * YieldExpression[In, Await] :
     *     yield
     *     yield [no LineTerminator here] AssignmentExpression[?In, +Yield, ?Await]
     *     yield [no LineTerminator here] * AssignmentExpression[?In, +Yield, ?Await]
     */
    @SubhutiRule
    YieldExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // yield [no LineTerminator here] * AssignmentExpression[?In, +Yield, ?Await]
            {
                alt: () => {
                    this.tokenConsumer.YieldTok()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.tokenConsumer.Asterisk()
                    this.AssignmentExpression({...params, Yield: true})
                }
            },
            // yield [no LineTerminator here] AssignmentExpression[?In, +Yield, ?Await]
            {
                alt: () => {
                    this.tokenConsumer.YieldTok()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.AssignmentExpression({...params, Yield: true})
                }
            },
            // yield
            {alt: () => this.tokenConsumer.YieldTok()}
        ])
    }

    /**
     * ArrowFunction[In, Yield, Await] :
     *     ArrowParameters[?Yield, ?Await] [no LineTerminator here] => ConciseBody[?In]
     */
    @SubhutiRule
    ArrowFunction(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.ArrowParameters(params)
        this.assertNoLineBreak()  // [no LineTerminator here]
        this.tokenConsumer.Arrow()
        this.ConciseBody(params)
        return this.curCst
    }

    /**
     * ArrowParameters[Yield, Await] :
     *     BindingIdentifier[?Yield, ?Await]
     *     CoverParenthesizedExpressionAndArrowParameterList[?Yield, ?Await]
     */
    @SubhutiRule
    ArrowParameters(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.BindingIdentifier(params)},
            {alt: () => this.CoverParenthesizedExpressionAndArrowParameterList(params)}
        ])
    }

    /**
     * ArrowFormalParameters[Yield, Await] :
     *     ( UniqueFormalParameters[?Yield, ?Await] )
     *
     * Supplemental Syntax:
     * When processing ArrowParameters : CoverParenthesizedExpressionAndArrowParameterList,
     * the interpretation is refined using this rule.
     *
     * 注意：此方法是 Cover Grammar 的精化版本，与规范完全对应。
     */
    @SubhutiRule
    ArrowFormalParameters(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.LParen()
        this.UniqueFormalParameters(params)
        return this.tokenConsumer.RParen()
    }

    /**
     * ConciseBody[In] :
     *     [lookahead ≠ {] ExpressionBody[?In, ~Await]
     *     { FunctionBody[~Yield, ~Await] }
     */
    @SubhutiRule
    ConciseBody(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.FunctionBody({Yield: false, Await: false})
                    this.tokenConsumer.RBrace()
                }
            },
            {
                alt: () => {
                    // [lookahead ≠ {]
                    this.assertLookaheadNot('LBrace')
                    this.ExpressionBody({...params, Await: false})
                }
            }
        ])
    }

    /**
     * ExpressionBody[In, Await] :
     *     AssignmentExpression[?In, ~Yield, ?Await]
     */
    @SubhutiRule
    ExpressionBody(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.AssignmentExpression({...params, Yield: false})
    }

    /**
     * AsyncArrowFunction[In, Yield, Await] :
     *     async [no LineTerminator here] AsyncArrowBindingIdentifier[?Yield] [no LineTerminator here] => AsyncConciseBody[?In]
     *     CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await] [no LineTerminator here] => AsyncConciseBody[?In]
     */
    @SubhutiRule
    AsyncArrowFunction(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // async [no LineTerminator here] AsyncArrowBindingIdentifier[?Yield] [no LineTerminator here] => AsyncConciseBody[?In]
            {
                alt: () => {
                    this.tokenConsumer.AsyncTok()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.AsyncArrowBindingIdentifier(params)
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.tokenConsumer.Arrow()
                    this.AsyncConciseBody(params)
                }
            },
            // CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await] [no LineTerminator here] => AsyncConciseBody[?In]
            {
                alt: () => {
                    this.CoverCallExpressionAndAsyncArrowHead(params)
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.tokenConsumer.Arrow()
                    this.AsyncConciseBody(params)
                }
            }
        ])
    }

    /**
     * AsyncArrowBindingIdentifier[Yield] :
     *     BindingIdentifier[?Yield, +Await]
     */
    @SubhutiRule
    AsyncArrowBindingIdentifier(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.BindingIdentifier({...params, Await: true})
    }

    /**
     * AsyncConciseBody[In] :
     *     [lookahead ≠ {] ExpressionBody[?In, +Await]
     *     { AsyncFunctionBody }
     */
    @SubhutiRule
    AsyncConciseBody(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.AsyncFunctionBody()
                    this.tokenConsumer.RBrace()
                }
            },
            {
                alt: () => {
                    // [lookahead ≠ {]
                    this.assertLookaheadNot('LBrace')
                    this.ExpressionBody({...params, Await: true})
                }
            }
        ])
    }

    /**
     * AsyncArrowHead :
     *     async [no LineTerminator here] ArrowFormalParameters[~Yield, +Await]
     *
     * Supplemental Syntax:
     * When processing AsyncArrowFunction : CoverCallExpressionAndAsyncArrowHead [no LineTerminator here] => AsyncConciseBody,
     * the interpretation is refined using this rule.
     *
     * 注意：此方法是 Cover Grammar 的精化版本，与规范完全对应。
     */
    @SubhutiRule
    AsyncArrowHead(): SubhutiCst | undefined {
        this.tokenConsumer.AsyncTok()
        this.assertNoLineBreak()  // [no LineTerminator here]
        this.ArrowFormalParameters({Yield: false, Await: true})
        return this.curCst
    }

    // ============================================
    // Function Parameters
    // ============================================

    /**
     * UniqueFormalParameters[Yield, Await] :
     *     FormalParameters[?Yield, ?Await]
     */
    @SubhutiRule
    UniqueFormalParameters(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.FormalParameters(params)
    }

    /**
     * FormalParameters[Yield, Await] :
     *     [empty]
     *     FunctionRestParameter[?Yield, ?Await]
     *     FormalParameterList[?Yield, ?Await]
     *     FormalParameterList[?Yield, ?Await] ,
     *     FormalParameterList[?Yield, ?Await] , FunctionRestParameter[?Yield, ?Await]
     */
    @SubhutiRule
    FormalParameters(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // FormalParameterList[?Yield, ?Await] , FunctionRestParameter[?Yield, ?Await]
            {
                alt: () => {
                    this.FormalParameterList(params)
                    this.tokenConsumer.Comma()
                    this.FunctionRestParameter(params)
                }
            },
            // FormalParameterList[?Yield, ?Await] ,
            {
                alt: () => {
                    this.FormalParameterList(params)
                    this.tokenConsumer.Comma()
                }
            },
            // FormalParameterList[?Yield, ?Await]
            {alt: () => this.FormalParameterList(params)},
            // FunctionRestParameter[?Yield, ?Await]
            {alt: () => this.FunctionRestParameter(params)},
            // [empty]
            {alt: () => this.curCst}
        ])
    }

    /**
     * FormalParameterList[Yield, Await] :
     *     FormalParameter[?Yield, ?Await]
     *     FormalParameterList[?Yield, ?Await] , FormalParameter[?Yield, ?Await]
     */
    @SubhutiRule
    FormalParameterList(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.FormalParameter(params)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.FormalParameter(params)
        })
        return this.curCst
    }

    /**
     * FunctionRestParameter[Yield, Await] :
     *     BindingRestElement[?Yield, ?Await]
     */
    @SubhutiRule
    FunctionRestParameter(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.BindingRestElement(params)
    }

    /**
     * FormalParameter[Yield, Await] :
     *     BindingElement[?Yield, ?Await]
     */
    @SubhutiRule
    FormalParameter(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.BindingElement(params)
    }

    // ============================================
    // Function Definitions
    // ============================================

    /**
     * FunctionBody[Yield, Await] :
     *     FunctionStatementList[?Yield, ?Await]
     */
    @SubhutiRule
    FunctionBody(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.FunctionStatementList(params)
    }

    /**
     * FunctionStatementList[Yield, Await] :
     *     StatementList[?Yield, ?Await, +Return]_opt
     */
    @SubhutiRule
    FunctionStatementList(params: ExpressionParams = {}): SubhutiCst | undefined {
        // 注意：必须显式构造参数对象，确保 Return: true 被正确传递
        const statementParams: StatementParams = {
            Yield: params.Yield,
            Await: params.Await,
            Return: true  // FunctionStatementList 总是设置 Return: true
        }
        this.Option(() => this.StatementList(statementParams))
        return this.curCst
    }

    /**
     * FunctionExpression :
     *     function BindingIdentifier[~Yield, ~Await]_opt ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
     */
    @SubhutiRule
    FunctionExpression(): SubhutiCst | undefined {
        this.tokenConsumer.FunctionTok()
        this.Option(() => this.BindingIdentifier({Yield: false, Await: false}))
        this.tokenConsumer.LParen()
        this.FormalParameters({Yield: false, Await: false})
        this.tokenConsumer.RParen()
        this.tokenConsumer.LBrace()
        this.FunctionBody({Yield: false, Await: false})
        return this.tokenConsumer.RBrace()
    }

    /**
     * FunctionDeclaration[Yield, Await, Default] :
     *     function BindingIdentifier[?Yield, ?Await] ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
     *     [+Default] function ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
     */
    @SubhutiRule
    FunctionDeclaration(params: DeclarationParams = {}): SubhutiCst | undefined {
        const {Default = false} = params

        return this.Or([
            // function BindingIdentifier[?Yield, ?Await] ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
            {
                alt: () => {
                    this.tokenConsumer.FunctionTok()
                    this.BindingIdentifier(params)
                    this.tokenConsumer.LParen()
                    this.FormalParameters({Yield: false, Await: false})
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.FunctionBody({Yield: false, Await: false})
                    this.tokenConsumer.RBrace()
                }
            },
            // [+Default] function ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] } - 条件展开
            ...(Default ? [{
                alt: () => {
                    this.tokenConsumer.FunctionTok()
                    this.tokenConsumer.LParen()
                    this.FormalParameters({Yield: false, Await: false})
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.FunctionBody({Yield: false, Await: false})
                    this.tokenConsumer.RBrace()
                }
            }] : [])
        ])
    }

    // ============================================
    // Generator Functions
    // ============================================

    /**
     * GeneratorDeclaration[Yield, Await, Default] :
     *     function * BindingIdentifier[?Yield, ?Await] ( FormalParameters[+Yield, ~Await] ) { GeneratorBody }
     *     [+Default] function * ( FormalParameters[+Yield, ~Await] ) { GeneratorBody }
     */
    @SubhutiRule
    GeneratorDeclaration(params: DeclarationParams = {}): SubhutiCst | undefined {
        const {Default = false} = params

        return this.Or([
            // function * BindingIdentifier[?Yield, ?Await] ( FormalParameters[+Yield, ~Await] ) { GeneratorBody }
            {
                alt: () => {
                    this.tokenConsumer.FunctionTok()
                    this.tokenConsumer.Asterisk()
                    this.BindingIdentifier(params)
                    this.tokenConsumer.LParen()
                    this.FormalParameters({Yield: true, Await: false})
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.GeneratorBody()
                    this.tokenConsumer.RBrace()
                }
            },
            // [+Default] function * ( FormalParameters[+Yield, ~Await] ) { GeneratorBody } - 条件展开
            ...(Default ? [{
                alt: () => {
                    this.tokenConsumer.FunctionTok()
                    this.tokenConsumer.Asterisk()
                    this.tokenConsumer.LParen()
                    this.FormalParameters({Yield: true, Await: false})
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.GeneratorBody()
                    this.tokenConsumer.RBrace()
                }
            }] : [])
        ])
    }

    /**
     * GeneratorExpression :
     *     function * BindingIdentifier[+Yield, ~Await]_opt ( FormalParameters[+Yield, ~Await] ) { GeneratorBody }
     */
    @SubhutiRule
    GeneratorExpression(): SubhutiCst | undefined {
        this.tokenConsumer.FunctionTok()
        this.tokenConsumer.Asterisk()
        this.Option(() => this.BindingIdentifier({Yield: true, Await: false}))
        this.tokenConsumer.LParen()
        this.FormalParameters({Yield: true, Await: false})
        this.tokenConsumer.RParen()
        this.tokenConsumer.LBrace()
        this.GeneratorBody()
        return this.tokenConsumer.RBrace()
    }

    /**
     * GeneratorMethod[Yield, Await] :
     *     * ClassElementName[?Yield, ?Await] ( UniqueFormalParameters[+Yield, ~Await] ) { GeneratorBody }
     */
    @SubhutiRule
    GeneratorMethod(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Asterisk()
        this.ClassElementName(params)
        this.tokenConsumer.LParen()
        this.UniqueFormalParameters({Yield: true, Await: false})
        this.tokenConsumer.RParen()
        this.tokenConsumer.LBrace()
        this.GeneratorBody()
        return this.tokenConsumer.RBrace()
    }

    /**
     * GeneratorBody :
     *     FunctionBody[+Yield, ~Await]
     */
    @SubhutiRule
    GeneratorBody(): SubhutiCst | undefined {
        return this.FunctionBody({Yield: true, Await: false})
    }

    // ============================================
    // Async Functions
    // ============================================

    /**
     * AsyncFunctionDeclaration[Yield, Await, Default] :
     *     async [no LineTerminator here] function BindingIdentifier[?Yield, ?Await] ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }
     *     [+Default] async [no LineTerminator here] function ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }
     */
    @SubhutiRule
    AsyncFunctionDeclaration(params: DeclarationParams = {}): SubhutiCst | undefined {
        const {Default = false} = params

        return this.Or([
            // async [no LineTerminator here] function BindingIdentifier[?Yield, ?Await] ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }
            {
                alt: () => {
                    this.tokenConsumer.AsyncTok()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.tokenConsumer.FunctionTok()
                    this.BindingIdentifier(params)
                    this.tokenConsumer.LParen()
                    this.FormalParameters({Yield: false, Await: true})
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.AsyncFunctionBody()
                    this.tokenConsumer.RBrace()
                }
            },
            // [+Default] async [no LineTerminator here] function ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody } - 条件展开
            ...(Default ? [{
                alt: () => {
                    this.tokenConsumer.AsyncTok()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.tokenConsumer.FunctionTok()
                    this.tokenConsumer.LParen()
                    this.FormalParameters({Yield: false, Await: true})
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.AsyncFunctionBody()
                    this.tokenConsumer.RBrace()
                }
            }] : [])
        ])
    }

    /**
     * AsyncFunctionExpression :
     *     async [no LineTerminator here] function BindingIdentifier[~Yield, +Await]_opt ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }
     */
    @SubhutiRule
    AsyncFunctionExpression(): SubhutiCst | undefined {
        this.tokenConsumer.AsyncTok()
        this.assertNoLineBreak()  // [no LineTerminator here]
        this.tokenConsumer.FunctionTok()
        this.Option(() => this.BindingIdentifier({Yield: false, Await: true}))
        this.tokenConsumer.LParen()
        this.FormalParameters({Yield: false, Await: true})
        this.tokenConsumer.RParen()
        this.tokenConsumer.LBrace()
        this.AsyncFunctionBody()
        this.tokenConsumer.RBrace()
        return this.curCst
    }

    /**
     * AsyncMethod[Yield, Await] :
     *     async [no LineTerminator here] ClassElementName[?Yield, ?Await] ( UniqueFormalParameters[~Yield, +Await] ) { AsyncFunctionBody }
     */
    @SubhutiRule
    AsyncMethod(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.AsyncTok()
        this.assertNoLineBreak()  // [no LineTerminator here]
        this.ClassElementName(params)
        this.tokenConsumer.LParen()
        this.UniqueFormalParameters({Yield: false, Await: true})
        this.tokenConsumer.RParen()
        this.tokenConsumer.LBrace()
        this.AsyncFunctionBody()
        this.tokenConsumer.RBrace()
        return this.curCst
    }

    /**
     * AsyncFunctionBody :
     *     FunctionBody[~Yield, +Await]
     */
    @SubhutiRule
    AsyncFunctionBody(): SubhutiCst | undefined {
        return this.FunctionBody({Yield: false, Await: true})
    }

    // ============================================
    // Async Generator Functions
    // ============================================

    /**
     * AsyncGeneratorDeclaration[Yield, Await, Default] :
     *     async [no LineTerminator here] function * BindingIdentifier[?Yield, ?Await] ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }
     *     [+Default] async [no LineTerminator here] function * ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }
     */
    @SubhutiRule
    AsyncGeneratorDeclaration(params: DeclarationParams = {}): SubhutiCst | undefined {
        const {Default = false} = params

        return this.Or([
            // async [no LineTerminator here] function * BindingIdentifier[?Yield, ?Await] ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }
            {
                alt: () => {
                    this.tokenConsumer.AsyncTok()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.tokenConsumer.FunctionTok()
                    this.tokenConsumer.Asterisk()
                    this.BindingIdentifier(params)
                    this.tokenConsumer.LParen()
                    this.FormalParameters({Yield: true, Await: true})
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.AsyncGeneratorBody()
                    this.tokenConsumer.RBrace()
                }
            },
            // [+Default] async [no LineTerminator here] function * ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody } - 条件展开
            ...(Default ? [{
                alt: () => {
                    this.tokenConsumer.AsyncTok()
                    this.assertNoLineBreak()  // [no LineTerminator here]
                    this.tokenConsumer.FunctionTok()
                    this.tokenConsumer.Asterisk()
                    this.tokenConsumer.LParen()
                    this.FormalParameters({Yield: true, Await: true})
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.AsyncGeneratorBody()
                    this.tokenConsumer.RBrace()
                }
            }] : [])
        ])
    }

    /**
     * AsyncGeneratorExpression :
     *     async [no LineTerminator here] function * BindingIdentifier[+Yield, +Await]_opt ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }
     */
    @SubhutiRule
    AsyncGeneratorExpression(): SubhutiCst | undefined {
        this.tokenConsumer.AsyncTok()
        this.assertNoLineBreak()  // [no LineTerminator here]
        this.tokenConsumer.FunctionTok()
        this.tokenConsumer.Asterisk()
        this.Option(() => this.BindingIdentifier({Yield: true, Await: true}))
        this.tokenConsumer.LParen()
        this.FormalParameters({Yield: true, Await: true})
        this.tokenConsumer.RParen()
        this.tokenConsumer.LBrace()
        this.AsyncGeneratorBody()
        this.tokenConsumer.RBrace()
        return this.curCst
    }

    /**
     * AsyncGeneratorMethod[Yield, Await] :
     *     async [no LineTerminator here] * ClassElementName[?Yield, ?Await] ( UniqueFormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }
     */
    @SubhutiRule
    AsyncGeneratorMethod(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.AsyncTok()
        this.assertNoLineBreak()  // [no LineTerminator here]
        this.tokenConsumer.Asterisk()
        this.ClassElementName(params)
        this.tokenConsumer.LParen()
        this.UniqueFormalParameters({Yield: true, Await: true})
        this.tokenConsumer.RParen()
        this.tokenConsumer.LBrace()
        this.AsyncGeneratorBody()
        this.tokenConsumer.RBrace()
        return this.curCst
    }

    /**
     * AsyncGeneratorBody :
     *     FunctionBody[+Yield, +Await]
     */
    @SubhutiRule
    AsyncGeneratorBody(): SubhutiCst | undefined {
        return this.FunctionBody({Yield: true, Await: true})
    }

    // ============================================
    // Method Definitions
    // ============================================

    /**
     * MethodDefinition[Yield, Await] :
     *     ClassElementName[?Yield, ?Await] ( UniqueFormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
     *     GeneratorMethod[?Yield, ?Await]
     *     AsyncMethod[?Yield, ?Await]
     *     AsyncGeneratorMethod[?Yield, ?Await]
     *     get ClassElementName[?Yield, ?Await] ( ) { FunctionBody[~Yield, ~Await] }
     *     set ClassElementName[?Yield, ?Await] ( PropertySetParameterList ) { FunctionBody[~Yield, ~Await] }
     */
    @SubhutiRule
    MethodDefinition(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // GeneratorMethod[?Yield, ?Await]
            {alt: () => this.GeneratorMethod(params)},
            // AsyncGeneratorMethod[?Yield, ?Await]
            {alt: () => this.AsyncGeneratorMethod(params)},
            // AsyncMethod[?Yield, ?Await]
            {alt: () => this.AsyncMethod(params)},
            // get ClassElementName[?Yield, ?Await] ( ) { FunctionBody[~Yield, ~Await] }
            {
                alt: () => {
                    this.tokenConsumer.GetTok()
                    this.ClassElementName(params)
                    this.tokenConsumer.LParen()
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.FunctionBody({Yield: false, Await: false})
                    this.tokenConsumer.RBrace()
                }
            },
            // set ClassElementName[?Yield, ?Await] ( PropertySetParameterList ) { FunctionBody[~Yield, ~Await] }
            {
                alt: () => {
                    this.tokenConsumer.SetTok()
                    this.ClassElementName(params)
                    this.tokenConsumer.LParen()
                    this.PropertySetParameterList()
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.FunctionBody({Yield: false, Await: false})
                    this.tokenConsumer.RBrace()
                }
            },
            // ClassElementName[?Yield, ?Await] ( UniqueFormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
            {
                alt: () => {
                    this.ClassElementName(params)
                    this.tokenConsumer.LParen()
                    this.UniqueFormalParameters({Yield: false, Await: false})
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.LBrace()
                    this.FunctionBody({Yield: false, Await: false})
                    this.tokenConsumer.RBrace()
                }
            }
        ])
    }

    /**
     * PropertySetParameterList :
     *     FormalParameter[~Yield, ~Await]
     */
    @SubhutiRule
    PropertySetParameterList(): SubhutiCst | undefined {
        return this.FormalParameter({Yield: false, Await: false})
    }

    // ============================================
    // Class Definitions
    // ============================================

    /**
     * ClassDeclaration[Yield, Await, Default] :
     *     class BindingIdentifier[?Yield, ?Await] ClassTail[?Yield, ?Await]
     *     [+Default] class ClassTail[?Yield, ?Await]
     */
    @SubhutiRule
    ClassDeclaration(params: DeclarationParams = {}): SubhutiCst | undefined {
        const {Default = false} = params

        return this.Or([
            // class BindingIdentifier[?Yield, ?Await] ClassTail[?Yield, ?Await]
            {
                alt: () => {
                    this.tokenConsumer.ClassTok()
                    this.BindingIdentifier(params)
                    this.ClassTail(params)
                }
            },
            // [+Default] class ClassTail[?Yield, ?Await] - 条件展开
            ...(Default ? [{
                alt: () => {
                    this.tokenConsumer.ClassTok()
                    this.ClassTail(params)
                }
            }] : [])
        ])
    }

    /**
     * ClassExpression[Yield, Await] :
     *     class BindingIdentifier[?Yield, ?Await]_opt ClassTail[?Yield, ?Await]
     */
    @SubhutiRule
    ClassExpression(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.ClassTok()
        this.Option(() => this.BindingIdentifier(params))
        return this.ClassTail(params)
    }

    /**
     * ClassTail[Yield, Await] :
     *     ClassHeritage[?Yield, ?Await]_opt { ClassBody[?Yield, ?Await]_opt }
     */
    @SubhutiRule
    ClassTail(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.Option(() => this.ClassHeritage(params))
        this.tokenConsumer.LBrace()
        this.Option(() => this.ClassBody(params))
        return this.tokenConsumer.RBrace()
    }

    /**
     * ClassHeritage[Yield, Await] :
     *     extends LeftHandSideExpression[?Yield, ?Await]
     */
    @SubhutiRule
    ClassHeritage(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.ExtendsTok()
        return this.LeftHandSideExpression(params)
    }

    /**
     * ClassBody[Yield, Await] :
     *     ClassElementList[?Yield, ?Await]
     */
    @SubhutiRule
    ClassBody(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.ClassElementList(params)
    }

    /**
     * ClassElementList[Yield, Await] :
     *     ClassElement[?Yield, ?Await]
     *     ClassElementList[?Yield, ?Await] ClassElement[?Yield, ?Await]
     */
    @SubhutiRule
    ClassElementList(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.AtLeastOne(() => this.ClassElement(params))
        return this.curCst
    }

    /**
     * ClassElement[Yield, Await] :
     *     MethodDefinition[?Yield, ?Await]
     *     static MethodDefinition[?Yield, ?Await]
     *     FieldDefinition[?Yield, ?Await] ;
     *     static FieldDefinition[?Yield, ?Await] ;
     *     ClassStaticBlock
     *     ;
     */
    @SubhutiRule
    ClassElement(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // static MethodDefinition[?Yield, ?Await]
            {
                alt: () => {
                    this.tokenConsumer.StaticTok()
                    this.MethodDefinition(params)
                }
            },
            // static FieldDefinition[?Yield, ?Await] ;
            {
                alt: () => {
                    this.tokenConsumer.StaticTok()
                    this.FieldDefinition(params)
                    this.tokenConsumer.Semicolon()
                }
            },
            // ClassStaticBlock
            {alt: () => this.ClassStaticBlock()},
            // FieldDefinition[?Yield, ?Await] ;
            {
                alt: () => {
                    this.FieldDefinition(params)
                    this.tokenConsumer.Semicolon()
                }
            },
            // MethodDefinition[?Yield, ?Await]
            {alt: () => this.MethodDefinition(params)},
            // ;
            {alt: () => this.tokenConsumer.Semicolon()}
        ])
    }

    /**
     * FieldDefinition[Yield, Await] :
     *     ClassElementName[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt
     */
    @SubhutiRule
    FieldDefinition(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.ClassElementName(params)
        this.Option(() => this.Initializer({...params, In: true}))
        return this.curCst
    }

    /**
     * ClassElementName[Yield, Await] :
     *     PropertyName[?Yield, ?Await]
     *     PrivateIdentifier
     */
    @SubhutiRule
    ClassElementName(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.PropertyName(params)},
            {alt: () => this.tokenConsumer.PrivateIdentifier()}
        ])
    }

    /**
     * ClassStaticBlock :
     *     static { ClassStaticBlockBody }
     */
    @SubhutiRule
    ClassStaticBlock(): SubhutiCst | undefined {
        this.tokenConsumer.StaticTok()
        this.tokenConsumer.LBrace()
        this.ClassStaticBlockBody()
        return this.tokenConsumer.RBrace()
    }

    /**
     * ClassStaticBlockBody :
     *     ClassStaticBlockStatementList
     */
    @SubhutiRule
    ClassStaticBlockBody(): SubhutiCst | undefined {
        return this.ClassStaticBlockStatementList()
    }

    /**
     * ClassStaticBlockStatementList :
     *     StatementList[~Yield, +Await, ~Return]_opt
     */
    @SubhutiRule
    ClassStaticBlockStatementList(): SubhutiCst | undefined {
        this.Option(() => this.StatementList({Yield: false, Await: true, Return: false}))
        return this.curCst
    }

    // ============================================
    // A.5 Scripts and Modules
    // ============================================

    /**
     * Script :
     *     ScriptBody_opt
     *
     * ScriptBody :
     *     StatementList[~Yield, ~Await, ~Return]
     */
    @SubhutiRule
    Script(): SubhutiCst | undefined {
        this.Option(() => this.StatementList({Yield: false, Await: false, Return: false}))
        return this.curCst
    }

    /**
     * Module :
     *     ModuleBody_opt
     *
     * ModuleBody :
     *     ModuleItemList
     */
    @SubhutiRule
    Module(): SubhutiCst | undefined {
        this.Option(() => this.ModuleItemList())
        return this.curCst
    }

    /**
     * ModuleItemList :
     *     ModuleItem
     *     ModuleItemList ModuleItem
     */
    @SubhutiRule
    ModuleItemList(): SubhutiCst | undefined {
        this.AtLeastOne(() => this.ModuleItem())
        return this.curCst
    }

    /**
     * ModuleItem :
     *     ImportDeclaration
     *     ExportDeclaration
     *     StatementListItem[~Yield, +Await, ~Return]
     */
    @SubhutiRule
    ModuleItem(): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.ImportDeclaration()},
            {alt: () => this.ExportDeclaration()},
            {alt: () => this.StatementListItem({Yield: false, Await: true, Return: false})}
        ])
    }

    // ============================================
    // A.5.3 Imports
    // ============================================

    /**
     * ImportDeclaration :
     *     import ImportClause FromClause WithClause_opt ;
     *     import ModuleSpecifier WithClause_opt ;
     */
    @SubhutiRule
    ImportDeclaration(): SubhutiCst | undefined {
        return this.Or([
            // import ImportClause FromClause WithClause_opt ;
            {
                alt: () => {
                    this.tokenConsumer.ImportTok()
                    this.ImportClause()
                    this.FromClause()
                    this.Option(() => this.WithClause())
                    this.SemicolonASI()
                }
            },
            // import ModuleSpecifier WithClause_opt ;
            {
                alt: () => {
                    this.tokenConsumer.ImportTok()
                    this.ModuleSpecifier()
                    this.Option(() => this.WithClause())
                    this.SemicolonASI()
                }
            }
        ])
    }

    /**
     * ImportClause :
     *     ImportedDefaultBinding
     *     NameSpaceImport
     *     NamedImports
     *     ImportedDefaultBinding , NameSpaceImport
     *     ImportedDefaultBinding , NamedImports
     */
    @SubhutiRule
    ImportClause(): SubhutiCst | undefined {
        return this.Or([
            // ImportedDefaultBinding , NameSpaceImport
            {
                alt: () => {
                    this.ImportedDefaultBinding()
                    this.tokenConsumer.Comma()
                    this.NameSpaceImport()
                }
            },
            // ImportedDefaultBinding , NamedImports
            {
                alt: () => {
                    this.ImportedDefaultBinding()
                    this.tokenConsumer.Comma()
                    this.NamedImports()
                }
            },
            // ImportedDefaultBinding
            {alt: () => this.ImportedDefaultBinding()},
            // NameSpaceImport
            {alt: () => this.NameSpaceImport()},
            // NamedImports
            {alt: () => this.NamedImports()}
        ])
    }

    /**
     * ImportedDefaultBinding :
     *     ImportedBinding
     */
    @SubhutiRule
    ImportedDefaultBinding(): SubhutiCst | undefined {
        return this.ImportedBinding()
    }

    /**
     * NameSpaceImport :
     *     * as ImportedBinding
     */
    @SubhutiRule
    NameSpaceImport(): SubhutiCst | undefined {
        this.tokenConsumer.Asterisk()
        this.tokenConsumer.AsTok()
        return this.ImportedBinding()
    }

    /**
     * NamedImports :
     *     { }
     *     { ImportsList }
     *     { ImportsList , }
     */
    @SubhutiRule
    NamedImports(): SubhutiCst | undefined {
        return this.Or([
            // { }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.tokenConsumer.RBrace()
                }
            },
            // { ImportsList , }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.ImportsList()
                    this.tokenConsumer.Comma()
                    this.tokenConsumer.RBrace()
                }
            },
            // { ImportsList }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.ImportsList()
                    this.tokenConsumer.RBrace()
                }
            }
        ])
    }

    /**
     * FromClause :
     *     from ModuleSpecifier
     */
    @SubhutiRule
    FromClause(): SubhutiCst | undefined {
        this.tokenConsumer.FromTok()
        return this.ModuleSpecifier()
    }

    /**
     * ImportsList :
     *     ImportSpecifier
     *     ImportsList , ImportSpecifier
     */
    @SubhutiRule
    ImportsList(): SubhutiCst | undefined {
        this.ImportSpecifier()
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.ImportSpecifier()
        })
        return this.curCst
    }

    /**
     * ImportSpecifier :
     *     ImportedBinding
     *     ModuleExportName as ImportedBinding
     */
    @SubhutiRule
    ImportSpecifier(): SubhutiCst | undefined {
        return this.Or([
            // ModuleExportName as ImportedBinding
            {
                alt: () => {
                    this.ModuleExportName()
                    this.tokenConsumer.AsTok()
                    this.ImportedBinding()
                }
            },
            // ImportedBinding
            {alt: () => this.ImportedBinding()}
        ])
    }

    /**
     * ModuleSpecifier :
     *     StringLiteral
     */
    @SubhutiRule
    ModuleSpecifier(): SubhutiCst | undefined {
        return this.tokenConsumer.String()
    }

    /**
     * ImportedBinding :
     *     BindingIdentifier[~Yield, +Await]
     */
    @SubhutiRule
    ImportedBinding(): SubhutiCst | undefined {
        return this.BindingIdentifier({Yield: false, Await: true})
    }

    /**
     * WithClause :
     *     with { }
     *     with { WithEntries ,_opt }
     */
    @SubhutiRule
    WithClause(): SubhutiCst | undefined {
        return this.Or([
            // with { }
            {
                alt: () => {
                    this.tokenConsumer.WithTok()
                    this.tokenConsumer.LBrace()
                    this.tokenConsumer.RBrace()
                }
            },
            // with { WithEntries ,_opt }
            {
                alt: () => {
                    this.tokenConsumer.WithTok()
                    this.tokenConsumer.LBrace()
                    this.WithEntries()
                    this.Option(() => this.tokenConsumer.Comma())
                    this.tokenConsumer.RBrace()
                }
            }
        ])
    }

    /**
     * WithEntries :
     *     AttributeKey : StringLiteral
     *     AttributeKey : StringLiteral , WithEntries
     */
    @SubhutiRule
    WithEntries(): SubhutiCst | undefined {
        this.AttributeKey()
        this.tokenConsumer.Colon()
        this.tokenConsumer.String()

        this.Many(() => {
            this.tokenConsumer.Comma()
            this.AttributeKey()
            this.tokenConsumer.Colon()
            this.tokenConsumer.String()
        })

        return this.curCst
    }

    /**
     * AttributeKey :
     *     IdentifierName
     *     StringLiteral
     */
    @SubhutiRule
    AttributeKey(): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.IdentifierName()},
            {alt: () => this.tokenConsumer.String()}
        ])
    }

    // ============================================
    // A.5.4 Exports
    // ============================================

    /**
     * ExportDeclaration :
     *     export ExportFromClause FromClause WithClause_opt ;
     *     export NamedExports ;
     *     export VariableStatement[~Yield, +Await]
     *     export Declaration[~Yield, +Await]
     *     export default HoistableDeclaration[~Yield, +Await, +Default]
     *     export default ClassDeclaration[~Yield, +Await, +Default]
     *     export default [lookahead ∉ {function, async [no LineTerminator here] function, class}] AssignmentExpression[+In, ~Yield, +Await] ;
     */
    @SubhutiRule
    ExportDeclaration(): SubhutiCst | undefined {
        return this.Or([
            // export ExportFromClause FromClause WithClause_opt ;
            {
                alt: () => {
                    this.tokenConsumer.ExportTok()
                    this.ExportFromClause()
                    this.FromClause()
                    this.Option(() => this.WithClause())
                    this.SemicolonASI()
                }
            },
            // export NamedExports ;
            {
                alt: () => {
                    this.tokenConsumer.ExportTok()
                    this.NamedExports()
                    this.SemicolonASI()
                }
            },
            // export VariableStatement[~Yield, +Await]
            {
                alt: () => {
                    this.tokenConsumer.ExportTok()
                    this.VariableStatement({Yield: false, Await: true})
                }
            },
            // export Declaration[~Yield, +Await]
            {
                alt: () => {
                    this.tokenConsumer.ExportTok()
                    this.Declaration({Yield: false, Await: true})
                }
            },
            // export default HoistableDeclaration[~Yield, +Await, +Default]
            {
                alt: () => {
                    this.tokenConsumer.ExportTok()
                    this.tokenConsumer.DefaultTok()
                    this.HoistableDeclaration({Yield: false, Await: true, Default: true})
                }
            },
            // export default ClassDeclaration[~Yield, +Await, +Default]
            {
                alt: () => {
                    this.tokenConsumer.ExportTok()
                    this.tokenConsumer.DefaultTok()
                    this.ClassDeclaration({Yield: false, Await: true, Default: true})
                }
            },
            // export default [lookahead ∉ {function, async [no LineTerminator here] function, class}] AssignmentExpression[+In, ~Yield, +Await] ;
            {
                alt: () => {
                    this.tokenConsumer.ExportTok()
                    this.tokenConsumer.DefaultTok()
                    // [lookahead ∉ {function, async [no LineTerminator here] function, class}]
                    this.assertLookaheadNotIn(['FunctionTok', 'ClassTok'])
                    this.assertLookaheadNotSequenceNoLT(['AsyncTok', 'FunctionTok'])
                    this.AssignmentExpression({In: true, Yield: false, Await: true})
                    this.SemicolonASI()
                }
            }
        ])
    }

    /**
     * ExportFromClause :
     *     *
     *     * as ModuleExportName
     *     NamedExports
     */
    @SubhutiRule
    ExportFromClause(): SubhutiCst | undefined {
        return this.Or([
            // * as ModuleExportName
            {
                alt: () => {
                    this.tokenConsumer.Asterisk()
                    this.tokenConsumer.AsTok()
                    this.ModuleExportName()
                }
            },
            // *
            {alt: () => this.tokenConsumer.Asterisk()},
            // NamedExports
            {alt: () => this.NamedExports()}
        ])
    }

    /**
     * NamedExports :
     *     { }
     *     { ExportsList }
     *     { ExportsList , }
     */
    @SubhutiRule
    NamedExports(): SubhutiCst | undefined {
        return this.Or([
            // { }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.tokenConsumer.RBrace()
                }
            },
            // { ExportsList , }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.ExportsList()
                    this.tokenConsumer.Comma()
                    this.tokenConsumer.RBrace()
                }
            },
            // { ExportsList }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.ExportsList()
                    this.tokenConsumer.RBrace()
                }
            }
        ])
    }

    /**
     * ExportsList :
     *     ExportSpecifier
     *     ExportsList , ExportSpecifier
     */
    @SubhutiRule
    ExportsList(): SubhutiCst | undefined {
        this.ExportSpecifier()
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.ExportSpecifier()
        })
        return this.curCst
    }

    /**
     * ExportSpecifier :
     *     ModuleExportName
     *     ModuleExportName as ModuleExportName
     */
    @SubhutiRule
    ExportSpecifier(): SubhutiCst | undefined {
        return this.Or([
            // ModuleExportName as ModuleExportName
            {
                alt: () => {
                    this.ModuleExportName()
                    this.tokenConsumer.AsTok()
                    this.ModuleExportName()
                }
            },
            // ModuleExportName
            {alt: () => this.ModuleExportName()}
        ])
    }

    /**
     * ModuleExportName :
     *     IdentifierName
     *     StringLiteral
     */
    @SubhutiRule
    ModuleExportName(): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.IdentifierName()},
            {alt: () => this.tokenConsumer.String()}
        ])
    }

    // ============================================
    // AssignmentPattern (Supplemental Syntax)
    // ============================================

    /**
     * AssignmentPattern[Yield, Await] :
     *     ObjectAssignmentPattern[?Yield, ?Await]
     *     ArrayAssignmentPattern[?Yield, ?Await]
     */
    @SubhutiRule
    AssignmentPattern(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            {alt: () => this.ObjectAssignmentPattern(params)},
            {alt: () => this.ArrayAssignmentPattern(params)}
        ])
    }

    /**
     * ObjectAssignmentPattern[Yield, Await] :
     *     { }
     *     { AssignmentRestProperty[?Yield, ?Await] }
     *     { AssignmentPropertyList[?Yield, ?Await] }
     *     { AssignmentPropertyList[?Yield, ?Await] , AssignmentRestProperty[?Yield, ?Await]_opt }
     */
    @SubhutiRule
    ObjectAssignmentPattern(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // { }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.tokenConsumer.RBrace()
                }
            },
            // { AssignmentRestProperty[?Yield, ?Await] }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.AssignmentRestProperty(params)
                    this.tokenConsumer.RBrace()
                }
            },
            // { AssignmentPropertyList[?Yield, ?Await] , AssignmentRestProperty[?Yield, ?Await]_opt }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.AssignmentPropertyList(params)
                    this.tokenConsumer.Comma()
                    this.Option(() => this.AssignmentRestProperty(params))
                    this.tokenConsumer.RBrace()
                }
            },
            // { AssignmentPropertyList[?Yield, ?Await] }
            {
                alt: () => {
                    this.tokenConsumer.LBrace()
                    this.AssignmentPropertyList(params)
                    this.tokenConsumer.RBrace()
                }
            }
        ])
    }

    /**
     * ArrayAssignmentPattern[Yield, Await] :
     *     [ Elision_opt AssignmentRestElement[?Yield, ?Await]_opt ]
     *     [ AssignmentElementList[?Yield, ?Await] ]
     *     [ AssignmentElementList[?Yield, ?Await] , Elision_opt AssignmentRestElement[?Yield, ?Await]_opt ]
     */
    @SubhutiRule
    ArrayAssignmentPattern(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // [ Elision_opt AssignmentRestElement[?Yield, ?Await]_opt ]
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.Option(() => this.Elision())
                    this.Option(() => this.AssignmentRestElement(params))
                    this.tokenConsumer.RBracket()
                }
            },
            // [ AssignmentElementList[?Yield, ?Await] , Elision_opt AssignmentRestElement[?Yield, ?Await]_opt ]
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.AssignmentElementList(params)
                    this.tokenConsumer.Comma()
                    this.Option(() => this.Elision())
                    this.Option(() => this.AssignmentRestElement(params))
                    this.tokenConsumer.RBracket()
                }
            },
            // [ AssignmentElementList[?Yield, ?Await] ]
            {
                alt: () => {
                    this.tokenConsumer.LBracket()
                    this.AssignmentElementList(params)
                    this.tokenConsumer.RBracket()
                }
            }
        ])
    }

    /**
     * AssignmentRestProperty[Yield, Await] :
     *     ... DestructuringAssignmentTarget[?Yield, ?Await]
     */
    @SubhutiRule
    AssignmentRestProperty(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Ellipsis()
        return this.DestructuringAssignmentTarget(params)
    }

    /**
     * AssignmentPropertyList[Yield, Await] :
     *     AssignmentProperty[?Yield, ?Await]
     *     AssignmentPropertyList[?Yield, ?Await] , AssignmentProperty[?Yield, ?Await]
     */
    @SubhutiRule
    AssignmentPropertyList(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.AssignmentProperty(params)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.AssignmentProperty(params)
        })
        return this.curCst
    }

    /**
     * AssignmentElementList[Yield, Await] :
     *     AssignmentElisionElement[?Yield, ?Await]
     *     AssignmentElementList[?Yield, ?Await] , AssignmentElisionElement[?Yield, ?Await]
     */
    @SubhutiRule
    AssignmentElementList(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.AssignmentElisionElement(params)
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.AssignmentElisionElement(params)
        })
        return this.curCst
    }

    /**
     * AssignmentElisionElement[Yield, Await] :
     *     Elision_opt AssignmentElement[?Yield, ?Await]
     */
    @SubhutiRule
    AssignmentElisionElement(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.Option(() => this.Elision())
        return this.AssignmentElement(params)
    }

    /**
     * AssignmentProperty[Yield, Await] :
     *     IdentifierReference[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt
     *     PropertyName[?Yield, ?Await] : AssignmentElement[?Yield, ?Await]
     */
    @SubhutiRule
    AssignmentProperty(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.Or([
            // PropertyName[?Yield, ?Await] : AssignmentElement[?Yield, ?Await]
            {
                alt: () => {
                    this.PropertyName(params)
                    this.tokenConsumer.Colon()
                    this.AssignmentElement(params)
                }
            },
            // IdentifierReference[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt
            {
                alt: () => {
                    this.IdentifierReference(params)
                    this.Option(() => this.Initializer({...params, In: true}))
                }
            }
        ])
    }

    /**
     * AssignmentElement[Yield, Await] :
     *     DestructuringAssignmentTarget[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt
     */
    @SubhutiRule
    AssignmentElement(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.DestructuringAssignmentTarget(params)
        this.Option(() => this.Initializer({...params, In: true}))
        return this.curCst
    }

    /**
     * AssignmentRestElement[Yield, Await] :
     *     ... DestructuringAssignmentTarget[?Yield, ?Await]
     */
    @SubhutiRule
    AssignmentRestElement(params: ExpressionParams = {}): SubhutiCst | undefined {
        this.tokenConsumer.Ellipsis()
        return this.DestructuringAssignmentTarget(params)
    }

    /**
     * DestructuringAssignmentTarget[Yield, Await] :
     *     LeftHandSideExpression[?Yield, ?Await]
     */
    @SubhutiRule
    DestructuringAssignmentTarget(params: ExpressionParams = {}): SubhutiCst | undefined {
        return this.LeftHandSideExpression(params)
    }
}

/**
 * === ES2025 Parser 完整实现 ===
 *
 * 本 Parser 完全基于 ECMAScript® 2025 规范（https://tc39.es/ecma262/2025/#sec-grammar-summary）
 *
 * ✅ 已完整实现的部分：
 *
 * A.2 Expressions（表达式）：
 * - IdentifierReference、BindingIdentifier、LabelIdentifier
 * - PrimaryExpression（this、Literal、ArrayLiteral、ObjectLiteral 等）
 * - TemplateLiteral（模板字面量）
 * - MemberExpression、NewExpression、CallExpression
 * - OptionalExpression（可选链）
 * - UpdateExpression、UnaryExpression
 * - 所有二元运算符表达式（乘法、加法、位移、关系、相等、位运算、逻辑运算）
 * - ConditionalExpression（三元运算符）
 * - AssignmentExpression（赋值表达式）
 * - YieldExpression、ArrowFunction、AsyncArrowFunction
 * - Expression（逗号表达式）
 *
 * A.3 Statements（语句）：
 * - BlockStatement、VariableStatement、EmptyStatement
 * - ExpressionStatement、IfStatement
 * - IterationStatement（DoWhile、While、For、ForInOf）
 * - ContinueStatement、BreakStatement、ReturnStatement
 * - WithStatement、SwitchStatement、LabelledStatement
 * - ThrowStatement、TryStatement、DebuggerStatement
 * - LexicalDeclaration、VariableDeclaration
 * - BindingPattern（解构绑定）
 *
 * A.4 Functions and Classes（函数和类）：
 * - FormalParameters、UniqueFormalParameters
 * - FunctionBody、FunctionExpression、FunctionDeclaration
 * - GeneratorExpression、GeneratorDeclaration、GeneratorBody
 * - AsyncFunctionExpression、AsyncFunctionDeclaration、AsyncFunctionBody
 * - AsyncGeneratorExpression、AsyncGeneratorDeclaration、AsyncGeneratorBody
 * - ArrowFunction、AsyncArrowFunction
 * - MethodDefinition（普通方法、Generator、Async、AsyncGenerator、getter、setter）
 * - ClassExpression、ClassDeclaration、ClassTail、ClassBody
 * - ClassElement、FieldDefinition、ClassStaticBlock
 *
 * A.5 Scripts and Modules（脚本和模块）：
 * - Script、Module、ModuleItem
 * - ImportDeclaration、ImportClause、NameSpaceImport、NamedImports
 * - ExportDeclaration、ExportFromClause、NamedExports
 * - WithClause（Import Assertions）
 *
 * Supplemental Syntax（补充语法）：
 * - AssignmentPattern、ObjectAssignmentPattern、ArrayAssignmentPattern
 * - AssignmentProperty、AssignmentElement、DestructuringAssignmentTarget
 *
 * ✅ 语法特性覆盖：
 * 1. 参数化规则：完整支持 [Yield, Await, In, Return, Default, Tagged]
 * 2. 前瞻约束：实现所有 [lookahead =, ≠, ∈, ∉] 规则
 * 3. 换行符约束：实现所有 [no LineTerminator here] 规则
 * 4. Cover Grammar：支持 CoverParenthesizedExpression、CoverCallExpression 等
 *
 * ✅ 设计特点：
 * 1. 完全符合 ES2025 规范，一对一映射语法规则
 * 2. 使用 SubhutiParser 的 PEG 能力（Or, Many, Option, AtLeastOne）
 * 3. 类型安全的 TokenConsumer 接口
 * 4. 继承 SubhutiTokenLookahead 提供完整的前瞻能力
 * 5. 支持所有现代 JavaScript 特性（async/await、class、module、optional chaining 等）
 *
 * 📝 实现说明：
 * - 本实现专注于语法结构的完全符合性
 * - 不考虑运行结果，只保证与规范一致
 * - 所有规则都使用 @SubhutiRule 装饰器
 * - 参数传递严格遵循规范的参数化规则
 *
 * @version 2.0.0 - 完整实现版本
 * @specification ECMAScript® 2025 Language Specification
 * @url https://tc39.es/ecma262/2025/#sec-grammar-summary
 */


