import OvsTokenConsumer from "./OvsConsumer.ts"
import {Subhuti, SubhutiRule} from 'subhuti/src/SubhutiParser.ts'
import OvsVueRenderFactory from "../factory/OvsVueRenderFactory.ts";
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import Es2025Parser from "slime-parser/src/language/es2025/Es2025Parser.ts";

@Subhuti
export default class OvsParser extends Es2025Parser<OvsTokenConsumer> {
  @SubhutiRule
  OvsRenderFunction() {
    // this.Option(() => {
    this.tokenConsumer.Identifier()
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
    const curCst = this.getCurCst()
    return curCst
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
    this.tokenConsumer.Identifier()
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

  @SubhutiRule
  Statement() {
    this.Or([
      { alt: () => this.NoRenderBlock() },        // 新增：#{}块优先
      { alt: () => this.BlockStatement() },
      { alt: () => this.VariableDeclaration() },
      { alt: () => this.NotEmptySemicolon() },
      { alt: () => this.ExpressionStatement() },
      { alt: () => this.IfStatement() },
      { alt: () => this.BreakableStatement() },
      { alt: () => this.ContinueStatement() },
      { alt: () => this.BreakStatement() },
      { alt: () => this.ReturnStatement() },
      { alt: () => this.WithStatement() },
      { alt: () => this.LabelledStatement() },
      { alt: () => this.ThrowStatement() },
      { alt: () => this.TryStatement() },
      { alt: () => this.DebuggerStatement() }
    ])
  }

  @SubhutiRule
  Declaration() {
    this.Or([
      {
        alt: () => {
          this.OvsViewDeclaration()  // 添加 ovsView 组件声明
        }
      },
      {
        alt: () => {
          this.HoistableDeclaration()
        }
      },
      {
        alt: () => {
          this.ClassDeclaration()
        }
      },
      {
        alt: () => {
          this.VariableDeclaration()
        }
      }
    ])
  }

  @SubhutiRule
  AssignmentExpression() {
    this.Or([
      {
        alt: () => {
          this.YieldExpression()
        }
      },
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
      {
        alt: () => {
          this.ConditionalExpression()
        }
      },
      // OvsRenderFunction 移到最后 - 避免与普通函数调用冲突
      // 只有其他所有规则都失败后，才尝试解析为 OVS 特殊语法
      {
        alt: () => {
          this.OvsRenderFunction()
        }
      }
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
