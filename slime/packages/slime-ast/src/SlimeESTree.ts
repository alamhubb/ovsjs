export interface SlimeBaseNodeWithoutComments {
    // Every leaf interface Slimethat extends BaseNode must specify a type property.
    // The type property should be a string literal. For example, Identifier
    // has: `type: "Identifier"`
    type: string;
    loc?: SourceLocation | null | undefined;
    range?: [number, number] | undefined;
}

export interface SlimeBaseNode extends BaseNodeWithoutComments {
    leadingComments?: Comment[] | undefined;
    trailingComments?: Comment[] | undefined;
}

export interface SlimeNodeMap {
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

export interface SlimeComment extends BaseNodeWithoutComments {
    type: "Line" | "Block";
    value: string;
}

export interface SlimeSourceLocation {
    source?: string | null | undefined;
    start: Position;
    end: Position;
}

export interface SlimePosition {
    /** >= 1 */
    line: number;
    /** >= 0 */
    column: number;
}

export interface SlimeProgram extends BaseNode {
    type: "Program";
    sourceType: "script" | "module";
    body: Array<Directive | Statement | ModuleDeclaration>;
    comments?: Comment[] | undefined;
}

export interface SlimeDirective extends BaseNode {
    type: "ExpressionStatement";
    expression: Literal;
    directive: string;
}

export interface SlimeBaseFunction extends BaseNode {
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

export interface SlimeBaseStatement extends BaseNode {}

export interface SlimeEmptyStatement extends BaseStatement {
    type: "EmptyStatement";
}

export interface SlimeBlockStatement extends BaseStatement {
    type: "BlockStatement";
    body: Statement[];
    innerComments?: Comment[] | undefined;
}

export interface SlimeStaticBlock extends Omit<BlockStatement, "type"> {
    type: "StaticBlock";
}

export interface SlimeExpressionStatement extends BaseStatement {
    type: "ExpressionStatement";
    expression: Expression;
}

export interface SlimeIfStatement extends BaseStatement {
    type: "IfStatement";
    test: Expression;
    consequent: Statement;
    alternate?: Statement | null | undefined;
}

export interface SlimeLabeledStatement extends BaseStatement {
    type: "LabeledStatement";
    label: Identifier;
    body: Statement;
}

export interface SlimeBreakStatement extends BaseStatement {
    type: "BreakStatement";
    label?: Identifier | null | undefined;
}

export interface SlimeContinueStatement extends BaseStatement {
    type: "ContinueStatement";
    label?: Identifier | null | undefined;
}

export interface SlimeWithStatement extends BaseStatement {
    type: "WithStatement";
    object: Expression;
    body: Statement;
}

export interface SlimeSwitchStatement extends BaseStatement {
    type: "SwitchStatement";
    discriminant: Expression;
    cases: SwitchCase[];
}

export interface SlimeReturnStatement extends BaseStatement {
    type: "ReturnStatement";
    argument?: Expression | null | undefined;
}

export interface SlimeThrowStatement extends BaseStatement {
    type: "ThrowStatement";
    argument: Expression;
}

export interface SlimeTryStatement extends BaseStatement {
    type: "TryStatement";
    block: BlockStatement;
    handler?: CatchClause | null | undefined;
    finalizer?: BlockStatement | null | undefined;
}

export interface SlimeWhileStatement extends BaseStatement {
    type: "WhileStatement";
    test: Expression;
    body: Statement;
}

export interface SlimeDoWhileStatement extends BaseStatement {
    type: "DoWhileStatement";
    body: Statement;
    test: Expression;
}

export interface SlimeForStatement extends BaseStatement {
    type: "ForStatement";
    init?: VariableDeclaration | Expression | null | undefined;
    test?: Expression | null | undefined;
    update?: Expression | null | undefined;
    body: Statement;
}

export interface SlimeBaseForXStatement extends BaseStatement {
    left: VariableDeclaration | Pattern;
    right: Expression;
    body: Statement;
}

export interface SlimeForInStatement extends BaseForXStatement {
    type: "ForInStatement";
}

export interface SlimeDebuggerStatement extends BaseStatement {
    type: "DebuggerStatement";
}

export type Declaration = FunctionDeclaration | VariableDeclaration | ClassDeclaration;

export interface SlimeBaseDeclaration extends BaseStatement {}

export interface SlimeMaybeNamedFunctionDeclaration extends BaseFunction, BaseDeclaration {
    type: "FunctionDeclaration";
    /** It is null when a function declaration is a part of the `export default function` statement */
    id: Identifier | null;
    body: BlockStatement;
}

export interface SlimeFunctionDeclaration extends MaybeNamedFunctionDeclaration {
    id: Identifier;
}

export interface SlimeVariableDeclaration extends BaseDeclaration {
    type: "VariableDeclaration";
    declarations: VariableDeclarator[];
    kind: "var" | "let" | "const";
}

export interface SlimeVariableDeclarator extends BaseNode {
    type: "VariableDeclarator";
    id: Pattern;
    init?: Expression | null | undefined;
}

export interface SlimeExpressionMap {
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

export interface SlimeBaseExpression extends BaseNode {}

export type ChainElement = SimpleCallExpression | MemberExpression;

export interface SlimeChainExpression extends BaseExpression {
    type: "ChainExpression";
    expression: ChainElement;
}

export interface SlimeThisExpression extends BaseExpression {
    type: "ThisExpression";
}

export interface SlimeArrayExpression extends BaseExpression {
    type: "ArrayExpression";
    elements: Array<Expression | SpreadElement | null>;
}

export interface SlimeObjectExpression extends BaseExpression {
    type: "ObjectExpression";
    properties: Array<Property | SpreadElement>;
}

export interface SlimePrivateIdentifier extends BaseNode {
    type: "PrivateIdentifier";
    name: string;
}

export interface SlimeProperty extends BaseNode {
    type: "Property";
    key: Expression | PrivateIdentifier;
    value: Expression | Pattern; // Could be an AssignmentProperty
    kind: "init" | "get" | "set";
    method: boolean;
    shorthand: boolean;
    computed: boolean;
}

export interface SlimePropertyDefinition extends BaseNode {
    type: "PropertyDefinition";
    key: Expression | PrivateIdentifier;
    value?: Expression | null | undefined;
    computed: boolean;
    static: boolean;
}

export interface SlimeFunctionExpression extends BaseFunction, BaseExpression {
    id?: Identifier | null | undefined;
    type: "FunctionExpression";
    body: BlockStatement;
}

export interface SlimeSequenceExpression extends BaseExpression {
    type: "SequenceExpression";
    expressions: Expression[];
}

export interface SlimeUnaryExpression extends BaseExpression {
    type: "UnaryExpression";
    operator: UnaryOperator;
    prefix: true;
    argument: Expression;
}

export interface SlimeBinaryExpression extends BaseExpression {
    type: "BinaryExpression";
    operator: BinaryOperator;
    left: Expression | PrivateIdentifier;
    right: Expression;
}

export interface SlimeAssignmentExpression extends BaseExpression {
    type: "AssignmentExpression";
    operator: AssignmentOperator;
    left: Pattern | MemberExpression;
    right: Expression;
}

export interface SlimeUpdateExpression extends BaseExpression {
    type: "UpdateExpression";
    operator: UpdateOperator;
    argument: Expression;
    prefix: boolean;
}

export interface SlimeLogicalExpression extends BaseExpression {
    type: "LogicalExpression";
    operator: LogicalOperator;
    left: Expression;
    right: Expression;
}

export interface SlimeConditionalExpression extends BaseExpression {
    type: "ConditionalExpression";
    test: Expression;
    alternate: Expression;
    consequent: Expression;
}

export interface SlimeBaseCallExpression extends BaseExpression {
    callee: Expression | Super;
    arguments: Array<Expression | SpreadElement>;
}
export type CallExpression = SimpleCallExpression | NewExpression;

export interface SlimeSimpleCallExpression extends BaseCallExpression {
    type: "CallExpression";
    optional: boolean;
}

export interface SlimeNewExpression extends BaseCallExpression {
    type: "NewExpression";
}

export interface SlimeMemberExpression extends BaseExpression, BasePattern {
    type: "MemberExpression";
    object: Expression | Super;
    property: Expression | PrivateIdentifier;
    computed: boolean;
    optional: boolean;
}

export type Pattern = Identifier | ObjectPattern | ArrayPattern | RestElement | AssignmentPattern | MemberExpression;

export interface SlimeBasePattern extends BaseNode {}

export interface SlimeSwitchCase extends BaseNode {
    type: "SwitchCase";
    test?: Expression | null | undefined;
    consequent: Statement[];
}

export interface SlimeCatchClause extends BaseNode {
    type: "CatchClause";
    param: Pattern | null;
    body: BlockStatement;
}

export interface SlimeIdentifier extends BaseNode, BaseExpression, BasePattern {
    type: "Identifier";
    name: string;
}

export type Literal = SimpleLiteral | RegExpLiteral | BigIntLiteral;

export interface SlimeSimpleLiteral extends BaseNode, BaseExpression {
    type: "Literal";
    value: string | boolean | number | null;
    raw?: string | undefined;
}

export interface SlimeRegExpLiteral extends BaseNode, BaseExpression {
    type: "Literal";
    value?: RegExp | null | undefined;
    regex: {
        pattern: string;
        flags: string;
    };
    raw?: string | undefined;
}

export interface SlimeBigIntLiteral extends BaseNode, BaseExpression {
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

export interface SlimeForOfStatement extends BaseForXStatement {
    type: "ForOfStatement";
    await: boolean;
}

export interface SlimeSuper extends BaseNode {
    type: "Super";
}

export interface SlimeSpreadElement extends BaseNode {
    type: "SpreadElement";
    argument: Expression;
}

export interface SlimeArrowFunctionExpression extends BaseExpression, BaseFunction {
    type: "ArrowFunctionExpression";
    expression: boolean;
    body: BlockStatement | Expression;
}

export interface SlimeYieldExpression extends BaseExpression {
    type: "YieldExpression";
    argument?: Expression | null | undefined;
    delegate: boolean;
}

export interface SlimeTemplateLiteral extends BaseExpression {
    type: "TemplateLiteral";
    quasis: TemplateElement[];
    expressions: Expression[];
}

export interface SlimeTaggedTemplateExpression extends BaseExpression {
    type: "TaggedTemplateExpression";
    tag: Expression;
    quasi: TemplateLiteral;
}

export interface SlimeTemplateElement extends BaseNode {
    type: "TemplateElement";
    tail: boolean;
    value: {
        /** It is null when the template literal is tagged and the text has an invalid escape (e.g. - tag`\unicode and \u{55}`) */
        cooked?: string | null | undefined;
        raw: string;
    };
}

export interface SlimeAssignmentProperty extends Property {
    value: Pattern;
    kind: "init";
    method: boolean; // false
}

export interface SlimeObjectPattern extends BasePattern {
    type: "ObjectPattern";
    properties: Array<AssignmentProperty | RestElement>;
}

export interface SlimeArrayPattern extends BasePattern {
    type: "ArrayPattern";
    elements: Array<Pattern | null>;
}

export interface SlimeRestElement extends BasePattern {
    type: "RestElement";
    argument: Pattern;
}

export interface SlimeAssignmentPattern extends BasePattern {
    type: "AssignmentPattern";
    left: Pattern;
    right: Expression;
}

export type Class = ClassDeclaration | ClassExpression;
export interface SlimeBaseClass extends BaseNode {
    superClass?: Expression | null | undefined;
    body: ClassBody;
}

export interface SlimeClassBody extends BaseNode {
    type: "ClassBody";
    body: Array<MethodDefinition | PropertyDefinition | StaticBlock>;
}

export interface SlimeMethodDefinition extends BaseNode {
    type: "MethodDefinition";
    key: Expression | PrivateIdentifier;
    value: FunctionExpression;
    kind: "constructor" | "method" | "get" | "set";
    computed: boolean;
    static: boolean;
}

export interface SlimeMaybeNamedClassDeclaration extends BaseClass, BaseDeclaration {
    type: "ClassDeclaration";
    /** It is null when a class declaration is a part of the `export default class` statement */
    id: Identifier | null;
}

export interface SlimeClassDeclaration extends MaybeNamedClassDeclaration {
    id: Identifier;
}

export interface SlimeClassExpression extends BaseClass, BaseExpression {
    type: "ClassExpression";
    id?: Identifier | null | undefined;
}

export interface SlimeMetaProperty extends BaseExpression {
    type: "MetaProperty";
    meta: Identifier;
    property: Identifier;
}

export type ModuleDeclaration =
    | ImportDeclaration
    | ExportNamedDeclaration
    | ExportDefaultDeclaration
    | ExportAllDeclaration;
export interface SlimeBaseModuleDeclaration extends BaseNode {}

export type ModuleSpecifier = ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier | ExportSpecifier;
export interface SlimeBaseModuleSpecifier extends BaseNode {
    local: Identifier;
}

export interface SlimeImportDeclaration extends BaseModuleDeclaration {
    type: "ImportDeclaration";
    specifiers: Array<ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier>;
    source: Literal;
}

export interface SlimeImportSpecifier extends BaseModuleSpecifier {
    type: "ImportSpecifier";
    imported: Identifier | Literal;
}

export interface SlimeImportExpression extends BaseExpression {
    type: "ImportExpression";
    source: Expression;
}

export interface SlimeImportDefaultSpecifier extends BaseModuleSpecifier {
    type: "ImportDefaultSpecifier";
}

export interface SlimeImportNamespaceSpecifier extends BaseModuleSpecifier {
    type: "ImportNamespaceSpecifier";
}

export interface SlimeExportNamedDeclaration extends BaseModuleDeclaration {
    type: "ExportNamedDeclaration";
    declaration?: Declaration | null | undefined;
    specifiers: ExportSpecifier[];
    source?: Literal | null | undefined;
}

export interface SlimeExportSpecifier extends Omit<BaseModuleSpecifier, "local"> {
    type: "ExportSpecifier";
    local: Identifier | Literal;
    exported: Identifier | Literal;
}

export interface SlimeExportDefaultDeclaration extends BaseModuleDeclaration {
    type: "ExportDefaultDeclaration";
    declaration: MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | Expression;
}

export interface SlimeExportAllDeclaration extends BaseModuleDeclaration {
    type: "ExportAllDeclaration";
    exported: Identifier | Literal | null;
    source: Literal;
}

export interface SlimeAwaitExpression extends BaseExpression {
    type: "AwaitExpression";
    argument: Expression;
}
