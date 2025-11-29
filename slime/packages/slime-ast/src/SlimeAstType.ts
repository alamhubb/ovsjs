/**
 * SlimeAstType - AST 节点类型枚举
 *
 * 与 ESTree 规范的 type 字符串完全一致
 */

export enum SlimeAstType {
    // --- Program ---
    Program = "Program",

    // --- Identifier ---
    Identifier = "Identifier",
    PrivateIdentifier = "PrivateIdentifier",

    // --- Literal ---
    Literal = "Literal",

    // --- Statements ---
    ExpressionStatement = "ExpressionStatement",
    BlockStatement = "BlockStatement",
    StaticBlock = "StaticBlock",
    EmptyStatement = "EmptyStatement",
    DebuggerStatement = "DebuggerStatement",
    ReturnStatement = "ReturnStatement",
    BreakStatement = "BreakStatement",
    ContinueStatement = "ContinueStatement",
    LabeledStatement = "LabeledStatement",
    WithStatement = "WithStatement",
    IfStatement = "IfStatement",
    SwitchStatement = "SwitchStatement",
    SwitchCase = "SwitchCase",
    ThrowStatement = "ThrowStatement",
    TryStatement = "TryStatement",
    CatchClause = "CatchClause",
    WhileStatement = "WhileStatement",
    DoWhileStatement = "DoWhileStatement",
    ForStatement = "ForStatement",
    ForInStatement = "ForInStatement",
    ForOfStatement = "ForOfStatement",

    // --- Declarations ---
    FunctionDeclaration = "FunctionDeclaration",
    VariableDeclaration = "VariableDeclaration",
    VariableDeclarator = "VariableDeclarator",
    ClassDeclaration = "ClassDeclaration",

    // --- Expressions ---
    ThisExpression = "ThisExpression",
    ArrayExpression = "ArrayExpression",
    ObjectExpression = "ObjectExpression",
    Property = "Property",
    FunctionExpression = "FunctionExpression",
    ArrowFunctionExpression = "ArrowFunctionExpression",
    ClassExpression = "ClassExpression",
    UnaryExpression = "UnaryExpression",
    UpdateExpression = "UpdateExpression",
    BinaryExpression = "BinaryExpression",
    AssignmentExpression = "AssignmentExpression",
    LogicalExpression = "LogicalExpression",
    MemberExpression = "MemberExpression",
    ConditionalExpression = "ConditionalExpression",
    CallExpression = "CallExpression",
    NewExpression = "NewExpression",
    SequenceExpression = "SequenceExpression",
    TemplateLiteral = "TemplateLiteral",
    TaggedTemplateExpression = "TaggedTemplateExpression",
    TemplateElement = "TemplateElement",
    SpreadElement = "SpreadElement",
    YieldExpression = "YieldExpression",
    AwaitExpression = "AwaitExpression",
    ImportExpression = "ImportExpression",
    ChainExpression = "ChainExpression",
    MetaProperty = "MetaProperty",
    Super = "Super",

    // --- Patterns ---
    ObjectPattern = "ObjectPattern",
    ArrayPattern = "ArrayPattern",
    RestElement = "RestElement",
    AssignmentPattern = "AssignmentPattern",

    // --- Classes ---
    ClassBody = "ClassBody",
    MethodDefinition = "MethodDefinition",
    PropertyDefinition = "PropertyDefinition",

    // --- Modules ---
    ImportDeclaration = "ImportDeclaration",
    ImportSpecifier = "ImportSpecifier",
    ImportDefaultSpecifier = "ImportDefaultSpecifier",
    ImportNamespaceSpecifier = "ImportNamespaceSpecifier",
    ExportNamedDeclaration = "ExportNamedDeclaration",
    ExportSpecifier = "ExportSpecifier",
    ExportDefaultDeclaration = "ExportDefaultDeclaration",
    ExportAllDeclaration = "ExportAllDeclaration",
}
