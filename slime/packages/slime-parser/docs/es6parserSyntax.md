# ECMAScript 2015 (ES6) 语法规则参考

> 本文档基于 ECMA-262 6th Edition 规范整理，为编写 ES6 Parser 提供清晰易懂的语法规则参考

## 目录

- [1. 词法语法 (Lexical Grammar)](#1-词法语法-lexical-grammar)
- [2. 表达式 (Expressions)](#2-表达式-expressions)
- [3. 语句 (Statements)](#3-语句-statements)
- [4. 函数和类 (Functions and Classes)](#4-函数和类-functions-and-classes)
- [5. 模块 (Modules)](#5-模块-modules)
- [6. 附录：运算符优先级](#6-附录运算符优先级)

---

## 1. 词法语法 (Lexical Grammar)

### 1.1 注释 (Comments)

```
Comment ::
    MultiLineComment
    SingleLineComment

MultiLineComment ::
    /* MultiLineCommentChars[opt] */

SingleLineComment ::
    // SingleLineCommentChars[opt]
```

### 1.2 标识符 (Identifiers)

```
Identifier ::
    IdentifierName but not ReservedWord

IdentifierName ::
    IdentifierStart
    IdentifierName IdentifierPart

IdentifierStart ::
    UnicodeIDStart
    $
    _
    \ UnicodeEscapeSequence

IdentifierPart ::
    UnicodeIDContinue
    $
    _
    \ UnicodeEscapeSequence
    <ZWNJ>  (零宽非连接符)
    <ZWJ>   (零宽连接符)
```

**保留字 (Reserved Words):**
```
ReservedWord ::
    Keyword
    FutureReservedWord
    NullLiteral
    BooleanLiteral

Keyword :: (关键字)
    break      do         in           typeof
    case       else       instanceof   var
    catch      export     new          void
    class      extends    return       while
    const      finally    super        with
    continue   for        switch       yield
    debugger   function   this
    default    if         throw
    delete     import     try

FutureReservedWord :: (未来保留字)
    enum       await

StrictModeReservedWord :: (严格模式保留字)
    implements  package    public
    interface   protected  static
    let         private
```

### 1.3 字面量 (Literals)

#### 1.3.1 Null 字面量
```
NullLiteral ::
    null
```

#### 1.3.2 布尔字面量
```
BooleanLiteral ::
    true
    false
```

#### 1.3.3 数字字面量
```
NumericLiteral ::
    DecimalLiteral
    BinaryIntegerLiteral
    OctalIntegerLiteral
    HexIntegerLiteral

DecimalLiteral ::
    DecimalIntegerLiteral . DecimalDigits[opt] ExponentPart[opt]
    . DecimalDigits ExponentPart[opt]
    DecimalIntegerLiteral ExponentPart[opt]

DecimalIntegerLiteral ::
    0
    NonZeroDigit DecimalDigits[opt]

DecimalDigits ::
    DecimalDigit
    DecimalDigits DecimalDigit

DecimalDigit :: one of
    0 1 2 3 4 5 6 7 8 9

NonZeroDigit :: one of
    1 2 3 4 5 6 7 8 9

ExponentPart ::
    ExponentIndicator SignedInteger

ExponentIndicator :: one of
    e E

SignedInteger ::
    DecimalDigits
    + DecimalDigits
    - DecimalDigits

BinaryIntegerLiteral ::
    0b BinaryDigits
    0B BinaryDigits

BinaryDigits ::
    BinaryDigit
    BinaryDigits BinaryDigit

BinaryDigit :: one of
    0 1

OctalIntegerLiteral ::
    0o OctalDigits
    0O OctalDigits

OctalDigits ::
    OctalDigit
    OctalDigits OctalDigit

OctalDigit :: one of
    0 1 2 3 4 5 6 7

HexIntegerLiteral ::
    0x HexDigits
    0X HexDigits

HexDigits ::
    HexDigit
    HexDigits HexDigit

HexDigit :: one of
    0 1 2 3 4 5 6 7 8 9 a b c d e f A B C D E F
```

#### 1.3.4 字符串字面量
```
StringLiteral ::
    " DoubleStringCharacters[opt] "
    ' SingleStringCharacters[opt] '

DoubleStringCharacters ::
    DoubleStringCharacter DoubleStringCharacters[opt]

SingleStringCharacters ::
    SingleStringCharacter SingleStringCharacters[opt]

DoubleStringCharacter ::
    SourceCharacter but not one of " or \ or LineTerminator
    \ EscapeSequence
    LineContinuation

SingleStringCharacter ::
    SourceCharacter but not one of ' or \ or LineTerminator
    \ EscapeSequence
    LineContinuation

EscapeSequence ::
    CharacterEscapeSequence
    0 [lookahead ∉ DecimalDigit]
    HexEscapeSequence
    UnicodeEscapeSequence

CharacterEscapeSequence ::
    SingleEscapeCharacter
    NonEscapeCharacter

SingleEscapeCharacter :: one of
    ' " \ b f n r t v

HexEscapeSequence ::
    x HexDigit HexDigit

UnicodeEscapeSequence ::
    u Hex4Digits
    u{ HexDigits }

Hex4Digits ::
    HexDigit HexDigit HexDigit HexDigit
```

#### 1.3.5 模板字面量
```
Template ::
    NoSubstitutionTemplate
    TemplateHead

NoSubstitutionTemplate ::
    ` TemplateCharacters[opt] `

TemplateHead ::
    ` TemplateCharacters[opt] ${

TemplateSubstitutionTail ::
    TemplateMiddle
    TemplateTail

TemplateMiddle ::
    } TemplateCharacters[opt] ${

TemplateTail ::
    } TemplateCharacters[opt] `

TemplateCharacters ::
    TemplateCharacter TemplateCharacters[opt]

TemplateCharacter ::
    $ [lookahead ≠ { ]
    \ EscapeSequence
    LineContinuation
    LineTerminatorSequence
    SourceCharacter but not one of ` or \ or $ or LineTerminator
```

#### 1.3.6 正则表达式字面量
```
RegularExpressionLiteral ::
    / RegularExpressionBody / RegularExpressionFlags

RegularExpressionBody ::
    RegularExpressionFirstChar RegularExpressionChars

RegularExpressionChars ::
    [empty]
    RegularExpressionChars RegularExpressionChar

RegularExpressionFirstChar ::
    RegularExpressionNonTerminator but not one of * or \ or / or [
    RegularExpressionBackslashSequence
    RegularExpressionClass

RegularExpressionChar ::
    RegularExpressionNonTerminator but not one of \ or / or [
    RegularExpressionBackslashSequence
    RegularExpressionClass

RegularExpressionBackslashSequence ::
    \ RegularExpressionNonTerminator

RegularExpressionClass ::
    [ RegularExpressionClassChars ]

RegularExpressionClassChars ::
    [empty]
    RegularExpressionClassChars RegularExpressionClassChar

RegularExpressionClassChar ::
    RegularExpressionNonTerminator but not one of ] or \
    RegularExpressionBackslashSequence

RegularExpressionFlags ::
    [empty]
    RegularExpressionFlags IdentifierPart
```

---

## 2. 表达式 (Expressions)

### 2.1 基础表达式 (Primary Expressions)

```
PrimaryExpression[Yield] ::
    this
    IdentifierReference[?Yield]
    Literal
    ArrayLiteral[?Yield]
    ObjectLiteral[?Yield]
    FunctionExpression
    ClassExpression[?Yield]
    GeneratorExpression
    RegularExpressionLiteral
    TemplateLiteral[?Yield]
    CoverParenthesizedExpressionAndArrowParameterList[?Yield]

CoverParenthesizedExpressionAndArrowParameterList[Yield] ::
    ( Expression[In, ?Yield] )
    ( )
    ( ... BindingIdentifier[?Yield] )
    ( Expression[In, ?Yield] , ... BindingIdentifier[?Yield] )
```

**说明：**
- `[Yield]` 表示语法参数，在生成器函数中为 true
- `[In]` 表示是否允许 `in` 运算符
- `?Yield` 表示继承当前上下文的 Yield 参数

#### 2.1.1 this 关键字
```
this
```

#### 2.1.2 标识符引用
```
IdentifierReference[Yield] ::
    Identifier
    [~Yield] yield
```

#### 2.1.3 字面量
```
Literal ::
    NullLiteral
    BooleanLiteral
    NumericLiteral
    StringLiteral
```

### 2.2 数组字面量 (Array Literals)

```
ArrayLiteral[Yield] ::
    [ Elision[opt] ]
    [ ElementList[?Yield] ]
    [ ElementList[?Yield] , Elision[opt] ]

ElementList[Yield] ::
    Elision[opt] AssignmentExpression[In, ?Yield]
    Elision[opt] SpreadElement[?Yield]
    ElementList[?Yield] , Elision[opt] AssignmentExpression[In, ?Yield]
    ElementList[?Yield] , Elision[opt] SpreadElement[?Yield]

Elision ::
    ,
    Elision ,

SpreadElement[Yield] ::
    ... AssignmentExpression[In, ?Yield]
```

**示例：**
```javascript
[1, 2, 3]
[1, , 3]           // 稀疏数组
[1, ...arr, 2]     // 展开运算符
```

### 2.3 对象字面量 (Object Literals)

```
ObjectLiteral[Yield] ::
    { }
    { PropertyDefinitionList[?Yield] }
    { PropertyDefinitionList[?Yield] , }

PropertyDefinitionList[Yield] ::
    PropertyDefinition[?Yield]
    PropertyDefinitionList[?Yield] , PropertyDefinition[?Yield]

PropertyDefinition[Yield] ::
    IdentifierReference[?Yield]
    CoverInitializedName[?Yield]
    PropertyName[?Yield] : AssignmentExpression[In, ?Yield]
    MethodDefinition[?Yield]

PropertyName[Yield] ::
    LiteralPropertyName
    ComputedPropertyName[?Yield]

LiteralPropertyName ::
    IdentifierName
    StringLiteral
    NumericLiteral

ComputedPropertyName[Yield] ::
    [ AssignmentExpression[In, ?Yield] ]

CoverInitializedName[Yield] ::
    IdentifierReference[?Yield] Initializer[In, ?Yield]

Initializer[In, Yield] ::
    = AssignmentExpression[?In, ?Yield]
```

**示例：**
```javascript
{
  x,                        // 简写属性
  y: 10,                    // 普通属性
  ['z' + 1]: 20,           // 计算属性名
  method() { },            // 方法简写
  get prop() { },          // getter
  set prop(v) { }          // setter
}
```

### 2.4 方法定义 (Method Definitions)

```
MethodDefinition[Yield] ::
    PropertyName[?Yield] ( StrictFormalParameters ) { FunctionBody }
    GeneratorMethod[?Yield]
    get PropertyName[?Yield] ( ) { FunctionBody }
    set PropertyName[?Yield] ( PropertySetParameterList ) { FunctionBody }

PropertySetParameterList ::
    FormalParameter

GeneratorMethod[Yield] ::
    * PropertyName[?Yield] ( StrictFormalParameters[Yield] ) { GeneratorBody }
```

### 2.5 成员访问 (Member Expressions)

```
MemberExpression[Yield] ::
    PrimaryExpression[?Yield]
    MemberExpression[?Yield] [ Expression[In, ?Yield] ]
    MemberExpression[?Yield] . IdentifierName
    MemberExpression[?Yield] TemplateLiteral[?Yield]
    SuperProperty[?Yield]
    MetaProperty
    new MemberExpression[?Yield] Arguments[?Yield]

SuperProperty[Yield] ::
    super [ Expression[In, ?Yield] ]
    super . IdentifierName

MetaProperty ::
    NewTarget

NewTarget ::
    new . target
```

**示例：**
```javascript
obj.prop                    // 点访问
obj['prop']                 // 括号访问
obj`template`              // 标签模板
super.method()             // super 访问
new.target                 // 元属性
new MyClass(args)          // new 表达式
```

### 2.6 new 表达式 (New Expressions)

```
NewExpression[Yield] ::
    MemberExpression[?Yield]
    new NewExpression[?Yield]
```

### 2.7 函数调用 (Call Expressions)

```
CallExpression[Yield] ::
    MemberExpression[?Yield] Arguments[?Yield]
    SuperCall[?Yield]
    CallExpression[?Yield] Arguments[?Yield]
    CallExpression[?Yield] [ Expression[In, ?Yield] ]
    CallExpression[?Yield] . IdentifierName
    CallExpression[?Yield] TemplateLiteral[?Yield]

SuperCall[Yield] ::
    super Arguments[?Yield]

Arguments[Yield] ::
    ( )
    ( ArgumentList[?Yield] )

ArgumentList[Yield] ::
    AssignmentExpression[In, ?Yield]
    ... AssignmentExpression[In, ?Yield]
    ArgumentList[?Yield] , AssignmentExpression[In, ?Yield]
    ArgumentList[?Yield] , ... AssignmentExpression[In, ?Yield]
```

**示例：**
```javascript
func()
func(a, b)
func(...args)
super(args)
obj.method()
func()`template`
```

### 2.8 左值表达式 (Left-Hand-Side Expressions)

```
LeftHandSideExpression[Yield] ::
    NewExpression[?Yield]
    CallExpression[?Yield]
```

### 2.9 后缀表达式 (Postfix Expressions)

```
PostfixExpression[Yield] ::
    LeftHandSideExpression[?Yield]
    LeftHandSideExpression[?Yield] [no LineTerminator here] ++
    LeftHandSideExpression[?Yield] [no LineTerminator here] --
```

**注意：** `++` 和 `--` 前不能有换行符

**示例：**
```javascript
a++
b--
```

### 2.10 一元表达式 (Unary Expressions)

```
UnaryExpression[Yield] ::
    PostfixExpression[?Yield]
    delete UnaryExpression[?Yield]
    void UnaryExpression[?Yield]
    typeof UnaryExpression[?Yield]
    ++ UnaryExpression[?Yield]
    -- UnaryExpression[?Yield]
    + UnaryExpression[?Yield]
    - UnaryExpression[?Yield]
    ~ UnaryExpression[?Yield]
    ! UnaryExpression[?Yield]
```

**运算符列表：**
- `delete` - 删除对象属性
- `void` - 执行表达式并返回 undefined
- `typeof` - 返回类型字符串
- `++` - 前缀递增
- `--` - 前缀递减
- `+` - 一元加（转换为数字）
- `-` - 一元减（取负）
- `~` - 按位非
- `!` - 逻辑非

### 2.11 乘法表达式 (Multiplicative Expressions)

```
MultiplicativeExpression[Yield] ::
    UnaryExpression[?Yield]
    MultiplicativeExpression[?Yield] MultiplicativeOperator UnaryExpression[?Yield]

MultiplicativeOperator :: one of
    *  /  %
```

**运算符：**
- `*` - 乘法
- `/` - 除法
- `%` - 取模

### 2.12 加法表达式 (Additive Expressions)

```
AdditiveExpression[Yield] ::
    MultiplicativeExpression[?Yield]
    AdditiveExpression[?Yield] + MultiplicativeExpression[?Yield]
    AdditiveExpression[?Yield] - MultiplicativeExpression[?Yield]
```

### 2.13 移位表达式 (Bitwise Shift Expressions)

```
ShiftExpression[Yield] ::
    AdditiveExpression[?Yield]
    ShiftExpression[?Yield] << AdditiveExpression[?Yield]
    ShiftExpression[?Yield] >> AdditiveExpression[?Yield]
    ShiftExpression[?Yield] >>> AdditiveExpression[?Yield]
```

**运算符：**
- `<<` - 左移
- `>>` - 有符号右移
- `>>>` - 无符号右移

### 2.14 关系表达式 (Relational Expressions)

```
RelationalExpression[In, Yield] ::
    ShiftExpression[?Yield]
    RelationalExpression[?In, ?Yield] < ShiftExpression[?Yield]
    RelationalExpression[?In, ?Yield] > ShiftExpression[?Yield]
    RelationalExpression[?In, ?Yield] <= ShiftExpression[?Yield]
    RelationalExpression[?In, ?Yield] >= ShiftExpression[?Yield]
    RelationalExpression[?In, ?Yield] instanceof ShiftExpression[?Yield]
    [+In] RelationalExpression[In, ?Yield] in ShiftExpression[?Yield]
```

**运算符：**
- `<` - 小于
- `>` - 大于
- `<=` - 小于等于
- `>=` - 大于等于
- `instanceof` - 实例检查
- `in` - 属性检查（仅在 [In] 上下文）

### 2.15 相等表达式 (Equality Expressions)

```
EqualityExpression[In, Yield] ::
    RelationalExpression[?In, ?Yield]
    EqualityExpression[?In, ?Yield] == RelationalExpression[?In, ?Yield]
    EqualityExpression[?In, ?Yield] != RelationalExpression[?In, ?Yield]
    EqualityExpression[?In, ?Yield] === RelationalExpression[?In, ?Yield]
    EqualityExpression[?In, ?Yield] !== RelationalExpression[?In, ?Yield]
```

**运算符：**
- `==` - 相等（类型转换）
- `!=` - 不等（类型转换）
- `===` - 严格相等
- `!==` - 严格不等

### 2.16 按位与表达式 (Bitwise AND)

```
BitwiseANDExpression[In, Yield] ::
    EqualityExpression[?In, ?Yield]
    BitwiseANDExpression[?In, ?Yield] & EqualityExpression[?In, ?Yield]
```

### 2.17 按位异或表达式 (Bitwise XOR)

```
BitwiseXORExpression[In, Yield] ::
    BitwiseANDExpression[?In, ?Yield]
    BitwiseXORExpression[?In, ?Yield] ^ BitwiseANDExpression[?In, ?Yield]
```

### 2.18 按位或表达式 (Bitwise OR)

```
BitwiseORExpression[In, Yield] ::
    BitwiseXORExpression[?In, ?Yield]
    BitwiseORExpression[?In, ?Yield] | BitwiseXORExpression[?In, ?Yield]
```

### 2.19 逻辑与表达式 (Logical AND)

```
LogicalANDExpression[In, Yield] ::
    BitwiseORExpression[?In, ?Yield]
    LogicalANDExpression[?In, ?Yield] && BitwiseORExpression[?In, ?Yield]
```

### 2.20 逻辑或表达式 (Logical OR)

```
LogicalORExpression[In, Yield] ::
    LogicalANDExpression[?In, ?Yield]
    LogicalORExpression[?In, ?Yield] || LogicalANDExpression[?In, ?Yield]
```

### 2.21 条件表达式 (Conditional Expressions)

```
ConditionalExpression[In, Yield] ::
    LogicalORExpression[?In, ?Yield]
    LogicalORExpression[?In, ?Yield] ? AssignmentExpression[In, ?Yield] : AssignmentExpression[?In, ?Yield]
```

**示例：**
```javascript
condition ? trueValue : falseValue
```

### 2.22 赋值表达式 (Assignment Expressions)

```
AssignmentExpression[In, Yield] ::
    ConditionalExpression[?In, ?Yield]
    [+Yield] YieldExpression[?In]
    ArrowFunction[?In, ?Yield]
    LeftHandSideExpression[?Yield] = AssignmentExpression[?In, ?Yield]
    LeftHandSideExpression[?Yield] AssignmentOperator AssignmentExpression[?In, ?Yield]

AssignmentOperator :: one of
    *=  /=  %=  +=  -=  <<=  >>=  >>>=  &=  ^=  |=
```

**运算符列表：**
- `=` - 赋值
- `*=` - 乘法赋值
- `/=` - 除法赋值
- `%=` - 取模赋值
- `+=` - 加法赋值
- `-=` - 减法赋值
- `<<=` - 左移赋值
- `>>=` - 有符号右移赋值
- `>>>=` - 无符号右移赋值
- `&=` - 按位与赋值
- `^=` - 按位异或赋值
- `|=` - 按位或赋值

### 2.23 箭头函数 (Arrow Functions)

```
ArrowFunction[In, Yield] ::
    ArrowParameters[?Yield] [no LineTerminator here] => ConciseBody[?In]

ArrowParameters[Yield] ::
    BindingIdentifier[?Yield]
    CoverParenthesizedExpressionAndArrowParameterList[?Yield]

ConciseBody[In] ::
    [lookahead ≠ { ] AssignmentExpression[?In]
    { FunctionBody }
```

**示例：**
```javascript
x => x + 1
(x, y) => x + y
() => { return 42; }
x => ({ value: x })
```

### 2.24 逗号表达式 (Comma Operator)

```
Expression[In, Yield] ::
    AssignmentExpression[?In, ?Yield]
    Expression[?In, ?Yield] , AssignmentExpression[?In, ?Yield]
```

**示例：**
```javascript
a = 1, b = 2, c = 3
```

---

## 3. 语句 (Statements)

### 3.1 语句列表

```
StatementList[Yield, Return] ::
    StatementListItem[?Yield, ?Return]
    StatementList[?Yield, ?Return] StatementListItem[?Yield, ?Return]

StatementListItem[Yield, Return] ::
    Statement[?Yield, ?Return]
    Declaration[?Yield]

Statement[Yield, Return] ::
    BlockStatement[?Yield, ?Return]
    VariableStatement[?Yield]
    EmptyStatement
    ExpressionStatement[?Yield]
    IfStatement[?Yield, ?Return]
    BreakableStatement[?Yield, ?Return]
    ContinueStatement[?Yield]
    BreakStatement[?Yield]
    [+Return] ReturnStatement[?Yield]
    WithStatement[?Yield, ?Return]
    LabelledStatement[?Yield, ?Return]
    ThrowStatement[?Yield]
    TryStatement[?Yield, ?Return]
    DebuggerStatement
```

### 3.2 块语句 (Block Statement)

```
BlockStatement[Yield, Return] ::
    Block[?Yield, ?Return]

Block[Yield, Return] ::
    { StatementList[?Yield, ?Return][opt] }
```

### 3.3 声明语句

#### 3.3.1 变量声明 (Variable Statement)

```
VariableStatement[Yield] ::
    var VariableDeclarationList[In, ?Yield] ;

VariableDeclarationList[In, Yield] ::
    VariableDeclaration[?In, ?Yield]
    VariableDeclarationList[?In, ?Yield] , VariableDeclaration[?In, ?Yield]

VariableDeclaration[In, Yield] ::
    BindingIdentifier[?Yield] Initializer[?In, ?Yield][opt]
    BindingPattern[?Yield] Initializer[?In, ?Yield]
```

**示例：**
```javascript
var x;
var x = 1;
var x = 1, y = 2;
var [a, b] = [1, 2];
var {x, y} = obj;
```

#### 3.3.2 词法声明 (Lexical Declarations)

```
LexicalDeclaration[In, Yield] ::
    LetOrConst BindingList[?In, ?Yield] ;

LetOrConst ::
    let
    const

BindingList[In, Yield] ::
    LexicalBinding[?In, ?Yield]
    BindingList[?In, ?Yield] , LexicalBinding[?In, ?Yield]

LexicalBinding[In, Yield] ::
    BindingIdentifier[?Yield] Initializer[?In, ?Yield][opt]
    BindingPattern[?Yield] Initializer[?In, ?Yield]
```

**示例：**
```javascript
let x = 1;
const PI = 3.14159;
let [a, b] = [1, 2];
const {x, y} = obj;
```

### 3.4 空语句 (Empty Statement)

```
EmptyStatement ::
    ;
```

### 3.5 表达式语句 (Expression Statement)

```
ExpressionStatement[Yield] ::
    [lookahead ∉ { {, function, class, let [ }] Expression[In, ?Yield] ;
```

**注意：** 不能以 `{`、`function`、`class`、`let [` 开头

### 3.6 if 语句 (If Statement)

```
IfStatement[Yield, Return] ::
    if ( Expression[In, ?Yield] ) Statement[?Yield, ?Return] else Statement[?Yield, ?Return]
    if ( Expression[In, ?Yield] ) Statement[?Yield, ?Return]
```

**示例：**
```javascript
if (condition) {
  // ...
}

if (condition) {
  // ...
} else {
  // ...
}
```

### 3.7 迭代语句 (Iteration Statements)

```
BreakableStatement[Yield, Return] ::
    IterationStatement[?Yield, ?Return]
    SwitchStatement[?Yield, ?Return]

IterationStatement[Yield, Return] ::
    do Statement[?Yield, ?Return] while ( Expression[In, ?Yield] ) ;
    while ( Expression[In, ?Yield] ) Statement[?Yield, ?Return]
    for ( [lookahead ≠ let [] Expression[?Yield][opt] ; Expression[In, ?Yield][opt] ; Expression[In, ?Yield][opt] ) Statement[?Yield, ?Return]
    for ( var VariableDeclarationList[?Yield] ; Expression[In, ?Yield][opt] ; Expression[In, ?Yield][opt] ) Statement[?Yield, ?Return]
    for ( LexicalDeclaration[?Yield] Expression[In, ?Yield][opt] ; Expression[In, ?Yield][opt] ) Statement[?Yield, ?Return]
    for ( [lookahead ≠ let [] LeftHandSideExpression[?Yield] in Expression[In, ?Yield] ) Statement[?Yield, ?Return]
    for ( var ForBinding[?Yield] in Expression[In, ?Yield] ) Statement[?Yield, ?Return]
    for ( ForDeclaration[?Yield] in Expression[In, ?Yield] ) Statement[?Yield, ?Return]
    for ( [lookahead ∉ { let, async of }] LeftHandSideExpression[?Yield] of AssignmentExpression[In, ?Yield] ) Statement[?Yield, ?Return]
    for ( var ForBinding[?Yield] of AssignmentExpression[In, ?Yield] ) Statement[?Yield, ?Return]
    for ( ForDeclaration[?Yield] of AssignmentExpression[In, ?Yield] ) Statement[?Yield, ?Return]

ForDeclaration[Yield] ::
    LetOrConst ForBinding[?Yield]

ForBinding[Yield] ::
    BindingIdentifier[?Yield]
    BindingPattern[?Yield]
```

**示例：**
```javascript
// while 循环
while (condition) {
  // ...
}

// do-while 循环
do {
  // ...
} while (condition);

// for 循环
for (let i = 0; i < 10; i++) {
  // ...
}

// for-in 循环
for (let key in obj) {
  // ...
}

// for-of 循环
for (let value of iterable) {
  // ...
}
```

### 3.8 continue 语句 (Continue Statement)

```
ContinueStatement[Yield] ::
    continue ;
    continue [no LineTerminator here] LabelIdentifier[?Yield] ;
```

### 3.9 break 语句 (Break Statement)

```
BreakStatement[Yield] ::
    break ;
    break [no LineTerminator here] LabelIdentifier[?Yield] ;
```

### 3.10 return 语句 (Return Statement)

```
ReturnStatement[Yield] ::
    return ;
    return [no LineTerminator here] Expression[In, ?Yield] ;
```

**注意：** `return` 后的表达式前不能有换行符

### 3.11 with 语句 (With Statement)

```
WithStatement[Yield, Return] ::
    with ( Expression[In, ?Yield] ) Statement[?Yield, ?Return]
```

**注意：** 严格模式禁止使用

### 3.12 switch 语句 (Switch Statement)

```
SwitchStatement[Yield, Return] ::
    switch ( Expression[In, ?Yield] ) CaseBlock[?Yield, ?Return]

CaseBlock[Yield, Return] ::
    { CaseClauses[?Yield, ?Return][opt] }
    { CaseClauses[?Yield, ?Return][opt] DefaultClause[?Yield, ?Return] CaseClauses[?Yield, ?Return][opt] }

CaseClauses[Yield, Return] ::
    CaseClause[?Yield, ?Return]
    CaseClauses[?Yield, ?Return] CaseClause[?Yield, ?Return]

CaseClause[Yield, Return] ::
    case Expression[In, ?Yield] : StatementList[?Yield, ?Return][opt]

DefaultClause[Yield, Return] ::
    default : StatementList[?Yield, ?Return][opt]
```

**示例：**
```javascript
switch (value) {
  case 1:
    // ...
    break;
  case 2:
  case 3:
    // ...
    break;
  default:
    // ...
}
```

### 3.13 标签语句 (Labelled Statement)

```
LabelledStatement[Yield, Return] ::
    LabelIdentifier[?Yield] : LabelledItem[?Yield, ?Return]

LabelledItem[Yield, Return] ::
    Statement[?Yield, ?Return]
    FunctionDeclaration[?Yield]
```

**示例：**
```javascript
loop: for (let i = 0; i < 10; i++) {
  if (condition) break loop;
}
```

### 3.14 throw 语句 (Throw Statement)

```
ThrowStatement[Yield] ::
    throw [no LineTerminator here] Expression[In, ?Yield] ;
```

**注意：** `throw` 后的表达式前不能有换行符

### 3.15 try 语句 (Try Statement)

```
TryStatement[Yield, Return] ::
    try Block[?Yield, ?Return] Catch[?Yield, ?Return]
    try Block[?Yield, ?Return] Finally[?Yield, ?Return]
    try Block[?Yield, ?Return] Catch[?Yield, ?Return] Finally[?Yield, ?Return]

Catch[Yield, Return] ::
    catch ( CatchParameter[?Yield] ) Block[?Yield, ?Return]

Finally[Yield, Return] ::
    finally Block[?Yield, ?Return]

CatchParameter[Yield] ::
    BindingIdentifier[?Yield]
    BindingPattern[?Yield]
```

**示例：**
```javascript
try {
  // ...
} catch (e) {
  // ...
}

try {
  // ...
} finally {
  // ...
}

try {
  // ...
} catch (e) {
  // ...
} finally {
  // ...
}

// 解构捕获
try {
  // ...
} catch ({message, stack}) {
  // ...
}
```

### 3.16 debugger 语句 (Debugger Statement)

```
DebuggerStatement ::
    debugger ;
```

---

## 4. 函数和类 (Functions and Classes)

### 4.1 函数声明 (Function Declarations)

```
FunctionDeclaration[Yield, Default] ::
    function BindingIdentifier[?Yield] ( FormalParameters ) { FunctionBody }
    [+Default] function ( FormalParameters ) { FunctionBody }

FunctionExpression ::
    function BindingIdentifier[opt] ( FormalParameters ) { FunctionBody }

FormalParameters[Yield] ::
    [empty]
    FormalParameterList[?Yield]

FormalParameterList[Yield] ::
    FunctionRestParameter[?Yield]
    FormalsList[?Yield]
    FormalsList[?Yield] , FunctionRestParameter[?Yield]

FormalsList[Yield] ::
    FormalParameter[?Yield]
    FormalsList[?Yield] , FormalParameter[?Yield]

FunctionRestParameter[Yield] ::
    BindingRestElement[?Yield]

FormalParameter[Yield] ::
    BindingElement[?Yield]

FunctionBody[Yield] ::
    FunctionStatementList[?Yield]

FunctionStatementList[Yield] ::
    StatementList[?Yield, Return][opt]
```

**示例：**
```javascript
// 函数声明
function add(a, b) {
  return a + b;
}

// 函数表达式
const add = function(a, b) {
  return a + b;
};

// 默认参数
function greet(name = 'World') {
  return `Hello, ${name}!`;
}

// 剩余参数
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

// 解构参数
function process({x, y}) {
  return x + y;
}
```

### 4.2 生成器函数 (Generator Functions)

```
GeneratorDeclaration[Yield, Default] ::
    function * BindingIdentifier[?Yield] ( FormalParameters[Yield] ) { GeneratorBody }
    [+Default] function * ( FormalParameters[Yield] ) { GeneratorBody }

GeneratorExpression ::
    function * BindingIdentifier[Yield][opt] ( FormalParameters[Yield] ) { GeneratorBody }

GeneratorBody ::
    FunctionBody[Yield]

YieldExpression[In] ::
    yield
    yield [no LineTerminator here] AssignmentExpression[?In, Yield]
    yield [no LineTerminator here] * AssignmentExpression[?In, Yield]
```

**示例：**
```javascript
// 生成器函数声明
function* range(start, end) {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

// 生成器表达式
const gen = function* () {
  yield 1;
  yield 2;
  yield 3;
};

// yield*
function* delegatingGenerator() {
  yield* [1, 2, 3];
}
```

### 4.3 类声明 (Class Declarations)

```
ClassDeclaration[Yield, Default] ::
    class BindingIdentifier[?Yield] ClassTail[?Yield]
    [+Default] class ClassTail[?Yield]

ClassExpression[Yield] ::
    class BindingIdentifier[?Yield][opt] ClassTail[?Yield]

ClassTail[Yield] ::
    ClassHeritage[?Yield][opt] { ClassBody[?Yield][opt] }

ClassHeritage[Yield] ::
    extends LeftHandSideExpression[?Yield]

ClassBody[Yield] ::
    ClassElementList[?Yield]

ClassElementList[Yield] ::
    ClassElement[?Yield]
    ClassElementList[?Yield] ClassElement[?Yield]

ClassElement[Yield] ::
    MethodDefinition[?Yield]
    static MethodDefinition[?Yield]
    ;
```

**示例：**
```javascript
// 类声明
class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  
  // 方法
  area() {
    return this.width * this.height;
  }
  
  // 静态方法
  static create(width, height) {
    return new Rectangle(width, height);
  }
  
  // getter
  get perimeter() {
    return 2 * (this.width + this.height);
  }
  
  // setter
  set width(value) {
    if (value > 0) {
      this._width = value;
    }
  }
}

// 继承
class Square extends Rectangle {
  constructor(size) {
    super(size, size);
  }
}

// 类表达式
const MyClass = class {
  // ...
};
```

### 4.4 绑定模式 (Binding Patterns)

```
BindingPattern[Yield] ::
    ObjectBindingPattern[?Yield]
    ArrayBindingPattern[?Yield]

ObjectBindingPattern[Yield] ::
    { }
    { BindingPropertyList[?Yield] }
    { BindingPropertyList[?Yield] , }

ArrayBindingPattern[Yield] ::
    [ Elision[opt] BindingRestElement[?Yield][opt] ]
    [ BindingElementList[?Yield] ]
    [ BindingElementList[?Yield] , Elision[opt] BindingRestElement[?Yield][opt] ]

BindingPropertyList[Yield] ::
    BindingProperty[?Yield]
    BindingPropertyList[?Yield] , BindingProperty[?Yield]

BindingElementList[Yield] ::
    BindingElisionElement[?Yield]
    BindingElementList[?Yield] , BindingElisionElement[?Yield]

BindingElisionElement[Yield] ::
    Elision[opt] BindingElement[?Yield]

BindingProperty[Yield] ::
    SingleNameBinding[?Yield]
    PropertyName[?Yield] : BindingElement[?Yield]

BindingElement[Yield] ::
    SingleNameBinding[?Yield]
    BindingPattern[?Yield] Initializer[In, ?Yield][opt]

SingleNameBinding[Yield] ::
    BindingIdentifier[?Yield] Initializer[In, ?Yield][opt]

BindingRestElement[Yield] ::
    ... BindingIdentifier[?Yield]
    ... BindingPattern[?Yield]
```

**示例：**
```javascript
// 对象解构
const {x, y} = obj;
const {x: a, y: b} = obj;
const {x = 0, y = 0} = obj;

// 数组解构
const [a, b] = arr;
const [a, , b] = arr;
const [a, ...rest] = arr;

// 嵌套解构
const {a: {b, c}} = obj;
const [x, [y, z]] = arr;

// 函数参数解构
function process({x, y}) { }
function sum([a, b]) { }
```

---

## 5. 模块 (Modules)

### 5.1 模块语法

```
Module ::
    ModuleBody[opt]

ModuleBody ::
    ModuleItemList

ModuleItemList ::
    ModuleItem
    ModuleItemList ModuleItem

ModuleItem ::
    ImportDeclaration
    ExportDeclaration
    StatementListItem
```

### 5.2 导入声明 (Import Declarations)

```
ImportDeclaration ::
    import ImportClause FromClause ;
    import ModuleSpecifier ;

ImportClause ::
    ImportedDefaultBinding
    NameSpaceImport
    NamedImports
    ImportedDefaultBinding , NameSpaceImport
    ImportedDefaultBinding , NamedImports

ImportedDefaultBinding ::
    ImportedBinding

NameSpaceImport ::
    * as ImportedBinding

NamedImports ::
    { }
    { ImportsList }
    { ImportsList , }

FromClause ::
    from ModuleSpecifier

ImportsList ::
    ImportSpecifier
    ImportsList , ImportSpecifier

ImportSpecifier ::
    ImportedBinding
    IdentifierName as ImportedBinding

ModuleSpecifier ::
    StringLiteral

ImportedBinding ::
    BindingIdentifier
```

**示例：**
```javascript
// 默认导入
import defaultExport from './module.js';

// 命名导入
import { export1, export2 } from './module.js';

// 重命名导入
import { export1 as alias1 } from './module.js';

// 命名空间导入
import * as name from './module.js';

// 混合导入
import defaultExport, { export1, export2 } from './module.js';
import defaultExport, * as name from './module.js';

// 仅执行模块
import './module.js';
```

### 5.3 导出声明 (Export Declarations)

```
ExportDeclaration ::
    export * FromClause ;
    export ExportClause FromClause ;
    export ExportClause ;
    export VariableStatement
    export Declaration
    export default HoistableDeclaration[Default]
    export default ClassDeclaration[Default]
    export default [lookahead ∉ { function, class }] AssignmentExpression[In] ;

ExportClause ::
    { }
    { ExportsList }
    { ExportsList , }

ExportsList ::
    ExportSpecifier
    ExportsList , ExportSpecifier

ExportSpecifier ::
    IdentifierName
    IdentifierName as IdentifierName
```

**示例：**
```javascript
// 命名导出
export const x = 1;
export let y = 2;
export function func() { }
export class MyClass { }

// 导出列表
export { x, y, z };

// 重命名导出
export { x as publicX, y as publicY };

// 重新导出
export { x, y } from './module.js';
export * from './module.js';

// 默认导出
export default function() { }
export default class { }
export default expression;

// 组合
export { default } from './module.js';
export { default as name } from './module.js';
```

---

## 6. 附录：运算符优先级

从高到低排列：

| 优先级 | 运算符类型 | 运算符 | 结合性 |
|-------|-----------|--------|--------|
| 20 | 分组 | `( ... )` | n/a |
| 19 | 成员访问 | `... . ...` | 左到右 |
|    | 计算成员访问 | `... [ ... ]` | 左到右 |
|    | new (带参数) | `new ... ( ... )` | n/a |
|    | 函数调用 | `... ( ... )` | 左到右 |
|    | 可选链 | `?.` | 左到右 |
| 18 | new (无参数) | `new ...` | 右到左 |
| 17 | 后缀递增 | `... ++` | n/a |
|    | 后缀递减 | `... --` | n/a |
| 16 | 逻辑非 | `! ...` | 右到左 |
|    | 按位非 | `~ ...` | 右到左 |
|    | 一元加 | `+ ...` | 右到左 |
|    | 一元减 | `- ...` | 右到左 |
|    | 前缀递增 | `++ ...` | 右到左 |
|    | 前缀递减 | `-- ...` | 右到左 |
|    | typeof | `typeof ...` | 右到左 |
|    | void | `void ...` | 右到左 |
|    | delete | `delete ...` | 右到左 |
| 15 | 幂 | `... ** ...` | 右到左 |
| 14 | 乘法 | `... * ...` | 左到右 |
|    | 除法 | `... / ...` | 左到右 |
|    | 取模 | `... % ...` | 左到右 |
| 13 | 加法 | `... + ...` | 左到右 |
|    | 减法 | `... - ...` | 左到右 |
| 12 | 左移 | `... << ...` | 左到右 |
|    | 有符号右移 | `... >> ...` | 左到右 |
|    | 无符号右移 | `... >>> ...` | 左到右 |
| 11 | 小于 | `... < ...` | 左到右 |
|    | 小于等于 | `... <= ...` | 左到右 |
|    | 大于 | `... > ...` | 左到右 |
|    | 大于等于 | `... >= ...` | 左到右 |
|    | in | `... in ...` | 左到右 |
|    | instanceof | `... instanceof ...` | 左到右 |
| 10 | 相等 | `... == ...` | 左到右 |
|    | 不等 | `... != ...` | 左到右 |
|    | 严格相等 | `... === ...` | 左到右 |
|    | 严格不等 | `... !== ...` | 左到右 |
| 9  | 按位与 | `... & ...` | 左到右 |
| 8  | 按位异或 | `... ^ ...` | 左到右 |
| 7  | 按位或 | `... | ...` | 左到右 |
| 6  | 逻辑与 | `... && ...` | 左到右 |
| 5  | 逻辑或 | `... || ...` | 左到右 |
| 4  | 条件 | `... ? ... : ...` | 右到左 |
| 3  | 赋值 | `... = ...` | 右到左 |
|    |       | `... += ...` | 右到左 |
|    |       | `... -= ...` | 右到左 |
|    |       | (其他赋值运算符) | 右到左 |
| 2  | yield | `yield ...` | 右到左 |
|    | yield* | `yield* ...` | 右到左 |
| 1  | 逗号 | `... , ...` | 左到右 |

---

## 附录 A：语法符号约定

### 语法表示法说明

- `::` - 定义语法规则
- `|` - 或者（备选）
- `[opt]` - 可选项
- `one of` - 从列表中选择一个
- `[lookahead ≠ token]` - 前瞻，下一个不是指定token
- `[lookahead ∉ { ... }]` - 前瞻，下一个不在集合中
- `[no LineTerminator here]` - 此处不允许换行符
- `but not` - 排除
- `...` - 重复零次或多次

### 语法参数

- `[Yield]` - 在生成器上下文中
- `[In]` - 允许 `in` 运算符
- `[Return]` - 在函数体中（允许 return）
- `[Default]` - 在默认导出上下文中
- `[+Param]` - 参数为 true
- `[~Param]` - 参数为 false
- `[?Param]` - 继承当前上下文的参数值

---

## 参考资源

- **官方规范：** https://262.ecma-international.org/6.0/
- **MDN 文档：** https://developer.mozilla.org/en-US/docs/Web/JavaScript
- **本文档版本：** 基于 ECMA-262 6th Edition (ES2015)

---

**注意事项：**

1. **自动分号插入 (ASI)：** JavaScript 会在某些情况下自动插入分号，但不应依赖此特性
2. **严格模式：** `"use strict"` 启用严格模式，禁止某些语法和行为
3. **换行符限制：** 某些语句（如 return、break、continue、throw、后缀++/--）后不能立即换行
4. **前瞻限制：** 某些位置不能使用特定token（如表达式语句不能以 `{` 开头）
5. **Cover Grammar：** 某些语法产生式用于覆盖多种可能的解析（如箭头函数参数）

---

**编写 Parser 建议：**

1. **从简单到复杂：** 先实现词法分析器（Lexer），再实现语法分析器（Parser）
2. **递归下降：** 使用递归下降方法，按优先级处理表达式
3. **错误处理：** 提供清晰的错误信息和恢复机制
4. **测试驱动：** 为每个语法规则编写测试用例
5. **参考实现：** 可参考 Babel、Acorn、ESPrima 等成熟的 JavaScript 解析器
6. **AST 设计：** 遵循 ESTree 规范设计抽象语法树

---

**文档结束**

