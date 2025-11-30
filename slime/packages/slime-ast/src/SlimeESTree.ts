import type * as ESTree from "estree";
import {SlimeAstType} from "./SlimeAstType.ts";
import {SlimeTokenType} from "./SlimeTokenType.ts";
import type {SubhutiSourceLocation} from "subhuti/src/struct/SubhutiCst.ts";

/**
 * 辅助类型：排除 ESTree 类型中与 Slime 冲突的属性
 * - loc: 使用 SubhutiSourceLocation 替代 SourceLocation
 * - leadingComments/trailingComments: 使用 SlimeComment[] 替代 Comment[]
 * - K: 可选的额外排除属性
 */
type SlimeExtends<T, K extends keyof any = never> = Omit<T, 'loc' | 'leadingComments' | 'trailingComments' | K>

export interface SlimeBaseNodeWithoutComments extends SlimeExtends<ESTree.BaseNodeWithoutComments> {
    // Every leaf interface Slimethat extends ESTree.that, SlimeBaseNode must specify a type property.
    // The type property should be a string literal. For example, Identifier
    // has: `type: "Identifier"`
    type: string;
    loc?: SubhutiSourceLocation | null | undefined;
    range?: [number, number] | undefined;
}

export interface SlimeBaseNode extends SlimeBaseNodeWithoutComments, SlimeExtends<ESTree.BaseNode> {
    leadingComments?: SlimeComment[] | undefined;
    trailingComments?: SlimeComment[] | undefined;
}

// ============================================
// Token 节点基础类型
// ============================================

/**
 * Token 节点基础类型
 * 所有 token 节点都继承此类型，包含 value 和位置信息
 */
export interface SlimeTokenNode extends SlimeBaseNodeWithoutComments {
    /** Token 原始值 */
    value: string;
}

// ============================================
// 变量声明关键字 Token
// ============================================

export interface SlimeVarToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Var;
    value: "var";
}

export interface SlimeLetToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Let;
    value: "let";
}

export interface SlimeConstToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Const;
    value: "const";
}

/** 变量声明关键字 Token 联合类型 */
export type SlimeVariableDeclarationKindToken = SlimeVarToken | SlimeLetToken | SlimeConstToken;

// ============================================
// 赋值运算符 Token
// ============================================

export interface SlimeAssignToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Assign;
    value: "=";
}

// ============================================
// 标点符号 Token
// ============================================

export interface SlimeSemicolonToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Semicolon;
    value: ";";
}

export interface SlimeLBraceToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.LBrace;
    value: "{";
}

export interface SlimeRBraceToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.RBrace;
    value: "}";
}

export interface SlimeLBracketToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.LBracket;
    value: "[";
}

export interface SlimeRBracketToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.RBracket;
    value: "]";
}

export interface SlimeLParenToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.LParen;
    value: "(";
}

export interface SlimeRParenToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.RParen;
    value: ")";
}

export interface SlimeCommaToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Comma;
    value: ",";
}

export interface SlimeColonToken extends SlimeTokenNode {
    type: typeof SlimeTokenType.Colon;
    value: ":";
}

// ============================================
// 通用 Token 组合接口
// ============================================

/** 包含大括号的节点 { } */
export interface SlimeBraceTokens {
    lBraceToken?: SlimeLBraceToken;
    rBraceToken?: SlimeRBraceToken;
}

/** 包含中括号的节点 [ ] */
export interface SlimeBracketTokens {
    lBracketToken?: SlimeLBracketToken;
    rBracketToken?: SlimeRBracketToken;
}

/** 包含小括号的节点 ( ) */
export interface SlimeParenTokens {
    lParenToken?: SlimeLParenToken;
    rParenToken?: SlimeRParenToken;
}

/** 函数结构：小括号 + 大括号 */
export interface SlimeFunctionTokens extends SlimeParenTokens, SlimeBraceTokens {}

/** 包含冒号的节点 */
export interface SlimeColonTokens {
    colonToken?: SlimeColonToken;
}

export interface SlimeNodeMap {
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

export type SlimeNode = SlimeNodeMap[keyof SlimeNodeMap];

export interface SlimeComment extends SlimeBaseNodeWithoutComments, SlimeExtends<ESTree.Comment> {
    type: "Line" | "Block";
    value: string;
}

export interface SlimeProgram extends SlimeBaseNode, SlimeExtends<ESTree.Program> {
    type: typeof SlimeAstType.Program;
    sourceType: "script" | "module";
    body: Array<SlimeDirective | SlimeStatement | SlimeModuleDeclaration>;
    comments?: SlimeComment[] | undefined;
}

export interface SlimeDirective extends SlimeBaseNode, SlimeExtends<ESTree.Directive> {
    type: typeof SlimeAstType.ExpressionStatement;
    expression: SlimeLiteral;
    directive: string;
}

export interface SlimeBaseFunction extends SlimeBaseNode, SlimeExtends<ESTree.BaseFunction> {
    params: SlimePattern[];
    generator?: boolean | undefined;
    async?: boolean | undefined;
    // The body is either BlockStatement or Expression because arrow functions
    // can have a body that's either. FunctionDeclarations and
    // FunctionExpressions have only BlockStatement bodies.
    body: SlimeBlockStatement | SlimeExpression;
}

export type SlimeFunction = SlimeFunctionDeclaration | SlimeFunctionExpression | SlimeArrowFunctionExpression;

export type SlimeStatement =
    | SlimeExpressionStatement
    | SlimeBlockStatement
    | SlimeStaticBlock
    | SlimeEmptyStatement
    | SlimeDebuggerStatement
    | SlimeWithStatement
    | SlimeReturnStatement
    | SlimeLabeledStatement
    | SlimeBreakStatement
    | SlimeContinueStatement
    | SlimeIfStatement
    | SlimeSwitchStatement
    | SlimeThrowStatement
    | SlimeTryStatement
    | SlimeWhileStatement
    | SlimeDoWhileStatement
    | SlimeForStatement
    | SlimeForInStatement
    | SlimeForOfStatement
    | SlimeDeclaration;

export interface SlimeBaseStatement extends SlimeBaseNode, SlimeExtends<ESTree.BaseStatement> {
}

export interface SlimeEmptyStatement extends SlimeBaseStatement, SlimeExtends<ESTree.EmptyStatement> {
    type: typeof SlimeAstType.EmptyStatement;
    /** 分号 Token，包含位置信息 */
    semicolonToken?: SlimeSemicolonToken;
}

export interface SlimeBlockStatement extends SlimeBaseStatement, SlimeExtends<ESTree.BlockStatement>, SlimeBraceTokens {
    type: typeof SlimeAstType.BlockStatement;
    body: SlimeStatement[];
    innerComments?: SlimeComment[] | undefined;
}

export interface SlimeStaticBlock extends SlimeExtends<ESTree.StaticBlock, 'innerComments'>, Omit<SlimeBlockStatement, 'type' | 'body'> {
    type: typeof SlimeAstType.StaticBlock;
}

export interface SlimeExpressionStatement extends SlimeBaseStatement, SlimeExtends<ESTree.ExpressionStatement> {
    type: typeof SlimeAstType.ExpressionStatement;
    expression: SlimeExpression;
    /** 分号 Token，包含位置信息 */
    semicolonToken?: SlimeSemicolonToken;
}

export interface SlimeIfStatement extends SlimeBaseStatement, SlimeExtends<ESTree.IfStatement> {
    type: typeof SlimeAstType.IfStatement;
    test: SlimeExpression;
    consequent: SlimeStatement;
    alternate?: SlimeStatement | null | undefined;
}

export interface SlimeLabeledStatement extends SlimeBaseStatement, SlimeExtends<ESTree.LabeledStatement> {
    type: typeof SlimeAstType.LabeledStatement;
    label: SlimeIdentifier;
    body: SlimeStatement;
}

export interface SlimeBreakStatement extends SlimeBaseStatement, SlimeExtends<ESTree.BreakStatement> {
    type: typeof SlimeAstType.BreakStatement;
    label?: SlimeIdentifier | null | undefined;
    /** 分号 Token，包含位置信息 */
    semicolonToken?: SlimeSemicolonToken;
}

export interface SlimeContinueStatement extends SlimeBaseStatement, SlimeExtends<ESTree.ContinueStatement> {
    type: typeof SlimeAstType.ContinueStatement;
    label?: SlimeIdentifier | null | undefined;
    /** 分号 Token，包含位置信息 */
    semicolonToken?: SlimeSemicolonToken;
}

export interface SlimeWithStatement extends SlimeBaseStatement, SlimeExtends<ESTree.WithStatement> {
    type: typeof SlimeAstType.WithStatement;
    object: SlimeExpression;
    body: SlimeStatement;
}

export interface SlimeSwitchStatement extends SlimeBaseStatement, SlimeExtends<ESTree.SwitchStatement> {
    type: typeof SlimeAstType.SwitchStatement;
    discriminant: SlimeExpression;
    cases: SlimeSwitchCase[];
}

export interface SlimeReturnStatement extends SlimeBaseStatement, SlimeExtends<ESTree.ReturnStatement> {
    type: typeof SlimeAstType.ReturnStatement;
    argument?: SlimeExpression | null | undefined;
    /** 分号 Token，包含位置信息 */
    semicolonToken?: SlimeSemicolonToken;
}

export interface SlimeThrowStatement extends SlimeBaseStatement, SlimeExtends<ESTree.ThrowStatement> {
    type: typeof SlimeAstType.ThrowStatement;
    argument: SlimeExpression;
    /** 分号 Token，包含位置信息 */
    semicolonToken?: SlimeSemicolonToken;
}

export interface SlimeTryStatement extends SlimeBaseStatement, SlimeExtends<ESTree.TryStatement> {
    type: typeof SlimeAstType.TryStatement;
    block: SlimeBlockStatement;
    handler?: SlimeCatchClause | null | undefined;
    finalizer?: SlimeBlockStatement | null | undefined;
}

export interface SlimeWhileStatement extends SlimeBaseStatement, SlimeExtends<ESTree.WhileStatement> {
    type: typeof SlimeAstType.WhileStatement;
    test: SlimeExpression;
    body: SlimeStatement;
}

export interface SlimeDoWhileStatement extends SlimeBaseStatement, SlimeExtends<ESTree.DoWhileStatement> {
    type: typeof SlimeAstType.DoWhileStatement;
    body: SlimeStatement;
    test: SlimeExpression;
    /** 分号 Token，包含位置信息 */
    semicolonToken?: SlimeSemicolonToken;
}

export interface SlimeForStatement extends SlimeBaseStatement, SlimeExtends<ESTree.ForStatement> {
    type: typeof SlimeAstType.ForStatement;
    init?: SlimeVariableDeclaration | SlimeExpression | null | undefined;
    test?: SlimeExpression | null | undefined;
    update?: SlimeExpression | null | undefined;
    body: SlimeStatement;
}

export interface SlimeBaseForXStatement extends SlimeBaseStatement, SlimeExtends<ESTree.BaseForXStatement> {
    left: SlimeVariableDeclaration | SlimePattern;
    right: SlimeExpression;
    body: SlimeStatement;
}

export interface SlimeForInStatement extends SlimeBaseForXStatement, Omit<SlimeExtends<ESTree.ForInStatement>, 'body' | 'left' | 'right'> {
    type: typeof SlimeAstType.ForInStatement;
}

export interface SlimeDebuggerStatement extends SlimeBaseStatement, SlimeExtends<ESTree.DebuggerStatement> {
    type: typeof SlimeAstType.DebuggerStatement;
    /** 分号 Token，包含位置信息 */
    semicolonToken?: SlimeSemicolonToken;
}

export type SlimeDeclaration = SlimeFunctionDeclaration | SlimeVariableDeclaration | SlimeClassDeclaration;

export interface SlimeBaseDeclaration extends SlimeBaseStatement, SlimeExtends<ESTree.BaseDeclaration> {
}

export interface SlimeMaybeNamedFunctionDeclaration extends SlimeBaseFunction, SlimeBaseDeclaration, Omit<SlimeExtends<ESTree.MaybeNamedFunctionDeclaration>, 'params'> {
    type: typeof SlimeAstType.FunctionDeclaration;
    /** It is null when a function declaration is a part of the `export default function` statement */
    id: SlimeIdentifier | null;
    body: SlimeBlockStatement;
}

export interface SlimeFunctionDeclaration extends SlimeMaybeNamedFunctionDeclaration, Omit<SlimeExtends<ESTree.FunctionDeclaration>, 'body' | 'params'> {
    id: SlimeIdentifier;
}

export interface SlimeVariableDeclaration extends SlimeBaseDeclaration, SlimeExtends<ESTree.VariableDeclaration> {
    type: typeof SlimeAstType.VariableDeclaration;
    declarations: SlimeVariableDeclarator[];
    kind: "var" | "let" | "const";
    /** 变量声明关键字 Token，包含位置信息 */
    kindToken?: SlimeVariableDeclarationKindToken;
    /** 分号 Token，包含位置信息 */
    semicolonToken?: SlimeSemicolonToken;
}

export interface SlimeVariableDeclarator extends SlimeBaseNode, SlimeExtends<ESTree.VariableDeclarator> {
    type: typeof SlimeAstType.VariableDeclarator;
    id: SlimePattern;
    init?: SlimeExpression | null | undefined;
    /** 赋值符号 Token，包含位置信息 */
    assignToken?: SlimeAssignToken;
}

export interface SlimeExpressionMap {
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

export type SlimeExpression = ESTree.Expression & SlimeExpressionMap[keyof SlimeExpressionMap];

export interface SlimeBaseExpression extends SlimeBaseNode, SlimeExtends<ESTree.BaseExpression> {
}

export type SlimeChainElement = SlimeSimpleCallExpression | SlimeMemberExpression;

export interface SlimeChainExpression extends SlimeBaseExpression, SlimeExtends<ESTree.ChainExpression> {
    type: typeof SlimeAstType.ChainExpression;
    expression: SlimeChainElement;
}

export interface SlimeThisExpression extends SlimeBaseExpression, SlimeExtends<ESTree.ThisExpression> {
    type: typeof SlimeAstType.ThisExpression;
}

export interface SlimeArrayExpression extends SlimeBaseExpression, SlimeExtends<ESTree.ArrayExpression>, SlimeBracketTokens {
    type: typeof SlimeAstType.ArrayExpression;
    elements: Array<SlimeExpression | SlimeSpreadElement | null>;
    /** commaTokens[i] 对应 elements[i] 后面的逗号 */
    commaTokens?: (SlimeCommaToken | undefined)[];
}

export interface SlimeObjectExpression extends SlimeBaseExpression, SlimeExtends<ESTree.ObjectExpression>, SlimeBraceTokens {
    type: typeof SlimeAstType.ObjectExpression;
    properties: Array<SlimeProperty | SlimeSpreadElement>;
    /** commaTokens[i] 对应 properties[i] 后面的逗号 */
    commaTokens?: (SlimeCommaToken | undefined)[];
}

export interface SlimePrivateIdentifier extends SlimeBaseNode, SlimeExtends<ESTree.PrivateIdentifier> {
    type: typeof SlimeAstType.PrivateIdentifier;
    name: string;
}

export interface SlimeProperty extends SlimeBaseNode, SlimeExtends<ESTree.Property> {
    type: typeof SlimeAstType.Property;
    key: SlimeExpression | SlimePrivateIdentifier;
    value: SlimeExpression | SlimePattern; // Could be an AssignmentProperty
    kind: "init" | "get" | "set";
    method: boolean;
    shorthand: boolean;
    computed: boolean;
}

export interface SlimePropertyDefinition extends SlimeBaseNode, SlimeExtends<ESTree.PropertyDefinition> {
    type: typeof SlimeAstType.PropertyDefinition;
    key: SlimeExpression | SlimePrivateIdentifier;
    value?: SlimeExpression | null | undefined;
    computed: boolean;
    static: boolean;
}

export interface SlimeFunctionExpression extends SlimeBaseFunction, SlimeBaseExpression, Omit<SlimeExtends<ESTree.FunctionExpression>, 'params'> {
    id?: SlimeIdentifier | null | undefined;
    type: typeof SlimeAstType.FunctionExpression;
    body: SlimeBlockStatement;
}

export interface SlimeSequenceExpression extends SlimeBaseExpression, SlimeExtends<ESTree.SequenceExpression> {
    type: typeof SlimeAstType.SequenceExpression;
    expressions: SlimeExpression[];
}

export interface SlimeUnaryExpression extends SlimeBaseExpression, SlimeExtends<ESTree.UnaryExpression> {
    type: typeof SlimeAstType.UnaryExpression;
    operator: SlimeUnaryOperator;
    prefix: true;
    argument: SlimeExpression;
}

export interface SlimeBinaryExpression extends SlimeBaseExpression, SlimeExtends<ESTree.BinaryExpression> {
    type: typeof SlimeAstType.BinaryExpression;
    operator: SlimeBinaryOperator;
    left: SlimeExpression | SlimePrivateIdentifier;
    right: SlimeExpression;
}

export interface SlimeAssignmentExpression extends SlimeBaseExpression, SlimeExtends<ESTree.AssignmentExpression> {
    type: typeof SlimeAstType.AssignmentExpression;
    operator: SlimeAssignmentOperator;
    left: SlimePattern | SlimeMemberExpression;
    right: SlimeExpression;
}

export interface SlimeUpdateExpression extends SlimeBaseExpression, SlimeExtends<ESTree.UpdateExpression> {
    type: typeof SlimeAstType.UpdateExpression;
    operator: SlimeUpdateOperator;
    argument: SlimeExpression;
    prefix: boolean;
}

export interface SlimeLogicalExpression extends SlimeBaseExpression, SlimeExtends<ESTree.LogicalExpression> {
    type: typeof SlimeAstType.LogicalExpression;
    operator: SlimeLogicalOperator;
    left: SlimeExpression;
    right: SlimeExpression;
}

export interface SlimeConditionalExpression extends SlimeBaseExpression, SlimeExtends<ESTree.ConditionalExpression> {
    type: typeof SlimeAstType.ConditionalExpression;
    test: SlimeExpression;
    alternate: SlimeExpression;
    consequent: SlimeExpression;
}

export interface SlimeBaseCallExpression extends SlimeBaseExpression, SlimeExtends<ESTree.BaseCallExpression> {
    callee: SlimeExpression | SlimeSuper;
    arguments: Array<SlimeExpression | SlimeSpreadElement>;
}

export type SlimeCallExpression = SlimeSimpleCallExpression | SlimeNewExpression;

export interface SlimeSimpleCallExpression extends SlimeBaseCallExpression, Omit<SlimeExtends<ESTree.SimpleCallExpression>, 'arguments' | 'callee'> {
    type: typeof SlimeAstType.CallExpression;
    optional: boolean;
}

export interface SlimeNewExpression extends SlimeBaseCallExpression, Omit<SlimeExtends<ESTree.NewExpression>, 'arguments' | 'callee'> {
    type: typeof SlimeAstType.NewExpression;
}

export interface SlimeMemberExpression extends SlimeBaseExpression, SlimeBasePattern, SlimeExtends<ESTree.MemberExpression> {
    type: typeof SlimeAstType.MemberExpression;
    object: SlimeExpression | SlimeSuper;
    property: SlimeExpression | SlimePrivateIdentifier;
    computed: boolean;
    optional: boolean;
}

export type SlimePattern =
    SlimeIdentifier
    | SlimeObjectPattern
    | SlimeArrayPattern
    | SlimeRestElement
    | SlimeAssignmentPattern
    | SlimeMemberExpression;

export interface SlimeBasePattern extends SlimeBaseNode, SlimeExtends<ESTree.BasePattern> {
}

export interface SlimeSwitchCase extends SlimeBaseNode, SlimeExtends<ESTree.SwitchCase> {
    type: typeof SlimeAstType.SwitchCase;
    test?: SlimeExpression | null | undefined;
    consequent: SlimeStatement[];
}

export interface SlimeCatchClause extends SlimeBaseNode, SlimeExtends<ESTree.CatchClause> {
    type: typeof SlimeAstType.CatchClause;
    param: SlimePattern | null;
    body: SlimeBlockStatement;
}

export interface SlimeIdentifier extends SlimeBaseNode, SlimeBaseExpression, SlimeBasePattern, SlimeExtends<ESTree.Identifier> {
    type: typeof SlimeAstType.Identifier;
    name: string;
}

export type SlimeLiteral = SlimeSimpleLiteral | SlimeRegExpLiteral | SlimeBigIntLiteral;

export interface SlimeSimpleLiteral extends SlimeBaseNode, SlimeBaseExpression, SlimeExtends<ESTree.SimpleLiteral> {
    type: typeof SlimeAstType.Literal;
    value: string | boolean | number | null;
    raw?: string | undefined;
}

export interface SlimeRegExpLiteral extends SlimeBaseNode, SlimeBaseExpression, SlimeExtends<ESTree.RegExpLiteral> {
    type: typeof SlimeAstType.Literal;
    value?: RegExp | null | undefined;
    regex: {
        pattern: string;
        flags: string;
    };
    raw?: string | undefined;
}

export interface SlimeBigIntLiteral extends SlimeBaseNode, SlimeBaseExpression, SlimeExtends<ESTree.BigIntLiteral> {
    type: typeof SlimeAstType.Literal;
    value?: bigint | null | undefined;
    bigint: string;
    raw?: string | undefined;
}

export type SlimeUnaryOperator = "-" | "+" | "!" | "~" | "typeof" | "void" | "delete";

export type SlimeBinaryOperator =
    | "=="
    | "!="
    | "==="
    | "!=="
    | "<"
    | "<="
    | ">"
    | ">="
    | "<<"
    | ">>"
    | ">>>"
    | "+"
    | "-"
    | "*"
    | "/"
    | "%"
    | "**"
    | "|"
    | "^"
    | "&"
    | "in"
    | "instanceof";

export type SlimeLogicalOperator = "||" | "&&" | "??";

export type SlimeAssignmentOperator =
    | "="
    | "+="
    | "-="
    | "*="
    | "/="
    | "%="
    | "**="
    | "<<="
    | ">>="
    | ">>>="
    | "|="
    | "^="
    | "&="
    | "||="
    | "&&="
    | "??=";

export type SlimeUpdateOperator = "++" | "--";

export interface SlimeForOfStatement extends SlimeBaseForXStatement, Omit<SlimeExtends<ESTree.ForOfStatement>, 'body' | 'left' | 'right'> {
    type: typeof SlimeAstType.ForOfStatement;
    await: boolean;
}

export interface SlimeSuper extends SlimeBaseNode, SlimeExtends<ESTree.Super> {
    type: typeof SlimeAstType.Super;
}

export interface SlimeSpreadElement extends SlimeBaseNode, SlimeExtends<ESTree.SpreadElement> {
    type: typeof SlimeAstType.SpreadElement;
    argument: SlimeExpression;
}

export interface SlimeArrowFunctionExpression extends SlimeBaseExpression, SlimeBaseFunction, Omit<SlimeExtends<ESTree.ArrowFunctionExpression>, 'params'> {
    type: typeof SlimeAstType.ArrowFunctionExpression;
    expression: boolean;
    body: SlimeBlockStatement | SlimeExpression;
}

export interface SlimeYieldExpression extends SlimeBaseExpression, SlimeExtends<ESTree.YieldExpression> {
    type: typeof SlimeAstType.YieldExpression;
    argument?: SlimeExpression | null | undefined;
    delegate: boolean;
}

export interface SlimeTemplateLiteral extends SlimeBaseExpression, SlimeExtends<ESTree.TemplateLiteral> {
    type: typeof SlimeAstType.TemplateLiteral;
    quasis: SlimeTemplateElement[];
    expressions: SlimeExpression[];
}

export interface SlimeTaggedTemplateExpression extends SlimeBaseExpression, SlimeExtends<ESTree.TaggedTemplateExpression> {
    type: typeof SlimeAstType.TaggedTemplateExpression;
    tag: SlimeExpression;
    quasi: SlimeTemplateLiteral;
}

export interface SlimeTemplateElement extends SlimeBaseNode, SlimeExtends<ESTree.TemplateElement> {
    type: typeof SlimeAstType.TemplateElement;
    tail: boolean;
    value: {
        /** It is null when the template literal is tagged and the text has an invalid escape (e.g. - tag`\unicode and \u{55}`) */
        cooked?: string | null | undefined;
        raw: string;
    };
}

export interface SlimeAssignmentProperty extends SlimeProperty, Omit<SlimeExtends<ESTree.AssignmentProperty>, 'key'> {
    value: SlimePattern;
    kind: "init";
    method: boolean; // false
}

export interface SlimeObjectPattern extends SlimeBasePattern, SlimeExtends<ESTree.ObjectPattern>, SlimeBraceTokens {
    type: typeof SlimeAstType.ObjectPattern;
    properties: Array<SlimeAssignmentProperty | SlimeRestElement>;
    /** commaTokens[i] 对应 properties[i] 后面的逗号 */
    commaTokens?: (SlimeCommaToken | undefined)[];
}

export interface SlimeArrayPattern extends SlimeBasePattern, SlimeExtends<ESTree.ArrayPattern>, SlimeBracketTokens {
    type: typeof SlimeAstType.ArrayPattern;
    elements: Array<SlimePattern | null>;
    /** commaTokens[i] 对应 elements[i] 后面的逗号 */
    commaTokens?: (SlimeCommaToken | undefined)[];
}

export interface SlimeRestElement extends SlimeBasePattern, SlimeExtends<ESTree.RestElement> {
    type: typeof SlimeAstType.RestElement;
    argument: SlimePattern;
}

export interface SlimeAssignmentPattern extends SlimeBasePattern, SlimeExtends<ESTree.AssignmentPattern> {
    type: typeof SlimeAstType.AssignmentPattern;
    left: SlimePattern;
    right: SlimeExpression;
}

export type SlimeClass = SlimeClassDeclaration | SlimeClassExpression;

export interface SlimeBaseClass extends SlimeBaseNode, SlimeExtends<ESTree.BaseClass> {
    superClass?: SlimeExpression | null | undefined;
    body: SlimeClassBody;
}

export interface SlimeClassBody extends SlimeBaseNode, SlimeExtends<ESTree.ClassBody>, SlimeBraceTokens {
    type: typeof SlimeAstType.ClassBody;
    body: Array<SlimeMethodDefinition | SlimePropertyDefinition | SlimeStaticBlock>;
}

export interface SlimeMethodDefinition extends SlimeBaseNode, SlimeExtends<ESTree.MethodDefinition> {
    type: typeof SlimeAstType.MethodDefinition;
    key: SlimeExpression | SlimePrivateIdentifier;
    value: SlimeFunctionExpression;
    kind: "constructor" | "method" | "get" | "set";
    computed: boolean;
    static: boolean;
}

export interface SlimeMaybeNamedClassDeclaration extends SlimeBaseClass, SlimeBaseDeclaration, Omit<SlimeExtends<ESTree.MaybeNamedClassDeclaration>, 'body' | 'superClass'> {
    type: typeof SlimeAstType.ClassDeclaration;
    /** It is null when a class declaration is a part of the `export default class` statement */
    id: SlimeIdentifier | null;
}

export interface SlimeClassDeclaration extends SlimeMaybeNamedClassDeclaration, Omit<SlimeExtends<ESTree.ClassDeclaration>, 'body' | 'superClass'> {
    id: SlimeIdentifier;
}

export interface SlimeClassExpression extends SlimeBaseClass, SlimeBaseExpression, Omit<SlimeExtends<ESTree.ClassExpression>, 'body' | 'superClass'> {
    type: typeof SlimeAstType.ClassExpression;
    id?: SlimeIdentifier | null | undefined;
}

export interface SlimeMetaProperty extends SlimeBaseExpression, SlimeExtends<ESTree.MetaProperty> {
    type: typeof SlimeAstType.MetaProperty;
    meta: SlimeIdentifier;
    property: SlimeIdentifier;
}

export type SlimeModuleDeclaration =
    | SlimeImportDeclaration
    | SlimeExportNamedDeclaration
    | SlimeExportDefaultDeclaration
    | SlimeExportAllDeclaration;

export interface SlimeBaseModuleDeclaration extends SlimeBaseNode, SlimeExtends<ESTree.BaseModuleDeclaration> {
}

export type SlimeModuleSpecifier =
    SlimeImportSpecifier
    | SlimeImportDefaultSpecifier
    | SlimeImportNamespaceSpecifier
    | SlimeExportSpecifier;

export interface SlimeBaseModuleSpecifier extends SlimeBaseNode, SlimeExtends<ESTree.BaseModuleSpecifier> {
    local: SlimeIdentifier;
}

export interface SlimeImportDeclaration extends SlimeBaseModuleDeclaration, SlimeExtends<ESTree.ImportDeclaration> {
    type: typeof SlimeAstType.ImportDeclaration;
    specifiers: Array<SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier>;
    source: SlimeLiteral;
    /** 分号 Token，包含位置信息 */
    semicolonToken?: SlimeSemicolonToken;
}

export interface SlimeImportSpecifier extends SlimeBaseModuleSpecifier, SlimeExtends<ESTree.ImportSpecifier, 'local'> {
    type: typeof SlimeAstType.ImportSpecifier;
    imported: SlimeIdentifier | SlimeLiteral;
}

export interface SlimeImportExpression extends SlimeBaseExpression, SlimeExtends<ESTree.ImportExpression> {
    type: typeof SlimeAstType.ImportExpression;
    source: SlimeExpression;
}

export interface SlimeImportDefaultSpecifier extends SlimeBaseModuleSpecifier, SlimeExtends<ESTree.ImportDefaultSpecifier, 'local'> {
    type: typeof SlimeAstType.ImportDefaultSpecifier;
}

export interface SlimeImportNamespaceSpecifier extends SlimeBaseModuleSpecifier, SlimeExtends<ESTree.ImportNamespaceSpecifier, 'local'> {
    type: typeof SlimeAstType.ImportNamespaceSpecifier;
}

export interface SlimeExportNamedDeclaration extends SlimeBaseModuleDeclaration, SlimeExtends<ESTree.ExportNamedDeclaration> {
    type: typeof SlimeAstType.ExportNamedDeclaration;
    declaration?: SlimeDeclaration | null | undefined;
    specifiers: SlimeExportSpecifier[];
    source?: SlimeLiteral | null | undefined;
    /** 分号 Token，包含位置信息 */
    semicolonToken?: SlimeSemicolonToken;
}

export interface SlimeExportSpecifier extends SlimeExtends<ESTree.ExportSpecifier>, Omit<SlimeBaseModuleSpecifier, 'local'> {
    type: typeof SlimeAstType.ExportSpecifier;
    local: SlimeIdentifier | SlimeLiteral;
    exported: SlimeIdentifier | SlimeLiteral;
}

export interface SlimeExportDefaultDeclaration extends SlimeBaseModuleDeclaration, SlimeExtends<ESTree.ExportDefaultDeclaration> {
    type: typeof SlimeAstType.ExportDefaultDeclaration;
    declaration: SlimeMaybeNamedFunctionDeclaration | SlimeMaybeNamedClassDeclaration | SlimeExpression;
}

export interface SlimeExportAllDeclaration extends SlimeBaseModuleDeclaration, SlimeExtends<ESTree.ExportAllDeclaration> {
    type: typeof SlimeAstType.ExportAllDeclaration;
    exported: SlimeIdentifier | SlimeLiteral | null;
    source: SlimeLiteral;
    /** 分号 Token，包含位置信息 */
    semicolonToken?: SlimeSemicolonToken;
}

export interface SlimeAwaitExpression extends SlimeBaseExpression, SlimeExtends<ESTree.AwaitExpression> {
    type: typeof SlimeAstType.AwaitExpression;
    argument: SlimeExpression;
}
