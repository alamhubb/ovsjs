import Es6TokenConsumer from "./Es6Tokens.ts"
import SubhutiMatchToken from "subhuti/src/struct/SubhutiMatchToken.ts"
import SubhutiParser, {Subhuti, SubhutiRule, type SubhutiTokenConsumerConstructor} from "subhuti/src/parser/SubhutiParser.ts"
import {Es5TokensName} from "../es5/Es5Tokens.ts";

@Subhuti
export default class Es6Parser<T extends Es6TokenConsumer> extends SubhutiParser<T> {
    constructor(tokens?: SubhutiMatchToken[], TokenConsumerClass: SubhutiTokenConsumerConstructor<T> = Es6TokenConsumer as SubhutiTokenConsumerConstructor<T>) {
        // 预处理tokens：根据上下文将SetTok/GetTok转换为Identifier
        if (tokens) {
            tokens = Es6Parser.preprocessSetGetTokens(tokens);
        }
        super(tokens, TokenConsumerClass);
    }

    /**
     * 预处理SetTok/GetTok：根据后面的token判断是否为真正的getter/setter
     * 规则：
     * - set/get后面是Identifier → 保留为关键字（可能是getter/setter）
     * - set/get后面不是Identifier → 改为Identifier（成员访问、变量名等）
     */
    private static preprocessSetGetTokens(tokens: SubhutiMatchToken[]): SubhutiMatchToken[] {
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            if (token.tokenName === Es5TokensName.SetTok || token.tokenName === Es5TokensName.GetTok) {
                // 检查后面的token
                const nextToken = i + 1 < tokens.length ? tokens[i + 1] : null;

                // 如果后面不是Identifier，改为Identifier
                if (!nextToken || nextToken.tokenName !== Es5TokensName.Identifier) {
                    token.tokenName = Es5TokensName.Identifier;
                }
                // 否则保留为SetTok/GetTok（可能是getter/setter）
            }
        }
        return tokens;
    }

    /**
     * IdentifierReference: 标识符引用（用于读取变量值）
     *
     * 1. ECMAScript规范的语义区分：
     *    - IdentifierReference用于引用已存在的变量（右值）
     *    - 例如：const x = y; // y是IdentifierReference
     *    - 与BindingIdentifier（声明）和LabelIdentifier（标签）语义不同
     *
     * 2. 预留扩展空间（完整ES规范）：
     *    IdentifierReference:
     *      Identifier
     *      [但不包括严格模式的保留字]
     *      [但不包括 yield 在生成器上下文中]
     *      [但不包括 await 在async函数上下文中]
     *    当前简化实现只支持Identifier，未来可在Or中添加上下文相关的分支
     *
     * 3. Or的副作用机制：
     *    - Or会重置optionAndOrAllowErrorMatchOnce标志
     *    - 确保正确的回溯行为和错误处理
     */
    @SubhutiRule
    IdentifierReference() {
        this.Or([
            {alt: () => this.tokenConsumer.Identifier()},
        ])
    }

    /**
     * BindingIdentifier: 绑定标识符（用于声明新变量）
     *
     * 1. ECMAScript规范的语义区分：
     *    - BindingIdentifier用于创建新的变量绑定（左值）
     *    - 例如：const x = 1; // x是BindingIdentifier
     *    - 例如：function foo(param) {} // param是BindingIdentifier
     *
     * 2. 预留扩展空间（完整ES规范）：
     *    BindingIdentifier:
     *      Identifier
     *      yield    (在非生成器上下文中可作为变量名)
     *      await    (在非async上下文中可作为变量名)
     *    当前简化实现只支持Identifier，未来需要添加上下文检查分支
     *
     * 3. Or的副作用机制：
     *    - Or会重置optionAndOrAllowErrorMatchOnce标志
     *    - 确保外层Or（如ArrowParameters）能正确回溯
     */
    @SubhutiRule
    BindingIdentifier() {
        this.Or([
            {alt: () => this.tokenConsumer.Identifier()},
        ])
    }

    /**
     * LabelIdentifier: 标签标识符（用于break/continue的目标）
     *
     * 1. ECMAScript规范的语义区分：
     *    - LabelIdentifier用于标记语句，供break/continue跳转
     *    - 例如：myLabel: for(...) { break myLabel; }
     *    - 与变量标识符完全不同的命名空间
     *
     * 2. 预留扩展空间（完整ES规范）：
     *    LabelIdentifier:
     *      Identifier
     *      [但不包括 yield 和 await]
     *    当前简化实现只支持Identifier，未来可添加关键字过滤分支
     *
     * 3. Or的副作用机制：
     *    - Or会重置optionAndOrAllowErrorMatchOnce标志
     *    - 统一的错误处理和allowError栈管理
     */
    @SubhutiRule
    LabelIdentifier() {
        this.Or([
            {alt: () => this.tokenConsumer.Identifier()},
        ])
    }

    @SubhutiRule
    PrimaryExpression() {
        this.Or([
            {alt: () => this.tokenConsumer.ThisTok()},
            {alt: () => this.IdentifierReference()},
            {alt: () => this.Literal()},
            {alt: () => this.ArrayLiteral()},
            {alt: () => this.ObjectLiteral()},
            {alt: () => this.FunctionExpression()},
            {alt: () => this.ClassExpression()},
            {alt: () => this.GeneratorExpression()},
            {alt: () => this.tokenConsumer.RegularExpressionLiteral()},
            {alt: () => this.TemplateLiteral()},
            // ✅ 普通括号表达式：(expr)
            {alt: () => this.ParenthesizedExpression()},
        ])
    }

    @SubhutiRule
    ParenthesizedExpression() {
        this.tokenConsumer.LParen()
        this.Expression()
        this.tokenConsumer.RParen()
    }

    @SubhutiRule
    Literal() {
        this.Or([
            {alt: () => this.tokenConsumer.NullLiteral()},
            {alt: () => this.tokenConsumer.TrueTok()},
            {alt: () => this.tokenConsumer.FalseTok()},
            {alt: () => this.tokenConsumer.NumericLiteral()},
            {alt: () => this.tokenConsumer.StringLiteral()}
        ])
    }

    @SubhutiRule
    ArrayLiteral() {
        this.tokenConsumer.LBracket()

        this.Or([
            // [ a, b, ]
            {
                alt: () => {
                    this.ElementList()
                    this.tokenConsumer.Comma()
                    this.Option(() => this.Elision())
                }
            },
            // [ a, b ]
            {
                alt: () => this.ElementList()
            },
            // [], [,,,]
            {
                alt: () => this.Option(() => this.Elision())
            }
        ])

        this.tokenConsumer.RBracket()
    }
    @SubhutiRule
    ElementList() {
        this.Option(() => this.Elision())
        this.Or([
            {alt: () => this.SpreadElement()},
            {alt: () => this.AssignmentExpression()}
        ])
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.Option(() => this.Elision())
            this.Or([
                {alt: () => this.SpreadElement()},
                {alt: () => this.AssignmentExpression()}
            ])
        })
    }

    @SubhutiRule
    Elision() {
        this.tokenConsumer.Comma()
        this.Many(() => this.tokenConsumer.Comma())
    }

    @SubhutiRule
    SpreadElement() {
        this.tokenConsumer.Ellipsis()
        this.AssignmentExpression()
    }

    @SubhutiRule
    ObjectLiteral() {
        this.tokenConsumer.LBrace()
        this.Option(() => this.PropertyDefinitionList())
        this.Option(() => this.tokenConsumer.Comma())
        this.tokenConsumer.RBrace()
    }

    @SubhutiRule
    PropertyDefinitionList() {
        this.PropertyDefinition()
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.PropertyDefinition()
        })
    }

    @SubhutiRule
    PropertyDefinition() {
        this.Or([
            //顺序问题MethodDefinition 需要在 IdentifierReference 之上，否则会触发IdentifierReference ，而 不执行MethodDefinition，应该执行最长匹配
            {alt: () => this.MethodDefinition()},
            // ES2018: 对象spread语法 {...obj}
            {
                alt: () => {
                    this.tokenConsumer.Ellipsis()
                    this.AssignmentExpression()
                }
            },
            //顺序前置，优先匹配
            {
                alt: () => {
                    this.PropertyName()
                    this.tokenConsumer.Colon()
                    this.AssignmentExpression()
                }
            },
            {
                alt: () => {
                    this.IdentifierReference()
                }
            },
            {
                alt: () => {
                    this.CoverInitializedName()
                }
            }
        ])
    }

    @SubhutiRule
    PropertyName() {
        this.Or([
            {alt: () => this.LiteralPropertyName()},
            {alt: () => this.ComputedPropertyName()}
        ])
    }

    @SubhutiRule
    LiteralPropertyName() {
        this.Or([
            {alt: () => this.tokenConsumer.Identifier()},
            {alt: () => this.tokenConsumer.StringLiteral()},
            {alt: () => this.tokenConsumer.NumericLiteral()},
            // ES6 允许保留字作为对象属性名
            // 最常用的保留字（按使用频率排序）
            {alt: () => this.tokenConsumer.ClassTok()},
            {alt: () => this.tokenConsumer.FunctionTok()},
            {alt: () => this.tokenConsumer.ReturnTok()},
            {alt: () => this.tokenConsumer.ConstTok()},
            {alt: () => this.tokenConsumer.LetTok()},
            {alt: () => this.tokenConsumer.VarTok()},
            {alt: () => this.tokenConsumer.IfTok()},
            {alt: () => this.tokenConsumer.ElseTok()},
            {alt: () => this.tokenConsumer.ForTok()},
            {alt: () => this.tokenConsumer.WhileTok()},
            {alt: () => this.tokenConsumer.DoTok()},
            {alt: () => this.tokenConsumer.SwitchTok()},
            {alt: () => this.tokenConsumer.CaseTok()},
            {alt: () => this.tokenConsumer.DefaultTok()},
            {alt: () => this.tokenConsumer.BreakTok()},
            {alt: () => this.tokenConsumer.ContinueTok()},
            {alt: () => this.tokenConsumer.TryTok()},
            {alt: () => this.tokenConsumer.CatchTok()},
            {alt: () => this.tokenConsumer.FinallyTok()},
            {alt: () => this.tokenConsumer.ThrowTok()},
            {alt: () => this.tokenConsumer.NewTok()},
            {alt: () => this.tokenConsumer.ThisTok()},
            {alt: () => this.tokenConsumer.ImportTok()},
            {alt: () => this.tokenConsumer.ExportTok()},
            {alt: () => this.tokenConsumer.FromTok()},
            {alt: () => this.tokenConsumer.AsTok()},
            {alt: () => this.tokenConsumer.OfTok()},
            {alt: () => this.tokenConsumer.InTok()},
            {alt: () => this.tokenConsumer.ExtendsTok()},
            {alt: () => this.tokenConsumer.StaticTok()},
            {alt: () => this.tokenConsumer.YieldTok()},
            {alt: () => this.tokenConsumer.SuperTok()},
            {alt: () => this.tokenConsumer.GetTok()},
            {alt: () => this.tokenConsumer.SetTok()},
            {alt: () => this.tokenConsumer.TypeofTok()},
            {alt: () => this.tokenConsumer.VoidTok()},
            {alt: () => this.tokenConsumer.DeleteTok()},
            {alt: () => this.tokenConsumer.WithTok()},
            {alt: () => this.tokenConsumer.InstanceOfTok()},
            {alt: () => this.tokenConsumer.DebuggerTok()},
            {alt: () => this.tokenConsumer.TrueTok()},
            {alt: () => this.tokenConsumer.FalseTok()},
        ])
    }

    @SubhutiRule
    ComputedPropertyName() {
        this.tokenConsumer.LBracket()
        this.AssignmentExpression()
        this.tokenConsumer.RBracket()
    }

    @SubhutiRule
    CoverInitializedName() {
        this.IdentifierReference()
        this.Initializer()
    }

    @SubhutiRule
    TemplateLiteral() {
        this.Or([
            {alt: () => this.tokenConsumer.NoSubstitutionTemplate()},
            {
                alt: () => {
                    this.tokenConsumer.TemplateHead()
                    this.Expression()
                    this.TemplateSpans()
                }
            }
        ])
    }

    @SubhutiRule
    TemplateSpans() {
        this.Or([
            {alt: () => this.tokenConsumer.TemplateTail()},
            {
                alt: () => {
                    this.TemplateMiddleList()
                    this.tokenConsumer.TemplateTail()
                }
            }
        ])
    }

    @SubhutiRule
    TemplateMiddleList() {
        this.tokenConsumer.TemplateMiddle()
        this.Expression()
        this.Many(() => {
            this.tokenConsumer.TemplateMiddle()
            this.Expression()
        })
    }


    @SubhutiRule
    NewMemberExpressionArguments() {
        this.tokenConsumer.NewTok()
        this.MemberExpression()
        this.Arguments()
    }

    @SubhutiRule
    MemberExpression() {
        this.Or([
            {alt: () => this.PrimaryExpression()},
            {alt: () => this.SuperProperty()},
            {alt: () => this.MetaProperty()},
            {
                alt: () => {
                    this.NewMemberExpressionArguments()
                }
            }
        ])
        // 使用 Many 处理多个后缀操作（. IdentifierName, [ Expression ], TemplateLiteral）
        this.Many(() => {
            this.Or([
                {
                    alt: () => {
                        this.DotIdentifier()
                    }
                },
                {
                    alt: () => {
                        this.BracketExpression()
                    }
                },
                {
                    alt: () => {
                        this.TemplateLiteral()
                    }
                }
            ])
        })
    }

    @SubhutiRule
    DotIdentifier() {
        this.tokenConsumer.Dot()
        // IdentifierName: 可以是Identifier或保留字（for、if等）
        this.IdentifierName()
    }

    // Override ES5的DotMemberExpression，支持关键字作为属性名
    @SubhutiRule
    DotMemberExpression() {
        this.tokenConsumer.Dot()
        this.IdentifierName()  // ES6支持关键字作为属性名（如.catch、.then等）
    }

    @SubhutiRule
    IdentifierName() {
        // 成员访问中的属性名可以是保留字
        // ES6规范：IdentifierName包括所有标识符和保留字
        this.Or([
            {alt: () => this.tokenConsumer.Identifier()},
            // 控制流关键字
            {alt: () => this.tokenConsumer.ForTok()},
            {alt: () => this.tokenConsumer.IfTok()},
            {alt: () => this.tokenConsumer.ElseTok()},
            {alt: () => this.tokenConsumer.WhileTok()},
            {alt: () => this.tokenConsumer.DoTok()},
            {alt: () => this.tokenConsumer.SwitchTok()},
            {alt: () => this.tokenConsumer.CaseTok()},
            {alt: () => this.tokenConsumer.BreakTok()},
            {alt: () => this.tokenConsumer.ContinueTok()},
            {alt: () => this.tokenConsumer.ReturnTok()},
            {alt: () => this.tokenConsumer.ThrowTok()},
            {alt: () => this.tokenConsumer.TryTok()},
            {alt: () => this.tokenConsumer.CatchTok()},
            {alt: () => this.tokenConsumer.FinallyTok()},
            // 运算符关键字
            {alt: () => this.tokenConsumer.NewTok()},
            {alt: () => this.tokenConsumer.DeleteTok()},
            {alt: () => this.tokenConsumer.TypeofTok()},
            {alt: () => this.tokenConsumer.VoidTok()},
            {alt: () => this.tokenConsumer.InTok()},
            {alt: () => this.tokenConsumer.InstanceOfTok()},
            {alt: () => this.tokenConsumer.ThisTok()},
            // 声明关键字
            {alt: () => this.tokenConsumer.FunctionTok()},
            {alt: () => this.tokenConsumer.VarTok()},
            {alt: () => this.tokenConsumer.LetTok()},
            {alt: () => this.tokenConsumer.ConstTok()},
            {alt: () => this.tokenConsumer.ClassTok()},
            {alt: () => this.tokenConsumer.ExtendsTok()},
            {alt: () => this.tokenConsumer.StaticTok()},
            // 模块关键字
            {alt: () => this.tokenConsumer.ImportTok()},
            {alt: () => this.tokenConsumer.ExportTok()},
            {alt: () => this.tokenConsumer.DefaultTok()},  // ⭐ 添加DefaultTok
            {alt: () => this.tokenConsumer.FromTok()},
            {alt: () => this.tokenConsumer.AsTok()},
            {alt: () => this.tokenConsumer.OfTok()},
            // 异步/生成器关键字
            {alt: () => this.tokenConsumer.YieldTok()},
            {alt: () => this.tokenConsumer.SuperTok()},
            {alt: () => this.tokenConsumer.AsyncTok()},
            {alt: () => this.tokenConsumer.AwaitTok()},
            // Getter/Setter
            {alt: () => this.tokenConsumer.GetTok()},
            {alt: () => this.tokenConsumer.SetTok()},
            // 值字面量关键字
            {alt: () => this.tokenConsumer.NullLiteral()},
            {alt: () => this.tokenConsumer.TrueTok()},
            {alt: () => this.tokenConsumer.FalseTok()},
        ])
    }

    @SubhutiRule
    BracketExpression() {
        this.tokenConsumer.LBracket()
        this.Expression()
        this.tokenConsumer.RBracket()
    }


    @SubhutiRule
    SuperProperty() {
        this.Or([
            {
                alt: () => {
                    this.tokenConsumer.SuperTok()
                    this.BracketExpression()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.SuperTok()
                    this.tokenConsumer.Dot()
                    this.tokenConsumer.Identifier()
                }
            }
        ])
    }

    @SubhutiRule
    MetaProperty() {
        this.NewTarget()
    }

    @SubhutiRule
    NewTarget() {
        this.tokenConsumer.NewTok()
        this.tokenConsumer.Dot()
        this.tokenConsumer.TargetTok()
    }

    @SubhutiRule
    NewExpression() {
        this.Or([
            {
                alt: () => {
                    this.MemberExpression()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.NewTok()
                    this.NewExpression()
                }
            }
        ])
    }

    @SubhutiRule
    CallExpression() {
        this.Or([
            {
                alt: () => {
                    this.MemberExpression()
                    this.Arguments()
                }
            },
            {
                alt: () => {
                    this.SuperCall()
                }
            }
        ])
        this.Many(() => {
            this.Or([
                {alt: () => this.Arguments()},
                {
                    alt: () => {
                        this.BracketExpression()
                    }
                },
                {
                    alt: () => {
                        this.DotMemberExpression()  // 使用DotMemberExpression支持关键字
                    }
                },
                {alt: () => this.TemplateLiteral()}
            ])
        })
    }


    @SubhutiRule
    SuperCall() {
        this.tokenConsumer.SuperTok()
        this.Arguments()
    }

    @SubhutiRule
    Arguments() {
        this.tokenConsumer.LParen()
        this.Option(() => {
            this.ArgumentList()
        })
        this.tokenConsumer.RParen()
    }

    @SubhutiRule
    ArgumentList() {
        this.Or([
            {alt: () => this.SpreadElement()},
            {alt: () => this.AssignmentExpression()}
        ])
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.Or([
                {alt: () => this.SpreadElement()},
                {alt: () => this.AssignmentExpression()}
            ])
        })
    }

    @SubhutiRule
    LeftHandSideExpression() {
        //需要保证 CallExpression 在前面执行
        this.Or([
            {
                alt: () => {
                    this.CallExpression()
                }
            },
            {
                alt: () => {
                    this.NewExpression()
                }
            }
        ])
    }

    @SubhutiRule
    PostfixExpression() {
        this.LeftHandSideExpression()
        this.Option(() => {
            this.Or([
                {alt: () => this.tokenConsumer.PlusPlus()},
                {alt: () => this.tokenConsumer.MinusMinus()}
            ])
        })
    }

    @SubhutiRule
    UnaryExpression() {
        this.Or([
            {alt: () => this.AwaitExpression()},
            {
                alt: () => {
                    this.PostfixExpression()
                }
            },
            {
                alt: () => {
                    this.Or([
                        {alt: () => this.tokenConsumer.DeleteTok()},
                        {alt: () => this.tokenConsumer.VoidTok()},
                        {alt: () => this.tokenConsumer.TypeofTok()},
                        {alt: () => this.tokenConsumer.PlusPlus()},
                        {alt: () => this.tokenConsumer.MinusMinus()},
                        {alt: () => this.tokenConsumer.Plus()},
                        {alt: () => this.tokenConsumer.Minus()},
                        {alt: () => this.tokenConsumer.Tilde()},
                        {alt: () => this.tokenConsumer.Exclamation()}
                    ])
                    this.UnaryExpression()
                }
            }
        ])
    }

    @SubhutiRule
    MultiplicativeExpression() {
        this.UnaryExpression()
        this.Many(() => {
            this.MultiplicativeOperator()
            this.UnaryExpression()
        })
    }

    @SubhutiRule
    MultiplicativeOperator() {
        this.Or([
            {alt: () => this.tokenConsumer.Asterisk()},
            {alt: () => this.tokenConsumer.Slash()},
            {alt: () => this.tokenConsumer.Percent()}
        ])
    }

    @SubhutiRule
    AdditiveExpression() {
        this.MultiplicativeExpression()
        this.Many(() => {
            this.Or([
                {alt: () => this.tokenConsumer.Plus()},
                {alt: () => this.tokenConsumer.Minus()}
            ])
            this.MultiplicativeExpression()
        })
    }

    @SubhutiRule
    ShiftExpression() {
        this.AdditiveExpression()
        this.Many(() => {
            this.Or([
                {alt: () => this.tokenConsumer.LessLess()},
                {alt: () => this.tokenConsumer.MoreMore()},
                {alt: () => this.tokenConsumer.MoreMoreMore()}
            ])
            this.AdditiveExpression()
        })
    }

    @SubhutiRule
    RelationalExpression() {
        this.ShiftExpression()
        this.Many(() => {
            this.Or([
                {alt: () => this.tokenConsumer.Less()},
                {alt: () => this.tokenConsumer.More()},
                {alt: () => this.tokenConsumer.LessEq()},
                {alt: () => this.tokenConsumer.MoreEq()},
                {alt: () => this.tokenConsumer.InstanceOfTok()},
                {
                    alt: () => {
                        this.tokenConsumer.InTok()
                    }
                }
            ])
            this.ShiftExpression()
        })
    }

    @SubhutiRule
    EqualityExpression() {
        this.RelationalExpression()
        this.Many(() => {
            this.Or([
                {alt: () => this.tokenConsumer.EqEq()},
                {alt: () => this.tokenConsumer.NotEq()},
                {alt: () => this.tokenConsumer.EqEqEq()},
                {alt: () => this.tokenConsumer.NotEqEq()}
            ])
            this.RelationalExpression()
        })
    }

    @SubhutiRule
    BitwiseANDExpression() {
        this.EqualityExpression()
        this.Many(() => {
            this.tokenConsumer.Ampersand()
            this.EqualityExpression()
        })
    }

    @SubhutiRule
    BitwiseXORExpression() {
        this.BitwiseANDExpression()
        this.Many(() => {
            this.tokenConsumer.Circumflex()
            this.BitwiseANDExpression()
        })
    }

    @SubhutiRule
    BitwiseORExpression() {
        this.BitwiseXORExpression()
        this.Many(() => {
            this.tokenConsumer.VerticalBar()
            this.BitwiseXORExpression()
        })
    }

    @SubhutiRule
    LogicalANDExpression() {
        this.BitwiseORExpression()
        this.Many(() => {
            this.tokenConsumer.AmpersandAmpersand()
            this.BitwiseORExpression()
        })
    }

    @SubhutiRule
    LogicalORExpression() {
        this.LogicalANDExpression()
        this.Many(() => {
            this.tokenConsumer.VerticalBarVerticalBar()
            this.LogicalANDExpression()
        })
    }

    @SubhutiRule
    ConditionalExpression() {

        this.LogicalORExpression()

        //这个把orbreak改为了false
        this.Option(() => {
            this.tokenConsumer.Question()
            this.AssignmentExpression()
            this.tokenConsumer.Colon()
            this.AssignmentExpression()
        })
    }


    @SubhutiRule
    AssignmentOperator() {
        this.Or([
            {alt: () => this.tokenConsumer.AsteriskEq()},
            {alt: () => this.tokenConsumer.SlashEq()},
            {alt: () => this.tokenConsumer.PercentEq()},
            {alt: () => this.tokenConsumer.PlusEq()},
            {alt: () => this.tokenConsumer.MinusEq()},
            {alt: () => this.tokenConsumer.LessLessEq()},
            {alt: () => this.tokenConsumer.MoreMoreEq()},
            {alt: () => this.tokenConsumer.MoreMoreMoreEq()},
            {alt: () => this.tokenConsumer.AmpersandEq()},
            {alt: () => this.tokenConsumer.CircumflexEq()},
            {alt: () => this.tokenConsumer.VerticalBarEq()}
        ])
    }

    @SubhutiRule
    Expression() {
        this.AssignmentExpression()
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.AssignmentExpression()
        })
    }

    @SubhutiRule
    Statement() {
        this.Or([
            // {alt: () => this.AssignmentExpression()},
            {alt: () => this.BlockStatement()},
            {alt: () => this.VariableDeclaration()},
            {alt: () => this.EmptyStatement()},
            {alt: () => this.LabelledStatement()},
            {alt: () => this.ExpressionStatement()},
            {alt: () => this.IfStatement()},
            {alt: () => this.BreakableStatement()},
            {alt: () => this.ContinueStatement()},
            {alt: () => this.BreakStatement()},
            {
                alt: () => {

                    this.ReturnStatement()

                }
            },
            {
                alt: () => {
                    this.WithStatement()
                }
            },
            {alt: () => this.ThrowStatement()},
            {alt: () => this.TryStatement()},
            {alt: () => this.DebuggerStatement()}
        ])
    }

    @SubhutiRule
    Declaration() {
        this.Or([
            {alt: () => this.HoistableDeclaration()},
            {alt: () => this.ClassDeclaration()},
            {alt: () => this.VariableDeclaration()}
        ])
    }

    EmptySemicolon() {
        this.Option(() => {
            this.tokenConsumer.Semicolon()
        })
    }


    @SubhutiRule
    VariableLetOrConst() {
        this.Or([
            {alt: () => this.tokenConsumer.VarTok()},
            {alt: () => this.tokenConsumer.LetTok()},
            {alt: () => this.tokenConsumer.ConstTok()}
        ])
    }

    @SubhutiRule
    VariableDeclarationList() {
        this.VariableDeclarator()
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.VariableDeclarator()
        })
    }

    //VariableStatement
    @SubhutiRule
    VariableDeclaration() {
        this.VariableLetOrConst()
        this.VariableDeclarationList()
        this.EmptySemicolon()
    }

    @SubhutiRule
    VariableDeclarator() {
        this.Or([
            {
                alt: () => {
                    this.BindingIdentifier()
                    this.Option(() => this.Initializer())
                }
            },
            {
                alt: () => {
                    this.BindingPattern()
                    // 解构也可以没有初始值（如 let [a, b]）
                    this.Option(() => this.Initializer())
                }
            }
        ])
    }

    @SubhutiRule
    Initializer() {
        this.tokenConsumer.Eq()
        this.AssignmentExpression()
    }


    @SubhutiRule
    AssignmentExpression() {
        this.Or([
            {alt: () => this.YieldExpression()},
            {alt: () => this.ArrowFunction()},
            {
                alt: () => {
                    this.LeftHandSideExpression()
                    this.tokenConsumer.Eq()
                    this.AssignmentExpression()
                }
            },
            {
                alt: () => {
                    this.LeftHandSideExpression()
                    this.AssignmentOperator()
                    this.AssignmentExpression()
                }
            },
            //这个位置调整到赋值表达式之前，会导致失去x=1失去=1的内容，因为有一个成功的就成功匹配了，应该长匹配在前面
            {alt: () => this.ConditionalExpression()},  // ← moved forward
        ])
    }

    @SubhutiRule
    HoistableDeclaration() {
        this.Or([
            {alt: () => this.FunctionDeclaration()},
            {alt: () => this.GeneratorDeclaration()}
        ])
    }

    @SubhutiRule
    BreakableStatement() {
        this.Or([
            {alt: () => this.IterationStatement()},
            {alt: () => this.SwitchStatement()}
        ])
    }

    @SubhutiRule
    BlockStatement() {
        this.Block()
    }

    @SubhutiRule
    Block() {
        this.tokenConsumer.LBrace()
        this.Option(() => this.StatementList())
        this.tokenConsumer.RBrace()
    }


    @SubhutiRule
    BindingPattern() {
        this.Or([
            {alt: () => this.ObjectBindingPattern()},
            {alt: () => this.ArrayBindingPattern()}
        ])
    }

    @SubhutiRule
    ObjectBindingPattern() {
        this.tokenConsumer.LBrace()
        this.Or([
            // 空对象：{}
            {alt: () => this.tokenConsumer.RBrace()},
            // ES2018: 对象rest语法 {a, ...rest}（长规则优先）
            {
                alt: () => {
                    this.BindingPropertyList()
                    this.tokenConsumer.Comma()
                    this.BindingRestElement()
                    this.tokenConsumer.RBrace()
                }
            },
            // 带尾逗号：{a, b, }
            {
                alt: () => {
                    this.BindingPropertyList()
                    this.tokenConsumer.Comma()
                    this.tokenConsumer.RBrace()
                }
            },
            // 基础形式：{a, b}
            {
                alt: () => {
                    this.BindingPropertyList()
                    this.tokenConsumer.RBrace()
                }
            }
        ])
    }

    @SubhutiRule
    ArrayBindingPattern() {
        this.tokenConsumer.LBracket()
        this.Or([
            // 长规则优先：[first, ...rest]
            {
                alt: () => {
                    this.BindingElementList()
                    this.tokenConsumer.Comma()
                    this.Option(() => this.Elision())
                    this.Option(() => this.BindingRestElement())
                    this.tokenConsumer.RBracket()
                }
            },
            // 短规则：[first, second]
            {
                alt: () => {
                    this.BindingElementList()
                    this.tokenConsumer.RBracket()
                }
            },
            // 特殊规则：[] 或 [...all]
            {
                alt: () => {
                    this.Option(() => this.Elision())
                    this.Option(() => this.BindingRestElement())
                    this.tokenConsumer.RBracket()
                }
            }
        ])
    }

    @SubhutiRule
    BindingPropertyList() {
        this.BindingProperty()
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.BindingProperty()
        })
    }

    @SubhutiRule
    BindingElementList() {
        this.BindingElisionElement()
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.BindingElisionElement()
        })
    }

    @SubhutiRule
    BindingElisionElement() {
        this.Option(() => this.Elision())
        this.BindingElement()
    }

    @SubhutiRule
    BindingProperty() {
        this.Or([
            // 长规则优先：{name: userName}
            {
                alt: () => {
                    this.PropertyName()
                    this.tokenConsumer.Colon()
                    this.BindingElement()
                }
            },
            // 短规则回退：{name}
            {alt: () => this.SingleNameBinding()}
        ])
    }

    @SubhutiRule
    BindingElement() {
        this.Or([
            {alt: () => this.SingleNameBinding()},
            {
                alt: () => {
                    this.BindingPattern()
                    this.Option(() => this.Initializer())
                }
            }
        ])
    }

    @SubhutiRule
    SingleNameBinding() {
        this.BindingIdentifier()
        this.Option(() => this.Initializer())
    }

    @SubhutiRule
    BindingRestElement() {
        this.tokenConsumer.Ellipsis()
        this.BindingIdentifier()
    }

    EmptyStatement() {
        // EmptyStatement 必须是一个分号（不能为空）
        // 避免在 Many 循环中无限匹配空语句
        this.tokenConsumer.Semicolon()
    }

    @SubhutiRule
    ExpressionStatement() {
        // TODO: Implement lookahead check
        this.Expression()
        this.EmptySemicolon()
    }

    @SubhutiRule
    IfStatement() {
        this.tokenConsumer.IfTok()
        this.tokenConsumer.LParen()
        this.Expression()
        this.tokenConsumer.RParen()
        this.Statement()
        this.Option(() => {
            this.tokenConsumer.ElseTok()
            this.Statement()
        })
    }

    @SubhutiRule
    IterationStatement() {
        this.Or([
            {alt: () => this.DoWhileStatement()},
            {alt: () => this.WhileStatement()},
            {alt: () => this.ForStatement()},
            {alt: () => this.ForInOfStatement()}
        ])
    }

    @SubhutiRule
    DoWhileStatement() {
        this.tokenConsumer.DoTok()
        this.Statement()
        this.tokenConsumer.WhileTok()
        this.tokenConsumer.LParen()
        this.Expression()
        this.tokenConsumer.RParen()
        this.EmptySemicolon()
    }

    @SubhutiRule
    WhileStatement() {
        this.tokenConsumer.WhileTok()
        this.tokenConsumer.LParen()
        this.Expression()
        this.tokenConsumer.RParen()
        this.Statement()
    }

    @SubhutiRule
    ForStatement() {
        this.tokenConsumer.ForTok()
        this.tokenConsumer.LParen()
        // TODO: Implement lookahead check for 'let ['
        this.Or([
            {
                alt: () => {
                    this.Option(() => this.Expression())
                    this.EmptySemicolon()
                    this.Option(() => this.Expression())
                    this.EmptySemicolon()
                    this.Option(() => this.Expression())
                }
            },
            {
                alt: () => {
                    this.VariableDeclaration()
                    this.EmptySemicolon()
                    this.Option(() => this.Expression())
                    this.EmptySemicolon()
                    this.Option(() => this.Expression())
                }
            }
        ])
        this.tokenConsumer.RParen()
        this.Statement()
    }

    @SubhutiRule
    ForInOfStatement() {
        this.tokenConsumer.ForTok()
        this.tokenConsumer.LParen()
        this.Or([
            {
                alt: () => {
                    // TODO: Implement lookahead check for 'let ['
                    this.LeftHandSideExpression()
                    this.Or([
                        {
                            alt: () => {
                                this.tokenConsumer.InTok()
                                this.Expression()
                            }
                        },
                        {
                            alt: () => {
                                this.tokenConsumer.OfTok()
                                this.AssignmentExpression()
                            }
                        }
                    ])
                }
            },
            {
                alt: () => {
                    this.ForDeclaration()
                    this.Or([
                        {
                            alt: () => {
                                this.tokenConsumer.InTok()
                                this.Expression()
                            }
                        },
                        {
                            alt: () => {
                                this.tokenConsumer.OfTok()
                                this.AssignmentExpression()
                            }
                        }
                    ])
                }
            }
        ])
        this.tokenConsumer.RParen()
        this.Statement()
    }

    @SubhutiRule
    ForDeclaration() {
        this.VariableLetOrConst()
        this.ForBinding()
    }

    @SubhutiRule
    ForBinding() {
        this.Or([
            {alt: () => this.BindingIdentifier()},
            {alt: () => this.BindingPattern()}
        ])
    }

    @SubhutiRule
    ContinueStatement() {
        this.tokenConsumer.ContinueTok()
        this.Option(() => {
            // TODO: Implement [no LineTerminator here] check
            this.LabelIdentifier()
        })
        this.EmptySemicolon()
    }

    @SubhutiRule
    BreakStatement() {
        this.tokenConsumer.BreakTok()
        this.Option(() => {
            // TODO: Implement [no LineTerminator here] check
            this.LabelIdentifier()
        })
        this.EmptySemicolon()
    }

    @SubhutiRule
    ReturnStatement() {
        this.tokenConsumer.ReturnTok()
        this.Option(() => {
            // TODO: Implement [no LineTerminator here] check
            this.Expression()
        })
        this.EmptySemicolon()
    }

    @SubhutiRule
    WithStatement() {
        this.tokenConsumer.WithTok()
        this.tokenConsumer.LParen()
        this.Expression()
        this.tokenConsumer.RParen()
        this.Statement()
    }

    @SubhutiRule
    SwitchStatement() {
        this.tokenConsumer.SwitchTok()
        this.tokenConsumer.LParen()
        this.Expression()
        this.tokenConsumer.RParen()
        this.CaseBlock()
    }

    @SubhutiRule
    CaseBlock() {
        this.tokenConsumer.LBrace()
        this.Option(() => this.CaseClauses())
        this.Option(() => {
            this.DefaultClause()
            this.Option(() => this.CaseClauses())
        })
        this.tokenConsumer.RBrace()
    }

    @SubhutiRule
    CaseClauses() {
        this.Many(() => this.CaseClause())
    }

    @SubhutiRule
    CaseClause() {
        this.tokenConsumer.CaseTok()
        this.Expression()
        this.tokenConsumer.Colon()
        this.Option(() => this.StatementList())
    }

    @SubhutiRule
    DefaultClause() {
        this.tokenConsumer.DefaultTok()
        this.tokenConsumer.Colon()
        this.Option(() => this.StatementList())
    }

    @SubhutiRule
    LabelledStatement() {
        this.LabelIdentifier()
        this.tokenConsumer.Colon()
        this.LabelledItem()
    }

    @SubhutiRule
    LabelledItem() {
        this.Or([
            {alt: () => this.Statement()},
            {alt: () => this.FunctionDeclaration()}
        ])
    }

    @SubhutiRule
    ThrowStatement() {
        this.tokenConsumer.ThrowTok()
        // TODO: Implement [no LineTerminator here] check
        this.Expression()
        this.EmptySemicolon()
    }

    @SubhutiRule
    TryStatement() {
        this.tokenConsumer.TryTok()
        this.Block()
        this.Or([
            {
                alt: () => {
                    this.Catch()
                    this.Option(() => this.Finally())
                }
            },
            {alt: () => this.Finally()}
        ])
    }

    @SubhutiRule
    Catch() {
        this.tokenConsumer.CatchTok()
        this.tokenConsumer.LParen()
        this.CatchParameter()
        this.tokenConsumer.RParen()
        this.Block()
    }

    @SubhutiRule
    Finally() {
        this.tokenConsumer.FinallyTok()
        this.Block()
    }

    @SubhutiRule
    CatchParameter() {
        this.Or([
            {alt: () => this.BindingIdentifier()},
            {alt: () => this.BindingPattern()}
        ])
    }

    @SubhutiRule
    DebuggerStatement() {
        this.tokenConsumer.DebuggerTok()
        this.EmptySemicolon()
    }


    @SubhutiRule
    FunctionDeclaration() {
        this.Option(() => this.tokenConsumer.AsyncTok())
        this.tokenConsumer.FunctionTok()
        this.BindingIdentifier()
        this.FunctionFormalParametersBodyDefine()
    }

    @SubhutiRule
    FunctionExpression() {
        this.Option(() => this.tokenConsumer.AsyncTok())
        this.tokenConsumer.FunctionTok()
        this.Option(() => this.BindingIdentifier())
        this.FunctionFormalParametersBodyDefine()
    }


    @SubhutiRule
    FunctionBodyDefine() {
        this.tokenConsumer.LBrace()
        this.FunctionBody()
        this.tokenConsumer.RBrace()
    }

    @SubhutiRule
    FunctionFormalParameters() {
        this.tokenConsumer.LParen()
        this.Option(() => {
            this.FormalParameterList()
        })
        this.tokenConsumer.RParen()
    }

    @SubhutiRule
    FormalParameterList() {
        this.Or([
            // 情况1: ( ...rest )
            { alt: () => this.RestParameter() },

            // 情况2: ( a, b, c, [ ...rest ] ) 或 ( a, b, c )
            // ✅ 直接使用 BindingElement，避免通过 FormalParameter 中间层
            {
                alt: () => {
                    this.BindingElement()
                    this.Many(() => {
                        this.tokenConsumer.Comma()
                        this.BindingElement()
                    })
                    this.Option(() => {
                        this.tokenConsumer.Comma()
                        this.RestParameter()
                    })
                }
            }
        ])
    }

    @SubhutiRule
    RestParameter() {
        this.tokenConsumer.Ellipsis()
        this.Or([
            { alt: () => this.BindingIdentifier() },
            { alt: () => this.BindingPattern() },
        ])
    }

    @SubhutiRule
    FunctionBody() {
        this.Option(() => this.StatementList())
    }

    @SubhutiRule
    ArrowFunction() {
        this.Option(() => this.tokenConsumer.AsyncTok())

        this.Or([
            // x => body
            {
                alt: () => {
                    this.BindingIdentifier()
                    this.tokenConsumer.Arrow()
                    this.ConciseBody()
                }
            },
            // ( ... ) => body
            {
                alt: () => {
                    this.tokenConsumer.LParen()
                    this.Option(() => this.FormalParameterList())
                    this.tokenConsumer.RParen()
                    this.tokenConsumer.Arrow()
                    this.ConciseBody()
                }
            }
        ])
    }

    @SubhutiRule
    ConciseBody() {
        this.Or([
            // 长规则在前：函数体 { FunctionBody }
            {
                alt: () => {
                    this.FunctionBodyDefine()
                }
            },
            // 短规则在后：表达式（包括对象字面量、普通表达式等）
            {
                alt: () => {
                    this.AssignmentExpression()
                }
            }
        ])
    }

    @SubhutiRule
    PropertyNameMethodDefinition() {
        this.Option(() => this.tokenConsumer.AsyncTok())
        this.PropertyName()
        this.FunctionFormalParametersBodyDefine()
    }

    @SubhutiRule
    GetMethodDefinition() {
        this.tokenConsumer.GetTok()
        this.PropertyName()
        this.tokenConsumer.LParen()
        this.tokenConsumer.RParen()
        this.FunctionBodyDefine()
    }

    @SubhutiRule
    SetMethodDefinition() {
        this.tokenConsumer.SetTok()
        this.PropertyNameMethodDefinition()
    }

    @SubhutiRule
    MethodDefinition() {
        this.Or([
            {
                alt: () => {
                    this.PropertyNameMethodDefinition()
                }
            },
            {
                alt: () => {
                    this.GeneratorMethod()
                }
            },
            {
                alt: () => {
                    this.GetMethodDefinition()
                }
            },
            {
                alt: () => {
                    this.SetMethodDefinition()
                }
            }
        ])
    }

    @SubhutiRule
    GeneratorMethod() {
        this.tokenConsumer.Asterisk()
        this.PropertyName()
        this.FunctionFormalParametersBodyDefine()
    }


    @SubhutiRule
    FunctionFormalParametersBodyDefine() {
        this.FunctionFormalParameters()
        this.FunctionBodyDefine()
    }

    @SubhutiRule
    GeneratorDeclaration() {
        this.tokenConsumer.FunctionTok()
        this.tokenConsumer.Asterisk()
        this.BindingIdentifier()
        this.tokenConsumer.LParen()
        this.Option(() => {
            this.FormalParameterList()
        })
        this.tokenConsumer.RParen()
        this.FunctionBodyDefine()
    }

    @SubhutiRule
    GeneratorExpression() {
        this.tokenConsumer.FunctionTok()
        this.tokenConsumer.Asterisk()
        this.Option(() => this.BindingIdentifier())
        this.tokenConsumer.LParen()
        this.Option(() => {
            this.FormalParameterList()
        })
        this.tokenConsumer.RParen()
        this.FunctionBodyDefine()
    }

    @SubhutiRule
    YieldExpression() {
        this.tokenConsumer.YieldTok()
        this.Option(() => {
            // TODO: Implement [no LineTerminator here] check
            this.Or([
                {alt: () => this.AssignmentExpression()},
                {
                    alt: () => {
                        this.tokenConsumer.Asterisk()
                        this.AssignmentExpression()
                    }
                }
            ])
        })
    }

    @SubhutiRule
    AwaitExpression() {
        this.tokenConsumer.AwaitTok()
        this.UnaryExpression()
    }

    @SubhutiRule
    ClassDeclaration() {
        this.tokenConsumer.ClassTok()
        this.BindingIdentifier()
        this.ClassTail()
    }

    @SubhutiRule
    ClassExpression() {
        this.tokenConsumer.ClassTok()
        this.Option(() => this.BindingIdentifier())
        this.ClassTail()
    }

    @SubhutiRule
    ClassTail() {
        this.Option(() => this.ClassHeritage())
        this.tokenConsumer.LBrace()
        this.Option(() => this.ClassBody())
        this.tokenConsumer.RBrace()
    }

    @SubhutiRule
    ClassHeritage() {
        this.tokenConsumer.ExtendsTok()
        this.LeftHandSideExpression()
    }

    @SubhutiRule
    ClassBody() {
        this.ClassElementList()
    }

    @SubhutiRule
    ClassElementList() {
        this.Many(() => this.ClassElement())
    }

    @SubhutiRule
    ClassElement() {
        this.Or([
            {alt: () => this.MethodDefinition()},
            {
                alt: () => {
                    this.tokenConsumer.StaticTok()
                    this.MethodDefinition()
                }
            },
            {
                alt: () => {
                    this.FieldDefinition()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.StaticTok()
                    this.FieldDefinition()
                }
            },
            {alt: () => this.EmptySemicolon()}
        ])
    }

    @SubhutiRule
    FieldDefinition() {
        this.PropertyName()
        this.Option(() => this.Initializer())
        this.Option(() => this.EmptySemicolon())
    }

    @SubhutiRule
    Program() {
        this.Or([
            {
                alt: () => {
                    this.ModuleItemList()
                }
            },
        ])
        return this.getCurCst()
    }

    @SubhutiRule
    ModuleItemList() {
        this.Many(() => {
            this.Or([
                {alt: () => this.ImportDeclaration()},
                {alt: () => this.ExportDeclaration()},
                {alt: () => this.StatementListItem()},
            ])
        })
    }

    @SubhutiRule
    StatementList() {
        this.Many(() => {
            this.StatementListItem()
        })
    }

    @SubhutiRule
    StatementListItem() {
        this.Or([
            {
                alt: () => {
                    // Declaration必须在前：FunctionDeclaration等特殊规则优先
                    this.Declaration()
                }
            },
            {
                alt: () => {
                    // Statement在后：通用规则作为回退
                    this.Statement()
                }
            }
        ])
    }


    @SubhutiRule
    ImportDeclaration() {
        this.tokenConsumer.ImportTok()
        this.Or([
            {
                alt: () => {
                    this.ImportClause()
                    this.FromClause()
                }
            },
            {
                alt: () => {
                    this.ModuleSpecifier()
                }
            }
        ])
        this.EmptySemicolon()
    }

    @SubhutiRule
    ImportClause() {
        this.Or([
            // ✅ 长规则优先：混合导入必须在单独导入之前
            {
                alt: () => {
                    this.ImportedDefaultBindingCommaNameSpaceImport()
                }
            },
            {
                alt: () => {
                    this.ImportedDefaultBindingCommaNamedImports()
                }
            },
            // 短规则在后：
            {alt: () => this.ImportedDefaultBinding()},
            {alt: () => this.NameSpaceImport()},
            {alt: () => this.NamedImports()},
        ])
    }

    @SubhutiRule
    ImportedDefaultBindingCommaNameSpaceImport() {
        this.ImportedDefaultBinding()
        this.tokenConsumer.Comma()
        this.NameSpaceImport()
    }

    @SubhutiRule
    ImportedDefaultBindingCommaNamedImports() {
        this.ImportedDefaultBinding()
        this.tokenConsumer.Comma()
        this.NamedImports()  // ✅ 修复：改为NamedImports
    }

    @SubhutiRule
    ImportedDefaultBinding() {
        this.ImportedBinding()
    }

    @SubhutiRule
    NameSpaceImport() {
        this.tokenConsumer.Asterisk()
        this.tokenConsumer.AsTok()
        this.ImportedBinding()
    }

    @SubhutiRule
    NamedImports() {
        this.tokenConsumer.LBrace()
        //应该消耗多的在前面，因为不是按顺序匹配的
        this.Or([
            {
                alt: () => {
                    this.ImportsList()
                    this.tokenConsumer.Comma()
                    this.tokenConsumer.RBrace()
                }
            },
            {
                alt: () => {
                    this.ImportsList()
                    this.tokenConsumer.RBrace()
                }
            },
            {
                alt: () => {
                    this.tokenConsumer.RBrace()
                }
            },
        ])
    }

    @SubhutiRule
    FromClause() {
        this.tokenConsumer.FromTok()
        this.ModuleSpecifier()
    }

    @SubhutiRule
    ImportsList() {
        this.ImportSpecifier()
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.ImportSpecifier()
        })
    }

    @SubhutiRule
    ImportSpecifier() {
        this.Or([
            // 长规则优先：import {name as userName}
            {
                alt: () => {
                    this.IdentifierName()
                    this.tokenConsumer.AsTok()
                    this.ImportedBinding()
                }
            },
            // 短规则回退：import {name}
            {alt: () => this.ImportedBinding()}
        ])
    }

    @SubhutiRule
    ModuleSpecifier() {
        this.tokenConsumer.StringLiteral()
    }

    @SubhutiRule
    ImportedBinding() {
        this.BindingIdentifier()
    }

    @SubhutiRule
    AsteriskFromClauseEmptySemicolon() {
        this.tokenConsumer.Asterisk()
        this.FromClause()
        this.EmptySemicolon()
    }

    @SubhutiRule
    ExportClauseFromClauseEmptySemicolon() {
        this.ExportClause()
        this.FromClause()
        this.EmptySemicolon()
    }


    @SubhutiRule
    ExportClauseEmptySemicolon() {
        this.ExportClause()
        this.EmptySemicolon()
    }

    @SubhutiRule
    DefaultTokHoistableDeclarationClassDeclarationAssignmentExpression() {
        this.tokenConsumer.DefaultTok()
        this.Or([
            {alt: () => this.HoistableDeclaration()},
            {alt: () => this.ClassDeclaration()},
            {
                alt: () => {
                    // TODO: Implement lookahead check
                    this.AssignmentExpressionEmptySemicolon()
                }
            }
        ])
    }

    @SubhutiRule
    AssignmentExpressionEmptySemicolon() {
        this.AssignmentExpression()
        this.EmptySemicolon()
    }

    @SubhutiRule
    ExportDeclaration() {
        this.tokenConsumer.ExportTok()
        this.Or([
            {
                alt: () => {
                    this.AsteriskFromClauseEmptySemicolon()
                }
            },
            {
                alt: () => {
                    this.ExportClauseFromClauseEmptySemicolon()
                }
            },
            {
                alt: () => {
                    this.ExportClauseEmptySemicolon()
                }
            },
            {alt: () => this.Declaration()},
            {
                alt: () => {
                    this.DefaultTokHoistableDeclarationClassDeclarationAssignmentExpression()
                }
            }
        ])
    }

    @SubhutiRule
    ExportClause() {
        this.tokenConsumer.LBrace()
        this.Or([
            {alt: () => this.tokenConsumer.RBrace()},
            {
                alt: () => {
                    this.ExportsList()
                    this.tokenConsumer.RBrace()
                }
            },
            {
                alt: () => {
                    this.ExportsList()
                    this.tokenConsumer.Comma()
                    this.tokenConsumer.RBrace()
                }
            }
        ])
    }

    @SubhutiRule
    ExportsList() {
        this.ExportSpecifier()
        this.Many(() => {
            this.tokenConsumer.Comma()
            this.ExportSpecifier()
        })
    }

    @SubhutiRule
    ExportSpecifier() {
        this.IdentifierName()
        this.Option(() => {
            this.tokenConsumer.AsTok()
            this.IdentifierName()
        })
    }

}

