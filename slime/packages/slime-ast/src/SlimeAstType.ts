/**
 * SlimeAstType - AST 节点类型枚举
 *
 * 完全按照 ECMAScript® 2025 规范 (es2025-grammar.md) 定义
 * 与 Es2025Parser.ts 中的规则 1:1 对应
 *
 * @see https://tc39.es/ecma262/2025/#sec-grammar-summary
 */

export enum SlimeAstType {
    // ============================================
    // A.2 表达式 (Expressions)
    // ============================================

    // --- A.2.1 标识符引用 ---
    IdentifierReference = 'IdentifierReference',
    BindingIdentifier = 'BindingIdentifier',
    LabelIdentifier = 'LabelIdentifier',
    Identifier = 'Identifier',
    IdentifierName = 'IdentifierName',
    PrivateIdentifier = 'PrivateIdentifier',

    // --- A.2.2 基本表达式 ---
    PrimaryExpression = 'PrimaryExpression',
    CoverParenthesizedExpressionAndArrowParameterList = 'CoverParenthesizedExpressionAndArrowParameterList',
    ParenthesizedExpression = 'ParenthesizedExpression',

    // --- A.2.3 字面量 ---
    Literal = 'Literal',
    NullLiteral = 'NullLiteral',
    BooleanLiteral = 'BooleanLiteral',
    NumericLiteral = 'NumericLiteral',
    StringLiteral = 'StringLiteral',
    RegularExpressionLiteral = 'RegularExpressionLiteral',

    // --- A.2.4 数组字面量 ---
    ArrayLiteral = 'ArrayLiteral',
    ElementList = 'ElementList',
    Elision = 'Elision',
    SpreadElement = 'SpreadElement',

    // --- A.2.5 对象字面量 ---
    ObjectLiteral = 'ObjectLiteral',
    PropertyDefinitionList = 'PropertyDefinitionList',
    PropertyDefinition = 'PropertyDefinition',
    PropertyName = 'PropertyName',
    LiteralPropertyName = 'LiteralPropertyName',
    ComputedPropertyName = 'ComputedPropertyName',
    CoverInitializedName = 'CoverInitializedName',
    Initializer = 'Initializer',

    // --- A.2.6 模板字面量 ---
    TemplateLiteral = 'TemplateLiteral',
    SubstitutionTemplate = 'SubstitutionTemplate',
    TemplateSpans = 'TemplateSpans',
    TemplateMiddleList = 'TemplateMiddleList',

    // --- A.2.7 成员表达式 ---
    MemberExpression = 'MemberExpression',
    SuperProperty = 'SuperProperty',
    MetaProperty = 'MetaProperty',
    NewTarget = 'NewTarget',
    ImportMeta = 'ImportMeta',
    NewExpression = 'NewExpression',

    // --- A.2.8 调用表达式 ---
    CallExpression = 'CallExpression',
    CoverCallExpressionAndAsyncArrowHead = 'CoverCallExpressionAndAsyncArrowHead',
    CallMemberExpression = 'CallMemberExpression',
    SuperCall = 'SuperCall',
    ImportCall = 'ImportCall',
    Arguments = 'Arguments',
    ArgumentList = 'ArgumentList',

    // --- A.2.9 可选链 ---
    OptionalExpression = 'OptionalExpression',
    OptionalChain = 'OptionalChain',
    LeftHandSideExpression = 'LeftHandSideExpression',

    // --- A.2.10 更新表达式 ---
    UpdateExpression = 'UpdateExpression',

    // --- A.2.11 一元表达式 ---
    UnaryExpression = 'UnaryExpression',
    AwaitExpression = 'AwaitExpression',

    // --- A.2.12 二元表达式 ---
    ExponentiationExpression = 'ExponentiationExpression',
    MultiplicativeExpression = 'MultiplicativeExpression',
    AdditiveExpression = 'AdditiveExpression',
    ShiftExpression = 'ShiftExpression',
    RelationalExpression = 'RelationalExpression',
    EqualityExpression = 'EqualityExpression',
    BitwiseANDExpression = 'BitwiseANDExpression',
    BitwiseXORExpression = 'BitwiseXORExpression',
    BitwiseORExpression = 'BitwiseORExpression',
    LogicalANDExpression = 'LogicalANDExpression',
    LogicalORExpression = 'LogicalORExpression',
    CoalesceExpression = 'CoalesceExpression',
    CoalesceExpressionHead = 'CoalesceExpressionHead',
    ShortCircuitExpression = 'ShortCircuitExpression',
    ConditionalExpression = 'ConditionalExpression',

    // --- A.2.13 赋值表达式 ---
    AssignmentExpression = 'AssignmentExpression',
    AssignmentOperator = 'AssignmentOperator',
    AssignmentPattern = 'AssignmentPattern',
    ObjectAssignmentPattern = 'ObjectAssignmentPattern',
    ArrayAssignmentPattern = 'ArrayAssignmentPattern',
    AssignmentRestProperty = 'AssignmentRestProperty',
    AssignmentPropertyList = 'AssignmentPropertyList',
    AssignmentElementList = 'AssignmentElementList',
    AssignmentElisionElement = 'AssignmentElisionElement',
    AssignmentProperty = 'AssignmentProperty',
    AssignmentElement = 'AssignmentElement',
    AssignmentRestElement = 'AssignmentRestElement',
    DestructuringAssignmentTarget = 'DestructuringAssignmentTarget',

    // --- A.2.14 逗号表达式 ---
    Expression = 'Expression',

    // ============================================
    // A.3 语句 (Statements)
    // ============================================

    // --- A.3.1 通用 ---
    Statement = 'Statement',
    Declaration = 'Declaration',
    HoistableDeclaration = 'HoistableDeclaration',
    BreakableStatement = 'BreakableStatement',

    // --- A.3.2 块语句 ---
    BlockStatement = 'BlockStatement',
    Block = 'Block',
    StatementList = 'StatementList',
    StatementListItem = 'StatementListItem',

    // --- A.3.3 变量声明 ---
    LexicalDeclaration = 'LexicalDeclaration',
    LetOrConst = 'LetOrConst',
    BindingList = 'BindingList',
    LexicalBinding = 'LexicalBinding',
    VariableStatement = 'VariableStatement',
    VariableDeclarationList = 'VariableDeclarationList',
    VariableDeclaration = 'VariableDeclaration',

    // --- A.3.4 绑定模式 ---
    BindingPattern = 'BindingPattern',
    ObjectBindingPattern = 'ObjectBindingPattern',
    ArrayBindingPattern = 'ArrayBindingPattern',
    BindingRestProperty = 'BindingRestProperty',
    BindingPropertyList = 'BindingPropertyList',
    BindingElementList = 'BindingElementList',
    BindingElisionElement = 'BindingElisionElement',
    BindingProperty = 'BindingProperty',
    BindingElement = 'BindingElement',
    SingleNameBinding = 'SingleNameBinding',
    BindingRestElement = 'BindingRestElement',

    // --- A.3.5 简单语句 ---
    EmptyStatement = 'EmptyStatement',
    ExpressionStatement = 'ExpressionStatement',

    // --- A.3.6 If 语句 ---
    IfStatement = 'IfStatement',

    // --- A.3.7 迭代语句 ---
    IterationStatement = 'IterationStatement',
    DoWhileStatement = 'DoWhileStatement',
    WhileStatement = 'WhileStatement',
    ForStatement = 'ForStatement',
    ForInOfStatement = 'ForInOfStatement',
    ForDeclaration = 'ForDeclaration',
    ForBinding = 'ForBinding',

    // --- A.3.8 控制流语句 ---
    ContinueStatement = 'ContinueStatement',
    BreakStatement = 'BreakStatement',
    ReturnStatement = 'ReturnStatement',

    // --- A.3.9 With 语句 ---
    WithStatement = 'WithStatement',

    // --- A.3.10 Switch 语句 ---
    SwitchStatement = 'SwitchStatement',
    CaseBlock = 'CaseBlock',
    CaseClauses = 'CaseClauses',
    CaseClause = 'CaseClause',
    DefaultClause = 'DefaultClause',

    // --- A.3.11 标签语句 ---
    LabelledStatement = 'LabelledStatement',
    LabelledItem = 'LabelledItem',

    // --- A.3.12 Throw 语句 ---
    ThrowStatement = 'ThrowStatement',

    // --- A.3.13 Try 语句 ---
    TryStatement = 'TryStatement',
    Catch = 'Catch',
    Finally = 'Finally',
    CatchParameter = 'CatchParameter',

    // --- A.3.14 Debugger 语句 ---
    DebuggerStatement = 'DebuggerStatement',

    // ============================================
    // A.4 函数和类 (Functions and Classes)
    // ============================================

    // --- A.4.1 函数参数 ---
    UniqueFormalParameters = 'UniqueFormalParameters',
    FormalParameters = 'FormalParameters',
    FormalParameterList = 'FormalParameterList',
    FunctionRestParameter = 'FunctionRestParameter',
    FormalParameter = 'FormalParameter',

    // --- A.4.2 函数定义 ---
    FunctionDeclaration = 'FunctionDeclaration',
    FunctionExpression = 'FunctionExpression',
    FunctionBody = 'FunctionBody',
    FunctionStatementList = 'FunctionStatementList',

    // --- A.4.3 箭头函数 ---
    ArrowFunction = 'ArrowFunction',
    ArrowParameters = 'ArrowParameters',
    ArrowFormalParameters = 'ArrowFormalParameters',
    ConciseBody = 'ConciseBody',
    ExpressionBody = 'ExpressionBody',

    // --- A.4.4 异步箭头函数 ---
    AsyncArrowFunction = 'AsyncArrowFunction',
    AsyncArrowBindingIdentifier = 'AsyncArrowBindingIdentifier',
    AsyncConciseBody = 'AsyncConciseBody',
    AsyncArrowHead = 'AsyncArrowHead',

    // --- A.4.5 方法定义 ---
    MethodDefinition = 'MethodDefinition',
    PropertySetParameterList = 'PropertySetParameterList',

    // --- A.4.6 Generator 函数 ---
    GeneratorDeclaration = 'GeneratorDeclaration',
    GeneratorExpression = 'GeneratorExpression',
    GeneratorMethod = 'GeneratorMethod',
    GeneratorBody = 'GeneratorBody',
    YieldExpression = 'YieldExpression',

    // --- A.4.7 异步 Generator 函数 ---
    AsyncGeneratorDeclaration = 'AsyncGeneratorDeclaration',
    AsyncGeneratorExpression = 'AsyncGeneratorExpression',
    AsyncGeneratorMethod = 'AsyncGeneratorMethod',
    AsyncGeneratorBody = 'AsyncGeneratorBody',

    // --- A.4.8 异步函数 ---
    AsyncFunctionDeclaration = 'AsyncFunctionDeclaration',
    AsyncFunctionExpression = 'AsyncFunctionExpression',
    AsyncMethod = 'AsyncMethod',
    AsyncFunctionBody = 'AsyncFunctionBody',

    // --- A.4.9 类定义 ---
    ClassDeclaration = 'ClassDeclaration',
    ClassExpression = 'ClassExpression',
    ClassTail = 'ClassTail',
    ClassHeritage = 'ClassHeritage',
    ClassBody = 'ClassBody',
    ClassElementList = 'ClassElementList',
    ClassElement = 'ClassElement',
    FieldDefinition = 'FieldDefinition',
    ClassElementName = 'ClassElementName',
    ClassStaticBlock = 'ClassStaticBlock',
    ClassStaticBlockBody = 'ClassStaticBlockBody',
    ClassStaticBlockStatementList = 'ClassStaticBlockStatementList',

    // ============================================
    // A.5 脚本和模块 (Scripts and Modules)
    // ============================================

    // --- A.5.1 脚本 ---
    Script = 'Script',
    ScriptBody = 'ScriptBody',

    // --- A.5.2 模块 ---
    Module = 'Module',
    ModuleBody = 'ModuleBody',
    ModuleItemList = 'ModuleItemList',
    ModuleItem = 'ModuleItem',

    // --- A.5.3 模块名称 ---
    ModuleExportName = 'ModuleExportName',

    // --- A.5.4 导入 ---
    ImportDeclaration = 'ImportDeclaration',
    ImportClause = 'ImportClause',
    ImportedDefaultBinding = 'ImportedDefaultBinding',
    NameSpaceImport = 'NameSpaceImport',
    NamedImports = 'NamedImports',
    FromClause = 'FromClause',
    ImportsList = 'ImportsList',
    ImportSpecifier = 'ImportSpecifier',
    ModuleSpecifier = 'ModuleSpecifier',
    ImportedBinding = 'ImportedBinding',
    WithClause = 'WithClause',
    WithEntries = 'WithEntries',
    AttributeKey = 'AttributeKey',

    // --- A.5.5 导出 ---
    ExportDeclaration = 'ExportDeclaration',
    ExportFromClause = 'ExportFromClause',
    NamedExports = 'NamedExports',
    ExportsList = 'ExportsList',
    ExportSpecifier = 'ExportSpecifier',

    // ============================================
    // Token 类型 (终结符)
    // ============================================

    // --- 标点符号 ---
    LParen = 'LParen',                     // (
    RParen = 'RParen',                     // )
    LBrace = 'LBrace',                     // {
    RBrace = 'RBrace',                     // }
    LBracket = 'LBracket',                 // [
    RBracket = 'RBracket',                 // ]
    Dot = 'Dot',                           // .
    Ellipsis = 'Ellipsis',                 // ...
    Semicolon = 'Semicolon',               // ;
    Comma = 'Comma',                       // ,
    QuestionDot = 'QuestionDot',           // ?.
    Colon = 'Colon',                       // :
    QuestionMark = 'QuestionMark',         // ?
    Arrow = 'Arrow',                       // =>

    // --- 比较运算符 ---
    LessThan = 'LessThan',                 // <
    GreaterThan = 'GreaterThan',           // >
    LessThanEquals = 'LessThanEquals',     // <=
    GreaterThanEquals = 'GreaterThanEquals', // >=
    EqualsEquals = 'EqualsEquals',         // ==
    ExclamationEquals = 'ExclamationEquals', // !=
    EqualsEqualsEquals = 'EqualsEqualsEquals', // ===
    ExclamationEqualsEquals = 'ExclamationEqualsEquals', // !==

    // --- 算术运算符 ---
    Plus = 'Plus',                         // +
    Minus = 'Minus',                       // -
    Asterisk = 'Asterisk',                 // *
    Slash = 'Slash',                       // /
    Percent = 'Percent',                   // %
    AsteriskAsterisk = 'AsteriskAsterisk', // **

    // --- 自增自减运算符 ---
    PlusPlus = 'PlusPlus',                 // ++
    MinusMinus = 'MinusMinus',             // --

    // --- 位运算符 ---
    LessThanLessThan = 'LessThanLessThan', // <<
    GreaterThanGreaterThan = 'GreaterThanGreaterThan', // >>
    GreaterThanGreaterThanGreaterThan = 'GreaterThanGreaterThanGreaterThan', // >>>
    Ampersand = 'Ampersand',               // &
    Bar = 'Bar',                           // |
    Caret = 'Caret',                       // ^
    Tilde = 'Tilde',                       // ~
    Exclamation = 'Exclamation',           // !

    // --- 逻辑运算符 ---
    AmpersandAmpersand = 'AmpersandAmpersand', // &&
    BarBar = 'BarBar',                     // ||
    QuestionQuestion = 'QuestionQuestion', // ??

    // --- 赋值运算符 ---
    Equals = 'Equals',                     // =
    PlusEquals = 'PlusEquals',             // +=
    MinusEquals = 'MinusEquals',           // -=
    AsteriskEquals = 'AsteriskEquals',     // *=
    SlashEquals = 'SlashEquals',           // /=
    PercentEquals = 'PercentEquals',       // %=
    AsteriskAsteriskEquals = 'AsteriskAsteriskEquals', // **=
    LessThanLessThanEquals = 'LessThanLessThanEquals', // <<=
    GreaterThanGreaterThanEquals = 'GreaterThanGreaterThanEquals', // >>=
    GreaterThanGreaterThanGreaterThanEquals = 'GreaterThanGreaterThanGreaterThanEquals', // >>>=
    AmpersandEquals = 'AmpersandEquals',   // &=
    BarEquals = 'BarEquals',               // |=
    CaretEquals = 'CaretEquals',           // ^=
    AmpersandAmpersandEquals = 'AmpersandAmpersandEquals', // &&=
    BarBarEquals = 'BarBarEquals',         // ||=
    QuestionQuestionEquals = 'QuestionQuestionEquals', // ??=

    // --- 关键字 ---
    // 保留字
    AwaitKeyword = 'AwaitKeyword',
    BreakKeyword = 'BreakKeyword',
    CaseKeyword = 'CaseKeyword',
    CatchKeyword = 'CatchKeyword',
    ClassKeyword = 'ClassKeyword',
    ConstKeyword = 'ConstKeyword',
    ContinueKeyword = 'ContinueKeyword',
    DebuggerKeyword = 'DebuggerKeyword',
    DefaultKeyword = 'DefaultKeyword',
    DeleteKeyword = 'DeleteKeyword',
    DoKeyword = 'DoKeyword',
    ElseKeyword = 'ElseKeyword',
    EnumKeyword = 'EnumKeyword',
    ExportKeyword = 'ExportKeyword',
    ExtendsKeyword = 'ExtendsKeyword',
    FalseKeyword = 'FalseKeyword',
    FinallyKeyword = 'FinallyKeyword',
    ForKeyword = 'ForKeyword',
    FunctionKeyword = 'FunctionKeyword',
    IfKeyword = 'IfKeyword',
    ImportKeyword = 'ImportKeyword',
    InKeyword = 'InKeyword',
    InstanceofKeyword = 'InstanceofKeyword',
    NewKeyword = 'NewKeyword',
    NullKeyword = 'NullKeyword',
    ReturnKeyword = 'ReturnKeyword',
    SuperKeyword = 'SuperKeyword',
    SwitchKeyword = 'SwitchKeyword',
    ThisKeyword = 'ThisKeyword',
    ThrowKeyword = 'ThrowKeyword',
    TrueKeyword = 'TrueKeyword',
    TryKeyword = 'TryKeyword',
    TypeofKeyword = 'TypeofKeyword',
    VarKeyword = 'VarKeyword',
    VoidKeyword = 'VoidKeyword',
    WhileKeyword = 'WhileKeyword',
    WithKeyword = 'WithKeyword',
    YieldKeyword = 'YieldKeyword',

    // 上下文关键字
    AsyncKeyword = 'AsyncKeyword',
    FromKeyword = 'FromKeyword',
    GetKeyword = 'GetKeyword',
    LetKeyword = 'LetKeyword',
    MetaKeyword = 'MetaKeyword',
    OfKeyword = 'OfKeyword',
    SetKeyword = 'SetKeyword',
    StaticKeyword = 'StaticKeyword',
    TargetKeyword = 'TargetKeyword',
    AsKeyword = 'AsKeyword',

    // --- 模板字符串 Token ---
    NoSubstitutionTemplate = 'NoSubstitutionTemplate',
    TemplateHead = 'TemplateHead',
    TemplateMiddle = 'TemplateMiddle',
    TemplateTail = 'TemplateTail',

    // ============================================
    // 兼容性别名 (为了向后兼容旧代码)
    // ============================================

    // 这些是旧代码中使用的类型名，映射到新的规范名称
    /** @deprecated 使用 Script 或 Module */
    Program = 'Program',
    /** @deprecated 使用 ArrayLiteral */
    ArrayExpression = 'ArrayExpression',
    /** @deprecated 使用 ObjectLiteral */
    ObjectExpression = 'ObjectExpression',
    /** @deprecated 使用 ArrowFunction */
    ArrowFunctionExpression = 'ArrowFunctionExpression',
    /** @deprecated 使用 PropertyDefinition */
    Property = 'Property',
    /** @deprecated 使用 BindingRestElement */
    RestElement = 'RestElement',
    /** @deprecated 使用 ObjectBindingPattern */
    ObjectPattern = 'ObjectPattern',
    /** @deprecated 使用 ArrayBindingPattern */
    ArrayPattern = 'ArrayPattern',
    /** @deprecated 使用 VariableDeclaration */
    VariableDeclarator = 'VariableDeclarator',
    /** @deprecated 使用 Catch */
    CatchClause = 'CatchClause',
    /** @deprecated 使用 LabelledStatement */
    LabeledStatement = 'LabeledStatement',
    /** @deprecated 使用 ForInOfStatement */
    ForInStatement = 'ForInStatement',
    /** @deprecated 使用 ForInOfStatement */
    ForOfStatement = 'ForOfStatement',
    /** @deprecated 使用 CaseClause */
    SwitchCase = 'SwitchCase',
    /** @deprecated 使用 TemplateLiteral + TemplateSpans */
    TemplateElement = 'TemplateElement',
    /** @deprecated 使用 TemplateLiteral + Tagged */
    TaggedTemplateExpression = 'TaggedTemplateExpression',

    // 保留用于 AST 构建的辅助类型
    /** @deprecated 使用具体的运算符 Token */
    EqualOperator = 'EqualOperator',
    /** @deprecated 使用 LetOrConst */
    VariableDeclarationKind = 'VariableDeclarationKind',
    /** @deprecated 使用 FromKeyword */
    From = 'From',
    /** @deprecated 使用 ExportKeyword */
    Export = 'Export',
    /** @deprecated 使用 FormalParameters */
    FunctionParams = 'FunctionParams',
    /** @deprecated 使用 ExportDeclaration */
    ExportNamedDeclaration = 'ExportNamedDeclaration',
    /** @deprecated 使用 ExportDeclaration */
    ExportDefaultDeclaration = 'ExportDefaultDeclaration',
    /** @deprecated 使用 ExportDeclaration */
    ExportAllDeclaration = 'ExportAllDeclaration',
    /** @deprecated 使用 NameSpaceImport */
    ImportNamespaceSpecifier = 'ImportNamespaceSpecifier',
    /** @deprecated 使用 ImportedDefaultBinding */
    ImportDefaultSpecifier = 'ImportDefaultSpecifier',
    /** @deprecated 使用 UnaryExpression / BinaryExpression */
    BinaryExpression = 'BinaryExpression',
}
