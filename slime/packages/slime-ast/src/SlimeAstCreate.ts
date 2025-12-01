/**
 * SlimeAstCreate.ts - AST 节点创建工厂
 *
 * 为每个 AST 节点类型提供创建方法
 * Token 创建方法请使用 SlimeTokenCreate.ts
 * 与 SlimeESTree.ts 中的 AST 类型一一对应
 */

import {
  // Base types
  type SlimeBaseNode,
  SlimeProgramSourceType,

  // Program
  type SlimeProgram,
  type SlimeDirective,

  // Statements
  type SlimeStatement,
  type SlimeBlockStatement,
  type SlimeEmptyStatement,
  type SlimeExpressionStatement,
  type SlimeIfStatement,
  type SlimeLabeledStatement,
  type SlimeBreakStatement,
  type SlimeContinueStatement,
  type SlimeWithStatement,
  type SlimeSwitchStatement,
  type SlimeReturnStatement,
  type SlimeThrowStatement,
  type SlimeTryStatement,
  type SlimeWhileStatement,
  type SlimeDoWhileStatement,
  type SlimeForStatement,
  type SlimeForInStatement,
  type SlimeForOfStatement,
  type SlimeDebuggerStatement,
  type SlimeStaticBlock,
  type SlimeSwitchCase,
  type SlimeCatchClause,

  // Declarations
  type SlimeDeclaration,
  type SlimeFunctionDeclaration,
  type SlimeVariableDeclaration,
  type SlimeVariableDeclarator,
  type SlimeClassDeclaration,
  type SlimeMaybeNamedFunctionDeclaration,
  type SlimeMaybeNamedClassDeclaration,

  // Expressions
  type SlimeExpression,
  type SlimeThisExpression,
  type SlimeArrayExpression,
  type SlimeObjectExpression,
  type SlimeFunctionExpression,
  type SlimeArrowFunctionExpression,
  type SlimeYieldExpression,
  type SlimeAwaitExpression,
  type SlimeUnaryExpression,
  type SlimeBinaryExpression,
  type SlimeLogicalExpression,
  type SlimeAssignmentExpression,
  type SlimeUpdateExpression,
  type SlimeConditionalExpression,
  type SlimeSimpleCallExpression,
  type SlimeNewExpression,
  type SlimeMemberExpression,
  type SlimeChainExpression,
  type SlimeChainElement,
  type SlimeSequenceExpression,
  type SlimeTemplateLiteral,
  type SlimeTaggedTemplateExpression,
  type SlimeTemplateElement,
  type SlimeMetaProperty,
  type SlimeImportExpression,
  type SlimeClassExpression,

  // Literals
  type SlimeLiteral,
  type SlimeSimpleLiteral,
  type SlimeRegExpLiteral,
  type SlimeBigIntLiteral,
  type SlimeStringLiteral,
  type SlimeNumericLiteral,
  type SlimeBooleanLiteral,
  type SlimeNullLiteral,

  // Patterns
  type SlimePattern,
  type SlimeObjectPattern,
  type SlimeArrayPattern,
  type SlimeRestElement,
  type SlimeAssignmentPattern,
  type SlimeAssignmentProperty,

  // Properties
  type SlimeProperty,
  type SlimePropertyDefinition,
  type SlimeSpreadElement,

  // Classes
  type SlimeClassBody,
  type SlimeMethodDefinition,

  // Modules
  type SlimeModuleDeclaration,
  type SlimeImportDeclaration,
  type SlimeImportSpecifier,
  type SlimeImportDefaultSpecifier,
  type SlimeImportNamespaceSpecifier,
  type SlimeExportNamedDeclaration,
  type SlimeExportDefaultDeclaration,
  type SlimeExportAllDeclaration,
  type SlimeExportSpecifier,

  // Special nodes
  type SlimeSuper,
  type SlimeIdentifier,
  type SlimePrivateIdentifier,

  // Token types
  type SlimeVariableDeclarationKindToken,
  type SlimeLBraceToken,
  type SlimeRBraceToken,
  type SlimeLBracketToken,
  type SlimeRBracketToken,
  type SlimeLParenToken,
  type SlimeRParenToken,
  type SlimeDotToken,
  type SlimeColonToken,
  type SlimeSemicolonToken,
  type SlimeCommaToken,
  type SlimeFromToken,
  type SlimeExportToken,
  type SlimeImportToken,
  type SlimeAssignToken,
  type SlimeArrowToken,
  type SlimeQuestionToken,
  type SlimeEllipsisToken,
  type SlimeAsteriskToken,
  type SlimeAsToken,
  type SlimeIfToken,
  type SlimeElseToken,
  type SlimeForToken,
  type SlimeWhileToken,
  type SlimeDoToken,
  type SlimeInToken,
  type SlimeOfToken,
  type SlimeSwitchToken,
  type SlimeCaseToken,
  type SlimeDefaultToken,
  type SlimeBreakToken,
  type SlimeContinueToken,
  type SlimeReturnToken,
  type SlimeThrowToken,
  type SlimeTryToken,
  type SlimeCatchToken,
  type SlimeFinallyToken,
  type SlimeWithToken,
  type SlimeDebuggerToken,
  type SlimeNewToken,
  type SlimeYieldToken,
  type SlimeAwaitToken,
  type SlimeFunctionToken,
  type SlimeAsyncToken,
  type SlimeClassToken,
  type SlimeExtendsToken,
  type SlimeStaticToken,
  type SlimeGetToken,
  type SlimeSetToken,
  type SlimeOptionalChainingToken,

  // Operator tokens
  type SlimeBinaryOperatorToken,
  type SlimeUnaryOperatorToken,
  type SlimeLogicalOperatorToken,
  type SlimeAssignmentOperatorToken,
  type SlimeUpdateOperatorToken,
} from "./SlimeESTree.ts";

import {SlimeAstType} from "./SlimeAstType.ts";
import type {SubhutiSourceLocation} from "subhuti/src/struct/SubhutiCst.ts";

class SlimeAstCreate {
  // ============================================
  // 通用辅助方法
  // ============================================

  commonLocType<T extends SlimeBaseNode>(node: T): T {
    if (!node.loc) {
      node.loc = {
        value: null,
        type: node.type,
        start: {
          index: 0,
          line: 0,
          column: 0,
        },
        end: {
          index: 0,
          line: 0,
          column: 0,
        }
      }
    }
    return node
  }

  // ============================================
  // Program
  // ============================================

  createProgram(body: Array<SlimeDirective | SlimeStatement | SlimeModuleDeclaration>, sourceType: SlimeProgramSourceType = SlimeProgramSourceType.script): SlimeProgram {
    return this.commonLocType({
      type: SlimeAstType.Program,
      sourceType: sourceType,
      body: body
    })
  }

  // ============================================
  // Expressions
  // ============================================

  createMemberExpression(object: SlimeExpression | SlimeSuper, dot: SlimeDotToken, property?: SlimeExpression | SlimePrivateIdentifier): SlimeMemberExpression {
    return this.commonLocType({
      type: SlimeAstType.MemberExpression,
      object: object,
      dot: dot,
      property: property,
      computed: false,
      optional: false,
      loc: object.loc
    })
  }

  createArrayExpression(
    elements?: Array<SlimeExpression | SlimeSpreadElement | null>,
    loc?: SubhutiSourceLocation,
    lBracketToken?: SlimeLBracketToken,
    rBracketToken?: SlimeRBracketToken,
    commaTokens?: (SlimeCommaToken | undefined)[]
  ): SlimeArrayExpression {
    return this.commonLocType({
      type: SlimeAstType.ArrayExpression,
      elements: elements,
      lBracketToken: lBracketToken,
      rBracketToken: rBracketToken,
      commaTokens: commaTokens,
      loc: loc
    })
  }


  createPropertyAst(key: SlimeExpression | SlimePrivateIdentifier, value: SlimeExpression | SlimePattern): SlimeProperty {
    return this.commonLocType({
      type: SlimeAstType.Property,
      key: key,
      value: value,
      kind: "init",
      method: false,
      shorthand: false,
      computed: false,
    })
  }

  createObjectExpression(
    properties: Array<SlimeProperty | SlimeSpreadElement> = [],
    loc?: SubhutiSourceLocation,
    lBraceToken?: SlimeLBraceToken,
    rBraceToken?: SlimeRBraceToken,
    commaTokens?: (SlimeCommaToken | undefined)[]
  ): SlimeObjectExpression {
    return this.commonLocType({
      type: SlimeAstType.ObjectExpression,
      properties: properties,
      lBraceToken: lBraceToken,
      rBraceToken: rBraceToken,
      commaTokens: commaTokens,
      loc: loc
    })
  }

  createParenthesizedExpression(expression: SlimeExpression, loc?: SubhutiSourceLocation): any {
    return this.commonLocType({
      type: SlimeAstType.ParenthesizedExpression,
      expression: expression,
      loc: loc
    })
  }

  createClassExpression(id?: SlimeIdentifier | null, superClass?: SlimeExpression | null, body?: SlimeClassBody, loc?: SubhutiSourceLocation): SlimeClassExpression {
    return this.commonLocType({
      type: SlimeAstType.ClassExpression,  // 节点类型
      id: id,                               // 类名（可选，匿名类为 null）
      body: body,                           // 类体（包含方法和属性）
      superClass: superClass,               // 父类表达式（可选，没有 extends 时为 null 或 undefined）
      loc: loc                              // 源码位置信息
    })
  }

  createCallExpression(
    callee: SlimeExpression | SlimeSuper,
    args: Array<SlimeExpression | SlimeSpreadElement>,
    loc?: SubhutiSourceLocation,
    lParenToken?: SlimeLParenToken,
    rParenToken?: SlimeRParenToken,
    commaTokens?: (SlimeCommaToken | undefined)[]
  ): SlimeSimpleCallExpression {
    return this.commonLocType({
      type: SlimeAstType.CallExpression,
      callee: callee,
      arguments: args,
      optional: false,
      lParenToken: lParenToken,
      rParenToken: rParenToken,
      commaTokens: commaTokens,
      loc: loc
    })
  }

  createThisExpression(loc?: SubhutiSourceLocation): SlimeThisExpression {
    return this.commonLocType({
      type: SlimeAstType.ThisExpression,
      loc: loc
    })
  }

  createChainExpression(expression: SlimeChainElement, loc?: SubhutiSourceLocation): SlimeChainExpression {
    return this.commonLocType({
      type: SlimeAstType.ChainExpression,
      expression: expression,
      loc: loc
    })
  }

  createSequenceExpression(expressions: SlimeExpression[], loc?: SubhutiSourceLocation): SlimeSequenceExpression {
    return this.commonLocType({
      type: SlimeAstType.SequenceExpression,
      expressions: expressions,
      loc: loc
    })
  }

  createUnaryExpression(
    operator: SlimeUnaryOperatorToken,
    argument: SlimeExpression,
    loc?: SubhutiSourceLocation
  ): SlimeUnaryExpression {
    return this.commonLocType({
      type: SlimeAstType.UnaryExpression,
      operator: operator,
      prefix: true,
      argument: argument,
      loc: loc
    })
  }

  createBinaryExpression(
    operator: SlimeBinaryOperatorToken,
    left: SlimeExpression | SlimePrivateIdentifier,
    right: SlimeExpression,
    loc?: SubhutiSourceLocation
  ): SlimeBinaryExpression {
    return this.commonLocType({
      type: SlimeAstType.BinaryExpression,
      operator: operator,
      left: left,
      right: right,
      loc: loc
    })
  }

  createAssignmentExpression(
    operator: SlimeAssignmentOperatorToken,
    left: SlimePattern | SlimeMemberExpression,
    right: SlimeExpression,
    loc?: SubhutiSourceLocation
  ): SlimeAssignmentExpression {
    return this.commonLocType({
      type: SlimeAstType.AssignmentExpression,
      operator: operator,
      left: left,
      right: right,
      loc: loc
    })
  }

  createUpdateExpression(
    operator: SlimeUpdateOperatorToken,
    argument: SlimeExpression,
    prefix: boolean,
    loc?: SubhutiSourceLocation
  ): SlimeUpdateExpression {
    return this.commonLocType({
      type: SlimeAstType.UpdateExpression,
      operator: operator,
      argument: argument,
      prefix: prefix,
      loc: loc
    })
  }

  createLogicalExpression(
    operator: SlimeLogicalOperatorToken,
    left: SlimeExpression,
    right: SlimeExpression,
    loc?: SubhutiSourceLocation
  ): SlimeLogicalExpression {
    return this.commonLocType({
      type: SlimeAstType.LogicalExpression,
      operator: operator,
      left: left,
      right: right,
      loc: loc
    })
  }

  createConditionalExpression(
    test: SlimeExpression,
    consequent: SlimeExpression,
    alternate: SlimeExpression,
    loc?: SubhutiSourceLocation,
    questionToken?: SlimeQuestionToken,
    colonToken?: SlimeColonToken
  ): SlimeConditionalExpression {
    return this.commonLocType({
      type: SlimeAstType.ConditionalExpression,
      test: test,
      consequent: consequent,
      alternate: alternate,
      questionToken: questionToken,
      colonToken: colonToken,
      loc: loc
    })
  }

  createNewExpression(
    callee: SlimeExpression,
    args: Array<SlimeExpression | SlimeSpreadElement>,
    loc?: SubhutiSourceLocation,
    newToken?: SlimeNewToken,
    lParenToken?: SlimeLParenToken,
    rParenToken?: SlimeRParenToken,
    commaTokens?: (SlimeCommaToken | undefined)[]
  ): SlimeNewExpression {
    return this.commonLocType({
      type: SlimeAstType.NewExpression,
      callee: callee,
      arguments: args,
      newToken: newToken,
      lParenToken: lParenToken,
      rParenToken: rParenToken,
      commaTokens: commaTokens,
      loc: loc
    })
  }

  createArrowFunctionExpression(
    body: SlimeBlockStatement | SlimeExpression,
    params: SlimePattern[],
    expression: boolean,
    async: boolean = false,
    loc?: SubhutiSourceLocation,
    arrowToken?: SlimeArrowToken,
    asyncToken?: SlimeAsyncToken,
    lParenToken?: SlimeLParenToken,
    rParenToken?: SlimeRParenToken,
    commaTokens?: (SlimeCommaToken | undefined)[]
  ): SlimeArrowFunctionExpression {
    return this.commonLocType({
      type: SlimeAstType.ArrowFunctionExpression,
      body: body,
      params: params,
      expression: expression,
      async: async,
      arrowToken: arrowToken,
      asyncToken: asyncToken,
      lParenToken: lParenToken,
      rParenToken: rParenToken,
      commaTokens: commaTokens,
      loc: loc
    })
  }

  createYieldExpression(
    argument?: SlimeExpression | null,
    delegate: boolean = false,
    loc?: SubhutiSourceLocation,
    yieldToken?: SlimeYieldToken,
    asteriskToken?: SlimeAsteriskToken
  ): SlimeYieldExpression {
    return this.commonLocType({
      type: SlimeAstType.YieldExpression,
      argument: argument,
      delegate: delegate,
      yieldToken: yieldToken,
      asteriskToken: asteriskToken,
      loc: loc
    })
  }

  createTaggedTemplateExpression(
    tag: SlimeExpression,
    quasi: SlimeTemplateLiteral,
    loc?: SubhutiSourceLocation
  ): SlimeTaggedTemplateExpression {
    return this.commonLocType({
      type: SlimeAstType.TaggedTemplateExpression,
      tag: tag,
      quasi: quasi,
      loc: loc
    })
  }

  createAwaitExpression(
    argument: SlimeExpression,
    loc?: SubhutiSourceLocation,
    awaitToken?: SlimeAwaitToken
  ): SlimeAwaitExpression {
    return this.commonLocType({
      type: SlimeAstType.AwaitExpression,
      argument: argument,
      awaitToken: awaitToken,
      loc: loc
    })
  }

  createMetaProperty(
    meta: SlimeIdentifier,
    property: SlimeIdentifier,
    loc?: SubhutiSourceLocation
  ): SlimeMetaProperty {
    return this.commonLocType({
      type: SlimeAstType.MetaProperty,
      meta: meta,
      property: property,
      loc: loc
    })
  }

  createImportExpression(
    source: SlimeExpression,
    loc?: SubhutiSourceLocation,
    importToken?: SlimeImportToken,
    lParenToken?: SlimeLParenToken,
    rParenToken?: SlimeRParenToken
  ): SlimeImportExpression {
    return this.commonLocType({
      type: SlimeAstType.ImportExpression,
      source: source,
      importToken: importToken,
      lParenToken: lParenToken,
      rParenToken: rParenToken,
      loc: loc
    })
  }

  createSuper(loc?: SubhutiSourceLocation): SlimeSuper {
    return this.commonLocType({
      type: SlimeAstType.Super,
      loc: loc
    })
  }

  createPrivateIdentifier(name: string, loc?: SubhutiSourceLocation): SlimePrivateIdentifier {
    return this.commonLocType({
      type: SlimeAstType.PrivateIdentifier,
      name: name,
      loc: loc
    })
  }

  // ============================================
  // Statements
  // ============================================

  createBlockStatement(body: SlimeStatement[], loc?: SubhutiSourceLocation, lBraceToken?: SlimeLBraceToken, rBraceToken?: SlimeRBraceToken): SlimeBlockStatement {
    return this.commonLocType({
      type: SlimeAstType.BlockStatement,
      body: body,
      lBraceToken: lBraceToken,
      rBraceToken: rBraceToken,
      loc: loc
    })
  }

  createEmptyStatement(loc?: SubhutiSourceLocation, semicolonToken?: SlimeSemicolonToken): SlimeEmptyStatement {
    return this.commonLocType({
      type: SlimeAstType.EmptyStatement,
      semicolonToken: semicolonToken,
      loc: loc
    })
  }

  createExpressionStatement(expression: SlimeExpression, loc?: SubhutiSourceLocation, semicolonToken?: SlimeSemicolonToken): SlimeExpressionStatement {
    return this.commonLocType({
      type: SlimeAstType.ExpressionStatement,
      expression: expression,
      semicolonToken: semicolonToken,
      loc: loc
    })
  }

  createIfStatement(
    test: SlimeExpression,
    consequent: SlimeStatement,
    alternate?: SlimeStatement | null,
    loc?: SubhutiSourceLocation,
    ifToken?: SlimeIfToken,
    elseToken?: SlimeElseToken,
    lParenToken?: SlimeLParenToken,
    rParenToken?: SlimeRParenToken
  ): SlimeIfStatement {
    return this.commonLocType({
      type: SlimeAstType.IfStatement,
      test: test,
      consequent: consequent,
      alternate: alternate,
      ifToken: ifToken,
      elseToken: elseToken,
      lParenToken: lParenToken,
      rParenToken: rParenToken,
      loc: loc
    })
  }

  createLabeledStatement(label: SlimeIdentifier, body: SlimeStatement, loc?: SubhutiSourceLocation): SlimeLabeledStatement {
    return this.commonLocType({
      type: SlimeAstType.LabeledStatement,
      label: label,
      body: body,
      loc: loc
    })
  }

  createBreakStatement(label?: SlimeIdentifier | null, loc?: SubhutiSourceLocation, breakToken?: SlimeBreakToken, semicolonToken?: SlimeSemicolonToken): SlimeBreakStatement {
    return this.commonLocType({
      type: SlimeAstType.BreakStatement,
      label: label,
      breakToken: breakToken,
      semicolonToken: semicolonToken,
      loc: loc
    })
  }

  createContinueStatement(label?: SlimeIdentifier | null, loc?: SubhutiSourceLocation, continueToken?: SlimeContinueToken, semicolonToken?: SlimeSemicolonToken): SlimeContinueStatement {
    return this.commonLocType({
      type: SlimeAstType.ContinueStatement,
      label: label,
      continueToken: continueToken,
      semicolonToken: semicolonToken,
      loc: loc
    })
  }

  createWithStatement(
    object: SlimeExpression,
    body: SlimeStatement,
    loc?: SubhutiSourceLocation,
    withToken?: SlimeWithToken,
    lParenToken?: SlimeLParenToken,
    rParenToken?: SlimeRParenToken
  ): SlimeWithStatement {
    return this.commonLocType({
      type: SlimeAstType.WithStatement,
      object: object,
      body: body,
      withToken: withToken,
      lParenToken: lParenToken,
      rParenToken: rParenToken,
      loc: loc
    })
  }

  createSwitchStatement(
    discriminant: SlimeExpression,
    cases: SlimeSwitchCase[],
    loc?: SubhutiSourceLocation,
    switchToken?: SlimeSwitchToken,
    lParenToken?: SlimeLParenToken,
    rParenToken?: SlimeRParenToken,
    lBraceToken?: SlimeLBraceToken,
    rBraceToken?: SlimeRBraceToken
  ): SlimeSwitchStatement {
    return this.commonLocType({
      type: SlimeAstType.SwitchStatement,
      discriminant: discriminant,
      cases: cases,
      switchToken: switchToken,
      lParenToken: lParenToken,
      rParenToken: rParenToken,
      lBraceToken: lBraceToken,
      rBraceToken: rBraceToken,
      loc: loc
    })
  }

  createThrowStatement(argument: SlimeExpression, loc?: SubhutiSourceLocation, throwToken?: SlimeThrowToken, semicolonToken?: SlimeSemicolonToken): SlimeThrowStatement {
    return this.commonLocType({
      type: SlimeAstType.ThrowStatement,
      argument: argument,
      throwToken: throwToken,
      semicolonToken: semicolonToken,
      loc: loc
    })
  }

  createTryStatement(
    block: SlimeBlockStatement,
    handler?: SlimeCatchClause | null,
    finalizer?: SlimeBlockStatement | null,
    loc?: SubhutiSourceLocation,
    tryToken?: SlimeTryToken,
    finallyToken?: SlimeFinallyToken
  ): SlimeTryStatement {
    return this.commonLocType({
      type: SlimeAstType.TryStatement,
      block: block,
      handler: handler,
      finalizer: finalizer,
      tryToken: tryToken,
      finallyToken: finallyToken,
      loc: loc
    })
  }

  createWhileStatement(
    test: SlimeExpression,
    body: SlimeStatement,
    loc?: SubhutiSourceLocation,
    whileToken?: SlimeWhileToken,
    lParenToken?: SlimeLParenToken,
    rParenToken?: SlimeRParenToken
  ): SlimeWhileStatement {
    return this.commonLocType({
      type: SlimeAstType.WhileStatement,
      test: test,
      body: body,
      whileToken: whileToken,
      lParenToken: lParenToken,
      rParenToken: rParenToken,
      loc: loc
    })
  }

  createDoWhileStatement(
    body: SlimeStatement,
    test: SlimeExpression,
    loc?: SubhutiSourceLocation,
    doToken?: SlimeDoToken,
    whileToken?: SlimeWhileToken,
    lParenToken?: SlimeLParenToken,
    rParenToken?: SlimeRParenToken,
    semicolonToken?: SlimeSemicolonToken
  ): SlimeDoWhileStatement {
    return this.commonLocType({
      type: SlimeAstType.DoWhileStatement,
      body: body,
      test: test,
      doToken: doToken,
      whileToken: whileToken,
      lParenToken: lParenToken,
      rParenToken: rParenToken,
      semicolonToken: semicolonToken,
      loc: loc
    })
  }

  createForStatement(
    body: SlimeStatement,
    init?: SlimeVariableDeclaration | SlimeExpression | null,
    test?: SlimeExpression | null,
    update?: SlimeExpression | null,
    loc?: SubhutiSourceLocation,
    forToken?: SlimeForToken,
    lParenToken?: SlimeLParenToken,
    rParenToken?: SlimeRParenToken,
    semicolon1Token?: SlimeSemicolonToken,
    semicolon2Token?: SlimeSemicolonToken
  ): SlimeForStatement {
    return this.commonLocType({
      type: SlimeAstType.ForStatement,
      init: init,
      test: test,
      update: update,
      body: body,
      forToken: forToken,
      lParenToken: lParenToken,
      rParenToken: rParenToken,
      semicolon1Token: semicolon1Token,
      semicolon2Token: semicolon2Token,
      loc: loc
    })
  }

  createForInStatement(
    left: SlimeVariableDeclaration | SlimePattern,
    right: SlimeExpression,
    body: SlimeStatement,
    loc?: SubhutiSourceLocation,
    forToken?: SlimeForToken,
    inToken?: SlimeInToken,
    lParenToken?: SlimeLParenToken,
    rParenToken?: SlimeRParenToken
  ): SlimeForInStatement {
    return this.commonLocType({
      type: SlimeAstType.ForInStatement,
      left: left,
      right: right,
      body: body,
      forToken: forToken,
      inToken: inToken,
      lParenToken: lParenToken,
      rParenToken: rParenToken,
      loc: loc
    })
  }

  createForOfStatement(
    left: SlimeVariableDeclaration | SlimePattern,
    right: SlimeExpression,
    body: SlimeStatement,
    isAwait: boolean = false,
    loc?: SubhutiSourceLocation,
    forToken?: SlimeForToken,
    ofToken?: SlimeOfToken,
    awaitToken?: SlimeAwaitToken,
    lParenToken?: SlimeLParenToken,
    rParenToken?: SlimeRParenToken
  ): SlimeForOfStatement {
    return this.commonLocType({
      type: SlimeAstType.ForOfStatement,
      left: left,
      right: right,
      body: body,
      await: isAwait,
      forToken: forToken,
      ofToken: ofToken,
      awaitToken: awaitToken,
      lParenToken: lParenToken,
      rParenToken: rParenToken,
      loc: loc
    })
  }

  createDebuggerStatement(loc?: SubhutiSourceLocation, debuggerToken?: SlimeDebuggerToken, semicolonToken?: SlimeSemicolonToken): SlimeDebuggerStatement {
    return this.commonLocType({
      type: SlimeAstType.DebuggerStatement,
      debuggerToken: debuggerToken,
      semicolonToken: semicolonToken,
      loc: loc
    })
  }

  createSwitchCase(
    consequent: SlimeStatement[],
    test?: SlimeExpression | null,
    loc?: SubhutiSourceLocation,
    caseToken?: SlimeCaseToken,
    defaultToken?: SlimeDefaultToken,
    colonToken?: SlimeColonToken
  ): SlimeSwitchCase {
    return this.commonLocType({
      type: SlimeAstType.SwitchCase,
      test: test,
      consequent: consequent,
      caseToken: caseToken,
      defaultToken: defaultToken,
      colonToken: colonToken,
      loc: loc
    })
  }

  createCatchClause(
    body: SlimeBlockStatement,
    param?: SlimePattern | null,
    loc?: SubhutiSourceLocation,
    catchToken?: SlimeCatchToken,
    lParenToken?: SlimeLParenToken,
    rParenToken?: SlimeRParenToken
  ): SlimeCatchClause {
    return this.commonLocType({
      type: SlimeAstType.CatchClause,
      param: param,
      body: body,
      catchToken: catchToken,
      lParenToken: lParenToken,
      rParenToken: rParenToken,
      loc: loc
    })
  }

  createStaticBlock(body: SlimeStatement[], loc?: SubhutiSourceLocation, lBraceToken?: SlimeLBraceToken, rBraceToken?: SlimeRBraceToken): SlimeStaticBlock {
    return this.commonLocType({
      type: SlimeAstType.StaticBlock,
      body: body,
      lBraceToken: lBraceToken,
      rBraceToken: rBraceToken,
      loc: loc
    })
  }

  // ============================================
  // Functions
  // ============================================

  createFunctionExpression(body: SlimeBlockStatement, id?: SlimeIdentifier | null, params?: SlimePattern[], loc?: SubhutiSourceLocation): SlimeFunctionExpression {
    return this.commonLocType({
      type: SlimeAstType.FunctionExpression,
      params: params || [],
      id: id,
      body: body,
      loc: loc
    })
  }

  // ============================================
  // Declarations
  // ============================================

  createVariableDeclaration(kind: SlimeVariableDeclarationKindToken, declarations: SlimeVariableDeclarator[], loc?: SubhutiSourceLocation): SlimeVariableDeclaration {
    return this.commonLocType({
      type: SlimeAstType.VariableDeclaration,
      declarations: declarations,
      kind: kind,
      loc: loc
    })
  }

  createVariableDeclarator(id: SlimePattern, assignToken?: SlimeAssignToken, init?: SlimeExpression | null, loc?: SubhutiSourceLocation): SlimeVariableDeclarator {
    return this.commonLocType({
      type: SlimeAstType.VariableDeclarator,
      id: id,
      assignToken: assignToken,
      init: init,
      loc: loc
    })
  }

  // ============================================
  // Patterns
  // ============================================

  createRestElement(
    argument: SlimePattern,
    loc?: SubhutiSourceLocation,
    ellipsisToken?: SlimeEllipsisToken
  ): SlimeRestElement {
    return this.commonLocType({
      type: SlimeAstType.RestElement,
      argument: argument,
      ellipsisToken: ellipsisToken,
      loc: loc
    })
  }

  createSpreadElement(
    argument: SlimeExpression,
    loc?: SubhutiSourceLocation,
    ellipsisToken?: SlimeEllipsisToken
  ): SlimeSpreadElement {
    return this.commonLocType({
      type: SlimeAstType.SpreadElement,
      argument: argument,
      ellipsisToken: ellipsisToken,
      loc: loc
    })
  }

  createObjectPattern(
    properties: Array<SlimeAssignmentProperty | SlimeRestElement>,
    loc?: SubhutiSourceLocation,
    lBraceToken?: SlimeLBraceToken,
    rBraceToken?: SlimeRBraceToken,
    commaTokens?: (SlimeCommaToken | undefined)[]
  ): SlimeObjectPattern {
    return this.commonLocType({
      type: SlimeAstType.ObjectPattern,
      properties: properties,
      lBraceToken: lBraceToken,
      rBraceToken: rBraceToken,
      commaTokens: commaTokens,
      loc: loc
    })
  }

  createArrayPattern(
    elements: Array<SlimePattern | null>,
    loc?: SubhutiSourceLocation,
    lBracketToken?: SlimeLBracketToken,
    rBracketToken?: SlimeRBracketToken,
    commaTokens?: (SlimeCommaToken | undefined)[]
  ): SlimeArrayPattern {
    return this.commonLocType({
      type: SlimeAstType.ArrayPattern,
      elements: elements,
      lBracketToken: lBracketToken,
      rBracketToken: rBracketToken,
      commaTokens: commaTokens,
      loc: loc
    })
  }

  createAssignmentPattern(
    left: SlimePattern,
    right: SlimeExpression,
    loc?: SubhutiSourceLocation
  ): SlimeAssignmentPattern {
    return this.commonLocType({
      type: SlimeAstType.AssignmentPattern,
      left: left,
      right: right,
      loc: loc
    })
  }

  createAssignmentProperty(
    key: SlimeExpression | SlimePrivateIdentifier,
    value: SlimePattern,
    shorthand: boolean = false,
    computed: boolean = false,
    loc?: SubhutiSourceLocation,
    colonToken?: SlimeColonToken,
    lBracketToken?: SlimeLBracketToken,
    rBracketToken?: SlimeRBracketToken
  ): SlimeAssignmentProperty {
    return this.commonLocType({
      type: SlimeAstType.Property,
      key: key,
      value: value,
      kind: "init",
      method: false,
      shorthand: shorthand,
      computed: computed,
      colonToken: colonToken,
      lBracketToken: lBracketToken,
      rBracketToken: rBracketToken,
      loc: loc
    })
  }

  // ============================================
  // Modules
  // ============================================

  createImportDeclaration(
    specifiers: Array<SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier>,
    source: SlimeStringLiteral,
    loc?: SubhutiSourceLocation,
    importToken?: SlimeImportToken,
    fromToken?: SlimeFromToken,
    lBraceToken?: SlimeLBraceToken,
    rBraceToken?: SlimeRBraceToken,
    semicolonToken?: SlimeSemicolonToken,
    commaTokens?: (SlimeCommaToken | undefined)[]
  ): SlimeImportDeclaration {
    return this.commonLocType({
      type: SlimeAstType.ImportDeclaration,
      source: source,
      specifiers: specifiers,
      importToken: importToken,
      fromToken: fromToken,
      lBraceToken: lBraceToken,
      rBraceToken: rBraceToken,
      semicolonToken: semicolonToken,
      commaTokens: commaTokens,
      loc: loc
    })
  }

  createImportSpecifier(
    local: SlimeIdentifier,
    imported: SlimeIdentifier | SlimeLiteral,
    loc?: SubhutiSourceLocation,
    asToken?: SlimeAsToken
  ): SlimeImportSpecifier {
    return this.commonLocType({
      type: SlimeAstType.ImportSpecifier,
      local: local,
      imported: imported,
      asToken: asToken,
      loc: loc
    })
  }

  createImportDefaultSpecifier(local: SlimeIdentifier, loc?: SubhutiSourceLocation): SlimeImportDefaultSpecifier {
    return this.commonLocType({
      type: SlimeAstType.ImportDefaultSpecifier,
      local: local,
      loc: loc
    })
  }

  createImportNamespaceSpecifier(
    local: SlimeIdentifier,
    loc?: SubhutiSourceLocation,
    asteriskToken?: SlimeAsteriskToken,
    asToken?: SlimeAsToken
  ): SlimeImportNamespaceSpecifier {
    return this.commonLocType({
      type: SlimeAstType.ImportNamespaceSpecifier,
      local: local,
      asteriskToken: asteriskToken,
      asToken: asToken,
      loc: loc
    })
  }

  createExportDefaultDeclaration(
    declaration: SlimeMaybeNamedFunctionDeclaration | SlimeMaybeNamedClassDeclaration | SlimeExpression,
    loc?: SubhutiSourceLocation,
    exportToken?: SlimeExportToken,
    defaultToken?: SlimeDefaultToken
  ): SlimeExportDefaultDeclaration {
    return this.commonLocType({
      type: SlimeAstType.ExportDefaultDeclaration,
      declaration: declaration,
      exportToken: exportToken,
      defaultToken: defaultToken,
      loc: loc
    })
  }

  createExportNamedDeclaration(
    declaration: SlimeDeclaration | null,
    specifiers: SlimeExportSpecifier[],
    source?: SlimeLiteral | null,
    loc?: SubhutiSourceLocation,
    exportToken?: SlimeExportToken,
    fromToken?: SlimeFromToken,
    lBraceToken?: SlimeLBraceToken,
    rBraceToken?: SlimeRBraceToken,
    semicolonToken?: SlimeSemicolonToken,
    commaTokens?: (SlimeCommaToken | undefined)[]
  ): SlimeExportNamedDeclaration {
    return this.commonLocType({
      type: SlimeAstType.ExportNamedDeclaration,
      declaration: declaration,
      specifiers: specifiers,
      source: source,
      exportToken: exportToken,
      fromToken: fromToken,
      lBraceToken: lBraceToken,
      rBraceToken: rBraceToken,
      semicolonToken: semicolonToken,
      commaTokens: commaTokens,
      loc: loc
    })
  }

  createExportSpecifier(
    local: SlimeIdentifier | SlimeLiteral,
    exported: SlimeIdentifier | SlimeLiteral,
    loc?: SubhutiSourceLocation,
    asToken?: SlimeAsToken
  ): SlimeExportSpecifier {
    return this.commonLocType({
      type: SlimeAstType.ExportSpecifier,
      local: local,
      exported: exported,
      asToken: asToken,
      loc: loc
    })
  }

  createExportAllDeclaration(
    source: SlimeLiteral,
    exported?: SlimeIdentifier | SlimeLiteral | null,
    loc?: SubhutiSourceLocation,
    exportToken?: SlimeExportToken,
    asteriskToken?: SlimeAsteriskToken,
    asToken?: SlimeAsToken,
    fromToken?: SlimeFromToken,
    semicolonToken?: SlimeSemicolonToken
  ): SlimeExportAllDeclaration {
    return this.commonLocType({
      type: SlimeAstType.ExportAllDeclaration,
      source: source,
      exported: exported,
      exportToken: exportToken,
      asteriskToken: asteriskToken,
      asToken: asToken,
      fromToken: fromToken,
      semicolonToken: semicolonToken,
      loc: loc
    })
  }

  createDirective(
    expression: SlimeLiteral,
    directive: string,
    loc?: SubhutiSourceLocation
  ): SlimeDirective {
    return this.commonLocType({
      type: SlimeAstType.ExpressionStatement,
      expression: expression,
      directive: directive,
      loc: loc
    })
  }

  // ============================================
  // Classes
  // ============================================

  createClassDeclaration(
    id: SlimeIdentifier | null,
    body: SlimeClassBody,
    superClass?: SlimeExpression | null,
    loc?: SubhutiSourceLocation,
    classToken?: SlimeClassToken,
    extendsToken?: SlimeExtendsToken
  ): SlimeClassDeclaration {
    return this.commonLocType({
      type: SlimeAstType.ClassDeclaration,
      id: id,
      body: body,
      superClass: superClass,
      classToken: classToken,
      extendsToken: extendsToken,
      loc: loc
    })
  }

  createClassBody(
    body: Array<SlimeMethodDefinition | SlimePropertyDefinition | SlimeStaticBlock>,
    loc?: SubhutiSourceLocation,
    lBraceToken?: SlimeLBraceToken,
    rBraceToken?: SlimeRBraceToken
  ): SlimeClassBody {
    return this.commonLocType({
      type: SlimeAstType.ClassBody,
      body: body,
      lBraceToken: lBraceToken,
      rBraceToken: rBraceToken,
      loc: loc
    })
  }

  createFunctionDeclaration(
    id: SlimeIdentifier | null,
    params: SlimePattern[],
    body: SlimeBlockStatement,
    generator: boolean = false,
    async: boolean = false,
    loc?: SubhutiSourceLocation,
    functionToken?: SlimeFunctionToken,
    asyncToken?: SlimeAsyncToken,
    asteriskToken?: SlimeAsteriskToken,
    lParenToken?: SlimeLParenToken,
    rParenToken?: SlimeRParenToken,
    commaTokens?: (SlimeCommaToken | undefined)[]
  ): SlimeFunctionDeclaration {
    return this.commonLocType({
      type: SlimeAstType.FunctionDeclaration,
      id: id,
      params: params,
      body: body,
      generator: generator,
      async: async,
      functionToken: functionToken,
      asyncToken: asyncToken,
      asteriskToken: asteriskToken,
      lParenToken: lParenToken,
      rParenToken: rParenToken,
      commaTokens: commaTokens,
      loc: loc
    })
  }

  createIdentifier(name: string, loc?: SubhutiSourceLocation): SlimeIdentifier {
    return this.commonLocType({
      type: SlimeAstType.Identifier,
      name: name,
      loc: loc
    })
  }

  createLiteral(value?: number | string): SlimeLiteral {
    let ast: SlimeLiteral
    if (value === undefined) {
      // ast = this.createNullLiteralToken()
    } else if (typeof value === "string") {
      ast = this.createStringLiteral(value)
    } else if (typeof value === "number") {
      ast = this.createNumericLiteral(value)
    }
    return ast
  }


  createNullLiteralToken(): SlimeNullLiteral {
    return this.commonLocType({
      type: SlimeAstType.NullLiteral,
      value: null
    })
  }


  createStringLiteral(value: string, loc?: SubhutiSourceLocation, raw?: string): SlimeStringLiteral {
    return this.commonLocType({
      type: SlimeAstType.StringLiteral,
      value: value.replace(/^['"]|['"]$/g, ''),
      raw: raw || value,  // 保存原始值（包含引号）
      loc: loc
    })
  }

  createNumericLiteral(value: number, raw?: string): SlimeNumericLiteral {
    return this.commonLocType({
      type: SlimeAstType.NumericLiteral,
      value: value,
      raw: raw || String(value)  // 保存原始值（保留格式如 0xFF）
    })
  }

  createBooleanLiteral(value: boolean, loc?: SubhutiSourceLocation): SlimeBooleanLiteral {
    return this.commonLocType({
      type: SlimeAstType.BooleanLiteral,
      value: value,
      loc: loc
    })
  }

  createRegExpLiteral(
    pattern: string,
    flags: string,
    raw?: string,
    loc?: SubhutiSourceLocation
  ): SlimeRegExpLiteral {
    return this.commonLocType({
      type: SlimeAstType.Literal,
      regex: {
        pattern: pattern,
        flags: flags
      },
      raw: raw || `/${pattern}/${flags}`,
      loc: loc
    })
  }

  createBigIntLiteral(
    bigint: string,
    raw?: string,
    loc?: SubhutiSourceLocation
  ): SlimeBigIntLiteral {
    return this.commonLocType({
      type: SlimeAstType.Literal,
      bigint: bigint,
      raw: raw || `${bigint}n`,
      loc: loc
    })
  }

  createTemplateLiteral(quasis: SlimeTemplateElement[], expressions: SlimeExpression[], loc?: SubhutiSourceLocation): SlimeTemplateLiteral {
    return this.commonLocType({
      type: SlimeAstType.TemplateLiteral,
      quasis: quasis,
      expressions: expressions,
      loc: loc
    })
  }

  createTemplateElement(tail: boolean, raw: string, cooked?: string | null, loc?: SubhutiSourceLocation): any {
    return this.commonLocType({
      type: SlimeAstType.TemplateElement,
      tail: tail,
      value: {
        raw: raw,
        cooked: cooked !== undefined ? cooked : raw
      },
      loc: loc
    })
  }

  createMethodDefinition(
    key: SlimeExpression | SlimePrivateIdentifier,
    value: SlimeFunctionExpression,
    kind: "constructor" | "method" | "get" | "set" = "method",
    computed: boolean = false,
    isStatic: boolean = false,
    loc?: SubhutiSourceLocation,
    staticToken?: SlimeStaticToken,
    getToken?: SlimeGetToken,
    setToken?: SlimeSetToken,
    asyncToken?: SlimeAsyncToken,
    asteriskToken?: SlimeAsteriskToken
  ): SlimeMethodDefinition {
    return this.commonLocType({
      type: SlimeAstType.MethodDefinition,
      key: key,
      value: value,
      kind: kind,
      computed: computed,
      static: isStatic,
      staticToken: staticToken,
      getToken: getToken,
      setToken: setToken,
      asyncToken: asyncToken,
      asteriskToken: asteriskToken,
      loc: loc
    })
  }

  createPropertyDefinition(
    key: SlimeExpression | SlimePrivateIdentifier,
    value?: SlimeExpression | null,
    computed: boolean = false,
    isStatic: boolean = false,
    loc?: SubhutiSourceLocation
  ): SlimePropertyDefinition {
    return this.commonLocType({
      type: SlimeAstType.PropertyDefinition,
      key: key,
      value: value ?? null,
      computed: computed,
      static: isStatic,
      loc: loc
    })
  }
}

const SlimeAstCreateUtil = new SlimeAstCreate()
export default SlimeAstCreateUtil

