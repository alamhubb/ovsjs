import { SlimeAssignmentOperatorTokenTypes, SlimeBinaryOperatorTokenTypes, SlimeLogicalOperatorTokenTypes, SlimeTokenType, SlimeUnaryOperatorTokenTypes, SlimeUpdateOperatorTokenTypes } from "slime-token/src/SlimeTokenType.ts";
import * as ESTree from "estree";
import { SubhutiSourceLocation } from "subhuti/src/struct/SubhutiCst.ts";

//#region src/SlimeNodeType.d.ts

/**
 * SlimeNodeType - AST 节点类型常量
 *
 * 与 ESTree 规范的 type 字符串完全一致
 * 使用 as const 确保类型是字面量类型
 */
declare const SlimeNodeType: {
  readonly Program: "Program";
  readonly Identifier: "Identifier";
  readonly PrivateIdentifier: "PrivateIdentifier";
  readonly Literal: "Literal";
  readonly NullLiteral: "NullLiteral";
  readonly StringLiteral: "StringLiteral";
  readonly NumericLiteral: "NumericLiteral";
  readonly BooleanLiteral: "BooleanLiteral";
  readonly ExpressionStatement: "ExpressionStatement";
  readonly BlockStatement: "BlockStatement";
  readonly StaticBlock: "StaticBlock";
  readonly EmptyStatement: "EmptyStatement";
  readonly DebuggerStatement: "DebuggerStatement";
  readonly ReturnStatement: "ReturnStatement";
  readonly BreakStatement: "BreakStatement";
  readonly ContinueStatement: "ContinueStatement";
  readonly LabeledStatement: "LabeledStatement";
  readonly WithStatement: "WithStatement";
  readonly IfStatement: "IfStatement";
  readonly SwitchStatement: "SwitchStatement";
  readonly SwitchCase: "SwitchCase";
  readonly ThrowStatement: "ThrowStatement";
  readonly TryStatement: "TryStatement";
  readonly CatchClause: "CatchClause";
  readonly WhileStatement: "WhileStatement";
  readonly DoWhileStatement: "DoWhileStatement";
  readonly ForStatement: "ForStatement";
  readonly ForInStatement: "ForInStatement";
  readonly ForOfStatement: "ForOfStatement";
  readonly FunctionDeclaration: "FunctionDeclaration";
  readonly VariableDeclaration: "VariableDeclaration";
  readonly VariableDeclarator: "VariableDeclarator";
  readonly ClassDeclaration: "ClassDeclaration";
  readonly ThisExpression: "ThisExpression";
  readonly ArrayExpression: "ArrayExpression";
  readonly ObjectExpression: "ObjectExpression";
  readonly Property: "Property";
  readonly FunctionExpression: "FunctionExpression";
  readonly ArrowFunctionExpression: "ArrowFunctionExpression";
  readonly ClassExpression: "ClassExpression";
  readonly UnaryExpression: "UnaryExpression";
  readonly UpdateExpression: "UpdateExpression";
  readonly BinaryExpression: "BinaryExpression";
  readonly AssignmentExpression: "AssignmentExpression";
  readonly LogicalExpression: "LogicalExpression";
  readonly MemberExpression: "MemberExpression";
  readonly ConditionalExpression: "ConditionalExpression";
  readonly CallExpression: "CallExpression";
  readonly NewExpression: "NewExpression";
  readonly SequenceExpression: "SequenceExpression";
  readonly TemplateLiteral: "TemplateLiteral";
  readonly TaggedTemplateExpression: "TaggedTemplateExpression";
  readonly TemplateElement: "TemplateElement";
  readonly SpreadElement: "SpreadElement";
  readonly YieldExpression: "YieldExpression";
  readonly AwaitExpression: "AwaitExpression";
  readonly ImportExpression: "ImportExpression";
  readonly ChainExpression: "ChainExpression";
  readonly MetaProperty: "MetaProperty";
  readonly Super: "Super";
  readonly ParenthesizedExpression: "ParenthesizedExpression";
  readonly OptionalCallExpression: "OptionalCallExpression";
  readonly OptionalMemberExpression: "OptionalMemberExpression";
  readonly ObjectPattern: "ObjectPattern";
  readonly ArrayPattern: "ArrayPattern";
  readonly RestElement: "RestElement";
  readonly AssignmentPattern: "AssignmentPattern";
  readonly ClassBody: "ClassBody";
  readonly MethodDefinition: "MethodDefinition";
  readonly PropertyDefinition: "PropertyDefinition";
  readonly ImportDeclaration: "ImportDeclaration";
  readonly ImportSpecifier: "ImportSpecifier";
  readonly ImportDefaultSpecifier: "ImportDefaultSpecifier";
  readonly ImportNamespaceSpecifier: "ImportNamespaceSpecifier";
  readonly ExportNamedDeclaration: "ExportNamedDeclaration";
  readonly ExportSpecifier: "ExportSpecifier";
  readonly ExportDefaultDeclaration: "ExportDefaultDeclaration";
  readonly ExportAllDeclaration: "ExportAllDeclaration";
};
//#endregion
//#region src/SlimeESTree.d.ts
/**
 * 辅助类型：排除 ESTree 类型中与 Slime 冲突的属性
 * - loc: 使用 SubhutiSourceLocation 替代 SourceLocation
 * - leadingComments/trailingComments: 使用 SlimeComment[] 替代 Comment[]
 * - K: 可选的额外排除属性
 */
type SlimeExtends<T, K extends keyof any = never> = Omit<T, 'loc' | 'leadingComments' | 'trailingComments' | K>;
interface SlimeBaseNodeWithoutComments extends SlimeExtends<ESTree.BaseNodeWithoutComments> {
  type: string;
  loc?: SubhutiSourceLocation | null | undefined;
  range?: [number, number] | undefined;
}
interface SlimeBaseNode extends SlimeBaseNodeWithoutComments, SlimeExtends<ESTree.BaseNode> {
  leadingComments?: SlimeComment[] | undefined;
  trailingComments?: SlimeComment[] | undefined;
}
/**
 * Token 节点基础类型
 * 所有 token 节点都继承此类型，包含 value 和位置信息
 */
interface SlimeTokenNode extends SlimeBaseNodeWithoutComments {
  /** Token 原始值 */
  value: string;
}
interface SlimeVarToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Var;
  value: "var";
}
interface SlimeLetToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Let;
  value: "let";
}
interface SlimeConstToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Const;
  value: "const";
}
/** 变量声明关键字 Token 联合类型 */
type SlimeVariableDeclarationKindToken = SlimeVarToken | SlimeLetToken | SlimeConstToken;
interface SlimeAssignToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Assign;
  value: "=";
}
interface SlimeSemicolonToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Semicolon;
  value: ";";
}
interface SlimeLBraceToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.LBrace;
  value: "{";
}
interface SlimeRBraceToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.RBrace;
  value: "}";
}
interface SlimeLBracketToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.LBracket;
  value: "[";
}
interface SlimeRBracketToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.RBracket;
  value: "]";
}
interface SlimeLParenToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.LParen;
  value: "(";
}
interface SlimeRParenToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.RParen;
  value: ")";
}
interface SlimeCommaToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Comma;
  value: ",";
}
interface SlimeColonToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Colon;
  value: ":";
}
/** 包含大括号的节点 { } */
interface SlimeBraceTokens {
  lBraceToken?: SlimeLBraceToken;
  rBraceToken?: SlimeRBraceToken;
}
/** 包含中括号的节点 [ ] */
interface SlimeBracketTokens {
  lBracketToken?: SlimeLBracketToken;
  rBracketToken?: SlimeRBracketToken;
}
/** 包含小括号的节点 ( ) */
interface SlimeParenTokens {
  lParenToken?: SlimeLParenToken;
  rParenToken?: SlimeRParenToken;
}
/** 函数结构：小括号 + 大括号 */
interface SlimeFunctionTokens extends SlimeParenTokens, SlimeBraceTokens {}
/** 包含冒号的节点 */
interface SlimeColonTokens {
  colonToken?: SlimeColonToken;
}
/** 包含分号的节点 */
interface SlimeSemicolonTokens {
  semicolonToken?: SlimeSemicolonToken;
}
interface SlimeFunctionToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Function;
  value: "function";
}
interface SlimeAsyncToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Async;
  value: "async";
}
interface SlimeAsteriskToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Asterisk;
  value: "*";
}
interface SlimeArrowToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Arrow;
  value: "=>";
}
interface SlimeIfToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.If;
  value: "if";
}
interface SlimeElseToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Else;
  value: "else";
}
interface SlimeForToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.For;
  value: "for";
}
interface SlimeWhileToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.While;
  value: "while";
}
interface SlimeDoToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Do;
  value: "do";
}
interface SlimeInToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.In;
  value: "in";
}
interface SlimeOfToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Of;
  value: "of";
}
interface SlimeSwitchToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Switch;
  value: "switch";
}
interface SlimeCaseToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Case;
  value: "case";
}
interface SlimeDefaultToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Default;
  value: "default";
}
interface SlimeBreakToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Break;
  value: "break";
}
interface SlimeContinueToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Continue;
  value: "continue";
}
interface SlimeReturnToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Return;
  value: "return";
}
interface SlimeThrowToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Throw;
  value: "throw";
}
interface SlimeTryToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Try;
  value: "try";
}
interface SlimeCatchToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Catch;
  value: "catch";
}
interface SlimeFinallyToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Finally;
  value: "finally";
}
interface SlimeWithToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.With;
  value: "with";
}
interface SlimeDebuggerToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Debugger;
  value: "debugger";
}
interface SlimeAwaitToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Await;
  value: "await";
}
interface SlimeYieldToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Yield;
  value: "yield";
}
interface SlimeClassToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Class;
  value: "class";
}
interface SlimeExtendsToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Extends;
  value: "extends";
}
interface SlimeStaticToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Static;
  value: "static";
}
interface SlimeGetToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Get;
  value: "get";
}
interface SlimeSetToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Set;
  value: "set";
}
interface SlimeNewToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.New;
  value: "new";
}
interface SlimeTypeofToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Typeof;
  value: "typeof";
}
interface SlimeVoidToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Void;
  value: "void";
}
interface SlimeDeleteToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Delete;
  value: "delete";
}
interface SlimeInstanceofToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Instanceof;
  value: "instanceof";
}
interface SlimeImportToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Import;
  value: "import";
}
interface SlimeExportToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Export;
  value: "export";
}
interface SlimeFromToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.From;
  value: "from";
}
interface SlimeAsToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.As;
  value: "as";
}
interface SlimeEllipsisToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Ellipsis;
  value: "...";
}
interface SlimeDotToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Dot;
  value: ".";
}
interface SlimeOptionalChainingToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.OptionalChaining;
  value: "?.";
}
interface SlimeQuestionToken extends SlimeTokenNode {
  type: typeof SlimeTokenType.Question;
  value: "?";
}
/** 二元运算符 Token */
interface SlimeBinaryOperatorToken extends SlimeTokenNode {
  type: typeof SlimeBinaryOperatorTokenTypes[keyof typeof SlimeBinaryOperatorTokenTypes];
  value: SlimeBinaryOperator;
}
/** 一元运算符 Token */
interface SlimeUnaryOperatorToken extends SlimeTokenNode {
  type: typeof SlimeUnaryOperatorTokenTypes[keyof typeof SlimeUnaryOperatorTokenTypes];
  value: SlimeUnaryOperator;
}
/** 逻辑运算符 Token */
interface SlimeLogicalOperatorToken extends SlimeTokenNode {
  type: typeof SlimeLogicalOperatorTokenTypes[keyof typeof SlimeLogicalOperatorTokenTypes];
  value: SlimeLogicalOperator;
}
/** 赋值运算符 Token */
interface SlimeAssignmentOperatorToken extends SlimeTokenNode {
  type: typeof SlimeAssignmentOperatorTokenTypes[keyof typeof SlimeAssignmentOperatorTokenTypes];
  value: SlimeAssignmentOperator;
}
/** 更新运算符 Token */
interface SlimeUpdateOperatorToken extends SlimeTokenNode {
  type: typeof SlimeUpdateOperatorTokenTypes[keyof typeof SlimeUpdateOperatorTokenTypes];
  value: SlimeUpdateOperator;
}
/** 数组元素包装 - 用于 SlimeArrayExpression */
interface SlimeArrayElement {
  element: SlimeExpression | SlimeSpreadElement | null;
  commaToken?: SlimeCommaToken;
}
/** 对象属性包装 - 用于 SlimeObjectExpression */
interface SlimeObjectPropertyItem {
  property: SlimeProperty | SlimeSpreadElement;
  commaToken?: SlimeCommaToken;
}
/** 函数参数包装 - 用于 SlimeBaseFunction.params */
interface SlimeFunctionParam {
  param: SlimePattern;
  commaToken?: SlimeCommaToken;
}
/** 调用参数包装 - 用于 SlimeBaseCallExpression.arguments */
interface SlimeCallArgument {
  argument: SlimeExpression | SlimeSpreadElement;
  commaToken?: SlimeCommaToken;
}
/** 解构数组元素包装 - 用于 SlimeArrayPattern */
interface SlimeArrayPatternElement {
  element: SlimePattern | null;
  commaToken?: SlimeCommaToken;
}
/** 解构对象属性包装 - 用于 SlimeObjectPattern */
interface SlimeObjectPatternProperty {
  property: SlimeAssignmentProperty | SlimeRestElement;
  commaToken?: SlimeCommaToken;
}
/** Import specifier 包装 - 用于 SlimeImportDeclaration */
interface SlimeImportSpecifierItem {
  specifier: SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier;
  commaToken?: SlimeCommaToken;
}
/** Export specifier 包装 - 用于 SlimeExportNamedDeclaration */
interface SlimeExportSpecifierItem {
  specifier: SlimeExportSpecifier;
  commaToken?: SlimeCommaToken;
}
interface SlimeNodeMap {
  SlimeAssignmentProperty: SlimeAssignmentProperty;
  SlimeCatchClause: SlimeCatchClause;
  SlimeClass: SlimeClass;
  SlimeClassBody: SlimeClassBody;
  SlimeExpression: SlimeExpression;
  SlimeFunction: SlimeFunction;
  SlimeIdentifier: SlimeIdentifier;
  SlimeLiteral: SlimeLiteral;
  SlimeMethodDefinition: SlimeMethodDefinition;
  SlimeModuleDeclaration: SlimeModuleDeclaration;
  SlimeModuleSpecifier: SlimeModuleSpecifier;
  SlimePattern: SlimePattern;
  SlimePrivateIdentifier: SlimePrivateIdentifier;
  SlimeProgram: SlimeProgram;
  SlimeProperty: SlimeProperty;
  SlimePropertyDefinition: SlimePropertyDefinition;
  SlimeSpreadElement: SlimeSpreadElement;
  SlimeStatement: SlimeStatement;
  SlimeSuper: SlimeSuper;
  SlimeSwitchCase: SlimeSwitchCase;
  SlimeTemplateElement: SlimeTemplateElement;
  SlimeVariableDeclarator: SlimeVariableDeclarator;
}
type SlimeNode = SlimeNodeMap[keyof SlimeNodeMap];
interface SlimeComment extends SlimeBaseNodeWithoutComments, SlimeExtends<ESTree.Comment> {
  type: "Line" | "Block";
  value: string;
}
/** Program source type */
declare const SlimeProgramSourceType: {
  readonly Script: "script";
  readonly Module: "module";
};
type SlimeProgramSourceType = typeof SlimeProgramSourceType[keyof typeof SlimeProgramSourceType];
interface SlimeProgram extends SlimeBaseNode, Omit<SlimeExtends<ESTree.Program>, 'body'> {
  type: typeof SlimeNodeType.Program;
  sourceType: SlimeProgramSourceType;
  body: Array<SlimeDirective | SlimeStatement | SlimeModuleDeclaration>;
  comments?: SlimeComment[] | undefined;
}
interface SlimeDirective extends SlimeBaseNode, Omit<SlimeExtends<ESTree.Directive>, 'expression'> {
  type: typeof SlimeNodeType.ExpressionStatement;
  expression: SlimeLiteral;
  directive: string;
}
interface SlimeBaseFunction extends SlimeBaseNode, Omit<SlimeExtends<ESTree.BaseFunction>, 'params' | 'body'>, SlimeFunctionTokens {
  /** 函数参数列表（包装类型，每个参数可关联其后的逗号） */
  params: SlimeFunctionParam[];
  generator?: boolean | undefined;
  async?: boolean | undefined;
  /** function 关键字 Token */
  functionToken?: SlimeFunctionToken;
  /** async 关键字 Token */
  asyncToken?: SlimeAsyncToken;
  /** generator * Token */
  asteriskToken?: SlimeAsteriskToken;
  body: SlimeBlockStatement | SlimeExpression;
}
type SlimeFunction = SlimeFunctionDeclaration | SlimeFunctionExpression | SlimeArrowFunctionExpression;
type SlimeStatement = SlimeExpressionStatement | SlimeBlockStatement | SlimeStaticBlock | SlimeEmptyStatement | SlimeDebuggerStatement | SlimeWithStatement | SlimeReturnStatement | SlimeLabeledStatement | SlimeBreakStatement | SlimeContinueStatement | SlimeIfStatement | SlimeSwitchStatement | SlimeThrowStatement | SlimeTryStatement | SlimeWhileStatement | SlimeDoWhileStatement | SlimeForStatement | SlimeForInStatement | SlimeForOfStatement | SlimeDeclaration;
interface SlimeBaseStatement extends SlimeBaseNode, SlimeExtends<ESTree.BaseStatement> {}
interface SlimeEmptyStatement extends SlimeBaseStatement, SlimeExtends<ESTree.EmptyStatement>, SlimeSemicolonTokens {
  type: typeof SlimeNodeType.EmptyStatement;
}
interface SlimeBlockStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.BlockStatement>, 'body'>, SlimeBraceTokens {
  type: typeof SlimeNodeType.BlockStatement;
  body: SlimeStatement[];
  innerComments?: SlimeComment[] | undefined;
}
interface SlimeStaticBlock extends Omit<SlimeExtends<ESTree.StaticBlock, 'innerComments'>, 'body'>, Omit<SlimeBlockStatement, 'type' | 'body'> {
  type: typeof SlimeNodeType.StaticBlock;
  body: SlimeStatement[];
}
interface SlimeExpressionStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.ExpressionStatement>, 'expression'>, SlimeSemicolonTokens {
  type: typeof SlimeNodeType.ExpressionStatement;
  expression: SlimeExpression;
}
interface SlimeIfStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.IfStatement>, 'test' | 'consequent' | 'alternate'>, SlimeParenTokens {
  type: typeof SlimeNodeType.IfStatement;
  test: SlimeExpression;
  consequent: SlimeStatement;
  alternate?: SlimeStatement | null | undefined;
  /** if 关键字 Token */
  ifToken?: SlimeIfToken;
  /** else 关键字 Token */
  elseToken?: SlimeElseToken;
}
interface SlimeLabeledStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.LabeledStatement>, 'label' | 'body'> {
  type: typeof SlimeNodeType.LabeledStatement;
  label: SlimeIdentifier;
  body: SlimeStatement;
}
interface SlimeBreakStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.BreakStatement>, 'label'>, SlimeSemicolonTokens {
  type: typeof SlimeNodeType.BreakStatement;
  label?: SlimeIdentifier | null | undefined;
  /** break 关键字 Token */
  breakToken?: SlimeBreakToken;
}
interface SlimeContinueStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.ContinueStatement>, 'label'>, SlimeSemicolonTokens {
  type: typeof SlimeNodeType.ContinueStatement;
  label?: SlimeIdentifier | null | undefined;
  /** continue 关键字 Token */
  continueToken?: SlimeContinueToken;
}
interface SlimeWithStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.WithStatement>, 'object' | 'body'>, SlimeParenTokens {
  type: typeof SlimeNodeType.WithStatement;
  object: SlimeExpression;
  body: SlimeStatement;
  /** with 关键字 Token */
  withToken?: SlimeWithToken;
}
interface SlimeSwitchStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.SwitchStatement>, 'discriminant' | 'cases'>, SlimeParenTokens, SlimeBraceTokens {
  type: typeof SlimeNodeType.SwitchStatement;
  discriminant: SlimeExpression;
  cases: SlimeSwitchCase[];
  /** switch 关键字 Token */
  switchToken?: SlimeSwitchToken;
}
interface SlimeReturnStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.ReturnStatement>, 'argument'>, SlimeSemicolonTokens {
  type: typeof SlimeNodeType.ReturnStatement;
  argument?: SlimeExpression | null | undefined;
  /** return 关键字 Token */
  returnToken?: SlimeReturnToken;
}
interface SlimeThrowStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.ThrowStatement>, 'argument'>, SlimeSemicolonTokens {
  type: typeof SlimeNodeType.ThrowStatement;
  argument: SlimeExpression;
  /** throw 关键字 Token */
  throwToken?: SlimeThrowToken;
}
interface SlimeTryStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.TryStatement>, 'block' | 'handler' | 'finalizer'> {
  type: typeof SlimeNodeType.TryStatement;
  block: SlimeBlockStatement;
  handler?: SlimeCatchClause | null | undefined;
  finalizer?: SlimeBlockStatement | null | undefined;
  /** try 关键字 Token */
  tryToken?: SlimeTryToken;
  /** finally 关键字 Token */
  finallyToken?: SlimeFinallyToken;
}
interface SlimeWhileStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.WhileStatement>, 'test' | 'body'>, SlimeParenTokens {
  type: typeof SlimeNodeType.WhileStatement;
  test: SlimeExpression;
  body: SlimeStatement;
  /** while 关键字 Token */
  whileToken?: SlimeWhileToken;
}
interface SlimeDoWhileStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.DoWhileStatement>, 'body' | 'test'>, SlimeParenTokens, SlimeSemicolonTokens {
  type: typeof SlimeNodeType.DoWhileStatement;
  body: SlimeStatement;
  test: SlimeExpression;
  /** do 关键字 Token */
  doToken?: SlimeDoToken;
  /** while 关键字 Token */
  whileToken?: SlimeWhileToken;
}
interface SlimeForStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.ForStatement>, 'init' | 'test' | 'update' | 'body'>, SlimeParenTokens {
  type: typeof SlimeNodeType.ForStatement;
  init?: SlimeVariableDeclaration | SlimeExpression | null | undefined;
  test?: SlimeExpression | null | undefined;
  update?: SlimeExpression | null | undefined;
  body: SlimeStatement;
  /** for 关键字 Token */
  forToken?: SlimeForToken;
  /** 第一个分号 */
  semicolon1Token?: SlimeSemicolonToken;
  /** 第二个分号 */
  semicolon2Token?: SlimeSemicolonToken;
}
interface SlimeBaseForXStatement extends SlimeBaseStatement, Omit<SlimeExtends<ESTree.BaseForXStatement>, 'left' | 'right' | 'body'>, SlimeParenTokens {
  left: SlimeVariableDeclaration | SlimePattern;
  right: SlimeExpression;
  body: SlimeStatement;
  /** for 关键字 Token */
  forToken?: SlimeForToken;
}
interface SlimeForInStatement extends SlimeBaseForXStatement, Omit<SlimeExtends<ESTree.ForInStatement>, 'body' | 'left' | 'right'> {
  type: typeof SlimeNodeType.ForInStatement;
  /** in 关键字 Token */
  inToken?: SlimeInToken;
}
interface SlimeDebuggerStatement extends SlimeBaseStatement, SlimeExtends<ESTree.DebuggerStatement>, SlimeSemicolonTokens {
  type: typeof SlimeNodeType.DebuggerStatement;
  /** debugger 关键字 Token */
  debuggerToken?: SlimeDebuggerToken;
}
type SlimeDeclaration = SlimeFunctionDeclaration | SlimeVariableDeclaration | SlimeClassDeclaration;
interface SlimeBaseDeclaration extends SlimeBaseStatement, SlimeExtends<ESTree.BaseDeclaration> {}
interface SlimeMaybeNamedFunctionDeclaration extends SlimeBaseFunction, SlimeBaseDeclaration, Omit<SlimeExtends<ESTree.MaybeNamedFunctionDeclaration>, 'params' | 'body' | 'id'> {
  type: typeof SlimeNodeType.FunctionDeclaration;
  /** It is null when a function declaration is a part of the `export default function` statement */
  id: SlimeIdentifier | null;
  body: SlimeBlockStatement;
}
interface SlimeFunctionDeclaration extends SlimeMaybeNamedFunctionDeclaration, Omit<SlimeExtends<ESTree.FunctionDeclaration>, 'body' | 'params'> {
  id: SlimeIdentifier;
}
interface SlimeVariableDeclaration extends SlimeBaseDeclaration, Omit<SlimeExtends<ESTree.VariableDeclaration>, 'kind' | 'declarations'>, SlimeSemicolonTokens {
  type: typeof SlimeNodeType.VariableDeclaration;
  declarations: SlimeVariableDeclarator[];
  /** 变量声明关键字 Token (var/let/const) */
  kind: SlimeVariableDeclarationKindToken;
}
interface SlimeVariableDeclarator extends SlimeBaseNode, Omit<SlimeExtends<ESTree.VariableDeclarator>, 'id' | 'init'> {
  type: typeof SlimeNodeType.VariableDeclarator;
  id: SlimePattern;
  init?: SlimeExpression | null | undefined;
  /** 赋值符号 Token，包含位置信息 */
  assignToken?: SlimeAssignToken;
}
interface SlimeExpressionMap {
  SlimeArrayExpression: SlimeArrayExpression;
  SlimeArrowFunctionExpression: SlimeArrowFunctionExpression;
  SlimeAssignmentExpression: SlimeAssignmentExpression;
  SlimeAwaitExpression: SlimeAwaitExpression;
  SlimeBinaryExpression: SlimeBinaryExpression;
  SlimeCallExpression: SlimeCallExpression;
  SlimeChainExpression: SlimeChainExpression;
  SlimeClassExpression: SlimeClassExpression;
  SlimeConditionalExpression: SlimeConditionalExpression;
  SlimeFunctionExpression: SlimeFunctionExpression;
  SlimeIdentifier: SlimeIdentifier;
  SlimeImportExpression: SlimeImportExpression;
  SlimeLiteral: SlimeLiteral;
  SlimeLogicalExpression: SlimeLogicalExpression;
  SlimeMemberExpression: SlimeMemberExpression;
  SlimeMetaProperty: SlimeMetaProperty;
  SlimeNewExpression: SlimeNewExpression;
  SlimeObjectExpression: SlimeObjectExpression;
  SlimeSequenceExpression: SlimeSequenceExpression;
  SlimeTaggedTemplateExpression: SlimeTaggedTemplateExpression;
  SlimeTemplateLiteral: SlimeTemplateLiteral;
  SlimeThisExpression: SlimeThisExpression;
  SlimeUnaryExpression: SlimeUnaryExpression;
  SlimeUpdateExpression: SlimeUpdateExpression;
  SlimeYieldExpression: SlimeYieldExpression;
}
type SlimeExpression = SlimeExpressionMap[keyof SlimeExpressionMap];
interface SlimeBaseExpression extends SlimeBaseNode, SlimeExtends<ESTree.BaseExpression> {}
type SlimeChainElement = SlimeSimpleCallExpression | SlimeMemberExpression;
interface SlimeChainExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.ChainExpression>, 'expression'> {
  type: typeof SlimeNodeType.ChainExpression;
  expression: SlimeChainElement;
}
interface SlimeThisExpression extends SlimeBaseExpression, SlimeExtends<ESTree.ThisExpression> {
  type: typeof SlimeNodeType.ThisExpression;
}
interface SlimeArrayExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.ArrayExpression>, 'elements'>, SlimeBracketTokens {
  type: typeof SlimeNodeType.ArrayExpression;
  /** 数组元素列表（包装类型，每个元素可关联其后的逗号） */
  elements: Array<SlimeArrayElement>;
}
interface SlimeObjectExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.ObjectExpression>, 'properties'>, SlimeBraceTokens {
  type: typeof SlimeNodeType.ObjectExpression;
  /** 对象属性列表（包装类型，每个属性可关联其后的逗号） */
  properties: Array<SlimeObjectPropertyItem>;
}
interface SlimePrivateIdentifier extends SlimeBaseNode, SlimeExtends<ESTree.PrivateIdentifier> {
  type: typeof SlimeNodeType.PrivateIdentifier;
  name: string;
}
interface SlimeProperty extends SlimeBaseNode, Omit<SlimeExtends<ESTree.Property>, 'key' | 'value'>, SlimeColonTokens, SlimeBracketTokens {
  type: typeof SlimeNodeType.Property;
  key: SlimeExpression | SlimePrivateIdentifier;
  value: SlimeExpression | SlimePattern;
  kind: "init" | "get" | "set";
  method: boolean;
  /** get 关键字 Token */
  getToken?: SlimeGetToken;
  /** set 关键字 Token */
  setToken?: SlimeSetToken;
  /** async 关键字 Token */
  asyncToken?: SlimeAsyncToken;
  /** * Token (generator) */
  asteriskToken?: SlimeAsteriskToken;
  shorthand: boolean;
  computed: boolean;
}
interface SlimePropertyDefinition extends SlimeBaseNode, Omit<SlimeExtends<ESTree.PropertyDefinition>, 'key' | 'value'> {
  type: typeof SlimeNodeType.PropertyDefinition;
  key: SlimeExpression | SlimePrivateIdentifier;
  value?: SlimeExpression | null | undefined;
  computed: boolean;
  static: boolean;
}
interface SlimeFunctionExpression extends SlimeBaseFunction, SlimeBaseExpression, Omit<SlimeExtends<ESTree.FunctionExpression>, 'params' | 'body' | 'id'> {
  id?: SlimeIdentifier | null | undefined;
  type: typeof SlimeNodeType.FunctionExpression;
  body: SlimeBlockStatement;
}
interface SlimeSequenceExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.SequenceExpression>, 'expressions'> {
  type: typeof SlimeNodeType.SequenceExpression;
  expressions: SlimeExpression[];
}
interface SlimeUnaryExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.UnaryExpression>, 'operator' | 'argument'> {
  type: typeof SlimeNodeType.UnaryExpression;
  /** 运算符 Token */
  operator: SlimeUnaryOperatorToken;
  prefix: true;
  argument: SlimeExpression;
}
interface SlimeBinaryExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.BinaryExpression>, 'operator' | 'left' | 'right'> {
  type: typeof SlimeNodeType.BinaryExpression;
  /** 运算符 Token */
  operator: SlimeBinaryOperatorToken;
  left: SlimeExpression | SlimePrivateIdentifier;
  right: SlimeExpression;
}
interface SlimeAssignmentExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.AssignmentExpression>, 'operator' | 'left' | 'right'> {
  type: typeof SlimeNodeType.AssignmentExpression;
  /** 运算符 Token */
  operator: SlimeAssignmentOperatorToken;
  left: SlimePattern | SlimeMemberExpression;
  right: SlimeExpression;
}
interface SlimeUpdateExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.UpdateExpression>, 'operator' | 'argument'> {
  type: typeof SlimeNodeType.UpdateExpression;
  /** 运算符 Token */
  operator: SlimeUpdateOperatorToken;
  argument: SlimeExpression;
  prefix: boolean;
}
interface SlimeLogicalExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.LogicalExpression>, 'operator' | 'left' | 'right'> {
  type: typeof SlimeNodeType.LogicalExpression;
  /** 运算符 Token */
  operator: SlimeLogicalOperatorToken;
  left: SlimeExpression;
  right: SlimeExpression;
}
interface SlimeConditionalExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.ConditionalExpression>, 'test' | 'alternate' | 'consequent'>, SlimeColonTokens {
  type: typeof SlimeNodeType.ConditionalExpression;
  test: SlimeExpression;
  alternate: SlimeExpression;
  consequent: SlimeExpression;
  /** ? Token */
  questionToken?: SlimeQuestionToken;
}
interface SlimeBaseCallExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.BaseCallExpression>, 'callee' | 'arguments'>, SlimeParenTokens {
  callee: SlimeExpression | SlimeSuper;
  /** 调用参数列表（包装类型，每个参数可关联其后的逗号） */
  arguments: Array<SlimeCallArgument>;
}
type SlimeCallExpression = SlimeSimpleCallExpression | SlimeNewExpression;
interface SlimeSimpleCallExpression extends SlimeBaseCallExpression, Omit<SlimeExtends<ESTree.SimpleCallExpression>, 'arguments' | 'callee'> {
  type: typeof SlimeNodeType.CallExpression;
  optional: boolean;
}
interface SlimeNewExpression extends SlimeBaseCallExpression, Omit<SlimeExtends<ESTree.NewExpression>, 'arguments' | 'callee'> {
  type: typeof SlimeNodeType.NewExpression;
  /** new 关键字 Token */
  newToken?: SlimeNewToken;
}
interface SlimeMemberExpression extends SlimeBaseExpression, SlimeBasePattern, Omit<SlimeExtends<ESTree.MemberExpression>, 'object' | 'property'>, SlimeBracketTokens {
  type: typeof SlimeNodeType.MemberExpression;
  object: SlimeExpression | SlimeSuper;
  property: SlimeExpression | SlimePrivateIdentifier;
  computed: boolean;
  optional: boolean;
  /** 点号 Token (非计算属性) */
  dotToken?: SlimeDotToken;
  /** 可选链 Token ?. */
  optionalChainingToken?: SlimeOptionalChainingToken;
}
type SlimePattern = SlimeIdentifier | SlimeObjectPattern | SlimeArrayPattern | SlimeRestElement | SlimeAssignmentPattern | SlimeMemberExpression;
interface SlimeBasePattern extends SlimeBaseNode, SlimeExtends<ESTree.BasePattern> {}
interface SlimeSwitchCase extends SlimeBaseNode, Omit<SlimeExtends<ESTree.SwitchCase>, 'test' | 'consequent'>, SlimeColonTokens {
  type: typeof SlimeNodeType.SwitchCase;
  test?: SlimeExpression | null | undefined;
  consequent: SlimeStatement[];
  /** case 关键字 Token (如果是 case) */
  caseToken?: SlimeCaseToken;
  /** default 关键字 Token (如果是 default) */
  defaultToken?: SlimeDefaultToken;
}
interface SlimeCatchClause extends SlimeBaseNode, Omit<SlimeExtends<ESTree.CatchClause>, 'param' | 'body'>, SlimeParenTokens {
  type: typeof SlimeNodeType.CatchClause;
  param: SlimePattern | null;
  body: SlimeBlockStatement;
  /** catch 关键字 Token */
  catchToken?: SlimeCatchToken;
}
interface SlimeIdentifier extends SlimeBaseNode, SlimeBaseExpression, SlimeBasePattern, SlimeExtends<ESTree.Identifier> {
  type: typeof SlimeNodeType.Identifier;
  name: string;
}
type SlimeLiteral = SlimeSimpleLiteral | SlimeRegExpLiteral | SlimeBigIntLiteral;
interface SlimeSimpleLiteral extends SlimeBaseNode, SlimeBaseExpression, SlimeExtends<ESTree.SimpleLiteral> {
  type: typeof SlimeNodeType.Literal;
  value: string | boolean | number | null;
  raw?: string | undefined;
}
interface SlimeRegExpLiteral extends SlimeBaseNode, SlimeBaseExpression, SlimeExtends<ESTree.RegExpLiteral> {
  type: typeof SlimeNodeType.Literal;
  value?: RegExp | null | undefined;
  regex: {
    pattern: string;
    flags: string;
  };
  raw?: string | undefined;
}
interface SlimeBigIntLiteral extends SlimeBaseNode, SlimeBaseExpression, SlimeExtends<ESTree.BigIntLiteral> {
  type: typeof SlimeNodeType.Literal;
  value?: bigint | null | undefined;
  bigint: string;
  raw?: string | undefined;
}
/** String literal - 字符串字面量 */
interface SlimeStringLiteral extends SlimeSimpleLiteral {
  value: string;
}
/** Numeric literal - 数字字面量 */
interface SlimeNumericLiteral extends SlimeSimpleLiteral {
  value: number;
}
/** Boolean literal - 布尔字面量 */
interface SlimeBooleanLiteral extends SlimeSimpleLiteral {
  value: boolean;
}
/** Null literal - 空值字面量 */
interface SlimeNullLiteral extends SlimeSimpleLiteral {
  value: null;
}
type SlimeUnaryOperator = "-" | "+" | "!" | "~" | "typeof" | "void" | "delete";
type SlimeBinaryOperator = "==" | "!=" | "===" | "!==" | "<" | "<=" | ">" | ">=" | "<<" | ">>" | ">>>" | "+" | "-" | "*" | "/" | "%" | "**" | "|" | "^" | "&" | "in" | "instanceof";
type SlimeLogicalOperator = "||" | "&&" | "??";
type SlimeAssignmentOperator = "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "**=" | "<<=" | ">>=" | ">>>=" | "|=" | "^=" | "&=" | "||=" | "&&=" | "??=";
type SlimeUpdateOperator = "++" | "--";
interface SlimeForOfStatement extends SlimeBaseForXStatement, Omit<SlimeExtends<ESTree.ForOfStatement>, 'body' | 'left' | 'right'> {
  type: typeof SlimeNodeType.ForOfStatement;
  await: boolean;
  /** of 关键字 Token */
  ofToken?: SlimeOfToken;
  /** await 关键字 Token (for await...of) */
  awaitToken?: SlimeAwaitToken;
}
interface SlimeSuper extends SlimeBaseNode, SlimeExtends<ESTree.Super> {
  type: typeof SlimeNodeType.Super;
}
interface SlimeSpreadElement extends SlimeBaseNode, Omit<SlimeExtends<ESTree.SpreadElement>, 'argument'> {
  type: typeof SlimeNodeType.SpreadElement;
  argument: SlimeExpression;
  /** ... 展开运算符 Token */
  ellipsisToken?: SlimeEllipsisToken;
}
interface SlimeArrowFunctionExpression extends SlimeBaseExpression, SlimeBaseFunction, Omit<SlimeExtends<ESTree.ArrowFunctionExpression>, 'params' | 'body'> {
  type: typeof SlimeNodeType.ArrowFunctionExpression;
  expression: boolean;
  body: SlimeBlockStatement | SlimeExpression;
  /** 箭头 Token => */
  arrowToken?: SlimeArrowToken;
}
interface SlimeYieldExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.YieldExpression>, 'argument'> {
  type: typeof SlimeNodeType.YieldExpression;
  argument?: SlimeExpression | null | undefined;
  delegate: boolean;
  /** yield 关键字 Token */
  yieldToken?: SlimeYieldToken;
  /** * Token (delegate yield) */
  asteriskToken?: SlimeAsteriskToken;
}
interface SlimeTemplateLiteral extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.TemplateLiteral>, 'quasis' | 'expressions'> {
  type: typeof SlimeNodeType.TemplateLiteral;
  quasis: SlimeTemplateElement[];
  expressions: SlimeExpression[];
}
interface SlimeTaggedTemplateExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.TaggedTemplateExpression>, 'tag' | 'quasi'> {
  type: typeof SlimeNodeType.TaggedTemplateExpression;
  tag: SlimeExpression;
  quasi: SlimeTemplateLiteral;
}
interface SlimeTemplateElement extends SlimeBaseNode, SlimeExtends<ESTree.TemplateElement> {
  type: typeof SlimeNodeType.TemplateElement;
  tail: boolean;
  value: {
    /** It is null when the template literal is tagged and the text has an invalid escape (e.g. - tag`\unicode and \u{55}`) */
    cooked?: string | null | undefined;
    raw: string;
  };
}
interface SlimeAssignmentProperty extends SlimeProperty, Omit<SlimeExtends<ESTree.AssignmentProperty>, 'key' | 'value'> {
  value: SlimePattern;
  kind: "init";
  method: boolean;
}
interface SlimeObjectPattern extends SlimeBasePattern, Omit<SlimeExtends<ESTree.ObjectPattern>, 'properties'>, SlimeBraceTokens {
  type: typeof SlimeNodeType.ObjectPattern;
  /** 解构属性列表（包装类型，每个属性可关联其后的逗号） */
  properties: Array<SlimeObjectPatternProperty>;
}
interface SlimeArrayPattern extends SlimeBasePattern, Omit<SlimeExtends<ESTree.ArrayPattern>, 'elements'>, SlimeBracketTokens {
  type: typeof SlimeNodeType.ArrayPattern;
  /** 解构元素列表（包装类型，每个元素可关联其后的逗号） */
  elements: Array<SlimeArrayPatternElement>;
}
interface SlimeRestElement extends SlimeBasePattern, Omit<SlimeExtends<ESTree.RestElement>, 'argument'> {
  type: typeof SlimeNodeType.RestElement;
  argument: SlimePattern;
  /** ... 展开运算符 Token */
  ellipsisToken?: SlimeEllipsisToken;
}
interface SlimeAssignmentPattern extends SlimeBasePattern, Omit<SlimeExtends<ESTree.AssignmentPattern>, 'left' | 'right'> {
  type: typeof SlimeNodeType.AssignmentPattern;
  left: SlimePattern;
  right: SlimeExpression;
}
type SlimeClass = SlimeClassDeclaration | SlimeClassExpression;
interface SlimeBaseClass extends SlimeBaseNode, Omit<SlimeExtends<ESTree.BaseClass>, 'superClass' | 'body'> {
  superClass?: SlimeExpression | null | undefined;
  body: SlimeClassBody;
  /** class 关键字 Token */
  classToken?: SlimeClassToken;
  /** extends 关键字 Token */
  extendsToken?: SlimeExtendsToken;
}
interface SlimeClassBody extends SlimeBaseNode, Omit<SlimeExtends<ESTree.ClassBody>, 'body'>, SlimeBraceTokens {
  type: typeof SlimeNodeType.ClassBody;
  body: Array<SlimeMethodDefinition | SlimePropertyDefinition | SlimeStaticBlock>;
}
interface SlimeMethodDefinition extends SlimeBaseNode, Omit<SlimeExtends<ESTree.MethodDefinition>, 'value' | 'key'> {
  type: typeof SlimeNodeType.MethodDefinition;
  key: SlimeExpression | SlimePrivateIdentifier;
  value: SlimeFunctionExpression;
  kind: "constructor" | "method" | "get" | "set";
  computed: boolean;
  static: boolean;
  /** static 关键字 Token */
  staticToken?: SlimeStaticToken;
  /** get 关键字 Token */
  getToken?: SlimeGetToken;
  /** set 关键字 Token */
  setToken?: SlimeSetToken;
  /** async 关键字 Token */
  asyncToken?: SlimeAsyncToken;
  /** generator * Token */
  asteriskToken?: SlimeAsteriskToken;
}
interface SlimeMaybeNamedClassDeclaration extends SlimeBaseClass, SlimeBaseDeclaration, Omit<SlimeExtends<ESTree.MaybeNamedClassDeclaration>, 'body' | 'superClass'> {
  type: typeof SlimeNodeType.ClassDeclaration;
  /** It is null when a class declaration is a part of the `export default class` statement */
  id: SlimeIdentifier | null;
}
interface SlimeClassDeclaration extends SlimeMaybeNamedClassDeclaration, Omit<SlimeExtends<ESTree.ClassDeclaration>, 'body' | 'superClass'> {
  id: SlimeIdentifier;
}
interface SlimeClassExpression extends SlimeBaseClass, SlimeBaseExpression, Omit<SlimeExtends<ESTree.ClassExpression>, 'body' | 'superClass'> {
  type: typeof SlimeNodeType.ClassExpression;
  id?: SlimeIdentifier | null | undefined;
}
interface SlimeMetaProperty extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.MetaProperty>, 'meta' | 'property'> {
  type: typeof SlimeNodeType.MetaProperty;
  meta: SlimeIdentifier;
  property: SlimeIdentifier;
}
type SlimeModuleDeclaration = SlimeImportDeclaration | SlimeExportNamedDeclaration | SlimeExportDefaultDeclaration | SlimeExportAllDeclaration;
interface SlimeBaseModuleDeclaration extends SlimeBaseNode, SlimeExtends<ESTree.BaseModuleDeclaration> {}
type SlimeModuleSpecifier = SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier | SlimeExportSpecifier;
interface SlimeBaseModuleSpecifier extends SlimeBaseNode, SlimeExtends<ESTree.BaseModuleSpecifier> {
  local: SlimeIdentifier;
}
interface SlimeImportDeclaration extends SlimeBaseModuleDeclaration, Omit<SlimeExtends<ESTree.ImportDeclaration>, 'specifiers' | 'source'>, SlimeBraceTokens, SlimeSemicolonTokens {
  type: typeof SlimeNodeType.ImportDeclaration;
  /** import specifiers 列表（包装类型，每个 specifier 可关联其后的逗号） */
  specifiers: Array<SlimeImportSpecifierItem>;
  source: SlimeLiteral;
  /** import 关键字 Token */
  importToken?: SlimeImportToken;
  /** from 关键字 Token */
  fromToken?: SlimeFromToken;
}
interface SlimeImportSpecifier extends SlimeBaseModuleSpecifier, SlimeExtends<ESTree.ImportSpecifier, 'local'> {
  type: typeof SlimeNodeType.ImportSpecifier;
  imported: SlimeIdentifier | SlimeLiteral;
  /** as 关键字 Token */
  asToken?: SlimeAsToken;
}
interface SlimeImportExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.ImportExpression>, 'source'>, SlimeParenTokens {
  type: typeof SlimeNodeType.ImportExpression;
  source: SlimeExpression;
  /** import 关键字 Token */
  importToken?: SlimeImportToken;
}
interface SlimeImportDefaultSpecifier extends SlimeBaseModuleSpecifier, SlimeExtends<ESTree.ImportDefaultSpecifier, 'local'> {
  type: typeof SlimeNodeType.ImportDefaultSpecifier;
}
interface SlimeImportNamespaceSpecifier extends SlimeBaseModuleSpecifier, SlimeExtends<ESTree.ImportNamespaceSpecifier, 'local'> {
  type: typeof SlimeNodeType.ImportNamespaceSpecifier;
  /** * Token */
  asteriskToken?: SlimeAsteriskToken;
  /** as 关键字 Token */
  asToken?: SlimeAsToken;
}
interface SlimeExportNamedDeclaration extends SlimeBaseModuleDeclaration, Omit<SlimeExtends<ESTree.ExportNamedDeclaration>, 'declaration' | 'specifiers'>, SlimeBraceTokens, SlimeSemicolonTokens {
  type: typeof SlimeNodeType.ExportNamedDeclaration;
  declaration?: SlimeDeclaration | null | undefined;
  /** export specifiers 列表（包装类型，每个 specifier 可关联其后的逗号） */
  specifiers: SlimeExportSpecifierItem[];
  source?: SlimeLiteral | null | undefined;
  /** export 关键字 Token */
  exportToken?: SlimeExportToken;
  /** from 关键字 Token */
  fromToken?: SlimeFromToken;
}
interface SlimeExportSpecifier extends Omit<SlimeExtends<ESTree.ExportSpecifier>, 'local' | 'exported'>, Omit<SlimeBaseModuleSpecifier, 'local'> {
  type: typeof SlimeNodeType.ExportSpecifier;
  local: SlimeIdentifier | SlimeLiteral;
  exported: SlimeIdentifier | SlimeLiteral;
  /** as 关键字 Token */
  asToken?: SlimeAsToken;
}
interface SlimeExportDefaultDeclaration extends SlimeBaseModuleDeclaration, Omit<SlimeExtends<ESTree.ExportDefaultDeclaration>, 'declaration'> {
  type: typeof SlimeNodeType.ExportDefaultDeclaration;
  declaration: SlimeMaybeNamedFunctionDeclaration | SlimeMaybeNamedClassDeclaration | SlimeExpression;
  /** export 关键字 Token */
  exportToken?: SlimeExportToken;
  /** default 关键字 Token */
  defaultToken?: SlimeDefaultToken;
}
interface SlimeExportAllDeclaration extends SlimeBaseModuleDeclaration, Omit<SlimeExtends<ESTree.ExportAllDeclaration>, 'exported' | 'source'>, SlimeSemicolonTokens {
  type: typeof SlimeNodeType.ExportAllDeclaration;
  exported: SlimeIdentifier | SlimeLiteral | null;
  source: SlimeLiteral;
  /** export 关键字 Token */
  exportToken?: SlimeExportToken;
  /** * Token */
  asteriskToken?: SlimeAsteriskToken;
  /** as 关键字 Token */
  asToken?: SlimeAsToken;
  /** from 关键字 Token */
  fromToken?: SlimeFromToken;
}
interface SlimeAwaitExpression extends SlimeBaseExpression, Omit<SlimeExtends<ESTree.AwaitExpression>, 'argument'> {
  type: typeof SlimeNodeType.AwaitExpression;
  argument: SlimeExpression;
  /** await 关键字 Token */
  awaitToken?: SlimeAwaitToken;
}
//#endregion
export { SlimeArrayElement, SlimeArrayExpression, SlimeArrayPattern, SlimeArrayPatternElement, SlimeArrowFunctionExpression, SlimeArrowToken, SlimeAsToken, SlimeAssignToken, SlimeAssignmentExpression, SlimeAssignmentOperator, SlimeAssignmentOperatorToken, SlimeAssignmentPattern, SlimeAssignmentProperty, SlimeAsteriskToken, SlimeAsyncToken, SlimeAwaitExpression, SlimeAwaitToken, SlimeBaseCallExpression, SlimeBaseClass, SlimeBaseDeclaration, SlimeBaseExpression, SlimeBaseForXStatement, SlimeBaseFunction, SlimeBaseModuleDeclaration, SlimeBaseModuleSpecifier, SlimeBaseNode, SlimeBaseNodeWithoutComments, SlimeBasePattern, SlimeBaseStatement, SlimeBigIntLiteral, SlimeBinaryExpression, SlimeBinaryOperator, SlimeBinaryOperatorToken, SlimeBlockStatement, SlimeBooleanLiteral, SlimeBraceTokens, SlimeBracketTokens, SlimeBreakStatement, SlimeBreakToken, SlimeCallArgument, SlimeCallExpression, SlimeCaseToken, SlimeCatchClause, SlimeCatchToken, SlimeChainElement, SlimeChainExpression, SlimeClass, SlimeClassBody, SlimeClassDeclaration, SlimeClassExpression, SlimeClassToken, SlimeColonToken, SlimeColonTokens, SlimeCommaToken, SlimeComment, SlimeConditionalExpression, SlimeConstToken, SlimeContinueStatement, SlimeContinueToken, SlimeDebuggerStatement, SlimeDebuggerToken, SlimeDeclaration, SlimeDefaultToken, SlimeDeleteToken, SlimeDirective, SlimeDoToken, SlimeDoWhileStatement, SlimeDotToken, SlimeEllipsisToken, SlimeElseToken, SlimeEmptyStatement, SlimeExportAllDeclaration, SlimeExportDefaultDeclaration, SlimeExportNamedDeclaration, SlimeExportSpecifier, SlimeExportSpecifierItem, SlimeExportToken, SlimeExpression, SlimeExpressionMap, SlimeExpressionStatement, SlimeExtendsToken, SlimeFinallyToken, SlimeForInStatement, SlimeForOfStatement, SlimeForStatement, SlimeForToken, SlimeFromToken, SlimeFunction, SlimeFunctionDeclaration, SlimeFunctionExpression, SlimeFunctionParam, SlimeFunctionToken, SlimeFunctionTokens, SlimeGetToken, SlimeIdentifier, SlimeIfStatement, SlimeIfToken, SlimeImportDeclaration, SlimeImportDefaultSpecifier, SlimeImportExpression, SlimeImportNamespaceSpecifier, SlimeImportSpecifier, SlimeImportSpecifierItem, SlimeImportToken, SlimeInToken, SlimeInstanceofToken, SlimeLBraceToken, SlimeLBracketToken, SlimeLParenToken, SlimeLabeledStatement, SlimeLetToken, SlimeLiteral, SlimeLogicalExpression, SlimeLogicalOperator, SlimeLogicalOperatorToken, SlimeMaybeNamedClassDeclaration, SlimeMaybeNamedFunctionDeclaration, SlimeMemberExpression, SlimeMetaProperty, SlimeMethodDefinition, SlimeModuleDeclaration, SlimeModuleSpecifier, SlimeNewExpression, SlimeNewToken, SlimeNode, SlimeNodeMap, SlimeNodeType, SlimeNullLiteral, SlimeNumericLiteral, SlimeObjectExpression, SlimeObjectPattern, SlimeObjectPatternProperty, SlimeObjectPropertyItem, SlimeOfToken, SlimeOptionalChainingToken, SlimeParenTokens, SlimePattern, SlimePrivateIdentifier, SlimeProgram, SlimeProgramSourceType, SlimeProperty, SlimePropertyDefinition, SlimeQuestionToken, SlimeRBraceToken, SlimeRBracketToken, SlimeRParenToken, SlimeRegExpLiteral, SlimeRestElement, SlimeReturnStatement, SlimeReturnToken, SlimeSemicolonToken, SlimeSemicolonTokens, SlimeSequenceExpression, SlimeSetToken, SlimeSimpleCallExpression, SlimeSimpleLiteral, SlimeSpreadElement, SlimeStatement, SlimeStaticBlock, SlimeStaticToken, SlimeStringLiteral, SlimeSuper, SlimeSwitchCase, SlimeSwitchStatement, SlimeSwitchToken, SlimeTaggedTemplateExpression, SlimeTemplateElement, SlimeTemplateLiteral, SlimeThisExpression, SlimeThrowStatement, SlimeThrowToken, SlimeTokenNode, SlimeTryStatement, SlimeTryToken, SlimeTypeofToken, SlimeUnaryExpression, SlimeUnaryOperator, SlimeUnaryOperatorToken, SlimeUpdateExpression, SlimeUpdateOperator, SlimeUpdateOperatorToken, SlimeVarToken, SlimeVariableDeclaration, SlimeVariableDeclarationKindToken, SlimeVariableDeclarator, SlimeVoidToken, SlimeWhileStatement, SlimeWhileToken, SlimeWithStatement, SlimeWithToken, SlimeYieldExpression, SlimeYieldToken };