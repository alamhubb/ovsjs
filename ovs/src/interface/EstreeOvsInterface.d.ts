/*
import {
    ArrayExpression, ArrayPattern, ArrowFunctionExpression,
    AssignmentExpression, AssignmentOperator, AssignmentPattern, AssignmentProperty,
    AwaitExpression,
    BaseCallExpression,
    BaseFunction,
    BaseModuleDeclaration,
    BaseModuleSpecifier,
    PropertyDefinition,
    BaseNode,
    BigIntLiteral,
    BinaryExpression, BinaryOperator,
    BlockStatement, BreakStatement, CatchClause,
    ChainExpression,
    ClassBody,
    ClassDeclaration, ClassExpression,
    Comment,
    ConditionalExpression, ContinueStatement, DebuggerStatement,
    Directive, DoWhileStatement, EmptyStatement,
    ExportDefaultDeclaration,
    Expression,
    ExpressionMap, ExpressionStatement, ForInStatement, ForOfStatement, ForStatement, FunctionDeclaration,
    Identifier, IfStatement, ImportExpression, LabeledStatement,
    LogicalExpression, LogicalOperator,
    MaybeNamedClassDeclaration,
    MaybeNamedFunctionDeclaration,
    MemberExpression,
    MetaProperty,
    MethodDefinition,
    ModuleDeclaration, NewExpression, ObjectExpression, ObjectPattern,
    Pattern, PrivateIdentifier,
    type Program,
    Property, RegExpLiteral, RestElement, ReturnStatement,
    SequenceExpression, SimpleCallExpression, SimpleLiteral,
    SpreadElement,
    Statement, StaticBlock, Super, SwitchCase, SwitchStatement,
    TaggedTemplateExpression, TemplateElement,
    TemplateLiteral,
    ThisExpression, ThrowStatement, TryStatement,
    UnaryExpression, UnaryOperator,
    UpdateExpression, UpdateOperator, VariableDeclarator, WhileStatement, WithStatement,
    YieldExpression, VariableDeclaration
} from "estree";

// 自定义声明类型
export interface OvsAstRenderDomViewDeclaration {
    type: "OvsRenderDomViewDeclaration";
    id: OvsAstIdentifier;
    children: OvsRenderDomViewDeclarator[];
    arguments: OvsAstExpression[];
}

export type OvsRenderDomViewDeclarator =
    // | OvsAstLexicalBinding
    | OvsAstAssignmentExpression

export interface OvsAstLexicalBinding {
    type: "OvsLexicalBinding";
    id: OvsAstIdentifier;
    init?: OvsAstExpression | null | undefined;
}

// 节点映射
export interface OvsAstNodeMap {
    AssignmentProperty: OvsAstAssignmentProperty;
    CatchClause: OvsAstCatchClause;
    Class: OvsAstClass;
    ClassBody: OvsAstClassBody;
    Expression: OvsAstExpression;
    Function: OvsAstFunction;
    Identifier: OvsAstIdentifier;
    Literal: OvsAstLiteral;
    MethodDefinition: OvsAstMethodDefinition;
    ModuleDeclaration: OvsAstModuleDeclaration;
    ModuleSpecifier: OvsAstModuleSpecifier;
    Pattern: OvsAstPattern;
    PrivateIdentifier: OvsAstPrivateIdentifier;
    Program: OvsAstProgram;
    Property: OvsAstProperty;
    PropertyDefinition: OvsAstPropertyDefinition;
    SpreadElement: OvsAstSpreadElement;
    Statement: OvsAstStatement;
    Super: OvsAstSuper;
    SwitchCase: OvsAstSwitchCase;
    TemplateElement: OvsAstTemplateElement;
    VariableDeclarator: OvsAstVariableDeclarator;
}

export type OvsAstNode = OvsAstNodeMap[keyof OvsAstNodeMap];

export interface OvsAstSourceLocation {
    source?: string | null | undefined;
    start: OvsAstPosition;
    end: OvsAstPosition;
}

export interface OvsAstPosition {
    line: number;
    column: number;
}

export interface OvsAstProgram extends Program {
    body: Array<OvsAstDirective | OvsAstStatement | OvsAstModuleDeclaration>;
}

export interface OvsAstDirective extends Directive {
    type: "ExpressionStatement";
    expression: OvsAstLiteral;
    directive: string;
}

export interface OvsAstBaseFunction extends BaseFunction {
    params: OvsAstPattern[];
    generator?: boolean | undefined;
    async?: boolean | undefined;
    body: OvsAstBlockStatement | OvsAstExpression;
}

export type OvsAstFunction = OvsAstFunctionDeclaration | OvsAstFunctionExpression | OvsAstArrowFunctionExpression;


export interface OvsAstEmptyStatement extends EmptyStatement {
    type: "EmptyStatement";
}

export interface OvsAstBlockStatement extends BlockStatement {
    type: "BlockStatement";
    body: OvsAstStatement[];
    innerComments?: Comment[] | undefined;
}

export interface OvsAstStaticBlock extends StaticBlock {
    type: "StaticBlock";
}

export interface OvsAstExpressionStatement extends ExpressionStatement {
    type: "ExpressionStatement";
    expression: OvsAstExpression;
}

// Statement 相关接口继续
export interface OvsAstIfStatement extends IfStatement {
    type: "IfStatement";
    test: OvsAstExpression;
    consequent: OvsAstStatement;
    alternate?: OvsAstStatement | null | undefined;
}

export interface OvsAstLabeledStatement extends LabeledStatement {
    type: "LabeledStatement";
    label: OvsAstIdentifier;
    body: OvsAstStatement;
}

export interface OvsAstBreakStatement extends BreakStatement {
    type: "BreakStatement";
    label?: OvsAstIdentifier | null | undefined;
}

export interface OvsAstContinueStatement extends ContinueStatement {
    type: "ContinueStatement";
    label?: OvsAstIdentifier | null | undefined;
}

export interface OvsAstWithStatement extends WithStatement {
    type: "WithStatement";
    object: OvsAstExpression;
    body: OvsAstStatement;
}

export interface OvsAstSwitchStatement extends SwitchStatement {
    type: "SwitchStatement";
    discriminant: OvsAstExpression;
    cases: OvsAstSwitchCase[];
}

export interface OvsAstReturnStatement extends ReturnStatement {
    type: "ReturnStatement";
    argument?: OvsAstExpression | null | undefined;
}

export interface OvsAstThrowStatement extends ThrowStatement {
    type: "ThrowStatement";
    argument: OvsAstExpression;
}

export interface OvsAstTryStatement extends TryStatement {
    type: "TryStatement";
    block: OvsAstBlockStatement;
    handler?: OvsAstCatchClause | null | undefined;
    finalizer?: OvsAstBlockStatement | null | undefined;
}

export interface OvsAstWhileStatement extends WhileStatement {
    type: "WhileStatement";
    test: OvsAstExpression;
    body: OvsAstStatement;
}

export interface OvsAstDoWhileStatement extends DoWhileStatement {
    type: "DoWhileStatement";
    body: OvsAstStatement;
    test: OvsAstExpression;
}

export interface OvsAstForStatement extends ForStatement {
    type: "ForStatement";
    init?: VariableDeclaration | Expression | null | undefined;
    test?: Expression | null | undefined;
    update?: Expression | null | undefined;
    body: Statement;
}

export type OvsAstStatement =
    | OvsAstExpressionStatement
    | OvsAstBlockStatement
    | OvsAstStaticBlock
    | OvsAstEmptyStatement
    | OvsAstDebuggerStatement
    | OvsAstWithStatement
    | OvsAstReturnStatement
    | OvsAstLabeledStatement
    | OvsAstBreakStatement
    | OvsAstContinueStatement
    | OvsAstIfStatement
    | OvsAstSwitchStatement
    | OvsAstThrowStatement
    | OvsAstTryStatement
    | OvsAstWhileStatement
    | OvsAstDoWhileStatement
    | OvsAstForStatement
    | OvsAstForInStatement
    | OvsAstForOfStatement
    | OvsAstDeclaration;

export interface OvsAstForInStatement extends ForInStatement {
    type: "ForInStatement";
}

export interface OvsAstDebuggerStatement extends DebuggerStatement {
    type: "DebuggerStatement";
}

// Declaration 相关定义
export type OvsAstDeclaration = OvsAstFunctionDeclaration | OvsAstVariableDeclaration | OvsAstClassDeclaration;

export interface OvsAstVariableDeclaration extends VariableDeclaration {
    type: "VariableDeclaration";
    declarations: OvsAstVariableDeclarator[];
    kind: "var" | "let" | "const";
}

export interface OvsAstMaybeNamedFunctionDeclaration extends MaybeNamedFunctionDeclaration {
    type: "FunctionDeclaration";
    id: OvsAstIdentifier | null;
    body: OvsAstBlockStatement;
}

export interface OvsAstFunctionDeclaration extends FunctionDeclaration {
    id: OvsAstIdentifier;
}

export interface OvsAstVariableDeclarator extends VariableDeclarator {
    type: "VariableDeclarator";
    id: OvsAstPattern;
    init?: OvsAstExpression | null | undefined;
}

// Expression 相关定义
export interface OvsAstExpressionMap extends ExpressionMap {
    ArrayExpression: OvsAstArrayExpression;
    ArrowFunctionExpression: OvsAstArrowFunctionExpression;
    AssignmentExpression: OvsAstAssignmentExpression;
    AwaitExpression: OvsAstAwaitExpression;
    BinaryExpression: OvsAstBinaryExpression;
    CallExpression: OvsAstCallExpression;
    ChainExpression: OvsAstChainExpression;
    ClassExpression: OvsAstClassExpression;
    ConditionalExpression: OvsAstConditionalExpression;
    FunctionExpression: OvsAstFunctionExpression;
    Identifier: OvsAstIdentifier;
    ImportExpression: OvsAstImportExpression;
    Literal: OvsAstLiteral;
    LogicalExpression: OvsAstLogicalExpression;
    MemberExpression: OvsAstMemberExpression;
    MetaProperty: OvsAstMetaProperty;
    NewExpression: OvsAstNewExpression;
    ObjectExpression: OvsAstObjectExpression;
    SequenceExpression: OvsAstSequenceExpression;
    TaggedTemplateExpression: OvsAstTaggedTemplateExpression;
    TemplateLiteral: OvsAstTemplateLiteral;
    ThisExpression: OvsAstThisExpression;
    UnaryExpression: OvsAstUnaryExpression;
    UpdateExpression: OvsAstUpdateExpression;
    YieldExpression: OvsAstYieldExpression;
}

export type OvsAstExpression = OvsAstExpressionMap[keyof OvsAstExpressionMap];

// Expression 相关接口继续
export type OvsAstChainElement = OvsAstSimpleCallExpression | OvsAstMemberExpression;

export interface OvsAstChainExpression extends ChainExpression {
    type: "ChainExpression";
    expression: OvsAstChainElement;
}

export interface OvsAstThisExpression extends ThisExpression {
    type: "ThisExpression";
}

export interface OvsAstArrayExpression extends ArrayExpression {
    type: "ArrayExpression";
    elements: Array<OvsAstExpression | OvsAstSpreadElement | null>;
}

export interface OvsAstObjectExpression extends ObjectExpression {
    type: "ObjectExpression";
    properties: Array<OvsAstProperty | OvsAstSpreadElement>;
}

export interface OvsAstPrivateIdentifier extends PrivateIdentifier {
    type: "PrivateIdentifier";
    name: string;
}

export interface OvsAstProperty extends Property {
    type: "Property";
    key: OvsAstExpression | OvsAstPrivateIdentifier;
    value: OvsAstExpression | OvsAstPattern;
    kind: "init" | "get" | "set";
    method: boolean;
    shorthand: boolean;
    computed: boolean;
}

export interface OvsAstPropertyDefinition extends PropertyDefinition {
    type: "PropertyDefinition";
    key: OvsAstExpression | OvsAstPrivateIdentifier;
    value?: OvsAstExpression | null | undefined;
    computed: boolean;
    static: boolean;
}

export interface OvsAstFunctionExpression extends OvsAstBaseFunction {
    type: "FunctionExpression";
    id?: OvsAstIdentifier | null | undefined;
    body: OvsAstBlockStatement;
}

export interface OvsAstSequenceExpression extends SequenceExpression {
    type: "SequenceExpression";
    expressions: OvsAstExpression[];
}

export interface OvsAstUnaryExpression extends UnaryExpression {
    type: "UnaryExpression";
    operator: UnaryOperator;
    prefix: true;
    argument: OvsAstExpression;
}

export interface OvsAstBinaryExpression extends BinaryExpression {
    type: "BinaryExpression";
    operator: BinaryOperator;
    left: OvsAstExpression | OvsAstPrivateIdentifier;
    right: OvsAstExpression;
}

// Expression 相关接口继续
export interface OvsAstAssignmentExpression extends AssignmentExpression {
    type: "AssignmentExpression";
    operator: AssignmentOperator;
    left: OvsAstPattern | OvsAstMemberExpression;
    right: OvsAstExpression;
}

export interface OvsAstUpdateExpression extends UpdateExpression {
    type: "UpdateExpression";
    operator: UpdateOperator;
    argument: OvsAstExpression;
    prefix: boolean;
}

export interface OvsAstLogicalExpression extends LogicalExpression {
    type: "LogicalExpression";
    operator: LogicalOperator;
    left: OvsAstExpression;
    right: OvsAstExpression;
}

export interface OvsAstConditionalExpression extends ConditionalExpression {
    type: "ConditionalExpression";
    test: OvsAstExpression;
    alternate: OvsAstExpression;
    consequent: OvsAstExpression;
}

export interface OvsAstBaseCallExpression extends BaseCallExpression {
    callee: OvsAstExpression | OvsAstSuper;
    arguments: Array<OvsAstExpression | OvsAstSpreadElement>;
}

export type OvsAstCallExpression = OvsAstSimpleCallExpression | OvsAstNewExpression;

export interface OvsAstSimpleCallExpression extends SimpleCallExpression {
    type: "CallExpression";
    optional: boolean;
}

export interface OvsAstNewExpression extends NewExpression {
    type: "NewExpression";
}


export interface OvsAstMemberExpression extends MemberExpression {
    type: "MemberExpression";
    object: OvsAstExpression | OvsAstSuper;
    property: OvsAstExpression | OvsAstPrivateIdentifier;
    computed: boolean;
    optional: boolean;
}

// Pattern 相关定义
export type OvsAstPattern = Pattern & (
    | OvsAstIdentifier
    | OvsAstObjectPattern
    | OvsAstArrayPattern
    | OvsAstRestElement
    | OvsAstAssignmentPattern
    | OvsAstMemberExpression
    )

// 其他节点类型定义
export interface OvsAstSwitchCase extends SwitchCase {
    type: "SwitchCase";
    test?: OvsAstExpression | null | undefined;
    consequent: OvsAstStatement[];
}

export interface OvsAstCatchClause extends CatchClause {
    type: "CatchClause";
    param: OvsAstPattern | null;
    body: OvsAstBlockStatement;
}

export interface OvsAstIdentifier extends Identifier {
    type: "Identifier";
    name: string;
}

// Literal 相关定义
export type OvsAstLiteral = OvsAstSimpleLiteral | OvsAstRegExpLiteral | OvsAstBigIntLiteral;

export interface OvsAstSimpleLiteral extends SimpleLiteral {
    type: "Literal";
    value: string | boolean | number | null;
    raw?: string | undefined;
}

export interface OvsAstRegExpLiteral extends RegExpLiteral {
    type: "Literal";
    value?: RegExp | null | undefined;
    regex: {
        pattern: string;
        flags: string;
    };
    raw?: string | undefined;
}

export interface OvsAstBigIntLiteral extends BigIntLiteral {
    type: "Literal";
    value?: bigint | null | undefined;
    bigint: string;
    raw?: string | undefined;
}

// ForOfStatement 和其他类型定义
export interface OvsAstForOfStatement extends ForOfStatement {
    type: "ForOfStatement";
    await: boolean;
}

export interface OvsAstSuper extends Super {
    type: "Super";
}

export interface OvsAstSpreadElement extends SpreadElement {
    type: "SpreadElement";
    argument: OvsAstExpression;
}

export interface OvsAstArrowFunctionExpression extends ArrowFunctionExpression {
    type: "ArrowFunctionExpression";
    expression: boolean;
    body: OvsAstBlockStatement | OvsAstExpression;
}

export interface OvsAstYieldExpression extends YieldExpression {
    type: "YieldExpression";
    argument?: OvsAstExpression | null | undefined;
    delegate: boolean;
}

// Template 相关定义
export interface OvsAstTemplateLiteral extends TemplateLiteral {
    type: "TemplateLiteral";
    quasis: OvsAstTemplateElement[];
    expressions: OvsAstExpression[];
}

export interface OvsAstTaggedTemplateExpression extends TaggedTemplateExpression {
    type: "TaggedTemplateExpression";
    tag: OvsAstExpression;
    quasi: OvsAstTemplateLiteral;
}

export interface OvsAstTemplateElement extends TemplateElement {
    type: "TemplateElement";
    tail: boolean;
    value: {
        cooked?: string | null | undefined;
        raw: string;
    };
}

// Pattern 相关定义
export interface OvsAstAssignmentProperty extends AssignmentProperty {
    value: OvsAstPattern;
    kind: "init";
    method: false;
}

export interface OvsAstObjectPattern extends ObjectPattern {
    type: "ObjectPattern";
    properties: Array<OvsAstAssignmentProperty | OvsAstRestElement>;
}

export interface OvsAstArrayPattern extends ArrayPattern {
    type: "ArrayPattern";
    elements: Array<OvsAstPattern | null>;
}

export interface OvsAstRestElement extends RestElement {
    type: "RestElement";
    argument: OvsAstPattern;
}

export interface OvsAstAssignmentPattern extends AssignmentPattern {
    type: "AssignmentPattern";
    left: OvsAstPattern;
    right: OvsAstExpression;
}

// Class 相关定义
export type OvsAstClass = OvsAstClassDeclaration | OvsAstClassExpression;


export interface OvsAstClassBody extends ClassBody {
    type: "ClassBody";
    body: Array<OvsAstMethodDefinition | OvsAstPropertyDefinition | OvsAstStaticBlock>;
}

// 你的自定义扩展
export interface OvsAstMethodDefinition extends MethodDefinition {
    type: "MethodDefinition";
    key: Expression | PrivateIdentifier;
    value: OvsAstFunctionExpression;
    kind: "constructor" | "method" | "get" | "set";
    computed: boolean;
    static: boolean;
}

export interface OvsAstMaybeNamedClassDeclaration extends MaybeNamedClassDeclaration {
    type: "ClassDeclaration";
    id: OvsAstIdentifier | null;
}

export interface OvsAstClassDeclaration extends ClassDeclaration {
    class: BaseNode;
}

export interface OvsAstClassExpression extends ClassExpression {
    type: "ClassExpression";
    id?: OvsAstIdentifier | null | undefined;
}

// Meta 和 Module 相关定义
export interface OvsAstMetaProperty extends MetaProperty {
    type: "MetaProperty";
    meta: OvsAstIdentifier;
    property: OvsAstIdentifier;
}

export type OvsAstModuleDeclaration = ModuleDeclaration & (
    | OvsAstImportDeclaration
    | OvsAstExportNamedDeclaration
    | OvsAstExportDefaultDeclaration
    | OvsAstExportAllDeclaration
    );

export interface OvsAstBaseModuleDeclaration extends BaseModuleDeclaration {
}

export type OvsAstModuleSpecifier =
    | OvsAstImportSpecifier
    | OvsAstImportDefaultSpecifier
    | OvsAstImportNamespaceSpecifier
    | OvsAstExportSpecifier;

export interface OvsAstBaseModuleSpecifier extends BaseModuleSpecifier {
    local: OvsAstIdentifier;
}

export interface OvsAstImportDeclaration extends BaseModuleDeclaration {
    type: "ImportDeclaration";
    specifiers: Array<OvsAstImportSpecifier | OvsAstImportDefaultSpecifier | OvsAstImportNamespaceSpecifier>;
    source: OvsAstLiteral;
}

export interface OvsAstImportSpecifier extends OvsAstBaseModuleSpecifier {
    type: "ImportSpecifier";
    imported: OvsAstIdentifier | OvsAstLiteral;
}

export interface OvsAstImportExpression extends ImportExpression {
    type: "ImportExpression";
    source: OvsAstExpression;
}

export interface OvsAstImportDefaultSpecifier extends OvsAstBaseModuleSpecifier {
    type: "ImportDefaultSpecifier";
}

export interface OvsAstImportNamespaceSpecifier extends OvsAstBaseModuleSpecifier {
    type: "ImportNamespaceSpecifier";
}

// Export 相关定义
export interface OvsAstExportNamedDeclaration extends BaseModuleDeclaration {
    type: "ExportNamedDeclaration";
    declaration?: OvsAstDeclaration | null | undefined;
    specifiers: OvsAstExportSpecifier[];
    source?: OvsAstLiteral | null | undefined;
}

export interface OvsAstExportSpecifier extends Omit<OvsAstBaseModuleSpecifier, "local"> {
    type: "ExportSpecifier";
    local: OvsAstIdentifier | OvsAstLiteral;
    exported: OvsAstIdentifier | OvsAstLiteral;
}

export interface OvsAstExportDefaultDeclaration extends ExportDefaultDeclaration, OvsAstBaseModuleDeclaration {
    type: "ExportDefaultDeclaration";
    declaration: OvsAstMaybeNamedFunctionDeclaration | OvsAstMaybeNamedClassDeclaration | OvsAstExpression;
    export: BaseNode;
    default: BaseNode;
}

export interface OvsAstExportAllDeclaration extends BaseModuleDeclaration {
    type: "ExportAllDeclaration";
    exported: OvsAstIdentifier | OvsAstLiteral | null;
    source: OvsAstLiteral;
}

export interface OvsAstAwaitExpression extends AwaitExpression {
    type: "AwaitExpression";
    argument: OvsAstExpression;
}
*/
