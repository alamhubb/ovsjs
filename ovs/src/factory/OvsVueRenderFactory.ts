import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts."
import { ovsTokenName, ovsTokensObj } from "../parser/OvsConsumer.ts"
import OvsParser, { ovsParserInstance } from "../parser/OvsParser.ts"
import Es6Parser from "slime-parser/src/language/es2015/Es6Parser.ts";

const htmlTag = {
  'div': 'div'
}

export default class OvsVueRenderFactory {
  //没有状态的组件就可以是方法，返回赋值语句
  static createInitializerVueRenderCst(OvsLexicalBinding: SubhutiCst) {
    //走了这里肯定是赋值语句，所以需要给对象加一个 name 属性

    const OvsLexicalDeclaration = new SubhutiCst()
    OvsLexicalDeclaration.name = 'OvsLexicalDeclaration'

    const BindingIdentifier = OvsLexicalBinding.children?.find(item => item.name === OvsParser.prototype.BindingIdentifier.name)
    if (!BindingIdentifier) {
      throw Error('BindingIdentifier syntax error')
    }
    const Identifier = BindingIdentifier.children?.find(item => item.name === OvsParser.prototype.Identifier.name)
    if (!Identifier) {
      throw Error('Identifier syntax error')
    }
    const IdentifierName = Identifier.children?.find(item => item.name === ovsTokenName.Identifier)
    if (!IdentifierName) {
      throw Error('IdentifierName syntax error')
    }

    OvsLexicalDeclaration.children = [
      OvsVueRenderFactory.createConstCst(), ...OvsLexicalBinding.children,
    ]

    const OvsInitializer = new SubhutiCst()
    OvsInitializer.name = 'OvsInitializer'
    OvsInitializer.children = [
      OvsLexicalDeclaration,
      OvsVueRenderFactory.createOvsViewNameCst(Identifier, IdentifierName.value)
    ]
    return OvsInitializer
  }

  //没有状态的组件就可以是方法，返回自执行函数
  static createOvsVueRenderCst(OvsRenderDomViewDeclaration: SubhutiCst): SubhutiCst {
    const OvsChildList = OvsRenderDomViewDeclaration.children?.find(item => item.name === OvsParser.prototype.OvsChildList.name)
    if (!OvsChildList) {
      throw Error('OvsChildList syntax error')
    }

    const ovsChildren = []
    const returnOvsChildrenStatement = []
    for (const OvsChildItem of OvsChildList.children) {
      if (OvsChildItem.children) {
        const OvsInitializer = OvsChildItem.children.find(item => item.name === 'OvsInitializer')
        if (OvsInitializer) {
          const OvsLexicalBinding = OvsInitializer.children.find(item => item.name === 'OvsLexicalDeclaration')
          if (!OvsLexicalBinding) {
            throw Error('OvsLexicalBinding syntax error')
          }
          const BindingIdentifier = OvsLexicalBinding.children?.find(item => item.name === OvsParser.prototype.BindingIdentifier.name)
          if (!BindingIdentifier) {
            throw Error('BindingIdentifier syntax error')
          }
          const Identifier = BindingIdentifier.children?.find(item => item.name === OvsParser.prototype.Identifier.name)
          if (!Identifier) {
            throw Error('Identifier syntax error')
          }
          ovsChildren.push(Identifier)
          returnOvsChildrenStatement.push(OvsChildItem)
          continue
        }
      }
      ovsChildren.push(OvsChildItem)
    }
    OvsChildList.children = ovsChildren


    const componentIdentifier = OvsRenderDomViewDeclaration.children?.find(item => item.name === OvsParser.prototype.Identifier.name)
    const componentIdentifierName = componentIdentifier.children?.find(item => item.name === ovsTokenName.Identifier)
    let component
    if (htmlTag[componentIdentifierName.value]) {
      component = this.createStringCst(componentIdentifierName.value)
    } else {
      component = componentIdentifier
    }

    const IdentifierReference = OvsVueRenderFactory.createIdentifierReferenceCst('OvsAPI')
    const PrimaryExpressionCst = OvsVueRenderFactory.createPrimaryExpressionCst(IdentifierReference)

    const dotCst = OvsVueRenderFactory.createDotCst()
    const IdentifierNameCst = OvsVueRenderFactory.createIdentifierNameCst('createVNode')


    const MemberExpressionCst = OvsVueRenderFactory.createMemberExpressionCst([PrimaryExpressionCst, dotCst, IdentifierNameCst])

    let vueArgs

    /*if (ovsVueRenderAst.props) {
        vueArgs = [component, this.createCommaCst(), ovsVueRenderAst.props, this.createCommaCst(), this.createLBracketCst(), ovsVueRenderAst.OvsChildList, this.createRBracketCst()]
    } else {

    }*/

    //后面要加上一些对象的属性，他的name由他的赋值决定
    vueArgs = [component, this.createCommaCst(), this.createLBracketCst(), OvsChildList, this.createRBracketCst()]

    const CallExpressionCst = OvsVueRenderFactory.createCallExpressionCst(MemberExpressionCst, OvsVueRenderFactory.createArgumentsCst(vueArgs))

    const ovsReturnCst = OvsVueRenderFactory.createOvsReturnStatementCst(CallExpressionCst)

    returnOvsChildrenStatement.push(ovsReturnCst)

    return OvsVueRenderFactory.createOvsVueRenderSelfExecutingFunctionCst(returnOvsChildrenStatement)
  }


  static createCallExpressionCst(MemberExpression: SubhutiCst, Arguments: SubhutiCst) {
    const cst = new SubhutiCst()
    cst.name = Es6Parser.prototype.CallExpression.name
    cst.children = [MemberExpression, Arguments]
    return cst
  }

  static createArgumentsCst(ArgumentListChildren: SubhutiCst[]) {
    const cst = new SubhutiCst()
    cst.name = Es6Parser.prototype.Arguments.name

    const ArgumentListCst = new SubhutiCst()
    ArgumentListCst.name = Es6Parser.prototype.ArgumentList.name
    ArgumentListCst.children = ArgumentListChildren

    cst.children = [OvsVueRenderFactory.createLParenCst(), ArgumentListCst, OvsVueRenderFactory.createRParenCst()]
    return cst
  }

  static createMemberExpressionCst(children: SubhutiCst[]) {
    const cst = new SubhutiCst()
    cst.name = Es6Parser.prototype.MemberExpression.name
    cst.children = children
    return cst
  }

  static createPrimaryExpressionCst(child: SubhutiCst) {
    const cst = new SubhutiCst()
    cst.name = Es6Parser.prototype.PrimaryExpression.name
    cst.children = [child]
    return cst
  }

  static createIdentifierReferenceCst(IdentifierName: string) {
    const cst = new SubhutiCst()
    cst.name = Es6Parser.prototype.IdentifierReference.name
    cst.children = [this.createIdentifierCst(IdentifierName)]
    return cst
  }

  static createIdentifierCst(IdentifierName: string) {
    const cst = new SubhutiCst()
    cst.name = Es6Parser.prototype.tokenConsumer.Identifier.name
    cst.children = [this.createIdentifierNameCst(IdentifierName)]
    return cst
  }

  static createIdentifierNameCst(IdentifierName: string) {
    const cst = new SubhutiCst()
    cst.name = ovsTokenName.Identifier
    cst.value = IdentifierName
    return cst
  }

  static createStringCst(IdentifierName: string) {
    const cst = new SubhutiCst()
    cst.name = ovsTokenName.StringLiteral
    cst.value = '"' + IdentifierName + '"'
    return cst
  }


  static createLParenCst() {
    const cst = new SubhutiCst()
    cst.name = ovsTokenName.LParen
    cst.value = ovsTokensObj.LParen.value
    return cst
  }

  static createRParenCst() {
    const cst = new SubhutiCst()
    cst.name = ovsTokenName.RParen
    cst.value = ovsTokensObj.RParen.value
    return cst
  }

  static createCommaCst() {
    const cst = new SubhutiCst()
    cst.name = ovsTokenName.Comma
    cst.value = ovsTokensObj.Comma.value
    return cst
  }

  static createColonCst() {
    const cst = new SubhutiCst()
    cst.name = ovsTokenName.Colon
    cst.value = ovsTokensObj.Colon.value
    return cst
  }

  static createLBracketCst() {
    const cst = new SubhutiCst()
    cst.name = ovsTokenName.LBracket
    cst.value = ovsTokensObj.LBracket.value
    return cst
  }

  static createRBracketCst() {
    const cst = new SubhutiCst()
    cst.name = ovsTokenName.RBracket
    cst.value = ovsTokensObj.RBracket.value
    return cst
  }

  static createLBraceCst() {
    const cst = new SubhutiCst()
    cst.name = ovsTokenName.LBrace
    cst.value = ovsTokensObj.LBrace.value
    return cst
  }

  static createRBraceCst() {
    const cst = new SubhutiCst()
    cst.name = ovsTokenName.RBrace
    cst.value = ovsTokensObj.RBrace.value
    return cst
  }

  static createDotCst() {
    const cst = new SubhutiCst()
    cst.name = ovsTokenName.Dot
    cst.value = ovsTokensObj.Dot.value
    return cst
  }


  static createConstCst() {
    const cst = new SubhutiCst()
    cst.name = ovsTokenName.ConstTok
    cst.value = ovsTokensObj.ConstTok.value
    return cst
  }

  //都可以使用常量
  static createEqCst() {
    const cst = new SubhutiCst()
    cst.name = ovsTokenName.Eq
    cst.value = ovsTokensObj.Eq.value
    return cst
  }

  static createReturnTokCst() {
    const cst = new SubhutiCst()
    cst.name = ovsTokenName.ReturnTok
    cst.value = ovsTokensObj.ReturnTok.value
    return cst
  }

  static createSemicolonCst() {
    const cst = new SubhutiCst()
    cst.name = ovsTokenName.Semicolon
    cst.value = ovsTokensObj.Semicolon.value
    return cst
  }



  static createOvsReturnStatementCst(returnCst: SubhutiCst) {
    const cst = new SubhutiCst()
    cst.name = 'OvsReturnStatement'
    cst.children = [OvsVueRenderFactory.createReturnTokCst(), returnCst]
    return cst
  }

  //都可以使用常量
  static createOvsViewNameCst(Identifier: SubhutiCst, name: string) {
    const cst = new SubhutiCst()
    cst.name = 'OvsViewName'
    cst.children = [
      Identifier,
      OvsVueRenderFactory.createLBracketCst(),
      OvsVueRenderFactory.createStringCst("slotName"),
      OvsVueRenderFactory.createRBracketCst(),
      OvsVueRenderFactory.createEqCst(),
      OvsVueRenderFactory.createStringCst(name),
      OvsVueRenderFactory.createSemicolonCst()
    ]
    return cst
  }


  static createOvsVueRenderSelfExecutingFunctionCst(ovsChildren: SubhutiCst[]) {
    const ovsRenderLeftCst = new SubhutiCst({
      name: 'ovsRenderLeftCst',
      value: '(function (){',
    })
    const ovsRenderRightCst = new SubhutiCst({
      name: 'ovsRenderRight',
      value: '})();',
    })

    const OvsVueRenderSelfExecutingFunction = new SubhutiCst()
    OvsVueRenderSelfExecutingFunction.name = 'OvsVueRenderSelfExecutingFunction'
    OvsVueRenderSelfExecutingFunction.children = [ovsRenderLeftCst, ...ovsChildren, ovsRenderRightCst]
    return OvsVueRenderSelfExecutingFunction
  }
}
