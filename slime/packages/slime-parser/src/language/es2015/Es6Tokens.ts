import Es5TokenConsumer from "../es5/Es5TokenConsume.ts";
import {Es5TokensName, es5TokensObj} from "../es5/Es5Tokens.ts";
import {
  createEmptyValueRegToken,
  createKeywordToken,
  createRegToken,
  createValueRegToken, SubhutiCreateToken
} from 'subhuti/src/struct/SubhutiCreateToken.ts'

export const Es6TokenName = {
  ...Es5TokensName,
  ImportTok: 'ImportTok',
  AsTok: 'AsTok',
  FromTok: 'FromTok',
  ExportTok: 'ExportTok',
  YieldTok: 'YieldTok',
  AsyncTok: 'AsyncTok',
  AwaitTok: 'AwaitTok',
  SuperTok: 'SuperTok',
  TargetTok: 'TargetTok',
  LetTok: 'LetTok',
  ConstTok: 'ConstTok',
  OfTok: 'OfTok',
  ClassTok: 'ClassTok',
  StaticTok: 'StaticTok',
  ExtendsTok: 'ExtendsTok',
  Arrow: 'ArrowTok',
  Ellipsis: 'EllipsisTok',
  NoSubstitutionTemplate: 'NoSubstitutionTemplateTok',
  TemplateHead: 'TemplateHead',
  TemplateTail: 'TemplateTail',
  TemplateMiddle: 'TemplateMiddle',
}

export const es6TokensObj = {
  ...es5TokensObj,
  ImportTok: createKeywordToken(Es6TokenName.ImportTok, "import"),
  AsTok: createKeywordToken(Es6TokenName.AsTok, "as"),
  FromTok: createKeywordToken(Es6TokenName.FromTok, "from"),
  ExportTok: createKeywordToken(Es6TokenName.ExportTok, "export"),
  YieldTok: createKeywordToken(Es6TokenName.YieldTok, "yield"),
  AsyncTok: createKeywordToken(Es6TokenName.AsyncTok, "async"),
  AwaitTok: createKeywordToken(Es6TokenName.AwaitTok, "await"),
  SuperTok: createKeywordToken(Es6TokenName.SuperTok, "super"),
  TargetTok: createKeywordToken(Es6TokenName.TargetTok, "target"),
  LetTok: createKeywordToken(Es6TokenName.LetTok, "let"),
  ConstTok: createKeywordToken(Es6TokenName.ConstTok, "const"),
  OfTok: createKeywordToken(Es6TokenName.OfTok, "of"),
  ClassTok: createKeywordToken(Es6TokenName.ClassTok, "class"),
  StaticTok: createKeywordToken(Es6TokenName.StaticTok, "static"),
  ExtendsTok: createKeywordToken(Es6TokenName.ExtendsTok, "extends"),

  Arrow: createRegToken(Es6TokenName.Arrow, /=>/),

  Ellipsis: createValueRegToken(Es6TokenName.Ellipsis, /\.\.\./, '...'),
  
  // 模板字符串tokens  
  // TemplateTail和TemplateMiddle改为*（0次或多次），允许紧邻的}和`
  NoSubstitutionTemplate: createEmptyValueRegToken(
    Es6TokenName.NoSubstitutionTemplate, /`(?:[^`\\$]|\\.|\$(?!\{))*`/
  ),
  TemplateHead: createEmptyValueRegToken(Es6TokenName.TemplateHead, /`(?:[^`\\$]|\\.|\$(?!\{))*\$\{/),
  TemplateMiddle: createEmptyValueRegToken(Es6TokenName.TemplateMiddle,  /}(?:[^`\\$]|\\.|\$(?!\{))*\$\{/),
  TemplateTail: createEmptyValueRegToken(Es6TokenName.TemplateTail,  /}(?:[^`\\$]|\\.|\$(?!\{))*`/),
};
export const es6Tokens = Object.values(es6TokensObj);
export const es6TokenMapObj: { [key in string]: SubhutiCreateToken } = Object.fromEntries(
  es6Tokens.map(token => [token.isKeyword ? token.value : token.name, token])
);

//想让他单例，那他就不能有属性。不能有状态。，有状态对象做不了多例
export default class Es6TokenConsumer extends Es5TokenConsumer {
  ImportTok() {
    return this.consume(es6TokensObj.ImportTok);
  }

  AsTok() {
    return this.consume(es6TokensObj.AsTok);
  }

  FromTok() {
    return this.consume(es6TokensObj.FromTok);
  }

  ExportTok() {
    return this.consume(es6TokensObj.ExportTok);
  }

  YieldTok() {
    return this.consume(es6TokensObj.YieldTok);
  }

  AsyncTok() {
    return this.consume(es6TokensObj.AsyncTok);
  }

  AwaitTok() {
    return this.consume(es6TokensObj.AwaitTok);
  }

  SuperTok() {
    return this.consume(es6TokensObj.SuperTok);
  }

  TargetTok() {
    return this.consume(es6TokensObj.TargetTok);
  }

  LetTok() {
    return this.consume(es6TokensObj.LetTok);
  }

  ConstTok() {
    return this.consume(es6TokensObj.ConstTok);
  }

  OfTok() {
    return this.consume(es6TokensObj.OfTok);
  }

  ClassTok() {
    return this.consume(es6TokensObj.ClassTok);
  }

  ExtendsTok() {
    return this.consume(es6TokensObj.ExtendsTok);
  }

  StaticTok() {
    return this.consume(es6TokensObj.StaticTok);
  }

  Arrow() {
    return this.consume(es6TokensObj.Arrow);
  }

  Ellipsis() {
    return this.consume(es6TokensObj.Ellipsis);
  }

  NoSubstitutionTemplate() {
    return this.consume(es6TokensObj.NoSubstitutionTemplate);
  }

  TemplateHead() {
    return this.consume(es6TokensObj.TemplateHead);
  }

  TemplateTail() {
    return this.consume(es6TokensObj.TemplateTail);
  }

  TemplateMiddle() {
    return this.consume(es6TokensObj.TemplateMiddle);
  }
}
