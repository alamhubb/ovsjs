import OvsTokenConsumer, {ovs6Tokens} from "./OvsConsumer.ts"
import {Subhuti, SubhutiRule} from 'subhuti/src/SubhutiParser.ts'
import OvsVueRenderFactory from "../factory/OvsVueRenderFactory.ts";
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import SlimeParser from "slime-parser/src/language/es2025/SlimeParser.ts";

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

    @SubhutiRule
    ovsRenderDomClassDeclaration() {
        this.tokenConsumer.IdentifierName()
        this.Option(() => {
            this.FunctionFormalParameters()
        })
        this.tokenConsumer.Colon()
    }

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
     * AssignmentExpression - 覆盖父类，添加 OvsRenderFunction 支持
     */
    @SubhutiRule
    AssignmentExpression(params: { Yield?: boolean; Await?: boolean; In?: boolean } = {}) {
        return this.Or([
            { alt: () => this.YieldExpression(params) },
            { alt: () => this.ArrowFunction(params) },
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
            { alt: () => this.ConditionalExpression(params) },
            // OvsRenderFunction 移到最后 - 避免与普通函数调用冲突
            { alt: () => this.OvsRenderFunction() }
        ])
    }

    exec(curCst: SubhutiCst = this.getCurCst(), code: string = ''): string {
        if (curCst.name === 'Program') {
            //递归执行这个
            curCst = this.transCst(curCst)
        }
        return super.exec(curCst, code);
    }

    //递归加入到子节点
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

