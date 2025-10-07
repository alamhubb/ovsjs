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
  ObjectTail() {
    this.Option(() => this.ObjectHeritage())
    this.tokenConsumer.LBrace()
    this.Option(() => this.ClassBody())
    this.tokenConsumer.RBrace()
  }

  @SubhutiRule
  ObjectHeritage() {
    this.tokenConsumer.ExtendsTok()
    this.BindingIdentifier()
  }

  @SubhutiRule
  Declaration() {
    this.Or([
      {alt: () => this.HoistableDeclaration()},
      {alt: () => this.ClassDeclaration()},
      {alt: () => this.ObjectDeclaration()},
      {alt: () => this.VariableDeclaration()}
    ])
  }
}
