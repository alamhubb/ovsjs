import OvsTokenConsumer, {ovs6Tokens} from "./OvsConsumer.ts"
import {Subhuti, SubhutiRule} from 'subhuti/src/SubhutiParser.ts'
import SlimeParser, {ExpressionParams, StatementParams, DeclarationParams} from "slime-parser/src/language/es2025/SlimeParser.ts";

/** OVS 扩展的表达式参数 */
interface OvsExpressionParams extends ExpressionParams {
    /** 禁用 OvsRenderFunction（用于 ClassHeritage 等上下文） */
    DisableOvsRender?: boolean
}

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


    /**
     * OvsRenderFunction - OVS 视图渲染函数
     * 语法: IdentifierReference Arguments? { StatementList? }
     *
     * 采用和普通方法调用一样的策略：
     * - 使用 IdentifierReference 并正确传递 params
     * - 在 async 上下文中，await 是关键字，不会被匹配为标签名
     * - 在非 async 上下文中，await 可以作为标识符（虽然不常见）
     */
    @SubhutiRule
    OvsRenderFunction(params: OvsExpressionParams = {}) {
        // 使用 IdentifierReference 并传递 params，和普通方法调用一样
        this.IdentifierReference(params)
        this.Option(() => {
            // ✅ 修复：传递 params
            // 根据 ES 规范 Arguments[?Yield, ?Await]，需要传递 Yield/Await 参数
            // 这样在 async 上下文中参数里可以使用 await
            this.Arguments(params)
        })
        this.tokenConsumer.LBrace()
        this.Option(() => {
            // ✅ 正确：传递 params
            // OvsRenderFunction 的 body 类似于 FunctionBody，需要传递 Yield/Await 参数
            // 这样在 async 组件中可以使用 await，在 generator 组件中可以使用 yield
            this.StatementList(params)
        })
        this.tokenConsumer.RBrace()
        return this.curCst
    }

    /**
     * ClassHeritage - 覆盖父类，禁用 OvsRenderFunction
     *
     * 在 `class A extends B {}` 中，`B {}` 不应该被解析为 OvsRenderFunction。
     * 通过传递 DisableOvsRender: true 参数来禁用。
     */
    @SubhutiRule
    ClassHeritage(params: OvsExpressionParams = {}): any {
        this.tokenConsumer.Extends()
        return this.LeftHandSideExpression({...params, DisableOvsRender: true} as any)
    }

    /**
     * OvsViewDeclaration - OVS 视图声明
     * 语法: ovsView Identifier (params)? : OvsRenderFunction
     *
     * ✅ 硬编码无参数是正确的：
     * 根据 ES 规范，顶层声明（如 FunctionDeclaration）不接收 Yield/Await 参数，
     * 而是在内部硬编码。例如：
     * - FunctionDeclaration 内部使用 FunctionBody[~Yield, ~Await]
     * - AsyncFunctionDeclaration 内部使用 AsyncFunctionBody (即 FunctionBody[~Yield, +Await])
     *
     * OvsViewDeclaration 作为顶层声明，其内部的 OvsRenderFunction 应该有自己的默认上下文。
     * 目前默认 {Yield: false, Await: false}，类似普通函数。
     * 如果需要 async 组件，可以考虑添加 async ovsView 语法。
     */
    @SubhutiRule
    OvsViewDeclaration() {
        // ovsView + ovsRenderDomClassDeclaration + OvsRenderDomViewDeclaration
        this.tokenConsumer.OvsViewToken()
        this.OvsRenderDomClassDeclaration()  // 复用：Identifier, FunctionFormalParameters?, Colon
        // ✅ 硬编码 {Yield: false, Await: false} 是正确的
        // OvsViewDeclaration 类似 FunctionDeclaration，内部默认不在 async/generator 上下文中
        this.OvsRenderFunction({Yield: false, Await: false})
    }

    /**
     * ovsView 的类声明部分
     * 格式: ComponentName(params)?:
     *
     * ✅ ArrowFormalParameters() 无参数是正确的：
     * 根据 ES 规范 ArrowFormalParameters[Yield, Await]，参数列表的上下文由外层决定。
     * OvsViewDeclaration 类似普通函数声明，其参数列表不在 async/generator 上下文中。
     * 参考：FunctionDeclaration 使用 FormalParameters[~Yield, ~Await]
     */
    @SubhutiRule
    OvsRenderDomClassDeclaration() {
        this.tokenConsumer.IdentifierName()
        this.Option(() => {
            // 使用 ArrowFormalParameters 而不是 FormalParameters
            // 因为 ovsView MyCard(state): div {} 的参数格式类似箭头函数
            // ✅ 硬编码 {Yield: false, Await: false} 是正确的
            // 类似 FunctionDeclaration 的 FormalParameters[~Yield, ~Await]
            this.ArrowFormalParameters({Yield: false, Await: false})
        })
        this.tokenConsumer.Colon()
    }

    /**
     * NoRenderBlock - 不渲染代码块
     * 语法: #{ StatementList? }
     *
     * ⚠️ 需要修复：NoRenderBlock 应该接收并传递 params
     * NoRenderBlock 可以出现在任何 Statement 位置，需要继承外层的 Yield/Await 上下文。
     * 例如在 async 函数中的 #{ await something } 需要正确解析 await。
     */
    @SubhutiRule
    NoRenderBlock(params: StatementParams = {}) {
        // #{ statements } - 不渲染代码块
        this.tokenConsumer.Hash()
        this.tokenConsumer.LBrace()
        this.Option(() => {
            // ✅ 正确：传递 params，继承外层的 Yield/Await/Return 上下文
            this.StatementList(params)
        })
        this.tokenConsumer.RBrace()
    }

    /**
     * Statement - 覆盖父类，添加 NoRenderBlock 支持
     *
     * 参数传递说明：
     * - NoRenderBlock(params): ✅ 传递 params，继承 Yield/Await/Return 上下文
     * - EmptyStatement(): ✅ 无参数是正确的，空语句不需要上下文
     * - DebuggerStatement(): ✅ 无参数是正确的，debugger 语句不需要上下文
     */
    @SubhutiRule
    Statement(params: StatementParams = {}) {
        const {Return = false} = params
        return this.Or([
            { alt: () => this.NoRenderBlock(params) },  // ✅ 修复：传递 params
            { alt: () => this.BlockStatement(params) },
            { alt: () => this.VariableStatement(params) },
            { alt: () => this.EmptyStatement() },       // ✅ 正确：EmptyStatement 不需要参数
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
            { alt: () => this.DebuggerStatement() }     // ✅ 正确：DebuggerStatement 不需要参数
        ])
    }

    /**
     * Declaration - 覆盖父类，添加 OvsViewDeclaration 支持
     */
    @SubhutiRule
    Declaration(params: DeclarationParams = {}) {
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
     *
     * 注意：当 DisableOvsRender 为 true 时，跳过 OvsRenderFunction 分支。
     * 这用于 ClassHeritage 等上下文，避免 `class A extends B {}` 中的 `B {}` 被误解析。
     */
    @SubhutiRule
    PrimaryExpression(params: OvsExpressionParams = {}) {
        const { DisableOvsRender = false } = params

        return this.Or([
            // === 1. 硬关键字表达式（不会被标识符遮蔽）===
            {alt: () => this.tokenConsumer.This()},

            // === 2. async 开头（软关键字，必须在 IdentifierReference 之前）===
            {alt: () => this.AsyncGeneratorExpression()},
            {alt: () => this.AsyncFunctionExpression()},

            // === 3. OvsRenderFunction（OVS 特有语法，放在 IdentifierReference 之前）===
            // 因为 div { } 以 IdentifierName 开头，需要先尝试 OvsRenderFunction
            // 当 DisableOvsRender 为 true 时跳过此分支
            // 传递 params 确保 await/yield 在正确的上下文中被处理
            ...(!DisableOvsRender ? [{alt: () => this.OvsRenderFunction(params)}] : []),

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

}

