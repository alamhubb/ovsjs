import type * as ESTree from "./estree";

export interface SlimeBaseNodeWithoutComments extends ESTree.BaseNodeWithoutComments {
    // Every leaf interface Slimethat extends ESTree.that, SlimeBaseNode must specify a type property.
    // The type property should be a string literal. For example, Identifier
    // has: `type: "Identifier"`
    type: string;
    loc?: SourceLocation | null | undefined;
    range?: [number, number] | undefined;
}

export interface SlimeBaseNode extends SlimeBaseNodeWithoutComments, ESTree.BaseNode {
    leadingComments?: SlimeComment[] | undefined;
    trailingComments?: SlimeComment[] | undefined;
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

export interface SlimeComment extends SlimeBaseNodeWithoutComments, ESTree.Comment {
    type: "Line" | "Block";
    value: string;
}

export interface SourceLocation {
    source?: string | null | undefined;
    start: Position;
    end: Position;
}

export interface Position {
    /** >= 1 */
    line: number;
    /** >= 0 */
    column: number;
}

export interface SlimeProgram extends SlimeBaseNode, ESTree.Program {
    type: "Program";
    sourceType: "script" | "module";
    body: Array<SlimeDirective | SlimeStatement | SlimeModuleDeclaration>;
    comments?: Comment[] | undefined;
}

export interface SlimeDirective extends SlimeBaseNode, ESTree.Directive {
    type: "ExpressionStatement";
    expression: SlimeLiteral;
    directive: string;
}

export interface SlimeBaseFunction extends SlimeBaseNode, ESTree.BaseFunction {
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

export interface SlimeBaseStatement extends SlimeBaseNode, ESTree.BaseStatement {
}

export interface SlimeEmptyStatement extends SlimeBaseStatement, ESTree.EmptyStatement {
    type: "EmptyStatement";
}

export interface SlimeBlockStatement extends SlimeBaseStatement, ESTree.BlockStatement {
    type: "BlockStatement";
    body: SlimeStatement[];
    innerComments?: Comment[] | undefined;
}

export interface SlimeStaticBlock extends ESTree.StaticBlock, Omit<SlimeBlockStatement, "type"> {
    type: "StaticBlock";
}

export interface SlimeExpressionStatement extends SlimeBaseStatement, ESTree.ExpressionStatement {
    type: "ExpressionStatement";
    expression: SlimeExpression;
}

export interface SlimeIfStatement extends SlimeBaseStatement, ESTree.IfStatement {
    type: "IfStatement";
    test: SlimeExpression;
    consequent: SlimeStatement;
    alternate?: SlimeStatement | null | undefined;
}

export interface SlimeLabeledStatement extends SlimeBaseStatement, ESTree.LabeledStatement {
    type: "LabeledStatement";
    label: SlimeIdentifier;
    body: SlimeStatement;
}

export interface SlimeBreakStatement extends SlimeBaseStatement, ESTree.BreakStatement {
    type: "BreakStatement";
    label?: SlimeIdentifier | null | undefined;
}

export interface SlimeContinueStatement extends SlimeBaseStatement, ESTree.ContinueStatement {
    type: "ContinueStatement";
    label?: SlimeIdentifier | null | undefined;
}

export interface SlimeWithStatement extends SlimeBaseStatement, ESTree.WithStatement {
    type: "WithStatement";
    object: SlimeExpression;
    body: SlimeStatement;
}

export interface SlimeSwitchStatement extends SlimeBaseStatement, ESTree.SwitchStatement {
    type: "SwitchStatement";
    discriminant: SlimeExpression;
    cases: SlimeSwitchCase[];
}

export interface SlimeReturnStatement extends SlimeBaseStatement, ESTree.ReturnStatement {
    type: "ReturnStatement";
    argument?: SlimeExpression | null | undefined;
}

export interface SlimeThrowStatement extends SlimeBaseStatement, ESTree.ThrowStatement {
    type: "ThrowStatement";
    argument: SlimeExpression;
}

export interface SlimeTryStatement extends SlimeBaseStatement, ESTree.TryStatement {
    type: "TryStatement";
    block: SlimeBlockStatement;
    handler?: SlimeCatchClause | null | undefined;
    finalizer?: SlimeBlockStatement | null | undefined;
}

export interface SlimeWhileStatement extends SlimeBaseStatement, ESTree.WhileStatement {
    type: "WhileStatement";
    test: SlimeExpression;
    body: SlimeStatement;
}

export interface SlimeDoWhileStatement extends SlimeBaseStatement, ESTree.DoWhileStatement {
    type: "DoWhileStatement";
    body: SlimeStatement;
    test: SlimeExpression;
}

export interface SlimeForStatement extends SlimeBaseStatement, ESTree.ForStatement {
    type: "ForStatement";
    init?: SlimeVariableDeclaration | SlimeExpression | null | undefined;
    test?: SlimeExpression | null | undefined;
    update?: SlimeExpression | null | undefined;
    body: SlimeStatement;
}

export interface SlimeBaseForXStatement extends SlimeBaseStatement, ESTree.BaseForXStatement {
    left: SlimeVariableDeclaration | SlimePattern;
    right: SlimeExpression;
    body: SlimeStatement;
}

export interface SlimeForInStatement extends SlimeBaseForXStatement, ESTree.ForInStatement {
    type: "ForInStatement";
}

export interface SlimeDebuggerStatement extends SlimeBaseStatement, ESTree.DebuggerStatement {
    type: "DebuggerStatement";
}

export type SlimeDeclaration = SlimeFunctionDeclaration | SlimeVariableDeclaration | SlimeClassDeclaration;

export interface SlimeBaseDeclaration extends SlimeBaseStatement, ESTree.BaseDeclaration {
}

export interface SlimeMaybeNamedFunctionDeclaration extends SlimeBaseFunction, SlimeBaseDeclaration, ESTree.MaybeNamedFunctionDeclaration {
    type: "FunctionDeclaration";
    /** It is null when a function declaration is a part of the `export default function` statement */
    id: SlimeIdentifier | null;
    body: SlimeBlockStatement;
}

export interface SlimeFunctionDeclaration extends SlimeMaybeNamedFunctionDeclaration, ESTree.FunctionDeclaration {
    id: SlimeIdentifier;
}

export interface SlimeVariableDeclaration extends SlimeBaseDeclaration, ESTree.VariableDeclaration {
    type: "VariableDeclaration";
    declarations: SlimeVariableDeclarator[];
    kind: "var" | "let" | "const";
}

export interface SlimeVariableDeclarator extends SlimeBaseNode, ESTree.VariableDeclarator {
    type: "VariableDeclarator";
    id: SlimePattern;
    init?: SlimeExpression | null | undefined;
}

export interface ExpressionMap {
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

export type SlimeExpression = ExpressionMap[keyof ExpressionMap];

export interface SlimeBaseExpression extends SlimeBaseNode, ESTree.BaseExpression {
}

export type SlimeChainElement = SlimeSimpleCallExpression | SlimeMemberExpression;

export interface SlimeChainExpression extends SlimeBaseExpression, ESTree.ChainExpression {
    type: "ChainExpression";
    expression: SlimeChainElement;
}

export interface SlimeThisExpression extends SlimeBaseExpression, ESTree.ThisExpression {
    type: "ThisExpression";
}

export interface SlimeArrayExpression extends SlimeBaseExpression, ESTree.ArrayExpression {
    type: "ArrayExpression";
    elements: Array<SlimeExpression | SlimeSpreadElement | null>;
}

export interface SlimeObjectExpression extends SlimeBaseExpression, ESTree.ObjectExpression {
    type: "ObjectExpression";
    properties: Array<SlimeProperty | SlimeSpreadElement>;
}

export interface SlimePrivateIdentifier extends SlimeBaseNode, ESTree.PrivateIdentifier {
    type: "PrivateIdentifier";
    name: string;
}

export interface SlimeProperty extends SlimeBaseNode, ESTree.Property {
    type: "Property";
    key: SlimeExpression | SlimePrivateIdentifier;
    value: SlimeExpression | SlimePattern; // Could be an AssignmentProperty
    kind: "init" | "get" | "set";
    method: boolean;
    shorthand: boolean;
    computed: boolean;
}

export interface SlimePropertyDefinition extends SlimeBaseNode, ESTree.PropertyDefinition {
    type: "PropertyDefinition";
    key: SlimeExpression | SlimePrivateIdentifier;
    value?: SlimeExpression | null | undefined;
    computed: boolean;
    static: boolean;
}

export interface SlimeFunctionExpression extends SlimeBaseFunction, SlimeBaseExpression, ESTree.FunctionExpression {
    id?: SlimeIdentifier | null | undefined;
    type: "FunctionExpression";
    body: SlimeBlockStatement;
}

export interface SlimeSequenceExpression extends SlimeBaseExpression, ESTree.SequenceExpression {
    type: "SequenceExpression";
    expressions: SlimeExpression[];
}

export interface SlimeUnaryExpression extends SlimeBaseExpression, ESTree.UnaryExpression {
    type: "UnaryExpression";
    operator: SlimeUnaryOperator;
    prefix: true;
    argument: SlimeExpression;
}

export interface SlimeBinaryExpression extends SlimeBaseExpression, ESTree.BinaryExpression {
    type: "BinaryExpression";
    operator: SlimeBinaryOperator;
    left: SlimeExpression | SlimePrivateIdentifier;
    right: SlimeExpression;
}

export interface SlimeAssignmentExpression extends SlimeBaseExpression, ESTree.AssignmentExpression {
    type: "AssignmentExpression";
    operator: SlimeAssignmentOperator;
    left: SlimePattern | SlimeMemberExpression;
    right: SlimeExpression;
}

export interface SlimeUpdateExpression extends SlimeBaseExpression, ESTree.UpdateExpression {
    type: "UpdateExpression";
    operator: SlimeUpdateOperator;
    argument: SlimeExpression;
    prefix: boolean;
}

export interface SlimeLogicalExpression extends SlimeBaseExpression, ESTree.LogicalExpression {
    type: "LogicalExpression";
    operator: SlimeLogicalOperator;
    left: SlimeExpression;
    right: SlimeExpression;
}

export interface SlimeConditionalExpression extends SlimeBaseExpression, ESTree.ConditionalExpression {
    type: "ConditionalExpression";
    test: SlimeExpression;
    alternate: SlimeExpression;
    consequent: SlimeExpression;
}

export interface SlimeBaseCallExpression extends SlimeBaseExpression, ESTree.BaseCallExpression {
    callee: SlimeExpression | SlimeSuper;
    arguments: Array<SlimeExpression | SlimeSpreadElement>;
}

export type SlimeCallExpression = SlimeSimpleCallExpression | SlimeNewExpression;

export interface SlimeSimpleCallExpression extends SlimeBaseCallExpression, ESTree.SimpleCallExpression {
    type: "CallExpression";
    optional: boolean;
}

export interface SlimeNewExpression extends SlimeBaseCallExpression, ESTree.NewExpression {
    type: "NewExpression";
}

export interface SlimeMemberExpression extends SlimeBaseExpression, SlimeBasePattern, ESTree.MemberExpression {
    type: "MemberExpression";
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

export interface SlimeBasePattern extends SlimeBaseNode, ESTree.BasePattern {
}

export interface SlimeSwitchCase extends SlimeBaseNode, ESTree.SwitchCase {
    type: "SwitchCase";
    test?: SlimeExpression | null | undefined;
    consequent: SlimeStatement[];
}

export interface SlimeCatchClause extends SlimeBaseNode, ESTree.CatchClause {
    type: "CatchClause";
    param: SlimePattern | null;
    body: SlimeBlockStatement;
}

export interface SlimeIdentifier extends SlimeBaseNode, SlimeBaseExpression, SlimeBasePattern, ESTree.Identifier {
    type: "Identifier";
    name: string;
}

export type SlimeLiteral = SlimeSimpleLiteral | SlimeRegExpLiteral | SlimeBigIntLiteral;

export interface SlimeSimpleLiteral extends SlimeBaseNode, SlimeBaseExpression, ESTree.SimpleLiteral {
    type: "Literal";
    value: string | boolean | number | null;
    raw?: string | undefined;
}

export interface SlimeRegExpLiteral extends SlimeBaseNode, SlimeBaseExpression, ESTree.RegExpLiteral {
    type: "Literal";
    value?: RegExp | null | undefined;
    regex: {
        pattern: string;
        flags: string;
    };
    raw?: string | undefined;
}

export interface SlimeBigIntLiteral extends SlimeBaseNode, SlimeBaseExpression, ESTree.BigIntLiteral {
    type: "Literal";
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

export interface SlimeForOfStatement extends SlimeBaseForXStatement, ESTree.ForOfStatement {
    type: "ForOfStatement";
    await: boolean;
}

export interface SlimeSuper extends SlimeBaseNode, ESTree.Super {
    type: "Super";
}

export interface SlimeSpreadElement extends SlimeBaseNode, ESTree.SpreadElement {
    type: "SpreadElement";
    argument: SlimeExpression;
}

export interface SlimeArrowFunctionExpression extends SlimeBaseExpression, SlimeBaseFunction, ESTree.ArrowFunctionExpression {
    type: "ArrowFunctionExpression";
    expression: boolean;
    body: SlimeBlockStatement | SlimeExpression;
}

export interface SlimeYieldExpression extends SlimeBaseExpression, ESTree.YieldExpression {
    type: "YieldExpression";
    argument?: SlimeExpression | null | undefined;
    delegate: boolean;
}

export interface SlimeTemplateLiteral extends SlimeBaseExpression, ESTree.TemplateLiteral {
    type: "TemplateLiteral";
    quasis: SlimeTemplateElement[];
    expressions: SlimeExpression[];
}

export interface SlimeTaggedTemplateExpression extends SlimeBaseExpression, ESTree.TaggedTemplateExpression {
    type: "TaggedTemplateExpression";
    tag: SlimeExpression;
    quasi: SlimeTemplateLiteral;
}

export interface SlimeTemplateElement extends SlimeBaseNode, ESTree.TemplateElement {
    type: "TemplateElement";
    tail: boolean;
    value: {
        /** It is null when the template literal is tagged and the text has an invalid escape (e.g. - tag`\unicode and \u{55}`) */
        cooked?: string | null | undefined;
        raw: string;
    };
}

export interface SlimeAssignmentProperty extends SlimeProperty, ESTree.AssignmentProperty {
    value: Pattern;
    kind: "init";
    method: boolean; // false
}

export interface SlimeObjectPattern extends SlimeBasePattern, ESTree.ObjectPattern {
    type: "ObjectPattern";
    properties: Array<SlimeAssignmentProperty | SlimeRestElement>;
}

export interface SlimeArrayPattern extends SlimeBasePattern, ESTree.ArrayPattern {
    type: "ArrayPattern";
    elements: Array<SlimePattern | null>;
}

export interface SlimeRestElement extends SlimeBasePattern, ESTree.RestElement {
    type: "RestElement";
    argument: SlimePattern;
}

export interface SlimeAssignmentPattern extends SlimeBasePattern, ESTree.AssignmentPattern {
    type: "AssignmentPattern";
    left: SlimePattern;
    right: SlimeExpression;
}

export type SlimeClass = SlimeClassDeclaration | SlimeClassExpression;

export interface SlimeBaseClass extends SlimeBaseNode, ESTree.BaseClass {
    superClass?: SlimeExpression | null | undefined;
    body: SlimeClassBody;
}

export interface SlimeClassBody extends SlimeBaseNode, ESTree.ClassBody {
    type: "ClassBody";
    body: Array<SlimeMethodDefinition | PropertyDefinition | SlimeStaticBlock>;
}

export interface SlimeMethodDefinition extends SlimeBaseNode, ESTree.MethodDefinition {
    type: "MethodDefinition";
    key: SlimeExpression | SlimePrivateIdentifier;
    value: SlimeFunctionExpression;
    kind: "constructor" | "method" | "get" | "set";
    computed: boolean;
    static: boolean;
}

export interface SlimeMaybeNamedClassDeclaration extends SlimeBaseClass, SlimeBaseDeclaration, ESTree.MaybeNamedClassDeclaration {
    type: "ClassDeclaration";
    /** It is null when a class declaration is a part of the `export default class` statement */
    id: SlimeIdentifier | null;
}

export interface SlimeClassDeclaration extends SlimeMaybeNamedClassDeclaration, ESTree.ClassDeclaration {
    id: SlimeIdentifier;
}

export interface SlimeClassExpression extends SlimeBaseClass, SlimeBaseExpression, ESTree.ClassExpression {
    type: "ClassExpression";
    id?: SlimeIdentifier | null | undefined;
}

export interface SlimeMetaProperty extends SlimeBaseExpression, ESTree.MetaProperty {
    type: "MetaProperty";
    meta: SlimeIdentifier;
    property: SlimeIdentifier;
}

export type SlimeModuleDeclaration =
    | SlimeImportDeclaration
    | SlimeExportNamedDeclaration
    | SlimeExportDefaultDeclaration
    | SlimeExportAllDeclaration;

export interface SlimeBaseModuleDeclaration extends SlimeBaseNode, ESTree.BaseModuleDeclaration {
}

export type SlimeModuleSpecifier =
    SlimeImportSpecifier
    | SlimeImportDefaultSpecifier
    | SlimeImportNamespaceSpecifier
    | SlimeExportSpecifier;

export interface SlimeBaseModuleSpecifier extends SlimeBaseNode, ESTree.BaseModuleSpecifier {
    local: SlimeIdentifier;
}

export interface SlimeImportDeclaration extends SlimeBaseModuleDeclaration, ESTree.ImportDeclaration {
    type: "ImportDeclaration";
    specifiers: Array<SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier>;
    source: SlimeLiteral;
}

export interface SlimeImportSpecifier extends SlimeBaseModuleSpecifier, ESTree.ImportSpecifier {
    type: "ImportSpecifier";
    imported: SlimeIdentifier | SlimeLiteral;
}

export interface SlimeImportExpression extends SlimeBaseExpression, ESTree.ImportExpression {
    type: "ImportExpression";
    source: SlimeExpression;
}

export interface SlimeImportDefaultSpecifier extends SlimeBaseModuleSpecifier, ESTree.ImportDefaultSpecifier {
    type: "ImportDefaultSpecifier";
}

export interface SlimeImportNamespaceSpecifier extends SlimeBaseModuleSpecifier, ESTree.ImportNamespaceSpecifier {
    type: "ImportNamespaceSpecifier";
}

export interface SlimeExportNamedDeclaration extends SlimeBaseModuleDeclaration, ESTree.ExportNamedDeclaration {
    type: "ExportNamedDeclaration";
    declaration?: SlimeDeclaration | null | undefined;
    specifiers: SlimeExportSpecifier[];
    source?: SlimeLiteral | null | undefined;
}

export interface SlimeExportSpecifier extends ESTree.ExportSpecifier, Omit<SlimeBaseModuleSpecifier, "local"> {
    type: "ExportSpecifier";
    local: SlimeIdentifier | SlimeLiteral;
    exported: SlimeIdentifier | SlimeLiteral;
}

export interface SlimeExportDefaultDeclaration extends SlimeBaseModuleDeclaration, ESTree.ExportDefaultDeclaration {
    type: "ExportDefaultDeclaration";
    declaration: SlimeMaybeNamedFunctionDeclaration | SlimeMaybeNamedClassDeclaration | SlimeExpression;
}

export interface SlimeExportAllDeclaration extends SlimeBaseModuleDeclaration, ESTree.ExportAllDeclaration {
    type: "ExportAllDeclaration";
    exported: SlimeIdentifier | SlimeLiteral | null;
    source: SlimeLiteral;
}

export interface SlimeAwaitExpression extends SlimeBaseExpression, ESTree.AwaitExpression {
    type: "AwaitExpression";
    argument: SlimeExpression;
}
