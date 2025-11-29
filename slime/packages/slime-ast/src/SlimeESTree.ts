import type * as ESTree from "estree";

export interface BaseNodeWithoutComments {
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

export interface NodeMap {
    AssignmentProperty: AssignmentProperty;
    CatchClause: CatchClause;
    Class: Class;
    ClassBody: ClassBody;
    Expression: Expression;
    Function: Function;
    Identifier: Identifier;
    Literal: Literal;
    MethodDefinition: MethodDefinition;
    ModuleDeclaration: ModuleDeclaration;
    ModuleSpecifier: ModuleSpecifier;
    Pattern: Pattern;
    PrivateIdentifier: PrivateIdentifier;
    Program: Program;
    Property: Property;
    PropertyDefinition: PropertyDefinition;
    SpreadElement: SpreadElement;
    Statement: Statement;
    Super: Super;
    SwitchCase: SwitchCase;
    TemplateElement: TemplateElement;
    VariableDeclarator: VariableDeclarator;
}

export type Node = NodeMap[keyof NodeMap];

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
    body: Array<Directive | Statement | ModuleDeclaration>;
    comments?: Comment[] | undefined;
}

export interface SlimeDirective extends ESTree.Directive, SlimeBaseNode {
    type: "ExpressionStatement";
    expression: Literal;
    directive: string;
}

export interface SlimeBaseFunction extends ESTree.BaseFunction, SlimeBaseNode {
    params: Pattern[];
    generator?: boolean | undefined;
    async?: boolean | undefined;
    // The body is either BlockStatement or Expression because arrow functions
    // can have a body that's either. FunctionDeclarations and
    // FunctionExpressions have only BlockStatement bodies.
    body: BlockStatement | Expression;
}

export type Function = FunctionDeclaration | FunctionExpression | ArrowFunctionExpression;

export type Statement =
    | ExpressionStatement
    | BlockStatement
    | StaticBlock
    | EmptyStatement
    | DebuggerStatement
    | WithStatement
    | ReturnStatement
    | LabeledStatement
    | BreakStatement
    | ContinueStatement
    | IfStatement
    | SwitchStatement
    | ThrowStatement
    | TryStatement
    | WhileStatement
    | DoWhileStatement
    | ForStatement
    | ForInStatement
    | ForOfStatement
    | Declaration;

export interface SlimeBaseStatement extends ESTree.BaseStatement, SlimeBaseNode {}

export interface SlimeEmptyStatement extends ESTree.EmptyStatement, SlimeBaseStatement {
    type: "EmptyStatement";
}

export interface SlimeBlockStatement extends ESTree.BlockStatement, SlimeBaseStatement {
    type: "BlockStatement";
    body: Statement[];
    innerComments?: Comment[] | undefined;
}

export interface SlimeStaticBlock extends ESTree.StaticBlock, Omit<ESTree.BlockStatement, "type"> {
    type: "StaticBlock";
}

export interface SlimeExpressionStatement extends ESTree.ExpressionStatement, SlimeBaseStatement {
    type: "ExpressionStatement";
    expression: Expression;
}

export interface SlimeIfStatement extends ESTree.IfStatement, SlimeBaseStatement {
    type: "IfStatement";
    test: Expression;
    consequent: Statement;
    alternate?: Statement | null | undefined;
}

export interface SlimeLabeledStatement extends ESTree.LabeledStatement, SlimeBaseStatement {
    type: "LabeledStatement";
    label: Identifier;
    body: Statement;
}

export interface SlimeBreakStatement extends ESTree.BreakStatement, SlimeBaseStatement {
    type: "BreakStatement";
    label?: Identifier | null | undefined;
}

export interface SlimeContinueStatement extends ESTree.ContinueStatement, SlimeBaseStatement {
    type: "ContinueStatement";
    label?: Identifier | null | undefined;
}

export interface SlimeWithStatement extends ESTree.WithStatement, SlimeBaseStatement {
    type: "WithStatement";
    object: Expression;
    body: Statement;
}

export interface SlimeSwitchStatement extends ESTree.SwitchStatement, SlimeBaseStatement {
    type: "SwitchStatement";
    discriminant: Expression;
    cases: SwitchCase[];
}

export interface SlimeReturnStatement extends ESTree.ReturnStatement, SlimeBaseStatement {
    type: "ReturnStatement";
    argument?: Expression | null | undefined;
}

export interface SlimeThrowStatement extends ESTree.ThrowStatement, SlimeBaseStatement {
    type: "ThrowStatement";
    argument: Expression;
}

export interface SlimeTryStatement extends ESTree.TryStatement, SlimeBaseStatement {
    type: "TryStatement";
    block: BlockStatement;
    handler?: CatchClause | null | undefined;
    finalizer?: BlockStatement | null | undefined;
}

export interface SlimeWhileStatement extends ESTree.WhileStatement, SlimeBaseStatement {
    type: "WhileStatement";
    test: Expression;
    body: Statement;
}

export interface SlimeDoWhileStatement extends ESTree.DoWhileStatement, SlimeBaseStatement {
    type: "DoWhileStatement";
    body: Statement;
    test: Expression;
}

export interface SlimeForStatement extends ESTree.ForStatement, SlimeBaseStatement {
    type: "ForStatement";
    init?: VariableDeclaration | Expression | null | undefined;
    test?: Expression | null | undefined;
    update?: Expression | null | undefined;
    body: Statement;
}

export interface SlimeBaseForXStatement extends ESTree.BaseForXStatement, SlimeBaseStatement {
    left: VariableDeclaration | Pattern;
    right: Expression;
    body: Statement;
}

export interface SlimeForInStatement extends ESTree.ForInStatement, SlimeBaseForXStatement {
    type: "ForInStatement";
}

export interface SlimeDebuggerStatement extends ESTree.DebuggerStatement, SlimeBaseStatement {
    type: "DebuggerStatement";
}

export type Declaration = FunctionDeclaration | VariableDeclaration | ClassDeclaration;

export interface SlimeBaseDeclaration extends ESTree.BaseDeclaration, SlimeBaseStatement {}

export interface SlimeSlimeMaybeNamedFunctionDeclaration extends ESTree.SlimeMaybeNamedFunctionDeclaration, SlimeMaybeNamedFunctionDeclaration, SlimeBaseFunction, SlimeBaseDeclaration {
    type: "FunctionDeclaration";
    /** It is null when a function declaration is a part of the `export default function` statement */
    id: Identifier | null;
    body: BlockStatement;
}

export interface SlimeFunctionDeclaration extends ESTree.FunctionDeclaration, SlimeMaybeNamedFunctionDeclaration {
    id: Identifier;
}

export interface SlimeVariableDeclaration extends ESTree.VariableDeclaration, SlimeBaseDeclaration {
    type: "VariableDeclaration";
    declarations: VariableDeclarator[];
    kind: "var" | "let" | "const";
}

export interface SlimeVariableDeclarator extends ESTree.VariableDeclarator, SlimeBaseNode {
    type: "VariableDeclarator";
    id: Pattern;
    init?: Expression | null | undefined;
}

export interface ExpressionMap {
    ArrayExpression: ArrayExpression;
    ArrowFunctionExpression: ArrowFunctionExpression;
    AssignmentExpression: AssignmentExpression;
    AwaitExpression: AwaitExpression;
    BinaryExpression: BinaryExpression;
    CallExpression: CallExpression;
    ChainExpression: ChainExpression;
    ClassExpression: ClassExpression;
    ConditionalExpression: ConditionalExpression;
    FunctionExpression: FunctionExpression;
    Identifier: Identifier;
    ImportExpression: ImportExpression;
    Literal: Literal;
    LogicalExpression: LogicalExpression;
    MemberExpression: MemberExpression;
    MetaProperty: MetaProperty;
    NewExpression: NewExpression;
    ObjectExpression: ObjectExpression;
    SequenceExpression: SequenceExpression;
    TaggedTemplateExpression: TaggedTemplateExpression;
    TemplateLiteral: TemplateLiteral;
    ThisExpression: ThisExpression;
    UnaryExpression: UnaryExpression;
    UpdateExpression: UpdateExpression;
    YieldExpression: YieldExpression;
}

export type Expression = ExpressionMap[keyof ExpressionMap];

export interface SlimeBaseExpression extends ESTree.BaseExpression, SlimeBaseNode {}

export type ChainElement = SimpleCallExpression | MemberExpression;

export interface SlimeChainExpression extends ESTree.ChainExpression, SlimeBaseExpression {
    type: "ChainExpression";
    expression: ChainElement;
}

export interface SlimeThisExpression extends ESTree.ThisExpression, SlimeBaseExpression {
    type: "ThisExpression";
}

export interface SlimeArrayExpression extends ESTree.ArrayExpression, SlimeBaseExpression {
    type: "ArrayExpression";
    elements: Array<Expression | SpreadElement | null>;
}

export interface SlimeObjectExpression extends ESTree.ObjectExpression, SlimeBaseExpression {
    type: "ObjectExpression";
    properties: Array<Property | SpreadElement>;
}

export interface SlimePrivateIdentifier extends ESTree.PrivateIdentifier, SlimeBaseNode {
    type: "PrivateIdentifier";
    name: string;
}

export interface SlimeProperty extends ESTree.Property, SlimeBaseNode {
    type: "Property";
    key: Expression | PrivateIdentifier;
    value: Expression | Pattern; // Could be an AssignmentProperty
    kind: "init" | "get" | "set";
    method: boolean;
    shorthand: boolean;
    computed: boolean;
}

export interface SlimePropertyDefinition extends ESTree.PropertyDefinition, SlimeBaseNode {
    type: "PropertyDefinition";
    key: Expression | PrivateIdentifier;
    value?: Expression | null | undefined;
    computed: boolean;
    static: boolean;
}

export interface SlimeSlimeFunctionExpression extends ESTree.SlimeFunctionExpression, SlimeFunctionExpression, SlimeBaseFunction, SlimeBaseExpression {
    id?: Identifier | null | undefined;
    type: "FunctionExpression";
    body: BlockStatement;
}

export interface SlimeSequenceExpression extends ESTree.SequenceExpression, SlimeBaseExpression {
    type: "SequenceExpression";
    expressions: Expression[];
}

export interface SlimeUnaryExpression extends ESTree.UnaryExpression, SlimeBaseExpression {
    type: "UnaryExpression";
    operator: UnaryOperator;
    prefix: true;
    argument: Expression;
}

export interface SlimeBinaryExpression extends ESTree.BinaryExpression, SlimeBaseExpression {
    type: "BinaryExpression";
    operator: BinaryOperator;
    left: Expression | PrivateIdentifier;
    right: Expression;
}

export interface SlimeAssignmentExpression extends ESTree.AssignmentExpression, SlimeBaseExpression {
    type: "AssignmentExpression";
    operator: AssignmentOperator;
    left: Pattern | MemberExpression;
    right: Expression;
}

export interface SlimeUpdateExpression extends ESTree.UpdateExpression, SlimeBaseExpression {
    type: "UpdateExpression";
    operator: UpdateOperator;
    argument: Expression;
    prefix: boolean;
}

export interface SlimeLogicalExpression extends ESTree.LogicalExpression, SlimeBaseExpression {
    type: "LogicalExpression";
    operator: LogicalOperator;
    left: Expression;
    right: Expression;
}

export interface SlimeConditionalExpression extends ESTree.ConditionalExpression, SlimeBaseExpression {
    type: "ConditionalExpression";
    test: Expression;
    alternate: Expression;
    consequent: Expression;
}

export interface SlimeBaseCallExpression extends ESTree.BaseCallExpression, SlimeBaseExpression {
    callee: Expression | Super;
    arguments: Array<Expression | SpreadElement>;
}
export type CallExpression = SimpleCallExpression | NewExpression;

export interface SlimeSimpleCallExpression extends ESTree.SimpleCallExpression, SlimeBaseCallExpression {
    type: "CallExpression";
    optional: boolean;
}

export interface SlimeNewExpression extends ESTree.NewExpression, SlimeBaseCallExpression {
    type: "NewExpression";
}

export interface SlimeSlimeMemberExpression extends ESTree.SlimeMemberExpression, SlimeMemberExpression, SlimeBaseExpression, SlimeBasePattern {
    type: "MemberExpression";
    object: Expression | Super;
    property: Expression | PrivateIdentifier;
    computed: boolean;
    optional: boolean;
}

export type Pattern = Identifier | ObjectPattern | ArrayPattern | RestElement | AssignmentPattern | MemberExpression;

export interface SlimeBasePattern extends ESTree.BasePattern, SlimeBaseNode {}

export interface SlimeSwitchCase extends ESTree.SwitchCase, SlimeBaseNode {
    type: "SwitchCase";
    test?: Expression | null | undefined;
    consequent: Statement[];
}

export interface SlimeCatchClause extends ESTree.CatchClause, SlimeBaseNode {
    type: "CatchClause";
    param: Pattern | null;
    body: BlockStatement;
}

export interface SlimeSlimeIdentifier extends ESTree.SlimeIdentifier, SlimeIdentifier, SlimeBaseNode, SlimeBaseExpression, SlimeBasePattern {
    type: "Identifier";
    name: string;
}

export type Literal = SimpleLiteral | RegExpLiteral | BigIntLiteral;

export interface SlimeSlimeSimpleLiteral extends ESTree.SlimeSimpleLiteral, SlimeSimpleLiteral, SlimeBaseNode, SlimeBaseExpression {
    type: "Literal";
    value: string | boolean | number | null;
    raw?: string | undefined;
}

export interface SlimeSlimeRegExpLiteral extends ESTree.SlimeRegExpLiteral, SlimeRegExpLiteral, SlimeBaseNode, SlimeBaseExpression {
    type: "Literal";
    value?: RegExp | null | undefined;
    regex: {
        pattern: string;
        flags: string;
    };
    raw?: string | undefined;
}

export interface SlimeSlimeBigIntLiteral extends ESTree.SlimeBigIntLiteral, SlimeBigIntLiteral, SlimeBaseNode, SlimeBaseExpression {
    type: "Literal";
    value?: bigint | null | undefined;
    bigint: string;
    raw?: string | undefined;
}

export type UnaryOperator = "-" | "+" | "!" | "~" | "typeof" | "void" | "delete";

export type BinaryOperator =
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

export type LogicalOperator = "||" | "&&" | "??";

export type AssignmentOperator =
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

export type UpdateOperator = "++" | "--";

export interface SlimeForOfStatement extends ESTree.ForOfStatement, SlimeBaseForXStatement {
    type: "ForOfStatement";
    await: boolean;
}

export interface SlimeSuper extends ESTree.Super, SlimeBaseNode {
    type: "Super";
}

export interface SlimeSpreadElement extends ESTree.SpreadElement, SlimeBaseNode {
    type: "SpreadElement";
    argument: Expression;
}

export interface SlimeSlimeArrowFunctionExpression extends ESTree.SlimeArrowFunctionExpression, SlimeArrowFunctionExpression, SlimeBaseExpression, SlimeBaseFunction {
    type: "ArrowFunctionExpression";
    expression: boolean;
    body: BlockStatement | Expression;
}

export interface SlimeYieldExpression extends ESTree.YieldExpression, SlimeBaseExpression {
    type: "YieldExpression";
    argument?: Expression | null | undefined;
    delegate: boolean;
}

export interface SlimeTemplateLiteral extends ESTree.TemplateLiteral, SlimeBaseExpression {
    type: "TemplateLiteral";
    quasis: TemplateElement[];
    expressions: Expression[];
}

export interface SlimeTaggedTemplateExpression extends ESTree.TaggedTemplateExpression, SlimeBaseExpression {
    type: "TaggedTemplateExpression";
    tag: Expression;
    quasi: TemplateLiteral;
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
    properties: Array<AssignmentProperty | RestElement>;
}

export interface SlimeArrayPattern extends ESTree.ArrayPattern, SlimeBasePattern {
    type: "ArrayPattern";
    elements: Array<Pattern | null>;
}

export interface SlimeRestElement extends ESTree.RestElement, SlimeBasePattern {
    type: "RestElement";
    argument: Pattern;
}

export interface SlimeAssignmentPattern extends ESTree.AssignmentPattern, SlimeBasePattern {
    type: "AssignmentPattern";
    left: Pattern;
    right: Expression;
}

export type Class = ClassDeclaration | ClassExpression;
export interface SlimeBaseClass extends ESTree.BaseClass, SlimeBaseNode {
    superClass?: Expression | null | undefined;
    body: ClassBody;
}

export interface SlimeClassBody extends ESTree.ClassBody, SlimeBaseNode {
    type: "ClassBody";
    body: Array<MethodDefinition | PropertyDefinition | StaticBlock>;
}

export interface SlimeMethodDefinition extends ESTree.MethodDefinition, SlimeBaseNode {
    type: "MethodDefinition";
    key: Expression | PrivateIdentifier;
    value: FunctionExpression;
    kind: "constructor" | "method" | "get" | "set";
    computed: boolean;
    static: boolean;
}

export interface SlimeSlimeMaybeNamedClassDeclaration extends ESTree.SlimeMaybeNamedClassDeclaration, SlimeMaybeNamedClassDeclaration, SlimeBaseClass, SlimeBaseDeclaration {
    type: "ClassDeclaration";
    /** It is null when a class declaration is a part of the `export default class` statement */
    id: Identifier | null;
}

export interface SlimeClassDeclaration extends ESTree.ClassDeclaration, SlimeMaybeNamedClassDeclaration {
    id: Identifier;
}

export interface SlimeSlimeClassExpression extends ESTree.SlimeClassExpression, SlimeClassExpression, SlimeBaseClass, SlimeBaseExpression {
    type: "ClassExpression";
    id?: Identifier | null | undefined;
}

export interface SlimeMetaProperty extends ESTree.MetaProperty, SlimeBaseExpression {
    type: "MetaProperty";
    meta: Identifier;
    property: Identifier;
}

export type ModuleDeclaration =
    | ImportDeclaration
    | ExportNamedDeclaration
    | ExportDefaultDeclaration
    | ExportAllDeclaration;
export interface SlimeBaseModuleDeclaration extends ESTree.BaseModuleDeclaration, SlimeBaseNode {}

export type ModuleSpecifier = ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier | ExportSpecifier;
export interface SlimeBaseModuleSpecifier extends ESTree.BaseModuleSpecifier, SlimeBaseNode {
    local: Identifier;
}

export interface SlimeImportDeclaration extends ESTree.ImportDeclaration, SlimeBaseModuleDeclaration {
    type: "ImportDeclaration";
    specifiers: Array<ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier>;
    source: Literal;
}

export interface SlimeImportSpecifier extends ESTree.ImportSpecifier, SlimeBaseModuleSpecifier {
    type: "ImportSpecifier";
    imported: Identifier | Literal;
}

export interface SlimeImportExpression extends ESTree.ImportExpression, SlimeBaseExpression {
    type: "ImportExpression";
    source: Expression;
}

export interface SlimeImportDefaultSpecifier extends ESTree.ImportDefaultSpecifier, SlimeBaseModuleSpecifier {
    type: "ImportDefaultSpecifier";
}

export interface SlimeImportNamespaceSpecifier extends ESTree.ImportNamespaceSpecifier, SlimeBaseModuleSpecifier {
    type: "ImportNamespaceSpecifier";
}

export interface SlimeExportNamedDeclaration extends ESTree.ExportNamedDeclaration, SlimeBaseModuleDeclaration {
    type: "ExportNamedDeclaration";
    declaration?: Declaration | null | undefined;
    specifiers: ExportSpecifier[];
    source?: Literal | null | undefined;
}

export interface SlimeExportSpecifier extends ESTree.ExportSpecifier, Omit<ESTree.BaseModuleSpecifier, "local"> {
    type: "ExportSpecifier";
    local: Identifier | Literal;
    exported: Identifier | Literal;
}

export interface SlimeExportDefaultDeclaration extends ESTree.ExportDefaultDeclaration, SlimeBaseModuleDeclaration {
    type: "ExportDefaultDeclaration";
    declaration: MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | Expression;
}

export interface SlimeExportAllDeclaration extends ESTree.ExportAllDeclaration, SlimeBaseModuleDeclaration {
    type: "ExportAllDeclaration";
    exported: Identifier | Literal | null;
    source: Literal;
}

export interface SlimeAwaitExpression extends ESTree.AwaitExpression, SlimeBaseExpression {
    type: "AwaitExpression";
    argument: Expression;
}
