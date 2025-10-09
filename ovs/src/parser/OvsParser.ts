import OvsTokenConsumer from "./OvsConsumer.ts"
import {Subhuti, SubhutiRule} from 'subhuti/src/parser/SubhutiParser.ts'
import OvsVueRenderFactory from "../factory/OvsVueRenderFactory.ts";
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import Es6Parser from "slime-parser/src/language/es2015/Es6Parser.ts";

@Subhuti
export default class OvsParser extends Es6Parser<OvsTokenConsumer> {
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
  OvsRenderDomViewDeclaration() {
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
  OvsRenderDomStatement() {
    this.ovsRenderDomClassDeclaration()
    this.OvsRenderDomViewDeclaration()
  }

  @SubhutiRule
  AssignmentExpression() {
    this.Or([
      {
        alt: () => {
          this.OvsRenderDomViewDeclaration()
        }
      },
      {
        alt: () => {
          this.ConditionalExpression()
        }
      },
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
    } else if (curCst.name === this.OvsRenderDomViewDeclaration.name) {
      curCst = OvsVueRenderFactory.createOvsVueRenderCst(curCst)
    }
    return curCst
  }
}
