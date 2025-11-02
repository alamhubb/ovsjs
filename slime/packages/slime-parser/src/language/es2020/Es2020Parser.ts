import Es6Parser from "../es2015/Es6Parser.ts"
import Es2020TokenConsumer from "./Es2020Tokens.ts"
import SubhutiMatchToken from "subhuti/src/struct/SubhutiMatchToken.ts"
import {Subhuti, SubhutiRule, type SubhutiTokenConsumerConstructor} from "subhuti/src/parser/SubhutiParser.ts"

/**
 * ES2020 (ES11) Parser
 * 基于 ECMA-262 11th Edition 规范实现
 * 
 * ES2020 新特性：
 * 1. Optional Chaining (?.) - 可选链运算符
 * 2. Nullish Coalescing (??) - 空值合并运算符
 * 3. BigInt - 大整数字面量
 * 4. Dynamic Import - 动态 import()
 * 5. import.meta - 模块元数据
 * 6. export * as ns - 命名空间重导出
 * 7. for await...of - 异步迭代 (ES2018)
 * 8. Optional catch binding - 可选 catch 参数 (ES2019)
 * 9. ** 幂运算符 (ES2016)
 * 10. **= 幂赋值运算符 (ES2016)
 */
@Subhuti
export default class Es2020Parser<T extends Es2020TokenConsumer> extends Es6Parser<T> {
    constructor(
        tokens?: SubhutiMatchToken[], 
        TokenConsumerClass: SubhutiTokenConsumerConstructor<T> = Es2020TokenConsumer as SubhutiTokenConsumerConstructor<T>
    ) {
        super(tokens, TokenConsumerClass);
    }

    // ============================================
    // ES2020: BigInt 字面量
    // 规范 §1.9.3
    // ============================================

    /**
     * Override: Literal
     * 规范 §1.9.3
     * 
     * ES2020 新增：BigIntLiteral
     * 
     * Literal ::
     *     NullLiteral
     *     BooleanLiteral
     *     NumericLiteral
     *     StringLiteral
     *     BigIntLiteral
     */
    @SubhutiRule
    Literal() {
        this.Or([
            {alt: () => this.tokenConsumer.BigIntLiteral()},  // 新增：必须在 NumericLiteral 之前
            {alt: () => this.tokenConsumer.NullLiteral()},
            {alt: () => this.tokenConsumer.TrueTok()},
            {alt: () => this.tokenConsumer.FalseTok()},
            {alt: () => this.tokenConsumer.NumericLiteral()},
            {alt: () => this.tokenConsumer.StringLiteral()}
        ])
    }

    // ============================================
    // ES2016: 幂运算表达式 (Exponentiation)
    // 规范 §2.14
    // ============================================

    /**
     * ExponentiationExpression[Yield, Await] ::
     *     UnaryExpression[?Yield, ?Await]
     *     UpdateExpression[?Yield, ?Await] ** ExponentiationExpression[?Yield, ?Await]
     * 
     * 注意：幂运算是右结合的
     * 例如：2 ** 3 ** 2 解析为 2 ** (3 ** 2) = 512
     */
    @SubhutiRule
    ExponentiationExpression() {
        this.Or([
            // 右结合：UpdateExpression ** ExponentiationExpression
            {
                alt: () => {
                    this.UpdateExpression()
                    this.tokenConsumer.Exponentiation()
                    this.ExponentiationExpression()
                }
            },
            // 基础情况：UnaryExpression
            {
                alt: () => {
                    this.UnaryExpression()
                }
            }
        ])
    }

    /**
     * UpdateExpression[Yield, Await] ::
     *     LeftHandSideExpression[?Yield, ?Await]
     *     LeftHandSideExpression[?Yield, ?Await] [no LineTerminator here] ++
     *     LeftHandSideExpression[?Yield, ?Await] [no LineTerminator here] --
     *     ++ UnaryExpression[?Yield, ?Await]
     *     -- UnaryExpression[?Yield, ?Await]
     * 
     * 实现说明：
     * - 规范的 UpdateExpression 包含前缀和后缀运算符
     * - Es6Parser 的设计将它们分离：
     *   * PostfixExpression：后缀 ++ 和 --
     *   * UnaryExpression：前缀 ++、-- 以及其他一元运算符
     * - 这里的 UpdateExpression 复用 PostfixExpression（仅后缀）
     * - 前缀运算符在 UnaryExpression 中处理（继承自 Es6Parser）
     * 
     * ExponentiationExpression 的两个分支正确处理：
     * - 第一分支：UpdateExpression ** ...（后缀运算符）
     * - 第二分支：UnaryExpression（包含前缀运算符）
     * 
     * 功能验证：✅ 已通过测试（tests/es2020/quick-test-p1-1.js）
     */
    @SubhutiRule
    UpdateExpression() {
        // 复用父类的 PostfixExpression 实现
        this.PostfixExpression()
    }

    /**
     * Override: MultiplicativeExpression
     * 规范 §2.15
     * 
     * ES2020 变化：使用 ExponentiationExpression 而非 UnaryExpression
     * 
     * MultiplicativeExpression[Yield, Await] ::
     *     ExponentiationExpression[?Yield, ?Await]
     *     MultiplicativeExpression[?Yield, ?Await] MultiplicativeOperator ExponentiationExpression[?Yield, ?Await]
     */
    @SubhutiRule
    MultiplicativeExpression() {
        this.ExponentiationExpression()
        this.Many(() => {
            this.MultiplicativeOperator()
            this.ExponentiationExpression()
        })
    }

    // ============================================
    // ES2020: 空值合并运算符 (Nullish Coalescing)
    // 规范 §2.22
    // ============================================

    /**
     * CoalesceExpression[In, Yield, Await] ::
     *     BitwiseORExpression[?In, ?Yield, ?Await]
     *     CoalesceExpression[?In, ?Yield, ?Await] ?? BitwiseORExpression[?In, ?Yield, ?Await]
     * 
     * 无前瞻实现：消除左递归，使用 Many 循环
     * 
     * 等价转换：
     *     BitwiseORExpression ( ?? BitwiseORExpression )*
     * 
     * 注意：
     * - ?? 不能与 && 或 || 直接混用，需要加括号
     * - 左结合：a ?? b ?? c 解析为 (a ?? b) ?? c
     */
    @SubhutiRule
    CoalesceExpression() {
        // 先解析第一个操作数
        this.BitwiseORExpression()
        
        // 然后循环解析 ?? 和后续操作数（左结合）
        this.Many(() => {
            this.tokenConsumer.NullishCoalescing()
            this.BitwiseORExpression()
        })
    }

    /**
     * ShortCircuitExpression[In, Yield, Await] ::
     *     LogicalORExpression[?In, ?Yield, ?Await]
     *     CoalesceExpression[?In, ?Yield, ?Await]
     * 
     * 无前瞻实现：通过 Or 分支顺序 + 回溯解决歧义
     * 
     * 规范约束：?? 不能与 && 或 || 直接混用（需要括号）
     * - 这意味着表达式中要么只有 ??，要么只有 && 或 ||
     * 
     * 分支顺序说明：
     * - LogicalORExpression 优先（使用频率高，减少回溯）
     * - 如果表达式包含 && 或 ||，第一个分支完全匹配
     * - 如果表达式只包含 ??，第一个分支部分匹配，后续解析失败，回溯到 CoalesceExpression
     * 
     * 回溯机制保证正确性：
     * - 对于 `a && b`：LogicalORExpression 完全匹配 ✅
     * - 对于 `a ?? b`：LogicalORExpression 部分匹配 → 回溯 → CoalesceExpression 完全匹配 ✅
     */
    @SubhutiRule
    ShortCircuitExpression() {
        this.Or([
            // 优先尝试 LogicalORExpression（&& 或 ||）
            {alt: () => this.LogicalORExpression()},
            // 回溯后尝试 CoalesceExpression（??）
            {alt: () => this.CoalesceExpression()}
        ])
    }

    /**
     * Override: ConditionalExpression
     * 规范 §2.24
     * 
     * ES2020 变化：使用 ShortCircuitExpression 而非 LogicalORExpression
     * 
     * ConditionalExpression[In, Yield, Await] ::
     *     ShortCircuitExpression[?In, ?Yield, ?Await]
     *     ShortCircuitExpression[?In, ?Yield, ?Await] ? AssignmentExpression[+In, ?Yield, ?Await] : AssignmentExpression[?In, ?Yield, ?Await]
     */
    @SubhutiRule
    ConditionalExpression() {
        this.ShortCircuitExpression()

        this.Option(() => {
            this.tokenConsumer.Question()
            this.AssignmentExpression()
            this.tokenConsumer.Colon()
            this.AssignmentExpression()
        })
    }

    // ============================================
    // ES2020: 可选链 (Optional Chaining)
    // 规范 §2.10
    // ============================================

    /**
     * OptionalChain[Yield, Await] ::
     *     ?. Arguments[?Yield, ?Await]
     *     ?. [ Expression[+In, ?Yield, ?Await] ]
     *     ?. IdentifierName
     *     ?. TemplateLiteral[?Yield, ?Await, +Tagged]
     *     OptionalChain[?Yield, ?Await] Arguments[?Yield, ?Await]
     *     OptionalChain[?Yield, ?Await] [ Expression[+In, ?Yield, ?Await] ]
     *     OptionalChain[?Yield, ?Await] . IdentifierName
     *     OptionalChain[?Yield, ?Await] TemplateLiteral[?Yield, ?Await, +Tagged]
     * 
     * 注意：?. [lookahead ∉ DecimalDigit] 避免与三元运算符混淆
     */
    @SubhutiRule
    OptionalChain() {
        // 首个元素：必须是 ?. 开头
        this.Or([
            // ?. Arguments
            {
                alt: () => {
                    this.tokenConsumer.OptionalChaining()
                    this.Arguments()
                }
            },
            // ?. [ Expression ]
            {
                alt: () => {
                    this.tokenConsumer.OptionalChaining()
                    this.BracketExpression()
                }
            },
            // ?. IdentifierName
            {
                alt: () => {
                    this.tokenConsumer.OptionalChaining()
                    this.IdentifierName()
                }
            },
            // ?. TemplateLiteral
            {
                alt: () => {
                    this.tokenConsumer.OptionalChaining()
                    this.TemplateLiteral()
                }
            }
        ])

        // 后续元素：可以是普通的成员访问/调用（不需要 ?.）
        this.Many(() => {
            this.Or([
                {alt: () => this.Arguments()},
                {alt: () => this.BracketExpression()},
                {
                    alt: () => {
                        this.tokenConsumer.Dot()
                        this.IdentifierName()
                    }
                },
                {alt: () => this.TemplateLiteral()}
            ])
        })
    }

    /**
     * OptionalExpression[Yield, Await] ::
     *     MemberExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]
     *     CallExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]
     *     OptionalExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]
     */
    @SubhutiRule
    OptionalExpression() {
        this.Or([
            {
                alt: () => {
                    this.MemberExpression()
                    this.OptionalChain()
                }
            },
            {
                alt: () => {
                    this.CallExpression()
                    this.OptionalChain()
                }
            }
        ])
        // 递归：OptionalExpression OptionalChain
        this.Many(() => {
            this.OptionalChain()
        })
    }

    /**
     * Override: LeftHandSideExpression
     * 规范 §2.11
     * 
     * ES2020 新增：OptionalExpression 分支
     * 
     * LeftHandSideExpression[Yield, Await] ::
     *     NewExpression[?Yield, ?Await]
     *     CallExpression[?Yield, ?Await]
     *     OptionalExpression[?Yield, ?Await]
     */
    @SubhutiRule
    LeftHandSideExpression() {
        this.Or([
            {alt: () => this.OptionalExpression()},  // 新增：优先尝试可选链
            {alt: () => this.CallExpression()},
            {alt: () => this.NewExpression()}
        ])
    }

    // ============================================
    // ES2020: 动态导入和 import.meta
    // 规范 §2.7, §2.9
    // ============================================

    /**
     * ImportCall[Yield, Await] ::
     *     import ( AssignmentExpression[+In, ?Yield, ?Await] )
     */
    @SubhutiRule
    ImportCall() {
        this.tokenConsumer.ImportTok()
        this.tokenConsumer.LParen()
        this.AssignmentExpression()
        this.tokenConsumer.RParen()
    }

    /**
     * ImportMeta ::
     *     import . meta
     */
    @SubhutiRule
    ImportMeta() {
        this.tokenConsumer.ImportTok()
        this.tokenConsumer.Dot()
        this.tokenConsumer.MetaTok()
    }

    /**
     * Override: MetaProperty
     * 规范 §2.7
     * 
     * ES2020 新增：ImportMeta
     * 
     * MetaProperty ::
     *     NewTarget
     *     ImportMeta
     */
    @SubhutiRule
    MetaProperty() {
        this.Or([
            {alt: () => this.NewTarget()},
            {alt: () => this.ImportMeta()}  // 新增
        ])
    }

    /**
     * Override: CallExpression
     * 规范 §2.9
     * 
     * ES2020 新增：ImportCall 分支
     */
    @SubhutiRule
    CallExpression() {
        this.Or([
            {alt: () => this.ImportCall()},  // 新增：动态 import
            {
                alt: () => {
                    this.MemberExpression()
                    this.Arguments()
                }
            },
            {alt: () => this.SuperCall()}
        ])
        this.Many(() => {
            this.Or([
                {alt: () => this.Arguments()},
                {alt: () => this.BracketExpression()},
                {alt: () => this.DotMemberExpression()},
                {alt: () => this.TemplateLiteral()}
            ])
        })
    }

    // ============================================
    // ES2020: export * as ns
    // 规范 §5.4
    // ============================================

    /**
     * Override: AsteriskFromClauseEmptySemicolon
     * 
     * 支持：export * as ns from './module.js'
     */
    @SubhutiRule
    AsteriskFromClauseEmptySemicolon() {
        this.tokenConsumer.Asterisk()
        // 可选：as IdentifierName
        this.Option(() => {
            this.tokenConsumer.AsTok()
            this.IdentifierName()
        })
        this.FromClause()
        this.EmptySemicolon()
    }

    // ============================================
    // ES2018: for await...of
    // 规范 §3.8
    // ============================================

    /**
     * ForAwaitOfStatement ::
     *     for await ( [lookahead ≠ let] LeftHandSideExpression of AssignmentExpression ) Statement
     *     for await ( var ForBinding of AssignmentExpression ) Statement
     *     for await ( ForDeclaration of AssignmentExpression ) Statement
     * 
     * 无前瞻实现：通过 Or 分支顺序解决 let 歧义
     * 
     * 分支顺序优化（从最具体到最通用）：
     * 1. ForDeclaration（let/const）- 优先匹配
     * 2. var ForBinding - 次优先
     * 3. LeftHandSideExpression - 最后兜底
     * 
     * 歧义处理示例：
     * - `for await (let x of items)` → 第1分支成功（ForDeclaration）
     * - `for await (var x of items)` → 第2分支成功（var）
     * - `for await (let of items)` → 第1分支失败（let 不是关键字），回溯到第3分支成功
     * 
     * 性能优化：
     * - 大多数情况使用 let/const，第1分支直接命中
     * - 减少不必要的回溯
     */
    @SubhutiRule
    ForAwaitOfStatement() {
        this.tokenConsumer.ForTok()
        this.tokenConsumer.AwaitTok()
        this.tokenConsumer.LParen()
        
        this.Or([
            // ✅ 分支 1：ForDeclaration（let/const 声明）
            // 最具体：以 let/const 关键字开头
            {
                alt: () => {
                    this.ForDeclaration()
                    this.tokenConsumer.OfTok()
                    this.AssignmentExpression()
                }
            },
            // ✅ 分支 2：var ForBinding
            // 较具体：以 var 关键字开头
            {
                alt: () => {
                    this.tokenConsumer.VarTok()
                    this.ForBinding()
                    this.tokenConsumer.OfTok()
                    this.AssignmentExpression()
                }
            },
            // ✅ 分支 3：LeftHandSideExpression
            // 最通用：兜底分支，匹配任何表达式（包括 let 作为变量名）
            {
                alt: () => {
                    this.LeftHandSideExpression()
                    this.tokenConsumer.OfTok()
                    this.AssignmentExpression()
                }
            }
        ])
        
        this.tokenConsumer.RParen()
        this.Statement()
    }

    /**
     * Override: IterationStatement
     * 规范 §3.8
     * 
     * ES2018 新增：for await...of
     */
    @SubhutiRule
    IterationStatement() {
        this.Or([
            {alt: () => this.ForAwaitOfStatement()},  // 新增
            {alt: () => this.DoWhileStatement()},
            {alt: () => this.WhileStatement()},
            {alt: () => this.ForStatement()},
            {alt: () => this.ForInOfStatement()}
        ])
    }

    // ============================================
    // ES2019: 可选 catch 绑定
    // 规范 §3.16
    // ============================================

    /**
     * Override: Catch
     * 规范 §3.16
     * 
     * ES2019 变化：CatchParameter 变为可选
     * 
     * Catch[Yield, Await, Return] ::
     *     catch ( CatchParameter[?Yield, ?Await] ) Block[?Yield, ?Await, ?Return]
     *     catch Block[?Yield, ?Await, ?Return]
     */
    @SubhutiRule
    Catch() {
        this.tokenConsumer.CatchTok()
        
        // 可选的参数
        this.Option(() => {
            this.tokenConsumer.LParen()
            this.CatchParameter()
            this.tokenConsumer.RParen()
        })
        
        this.Block()
    }

    // ============================================
    // ES2016: **= 幂赋值运算符
    // 规范 §2.25
    // ============================================

    /**
     * Override: AssignmentOperator
     * 规范 §2.25
     * 
     * ES2016 新增：**=
     * 
     * AssignmentOperator :: one of
     *     *=  /=  %=  +=  -=  <<=  >>=  >>>=  &=  ^=  |=  **=
     */
    @SubhutiRule
    AssignmentOperator() {
        this.Or([
            {alt: () => this.tokenConsumer.ExponentiationAssign()},  // 新增：**=
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
}

