import type * as ESTree from "./estree";

export interface SlimeBaseNodeWithoutComments extends ESTree.BaseNodeWithoutComments {
    // Every leaf interface Slimethat extends ESTree.that, SlimeBaseNode must specify a type property.
    // The type property should be a string literal. For example, Identifier
    // has: `type: "Identifier"`
    type: string;
    loc?: SourceLocation | null | undefined;
    range?: [number, number] | undefined;
}

export interface SlimeBaseNode extends ESTree.BaseNode, SlimeBaseNodeWithoutComments {
    leadingComments?: Comment[] | undefined;
    trailingComments?: Comment[] | undefined;
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

export type SlimeNode =  SlimeNodeMap[keyof SlimeNodeMap];

export interface SlimeComment extends ESTree.Comment, SlimeBaseNodeWithoutComments {
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

export interface SlimeProgram extends ESTree.Program, SlimeBaseNode {
    type: "Program";
    sourceType: "script" | "module";
    body: Array<SlimeDirective | SlimeStatement | SlimeModuleDeclaration>;
    comments?: Comment[] | undefined;
}

export interface SlimeDirective extends ESTree.Directive, SlimeBaseNode {
    type: "ExpressionStatement";
    expression: SlimeLiteral;
    directive: string;
}

export interface SlimeBaseFunction extends ESTree.BaseFunction, SlimeBaseNode {
    params: SlimePattern[];
    generator?: boolean | undefined;
    async?: boolean | undefined;
    // The body is either BlockStatement or Expression because arrow functions
    // can have a body that's either. FunctionDeclarations and
    // FunctionExpressions have only BlockStatement bodies.
    body: SlimeBlockStatement | SlimeExpression;
}

export type SlimeFunction =  SlimeFunctionDeclaration | SlimeFunctionExpression | SlimeArrowFunctionExpression;

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

export interface SlimeBaseStatement extends ESTree.BaseStatement, SlimeBaseNode {}

export interface SlimeEmptyStatement extends ESTree.EmptyStatement, SlimeBaseStatement {
    type: "EmptyStatement";
}

export interface SlimeBlockStatement extends ESTree.BlockStatement, SlimeBaseStatement {
    type: "BlockStatement";
    body: SlimeStatement[];
    innerComments?: Comment[] | undefined;
}

export interface SlimeStaticBlock extends ESTree.StaticBlock, Omit<ESTree.BlockStatement, "type"> {
    type: "StaticBlock";
}

export interface SlimeExpressionStatement extends ESTree.ExpressionStatement, SlimeBaseStatement {
    type: "ExpressionStatement";
    Slimeexpression: SlimeSlimeexpression;
}

export interface SlimeIfStatement extends ESTree.IfStatement, SlimeBaseStatement {
    type: "IfStatement";
    test: SlimeExpression;
    consequent: SlimeStatement;
    alternate?: SlimeStatement | null | undefined;
}

export interface SlimeLabeledStatement extends ESTree.LabeledStatement, SlimeBaseStatement {
    type: "LabeledStatement";
    label: SlimeIdentifier;
    body: SlimeStatement;
}

export interface SlimeBreakStatement extends ESTree.BreakStatement, SlimeBaseStatement {
    type: "BreakStatement";
    label?: SlimeIdentifier | null | undefined;
}

export interface SlimeContinueStatement extends ESTree.ContinueStatement, SlimeBaseStatement {
    type: "ContinueStatement";
    label?: SlimeIdentifier | null | undefined;
}

export interface SlimeWithStatement extends ESTree.WithStatement, SlimeBaseStatement {
    type: "WithStatement";
    object: SlimeExpression;
    body: SlimeStatement;
}

export interface SlimeSwitchStatement extends ESTree.SwitchStatement, SlimeBaseStatement {
    type: "SwitchStatement";
    discriminant: SlimeExpression;
    cases: SlimeSwitchCase[];
}

export interface SlimeReturnStatement extends ESTree.ReturnStatement, SlimeBaseStatement {
    type: "ReturnStatement";
    argument?: SlimeExpression | null | undefined;
}

export interface SlimeThrowStatement extends ESTree.ThrowStatement, SlimeBaseStatement {
    type: "ThrowStatement";
    argument: SlimeExpression;
}

export interface SlimeTryStatement extends ESTree.TryStatement, SlimeBaseStatement {
    type: "TryStatement";
    block: SlimeBlockStatement;
    handler?: SlimeCatchClause | null | undefined;
    finalizer?: SlimeBlockStatement | null | undefined;
}

export interface SlimeWhileStatement extends ESTree.WhileStatement, SlimeBaseStatement {
    type: "WhileStatement";
    test: SlimeExpression;
    body: SlimeStatement;
}

export interface SlimeDoWhileStatement extends ESTree.DoWhileStatement, SlimeBaseStatement {
    type: "DoWhileStatement";
    body: SlimeStatement;
    test: SlimeExpression;
}

export interface SlimeForStatement extends ESTree.ForStatement, SlimeBaseStatement {
    type: "ForStatement";
    init?: SlimeVariableDeclaration | SlimeExpression | null | undefined;
    test?: SlimeExpression | null | undefined;
    update?: SlimeExpression | null | undefined;
    body: SlimeStatement;
}

export interface SlimeBaseForXStatement extends ESTree.BaseForXStatement, SlimeBaseStatement {
    left: SlimeVariableDeclaration | Pattern;
    right: SlimeExpression;
    body: SlimeStatement;
}

export interface SlimeForInStatement extends ESTree.ForInStatement, SlimeBaseForXStatement {
    type: "ForInStatement";
}

export interface SlimeDebuggerStatement extends ESTree.DebuggerStatement, SlimeBaseStatement {
    type: "DebuggerStatement";
}

export type SlimeDeclaration =  SlimeFunctionDeclaration | SlimeVariableDeclaration | SlimeClassDeclaration;

export interface SlimeBaseDeclaration extends ESTree.BaseDeclaration, SlimeBaseStatement {}

export interface SlimeMaybeNamedFunctionDeclaration extends ESTree.SlimeMaybeNamedFunctionDeclaration, SlimeMaybeNamedFunctionDeclaration, SlimeBaseFunction, SlimeBaseDeclaration {
    type: "FunctionDeclaration";
    /** It is null when a function declaration is a part of the `export default function` statement */
    id: SlimeIdentifier | null;
    body: SlimeBlockStatement;
}

export interface SlimeFunctionDeclaration extends ESTree.FunctionDeclaration, SlimeMaybeNamedFunctionDeclaration {
    id: SlimeIdentifier;
}

export interface SlimeVariableDeclaration extends ESTree.VariableDeclaration, SlimeBaseDeclaration {
    type: "VariableDeclaration";
    declarations: SlimeVariableDeclarator[];
    kind: "var" | "let" | "const";
}

export interface SlimeVariableDeclarator extends ESTree.VariableDeclarator, SlimeBaseNode {
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

export type SlimeExpression =  ExpressionMap[keyof ExpressionMap];

export interface SlimeBaseExpression extends ESTree.BaseExpression, SlimeBaseNode {}

export type SlimeChainElement =  SlimeSimpleCallExpression | SlimeMemberExpression;

export interface SlimeChainExpression extends ESTree.ChainExpression, SlimeBaseExpression {
    type: "ChainExpression";
    expression: SlimeChainElement;
}

export interface SlimeThisExpression extends ESTree.ThisExpression, SlimeBaseExpression {
    type: "ThisExpression";
}

export interface SlimeArrayExpression extends ESTree.ArrayExpression, SlimeBaseExpression {
    type: "ArrayExpression";
    elements: Array<SlimeExpression | SlimeSpreadElement | null>;
}

export interface SlimeObjectExpression extends ESTree.ObjectExpression, SlimeBaseExpression {
    type: "ObjectExpression";
    properties: Array<SlimeProperty | SlimeSpreadElement>;
}

export interface SlimePrivateIdentifier extends ESTree.PrivateIdentifier, SlimeBaseNode {
    type: "PrivateIdentifier";
    name: string;
}

export interface SlimeProperty extends ESTree.Property, SlimeBaseNode {
    type: "Property";
    key: SlimeExpression | SlimePrivateIdentifier;
    value: SlimeExpression | SlimePattern; // Could be an AssignmentProperty
    kind: "init" | "get" | "set";
    method: boolean;
    shorthand: boolean;
    computed: boolean;
}

export interface SlimePropertyDefinition extends ESTree.PropertyDefinition, SlimeBaseNode {
    type: "PropertyDefinition";
    key: SlimeExpression | SlimePrivateIdentifier;
    value?: SlimeExpression | null | undefined;
    computed: boolean;
    static: boolean;
}

export interface SlimeFunctionExpression extends ESTree.SlimeFunctionExpression, SlimeFunctionExpression, SlimeBaseFunction, SlimeBaseExpression {
    id?: SlimeIdentifier | null | undefined;
    type: "FunctionExpression";
    body: SlimeBlockStatement;
}

export interface SlimeSequenceExpression extends ESTree.SequenceExpression, SlimeBaseExpression {
    type: "SequenceExpression";
    expressions: SlimeExpression[];
}

export interface SlimeUnaryExpression extends ESTree.UnaryExpression, SlimeBaseExpression {
    type: "UnaryExpression";
    operator: SlimeUnaryOperator;
    prefix: true;
    argument: SlimeExpression;
}

export interface SlimeBinaryExpression extends ESTree.BinaryExpression, SlimeBaseExpression {
    type: "BinaryExpression";
    operator: SlimeBinaryOperator;
    left: SlimeExpression | SlimePrivateIdentifier;
    right: SlimeExpression;
}

export interface SlimeAssignmentExpression extends ESTree.AssignmentExpression, SlimeBaseExpression {
    type: "AssignmentExpression";
    operator: SlimeAssignmentOperator;
    left: SlimePattern | SlimeMemberExpression;
    right: SlimeExpression;
}

export interface SlimeUpdateExpression extends ESTree.UpdateExpression, SlimeBaseExpression {
    type: "UpdateExpression";
    operator: SlimeUpdateOperator;
    argument: SlimeExpression;
    prefix: boolean;
}

export interface SlimeLogicalExpression extends ESTree.LogicalExpression, SlimeBaseExpression {
    type: "LogicalExpression";
    operator: SlimeLogicalOperator;
    left: SlimeExpression;
    right: SlimeExpression;
}

export interface SlimeConditionalExpression extends ESTree.ConditionalExpression, SlimeBaseExpression {
    type: "ConditionalExpression";
    test: SlimeExpression;
    alternate: SlimeExpression;
    consequent: SlimeExpression;
}

export interface SlimeBaseCallExpression extends ESTree.BaseCallExpression, SlimeBaseExpression {
    callee: SlimeExpression | SlimeSuper;
    arguments: Array<SlimeExpression | SlimeSpreadElement>;
}
export type SlimeCallExpression =  SlimeSimpleCallExpression | SlimeNewExpression;

export interface SlimeSimpleCallExpression extends ESTree.SimpleCallExpression, SlimeBaseCallExpression {
    type: "CallExpression";
    optional: boolean;
}

export interface SlimeNewExpression extends ESTree.NewExpression, SlimeBaseCallExpression {
    type: "NewExpression";
}

export interface SlimeMemberExpression extends ESTree.SlimeMemberExpression, SlimeMemberExpression, SlimeBaseExpression, SlimeBasePattern {
    type: "MemberExpression";
    object: SlimeExpression | SlimeSuper;
    property: SlimeExpression | SlimePrivateIdentifier;
    computed: boolean;
    optional: boolean;
}

export type SlimePattern =  SlimeIdentifier | SlimeObjectPattern | SlimeArrayPattern | SlimeRestElement | SlimeAssignmentPattern | SlimeMemberExpression;

export interface SlimeBasePattern extends ESTree.BasePattern, SlimeBaseNode {}

export interface SlimeSwitchCase extends ESTree.SwitchCase, SlimeBaseNode {
    type: "SwitchCase";
    test?: SlimeExpression | null | undefined;
    consequent: SlimeStatement[];
}

export interface SlimeCatchClause extends ESTree.CatchClause, SlimeBaseNode {
    type: "CatchClause";
    param: SlimePattern | null;
    body: SlimeBlockStatement;
}

export interface SlimeIdentifier extends ESTree.SlimeIdentifier, SlimeIdentifier, SlimeBaseNode, SlimeBaseExpression, SlimeBasePattern {
    type: "Identifier";
    name: string;
}

export type SlimeLiteral =  SlimeSimpleLiteral | SlimeRegExpLiteral | SlimeBigIntLiteral;

export interface SlimeSimpleLiteral extends ESTree.SlimeSimpleLiteral, SlimeSimpleLiteral, SlimeBaseNode, SlimeBaseExpression {
    type: "Literal";
    value: string | boolean | number | null;
    raw?: string | undefined;
}

export interface SlimeRegExpLiteral extends ESTree.SlimeRegExpLiteral, SlimeRegExpLiteral, SlimeBaseNode, SlimeBaseExpression {
    type: "Literal";
    value?: RegExp | null | undefined;
    regex: {
        pattern: string;
        flags: string;
    };
    raw?: string | undefined;
}

export interface SlimeBigIntLiteral extends ESTree.SlimeBigIntLiteral, SlimeBigIntLiteral, SlimeBaseNode, SlimeBaseExpression {
    type: "Literal";
    value?: bigint | null | undefined;
    bigint: string;
    raw?: string | undefined;
}

export type SlimeUnaryOperator =  "-" | "+" | "!" | "~" | "typeof" | "void" | "delete";

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

export type SlimeLogicalOperator =  "||" | "&&" | "??";

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

export type SlimeUpdateOperator =  "++" | "--";

export interface SlimeForOfStatement extends ESTree.ForOfStatement, SlimeBaseForXStatement {
    type: "ForOfStatement";
    await: boolean;
}

export interface SlimeSuper extends ESTree.Super, SlimeBaseNode {
    type: "Super";
}

export interface SlimeSpreadElement extends ESTree.SpreadElement, SlimeBaseNode {
    type: "SpreadElement";
    argument: SlimeExpression;
}

export interface SlimeArrowFunctionExpression extends ESTree.SlimeArrowFunctionExpression, SlimeArrowFunctionExpression, SlimeBaseExpression, SlimeBaseFunction {
    type: "ArrowFunctionExpression";
    expression: boolean;
    body: SlimeBlockStatement | SlimeExpression;
}

export interface SlimeYieldExpression extends ESTree.YieldExpression, SlimeBaseExpression {
    type: "YieldExpression";
    argument?: SlimeExpression | null | undefined;
    delegate: boolean;
}

export interface SlimeTemplateLiteral extends ESTree.TemplateLiteral, SlimeBaseExpression {
    type: "TemplateLiteral";
    quasis: SlimeTemplateElement[];
    expressions: SlimeExpression[];
}

export interface SlimeTaggedTemplateExpression extends ESTree.TaggedTemplateExpression, SlimeBaseExpression {
    type: "TaggedTemplateExpression";
    tag: SlimeExpression;
    quasi: SlimeTemplateLiteral;
}

export interface SlimeTemplateElement extends ESTree.TemplateElement, SlimeBaseNode {
    type: "TemplateElement";
    tail: boolean;
    value: {
        /** It is null when the template literal is tagged and the text has an invalid escape (e.g. - tag`\unicode and \u{55}`) */
        cooked?: string | null | undefined;
        raw: string;
    };
}

export interface SlimeAssignmentProperty extends ESTree.AssignmentProperty, SlimeProperty {
    value: Pattern;
    kind: "init";
    method: boolean; // false
}

export interface SlimeObjectPattern extends ESTree.ObjectPattern, SlimeBasePattern {
    type: "ObjectPattern";
    properties: Array<SlimeAssignmentProperty | SlimeRestElement>;
}

export interface SlimeArrayPattern extends ESTree.ArrayPattern, SlimeBasePattern {
    type: "ArrayPattern";
    elements: Array<SlimePattern | null>;
}

export interface SlimeRestElement extends ESTree.RestElement, SlimeBasePattern {
    type: "RestElement";
    argument: Pattern;
}

export interface SlimeAssignmentPattern extends ESTree.AssignmentPattern, SlimeBasePattern {
    type: "AssignmentPattern";
    left: SlimePattern;
    right: SlimeExpression;
}

export type SlimeClass =  SlimeClassDeclaration | SlimeClassExpression;
export interface SlimeBaseClass extends ESTree.BaseClass, SlimeBaseNode {
    superClass?: SlimeExpression | null | undefined;
    body: SlimeClassBody;
}

export interface SlimeClassBody extends ESTree.ClassBody, SlimeBaseNode {
    type: "ClassBody";
    body: Array<SlimeMethodDefinition | PropertyDefinition | SlimeStaticBlock>;
}

export interface SlimeMethodDefinition extends ESTree.MethodDefinition, SlimeBaseNode {
    type: "MethodDefinition";
    key: SlimeExpression | SlimePrivateIdentifier;
    value: SlimeFunctionExpression;
    kind: "constructor" | "method" | "get" | "set";
    computed: boolean;
    static: boolean;
}

export interface SlimeMaybeNamedClassDeclaration extends ESTree.SlimeMaybeNamedClassDeclaration, SlimeMaybeNamedClassDeclaration, SlimeBaseClass, SlimeBaseDeclaration {
    type: "ClassDeclaration";
    /** It is null when a class declaration is a part of the `export default class` statement */
    id: SlimeIdentifier | null;
}

export interface SlimeClassDeclaration extends ESTree.ClassDeclaration, SlimeMaybeNamedClassDeclaration {
    id: SlimeIdentifier;
}

export interface SlimeClassExpression extends ESTree.SlimeClassExpression, SlimeClassExpression, SlimeBaseClass, SlimeBaseExpression {
    type: "ClassExpression";
    id?: SlimeIdentifier | null | undefined;
}

export interface SlimeMetaProperty extends ESTree.MetaProperty, SlimeBaseExpression {
    type: "MetaProperty";
    meta: SlimeIdentifier;
    property: SlimeIdentifier;
}

export type SlimeModuleDeclaration = 
    | SlimeImportDeclaration
    | SlimeExportNamedDeclaration
    | SlimeExportDefaultDeclaration
    | SlimeExportAllDeclaration;
export interface SlimeBaseModuleDeclaration extends ESTree.BaseModuleDeclaration, SlimeBaseNode {}

export type SlimeModuleSpecifier =  SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier | SlimeExportSpecifier;
export interface SlimeBaseModuleSpecifier extends ESTree.BaseModuleSpecifier, SlimeBaseNode {
    local: SlimeIdentifier;
}

export interface SlimeImportDeclaration extends ESTree.ImportDeclaration, SlimeBaseModuleDeclaration {
    type: "ImportDeclaration";
    specifiers: Array<SlimeImportSpecifier | SlimeImportDefaultSpecifier | SlimeImportNamespaceSpecifier>;
    source: SlimeLiteral;
}

export interface SlimeImportSpecifier extends ESTree.ImportSpecifier, SlimeBaseModuleSpecifier {
    type: "ImportSpecifier";
    imported: SlimeIdentifier | SlimeLiteral;
}

export interface SlimeImportExpression extends ESTree.ImportExpression, SlimeBaseExpression {
    type: "ImportExpression";
    source: SlimeExpression;
}

export interface SlimeImportDefaultSpecifier extends ESTree.ImportDefaultSpecifier, SlimeBaseModuleSpecifier {
    type: "ImportDefaultSpecifier";
}

export interface SlimeImportNamespaceSpecifier extends ESTree.ImportNamespaceSpecifier, SlimeBaseModuleSpecifier {
    type: "ImportNamespaceSpecifier";
}

export interface SlimeExportNamedDeclaration extends ESTree.ExportNamedDeclaration, SlimeBaseModuleDeclaration {
    type: "ExportNamedDeclaration";
    declaration?: SlimeDeclaration | null | undefined;
    specifiers: SlimeExportSpecifier[];
    source?: SlimeLiteral | null | undefined;
}

export interface SlimeExportSpecifier extends ESTree.ExportSpecifier, Omit<ESTree.BaseModuleSpecifier, "local"> {
    type: "ExportSpecifier";
    local: SlimeIdentifier | SlimeLiteral;
    exported: SlimeIdentifier | SlimeLiteral;
}

export interface SlimeExportDefaultDeclaration extends ESTree.ExportDefaultDeclaration, SlimeBaseModuleDeclaration {
    type: "ExportDefaultDeclaration";
    declaration: SlimeMaybeNamedFunctionDeclaration | SlimeMaybeNamedClassDeclaration | SlimeExpression;
}

export interface SlimeExportAllDeclaration extends ESTree.ExportAllDeclaration, SlimeBaseModuleDeclaration {
    type: "ExportAllDeclaration";
    exported: SlimeIdentifier | SlimeLiteral | null;
    source: SlimeLiteral;
}

export interface SlimeAwaitExpression extends ESTree.AwaitExpression, SlimeBaseExpression {
    type: "AwaitExpression";
    argument: SlimeExpression;
}
