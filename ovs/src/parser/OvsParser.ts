import OvsTokenConsumer, {ovs6Tokens} from "./OvsConsumer.ts"
import {Subhuti, SubhutiRule} from 'subhuti/src/SubhutiParser.ts'
import OvsVueRenderFactory from "../factory/OvsVueRenderFactory.ts";
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import SlimeParser, {ExpressionParams} from "slime-parser/src/language/es2025/SlimeParser.ts";

@Subhuti
export default class OvsParser extends SlimeParser<OvsTokenConsumer> {
    /**
     * 构造函数 - 使用按需词法分析模式
     * @param sourceCode 原始源码
     */
    constructor(sourceCode: string = '') {
        super(sourceCode, {
            tokenConsumer: OvsTokenConsumer,
            tokenDefinitions: ovs6Tokens
        })
    }


    @SubhutiRule
    OvsRenderFunction() {
        // this.Option(() => {
        this.tokenConsumer.IdentifierName()
        // })
        this.Option(() => {
            this.Arguments()
        })
        this.tokenConsumer.LBrace()
        //这里要改一下，支持三种，一种是嵌套的，一种是元素，一种是命名=的
        this.Option(() => {
            this.StatementList()
        })
        this.tokenConsumer.RBrace()
        return this.curCst
    }

    @SubhutiRule
    OvsViewDeclaration() {
        // ovsView + ovsRenderDomClassDeclaration + OvsRenderDomViewDeclaration
        this.tokenConsumer.OvsViewToken()
        this.ovsRenderDomClassDeclaration()  // 复用：Identifier, FunctionFormalParameters?, Colon
        this.OvsRenderFunction()   // 视图内容
    }

    /**
     * ovsView 的类声明部分
     * 格式: ComponentName(params)?:
     */
    @SubhutiRule
    ovsRenderDomClassDeclaration() {
        this.tokenConsumer.IdentifierName()
        this.Option(() => {
            // 使用 ArrowFormalParameters 而不是 FormalParameters
            // 因为 ovsView MyCard(state): div {} 的参数格式类似箭头函数
            this.ArrowFormalParameters()
        })
        this.tokenConsumer.Colon()
    }

    /**
     * @deprecated 此规则未被任何语法调用，是旧代码路径的一部分
     * 保留仅供向后兼容，新代码应使用 OvsCstToSlimeAstUtil 进行转换
     */
    @SubhutiRule
    OvsLexicalBinding() {
        this.BindingIdentifier()
        this.Initializer()
    }

    @SubhutiRule
    NoRenderBlock() {
        // #{ statements } - 不渲染代码块
        this.tokenConsumer.Hash()
        this.tokenConsumer.LBrace()
        this.Option(() => {
            this.StatementList()
        })
        this.tokenConsumer.RBrace()
    }

    /**
     * Statement - 覆盖父类，添加 NoRenderBlock 支持
     * 修复：使用 VariableStatement 而非 VariableDeclaration
     */
    @SubhutiRule
    Statement(params: { Yield?: boolean; Await?: boolean; Return?: boolean } = {}) {
        const {Return = false} = params
        return this.Or([
            { alt: () => this.NoRenderBlock() },        // 新增：#{}块优先
            { alt: () => this.BlockStatement(params) },
            { alt: () => this.VariableStatement(params) },
            { alt: () => this.EmptyStatement() },
            { alt: () => this.ExpressionStatement(params) },
            { alt: () => this.IfStatement(params) },
            { alt: () => this.BreakableStatement(params) },
            { alt: () => this.ContinueStatement(params) },
            { alt: () => this.BreakStatement(params) },
            ...(Return ? [{ alt: () => this.ReturnStatement(params) }] : []),
            { alt: () => this.WithStatement(params) },
            { alt: () => this.LabelledStatement(params) },
            { alt: () => this.ThrowStatement(params) },
            { alt: () => this.TryStatement(params) },
            { alt: () => this.DebuggerStatement() }
        ])
    }

    /**
     * Declaration - 覆盖父类，添加 OvsViewDeclaration 支持
     * 修复：使用 LexicalDeclaration 而非 VariableDeclaration
     */
    @SubhutiRule
    Declaration(params: { Yield?: boolean; Await?: boolean } = {}) {
        return this.Or([
            { alt: () => this.OvsViewDeclaration() },  // 添加 ovsView 组件声明
            { alt: () => this.HoistableDeclaration({ ...params, Default: false }) },
            { alt: () => this.ClassDeclaration({ ...params, Default: false }) },
            { alt: () => this.LexicalDeclaration({ ...params, In: true }) }
        ])
    }

    /**
     * PrimaryExpression - 覆盖父类，添加 OvsRenderFunction 支持
     * OvsRenderFunction 放在 IdentifierReference 之前，因为都以 IdentifierName 开头
     * 依靠 Or 的回溯机制：OvsRenderFunction 失败时会回溯并尝试 IdentifierReference
     */
    @SubhutiRule
    PrimaryExpression(params: ExpressionParams = {}) {
        return this.Or([
            // === 1. 硬关键字表达式（不会被标识符遮蔽）===
            {alt: () => this.tokenConsumer.This()},

            // === 2. async 开头（软关键字，必须在 IdentifierReference 之前）===
            {alt: () => this.AsyncGeneratorExpression()},
            {alt: () => this.AsyncFunctionExpression()},

            // === 3. OvsRenderFunction（OVS 特有语法，放在 IdentifierReference 之前）===
            // 因为 div { } 以 IdentifierName 开头，需要先尝试 OvsRenderFunction
            {alt: () => this.OvsRenderFunction()},

            // === 4. 标识符（在所有软关键字表达式之后）===
            {alt: () => this.IdentifierReference(params)},

            // === 5. 字面量（null/true/false 是硬关键字，数字/字符串有独特首 token）===
            {alt: () => this.Literal()},

            // === 6. function 开头（硬关键字，按特异性排序）===
            {alt: () => this.GeneratorExpression()},
            {alt: () => this.FunctionExpression()},

            // === 7. class 表达式（硬关键字）===
            {alt: () => this.ClassExpression(params)},

            // === 8. 符号开头（各有独特首 token，不会互相遮蔽）===
            {alt: () => this.ArrayLiteral(params)},
            {alt: () => this.ObjectLiteral(params)},
            // RegularExpressionLiteral - 使用 InputElementRegExp 模式消费
            {alt: () => this.consumeRegularExpressionLiteral()},
            {alt: () => this.TemplateLiteral({...params, Tagged: false})},
            {alt: () => this.CoverParenthesizedExpressionAndArrowParameterList(params)}
        ])
    }

    /**
     * AssignmentExpression - 覆盖父类，完整复制 SlimeParser 的实现
     * 注意：OvsRenderFunction 已移到 PrimaryExpression 中，这里不再需要
     */
    @SubhutiRule
    AssignmentExpression(params: { Yield?: boolean; Await?: boolean; In?: boolean } = {}) {
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
            // 条件表达式作为兜底
            {alt: () => this.ConditionalExpression(params)}
        ])
    }

    /**
     * @deprecated 旧的代码生成方法，新代码应使用 OvsCstToSlimeAstUtil + SlimeGenerator
     * 保留仅供向后兼容
     */
    exec(curCst: SubhutiCst = this.getCurCst(), code: string = ''): string {
        if (curCst.name === 'Program') {
            //递归执行这个
            curCst = this.transCst(curCst)
        }
        return super.exec(curCst, code);
    }

    /**
     * @deprecated 旧的 CST 转换方法，新代码应使用 OvsCstToSlimeAstUtil
     * 保留仅供向后兼容
     */
    transCst(curCst: SubhutiCst) {
        if (curCst.children) {
            const children = []
            for (let child of curCst.children) {
                if (child) {
                    child = this.transCst(child)
                    children.push(child)
                }
            }
            curCst.children = children
        }

        //将ovs view转为自执行函数
        if (curCst.name === this.OvsLexicalBinding.name) {
            curCst = OvsVueRenderFactory.createInitializerVueRenderCst(curCst)
        } else if (curCst.name === this.OvsRenderFunction.name) {
            curCst = OvsVueRenderFactory.createOvsVueRenderCst(curCst)
        }
        return curCst
    }
}

