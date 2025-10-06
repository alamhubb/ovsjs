import {Subhuti, SubhutiRule} from "subhuti/src/parser/SubhutiParser";
import Es6Parser from "slime-parser/src/language/es2015/Es6Parser";
import ObjectScriptTokenConsumer from "./OvsConsumer";


@Subhuti
export default class ObjectScriptParser extends Es6Parser<ObjectScriptTokenConsumer> {

  @SubhutiRule
  ObjectDeclaration() {
    this.tokenConsumer.ObjectToken()
    this.BindingIdentifier()
    this.ClassTail()
  }

  @SubhutiRule
  ObjectHeritage() {
    this.tokenConsumer.ExtendsTok()
    this.LeftHandSideExpression()
  }


  @SubhutiRule
  Declaration() {
    this.Or([
      {alt: () => this.HoistableDeclaration()},
      {alt: () => this.ClassDeclaration()},
      {alt: () => this.VariableDeclaration()}
    ])
  }
}
