import {Subhuti, SubhutiRule, type SubhutiTokenConsumerConstructor} from "subhuti/src/parser/SubhutiParser";
import Es6Parser from "slime-parser/src/language/es2015/Es6Parser";
import ObjectScriptTokenConsumer from "./ObjectScriptTokenConsumer";
import SubhutiMatchToken from "subhuti/src/struct/SubhutiMatchToken";

@Subhuti
export default class ObjectScriptParser<T extends ObjectScriptTokenConsumer> extends Es6Parser<T> {
  constructor(tokens?: SubhutiMatchToken[], TokenConsumerClass: SubhutiTokenConsumerConstructor<T> = ObjectScriptTokenConsumer as any) {
    super(tokens, TokenConsumerClass);
  }

  @SubhutiRule
  ObjectDeclaration() {
    this.tokenConsumer.ObjectToken()
    this.BindingIdentifier()
    this.ObjectTail()
  }

  @SubhutiRule
  ObjectTail() {
    this.Option(() => this.ObjectHeritage())
    this.tokenConsumer.LBrace()
    this.Option(() => this.ObjectBody())
    this.tokenConsumer.RBrace()
  }

  @SubhutiRule
  ObjectBody() {
    this.ObjectElementList()
  }

  @SubhutiRule
  ObjectElementList() {
    this.Many(() => this.ObjectElement())
  }

  @SubhutiRule
  ObjectElement() {
    this.Or([
      {alt: () => this.MethodDefinition()},
      {alt: () => this.EmptySemicolon()}
    ])
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
