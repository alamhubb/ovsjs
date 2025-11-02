# ECMAScript 2020 (ES11) 语法规则参考

> 本文档基于 ECMA-262 11th Edition 规范整理，为编写 ES2020 Parser 提供清晰易懂的语法规则参考

## 目录

- [1. 词法语法 (Lexical Grammar)](#1-词法语法-lexical-grammar)
- [2. 表达式 (Expressions)](#2-表达式-expressions)
- [3. 语句 (Statements)](#3-语句-statements)
- [4. 函数和类 (Functions and Classes)](#4-函数和类-functions-and-classes)
- [5. 脚本和模块 (Scripts and Modules)](#5-脚本和模块-scripts-and-modules)
- [6. ES2020 新特性](#6-es2020-新特性)
- [7. 附录：运算符优先级](#7-附录运算符优先级)

---

## 1. 词法语法 (Lexical Grammar)

### 1.1 源字符 (Source Characters)

```
SourceCharacter ::
    any Unicode code point
```

### 1.2 输入元素 (Input Elements)

```
InputElementDiv ::
    WhiteSpace
    LineTerminator
    Comment
    CommonToken
    DivPunctuator
    RightBracePunctuator

InputElementRegExp ::
    WhiteSpace
    LineTerminator
    Comment
    CommonToken
    RightBracePunctuator
    RegularExpressionLiteral

InputElementRegExpOrTemplateTail ::
    WhiteSpace
    LineTerminator
    Comment
    CommonToken
    RegularExpressionLiteral
    TemplateSubstitutionTail

InputElementTemplateTail ::
    WhiteSpace
    LineTerminator
    Comment
    CommonToken
    DivPunctuator
    TemplateSubstitutionTail
```

### 1.3 空白字符 (White Space)

```
WhiteSpace :: one of
    <TAB>   (制表符)
    <VT>    (垂直制表符)
    <FF>    (换页符)
    <SP>    (空格)
    <NBSP>  (不换行空格)
    <ZWNBSP> (零宽不换行空格)
    <USP>   (任何Unicode空格分隔符)
```

### 1.4 行终止符 (Line Terminators)

```
LineTerminator :: one of
    <LF>    (换行符 \n)
    <CR>    (回车符 \r)
    <LS>    (行分隔符)
    <PS>    (段落分隔符)

LineTerminatorSequence ::
    <LF>
    <CR> [lookahead ≠ <LF>]
    <LS>
    <PS>
    <CR><LF>
```

### 1.5 注释 (Comments)

```
Comment ::
    MultiLineComment
    SingleLineComment

MultiLineComment ::
    /* MultiLineCommentChars[opt] */

MultiLineCommentChars ::
    MultiLineNotAsteriskChar MultiLineCommentChars[opt]
    * PostAsteriskCommentChars[opt]

PostAsteriskCommentChars ::
    MultiLineNotForwardSlashOrAsteriskChar MultiLineCommentChars[opt]
    * PostAsteriskCommentChars[opt]

SingleLineComment ::
    // SingleLineCommentChars[opt]

SingleLineCommentChars ::
    SingleLineCommentChar SingleLineCommentChars[opt]

SingleLineCommentChar ::
    SourceCharacter but not LineTerminator
```

### 1.6 标识符 (Identifiers)

```
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
    \ UnicodeEscapeSequence
    <ZWNJ>  (零宽非连接符)
    <ZWJ>   (零宽连接符)

Identifier ::
    IdentifierName but not ReservedWord
```

### 1.7 保留字 (Reserved Words)

```
ReservedWord :: one of
    await break case catch class const continue debugger default
    delete do else enum export extends false finally for function
    if import in instanceof new null return super switch this
    throw true try typeof var void while with yield
```

**说明：** ES2020 中 `await` 已成为正式保留字

### 1.8 标点符号 (Punctuators)

```
Punctuator ::
    OptionalChainingPunctuator
    OtherPunctuator

OptionalChainingPunctuator ::
    ?. [lookahead ∉ DecimalDigit]

OtherPunctuator :: one of
    { ( ) [ ] . ... ; , < > <= >= == != === !==
    + - * % ** ++ -- << >> >>> & | ^ ! ~ && || ??
    ? : = += -= *= %= **= <<= >>= >>>= &= |= ^= =>

DivPunctuator :: one of
    /  /=

RightBracePunctuator ::
    }
```

**ES2020 新增：**
- `?.` - Optional Chaining（可选链）
- `??` - Nullish Coalescing（空值合并）

### 1.9 字面量 (Literals)

#### 1.9.1 Null 字面量
```
NullLiteral ::
    null
```

#### 1.9.2 布尔字面量
```
BooleanLiteral :: one of
    true  false
```

#### 1.9.3 数字字面量

```
NumericLiteral ::
    DecimalLiteral
    DecimalBigIntegerLiteral
    NonDecimalIntegerLiteral
    NonDecimalIntegerLiteral BigIntLiteralSuffix

DecimalBigIntegerLiteral ::
    0 BigIntLiteralSuffix
    NonZeroDigit DecimalDigits[opt] BigIntLiteralSuffix

NonDecimalIntegerLiteral ::
    BinaryIntegerLiteral
    OctalIntegerLiteral
    HexIntegerLiteral

BigIntLiteralSuffix ::
    n

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

**ES2020 新增：BigInt 大整数字面量**
```javascript
// BigInt 示例
const big1 = 123n;          // DecimalBigIntegerLiteral
const big2 = 0b1010n;       // BinaryBigIntegerLiteral
const big3 = 0o777n;        // OctalBigIntegerLiteral
const big4 = 0xFFn;         // HexBigIntegerLiteral
```

#### 1.9.4 字符串字面量

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
    <LS>
    <PS>
    \ EscapeSequence
    LineContinuation

SingleStringCharacter ::
    SourceCharacter but not one of ' or \ or LineTerminator
    <LS>
    <PS>
    \ EscapeSequence
    LineContinuation

LineContinuation ::
    \ LineTerminatorSequence

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
    u{ CodePoint }

Hex4Digits ::
    HexDigit HexDigit HexDigit HexDigit
```

#### 1.9.5 正则表达式字面量

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

RegularExpressionNonTerminator ::
    SourceCharacter but not LineTerminator

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

#### 1.9.6 模板字面量

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
    \ NotEscapeSequence
    LineContinuation
    LineTerminatorSequence
    SourceCharacter but not one of ` or \ or $ or LineTerminator
```

---

## 2. 表达式 (Expressions)

### 2.1 标识符引用 (Identifier References)

```
IdentifierReference[Yield, Await] ::
    Identifier
    [~Yield] yield
    [~Await] await

BindingIdentifier[Yield, Await] ::
    Identifier
    yield
    await

LabelIdentifier[Yield, Await] ::
    Identifier
    [~Yield] yield
    [~Await] await
```

**说明：**
- `[Yield, Await]` - ES2020 增加了 Await 参数
- `[~Yield]` - 表示在非生成器上下文中
- `[~Await]` - 表示在非异步上下文中

### 2.2 基础表达式 (Primary Expressions)

```
PrimaryExpression[Yield, Await] ::
    this
    IdentifierReference[?Yield, ?Await]
    Literal
    ArrayLiteral[?Yield, ?Await]
    ObjectLiteral[?Yield, ?Await]
    FunctionExpression
    ClassExpression[?Yield, ?Await]
    GeneratorExpression
    AsyncFunctionExpression
    AsyncGeneratorExpression
    RegularExpressionLiteral
    TemplateLiteral[?Yield, ?Await, ~Tagged]
    CoverParenthesizedExpressionAndArrowParameterList[?Yield, ?Await]
```

**说明：** ES2020 在所有表达式规则中增加了 `Await` 参数支持

#### 2.2.1 括号表达式覆盖语法

```
CoverParenthesizedExpressionAndArrowParameterList[Yield, Await] ::
    ( Expression[+In, ?Yield, ?Await] )
    ( Expression[+In, ?Yield, ?Await] , )
    ( )
    ( ... BindingIdentifier[?Yield, ?Await] )
    ( ... BindingPattern[?Yield, ?Await] )
    ( Expression[+In, ?Yield, ?Await] , ... BindingIdentifier[?Yield, ?Await] )
    ( Expression[+In, ?Yield, ?Await] , ... BindingPattern[?Yield, ?Await] )
```

**用途：** 同时覆盖括号表达式和箭头函数参数列表

**精化为括号表达式：**
```
ParenthesizedExpression[Yield, Await] ::
    ( Expression[+In, ?Yield, ?Await] )
```

### 2.3 字面量 (Literals)

```
Literal ::
    NullLiteral
    BooleanLiteral
    NumericLiteral
    StringLiteral
```

### 2.4 数组字面量 (Array Literals)

```
ArrayLiteral[Yield, Await] ::
    [ Elision[opt] ]
    [ ElementList[?Yield, ?Await] ]
    [ ElementList[?Yield, ?Await] , Elision[opt] ]

ElementList[Yield, Await] ::
    Elision[opt] AssignmentExpression[+In, ?Yield, ?Await]
    Elision[opt] SpreadElement[?Yield, ?Await]
    ElementList[?Yield, ?Await] , Elision[opt] AssignmentExpression[+In, ?Yield, ?Await]
    ElementList[?Yield, ?Await] , Elision[opt] SpreadElement[?Yield, ?Await]

Elision ::
    ,
    Elision ,

SpreadElement[Yield, Await] ::
    ... AssignmentExpression[+In, ?Yield, ?Await]
```

**示例：**
```javascript
[1, 2, 3]
[1, , 3]           // 稀疏数组
[1, ...arr, 2]     // 展开运算符
```

### 2.5 对象字面量 (Object Literals)

```
ObjectLiteral[Yield, Await] ::
    { }
    { PropertyDefinitionList[?Yield, ?Await] }
    { PropertyDefinitionList[?Yield, ?Await] , }

PropertyDefinitionList[Yield, Await] ::
    PropertyDefinition[?Yield, ?Await]
    PropertyDefinitionList[?Yield, ?Await] , PropertyDefinition[?Yield, ?Await]

PropertyDefinition[Yield, Await] ::
    IdentifierReference[?Yield, ?Await]
    CoverInitializedName[?Yield, ?Await]
    PropertyName[?Yield, ?Await] : AssignmentExpression[+In, ?Yield, ?Await]
    MethodDefinition[?Yield, ?Await]
    ... AssignmentExpression[+In, ?Yield, ?Await]

PropertyName[Yield, Await] ::
    LiteralPropertyName
    ComputedPropertyName[?Yield, ?Await]

LiteralPropertyName ::
    IdentifierName
    StringLiteral
    NumericLiteral

ComputedPropertyName[Yield, Await] ::
    [ AssignmentExpression[+In, ?Yield, ?Await] ]

CoverInitializedName[Yield, Await] ::
    IdentifierReference[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]

Initializer[In, Yield, Await] ::
    = AssignmentExpression[?In, ?Yield, ?Await]
```

**ES2018 新增：对象展开语法**
```javascript
const obj = {...source, key: value}
```

### 2.6 模板字面量 (Template Literals)

```
TemplateLiteral[Yield, Await, Tagged] ::
    NoSubstitutionTemplate
    SubstitutionTemplate[?Yield, ?Await, ?Tagged]

SubstitutionTemplate[Yield, Await, Tagged] ::
    TemplateHead Expression[+In, ?Yield, ?Await] TemplateSpans[?Yield, ?Await, ?Tagged]

TemplateSpans[Yield, Await, Tagged] ::
    TemplateTail
    TemplateMiddleList[?Yield, ?Await, ?Tagged] TemplateTail

TemplateMiddleList[Yield, Await, Tagged] ::
    TemplateMiddle Expression[+In, ?Yield, ?Await]
    TemplateMiddleList[?Yield, ?Await, ?Tagged] TemplateMiddle Expression[+In, ?Yield, ?Await]
```

### 2.7 成员表达式 (Member Expressions)

```
MemberExpression[Yield, Await] ::
    PrimaryExpression[?Yield, ?Await]
    MemberExpression[?Yield, ?Await] [ Expression[+In, ?Yield, ?Await] ]
    MemberExpression[?Yield, ?Await] . IdentifierName
    MemberExpression[?Yield, ?Await] TemplateLiteral[?Yield, ?Await, +Tagged]
    SuperProperty[?Yield, ?Await]
    MetaProperty
    new MemberExpression[?Yield, ?Await] Arguments[?Yield, ?Await]

SuperProperty[Yield, Await] ::
    super [ Expression[+In, ?Yield, ?Await] ]
    super . IdentifierName

MetaProperty ::
    NewTarget
    ImportMeta

NewTarget ::
    new . target

ImportMeta ::
    import . meta
```

**ES2020 新增：**
- `import.meta` - 模块元数据访问

**示例：**
```javascript
// import.meta 示例
console.log(import.meta.url)  // 当前模块的URL
```

### 2.8 new 表达式 (New Expressions)

```
NewExpression[Yield, Await] ::
    MemberExpression[?Yield, ?Await]
    new NewExpression[?Yield, ?Await]
```

### 2.9 函数调用表达式 (Call Expressions)

```
CallExpression[Yield, Await] ::
    CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await]
    SuperCall[?Yield, ?Await]
    ImportCall[?Yield, ?Await]
    CallExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
    CallExpression[?Yield, ?Await] [ Expression[+In, ?Yield, ?Await] ]
    CallExpression[?Yield, ?Await] . IdentifierName
    CallExpression[?Yield, ?Await] TemplateLiteral[?Yield, ?Await, +Tagged]
```

**精化为普通调用表达式：**
```
CallMemberExpression[Yield, Await] ::
    MemberExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
```

**ES2020 新增：动态 import**
```
ImportCall[Yield, Await] ::
    import ( AssignmentExpression[+In, ?Yield, ?Await] )
```

**示例：**
```javascript
// 动态 import
const module = await import('./module.js');
const modulePath = './dynamic.js';
import(modulePath).then(m => console.log(m));
```

```
SuperCall[Yield, Await] ::
    super Arguments[?Yield, ?Await]

Arguments[Yield, Await] ::
    ( )
    ( ArgumentList[?Yield, ?Await] )
    ( ArgumentList[?Yield, ?Await] , )

ArgumentList[Yield, Await] ::
    AssignmentExpression[+In, ?Yield, ?Await]
    ... AssignmentExpression[+In, ?Yield, ?Await]
    ArgumentList[?Yield, ?Await] , AssignmentExpression[+In, ?Yield, ?Await]
    ArgumentList[?Yield, ?Await] , ... AssignmentExpression[+In, ?Yield, ?Await]
```

### 2.10 可选链表达式 (Optional Expressions) 🆕

```
OptionalExpression[Yield, Await] ::
    MemberExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]
    CallExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]
    OptionalExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]

OptionalChain[Yield, Await] ::
    ?. Arguments[?Yield, ?Await]
    ?. [ Expression[+In, ?Yield, ?Await] ]
    ?. IdentifierName
    ?. TemplateLiteral[?Yield, ?Await, +Tagged]
    OptionalChain[?Yield, ?Await] Arguments[?Yield, ?Await]
    OptionalChain[?Yield, ?Await] [ Expression[+In, ?Yield, ?Await] ]
    OptionalChain[?Yield, ?Await] . IdentifierName
    OptionalChain[?Yield, ?Await] TemplateLiteral[?Yield, ?Await, +Tagged]
```

**ES2020 新特性：Optional Chaining（可选链）**

**示例：**
```javascript
// 安全地访问嵌套属性
obj?.prop
obj?.[expr]
obj?.method()
obj?.prop?.nested

// 避免错误
// 传统写法
const value = obj && obj.prop && obj.prop.nested;
// ES2020
const value = obj?.prop?.nested;
```

### 2.11 左值表达式 (Left-Hand-Side Expressions)

```
LeftHandSideExpression[Yield, Await] ::
    NewExpression[?Yield, ?Await]
    CallExpression[?Yield, ?Await]
    OptionalExpression[?Yield, ?Await]
```

**ES2020 新增：** OptionalExpression 分支

### 2.12 更新表达式 (Update Expressions)

```
UpdateExpression[Yield, Await] ::
    LeftHandSideExpression[?Yield, ?Await]
    LeftHandSideExpression[?Yield, ?Await] [no LineTerminator here] ++
    LeftHandSideExpression[?Yield, ?Await] [no LineTerminator here] --
    ++ UnaryExpression[?Yield, ?Await]
    -- UnaryExpression[?Yield, ?Await]
```

### 2.13 一元表达式 (Unary Expressions)

```
UnaryExpression[Yield, Await] ::
    UpdateExpression[?Yield, ?Await]
    delete UnaryExpression[?Yield, ?Await]
    void UnaryExpression[?Yield, ?Await]
    typeof UnaryExpression[?Yield, ?Await]
    + UnaryExpression[?Yield, ?Await]
    - UnaryExpression[?Yield, ?Await]
    ~ UnaryExpression[?Yield, ?Await]
    ! UnaryExpression[?Yield, ?Await]
    [+Await] AwaitExpression[?Yield]
```

**说明：** AwaitExpression 仅在 async 上下文中可用（[+Await]）

### 2.14 幂运算表达式 (Exponentiation Expressions) 🆕

```
ExponentiationExpression[Yield, Await] ::
    UnaryExpression[?Yield, ?Await]
    UpdateExpression[?Yield, ?Await] ** ExponentiationExpression[?Yield, ?Await]
```

**ES2016 新增：** 幂运算符 `**`（右结合）

**示例：**
```javascript
2 ** 3        // 8
2 ** 3 ** 2   // 512 (右结合: 2 ** (3 ** 2))
```

### 2.15 乘法表达式 (Multiplicative Expressions)

```
MultiplicativeExpression[Yield, Await] ::
    ExponentiationExpression[?Yield, ?Await]
    MultiplicativeExpression[?Yield, ?Await] MultiplicativeOperator ExponentiationExpression[?Yield, ?Await]

MultiplicativeOperator :: one of
    *  /  %
```

### 2.16 加法表达式 (Additive Expressions)

```
AdditiveExpression[Yield, Await] ::
    MultiplicativeExpression[?Yield, ?Await]
    AdditiveExpression[?Yield, ?Await] + MultiplicativeExpression[?Yield, ?Await]
    AdditiveExpression[?Yield, ?Await] - MultiplicativeExpression[?Yield, ?Await]
```

### 2.17 移位表达式 (Shift Expressions)

```
ShiftExpression[Yield, Await] ::
    AdditiveExpression[?Yield, ?Await]
    ShiftExpression[?Yield, ?Await] << AdditiveExpression[?Yield, ?Await]
    ShiftExpression[?Yield, ?Await] >> AdditiveExpression[?Yield, ?Await]
    ShiftExpression[?Yield, ?Await] >>> AdditiveExpression[?Yield, ?Await]
```

### 2.18 关系表达式 (Relational Expressions)

```
RelationalExpression[In, Yield, Await] ::
    ShiftExpression[?Yield, ?Await]
    RelationalExpression[?In, ?Yield, ?Await] < ShiftExpression[?Yield, ?Await]
    RelationalExpression[?In, ?Yield, ?Await] > ShiftExpression[?Yield, ?Await]
    RelationalExpression[?In, ?Yield, ?Await] <= ShiftExpression[?Yield, ?Await]
    RelationalExpression[?In, ?Yield, ?Await] >= ShiftExpression[?Yield, ?Await]
    RelationalExpression[?In, ?Yield, ?Await] instanceof ShiftExpression[?Yield, ?Await]
    [+In] RelationalExpression[+In, ?Yield, ?Await] in ShiftExpression[?Yield, ?Await]
```

### 2.19 相等表达式 (Equality Expressions)

```
EqualityExpression[In, Yield, Await] ::
    RelationalExpression[?In, ?Yield, ?Await]
    EqualityExpression[?In, ?Yield, ?Await] == RelationalExpression[?In, ?Yield, ?Await]
    EqualityExpression[?In, ?Yield, ?Await] != RelationalExpression[?In, ?Yield, ?Await]
    EqualityExpression[?In, ?Yield, ?Await] === RelationalExpression[?In, ?Yield, ?Await]
    EqualityExpression[?In, ?Yield, ?Await] !== RelationalExpression[?In, ?Yield, ?Await]
```

### 2.20 按位运算表达式 (Bitwise Expressions)

```
BitwiseANDExpression[In, Yield, Await] ::
    EqualityExpression[?In, ?Yield, ?Await]
    BitwiseANDExpression[?In, ?Yield, ?Await] & EqualityExpression[?In, ?Yield, ?Await]

BitwiseXORExpression[In, Yield, Await] ::
    BitwiseANDExpression[?In, ?Yield, ?Await]
    BitwiseXORExpression[?In, ?Yield, ?Await] ^ BitwiseANDExpression[?In, ?Yield, ?Await]

BitwiseORExpression[In, Yield, Await] ::
    BitwiseXORExpression[?In, ?Yield, ?Await]
    BitwiseORExpression[?In, ?Yield, ?Await] | BitwiseXORExpression[?In, ?Yield, ?Await]
```

### 2.21 逻辑运算表达式 (Logical Expressions)

```
LogicalANDExpression[In, Yield, Await] ::
    BitwiseORExpression[?In, ?Yield, ?Await]
    LogicalANDExpression[?In, ?Yield, ?Await] && BitwiseORExpression[?In, ?Yield, ?Await]

LogicalORExpression[In, Yield, Await] ::
    LogicalANDExpression[?In, ?Yield, ?Await]
    LogicalORExpression[?In, ?Yield, ?Await] || LogicalANDExpression[?In, ?Yield, ?Await]
```

### 2.22 空值合并表达式 (Coalesce Expression) 🆕

```
CoalesceExpression[In, Yield, Await] ::
    CoalesceExpressionHead[?In, ?Yield, ?Await] ?? BitwiseORExpression[?In, ?Yield, ?Await]

CoalesceExpressionHead[In, Yield, Await] ::
    CoalesceExpression[?In, ?Yield, ?Await]
    BitwiseORExpression[?In, ?Yield, ?Await]
```

**ES2020 新特性：Nullish Coalescing（空值合并运算符）**

**示例：**
```javascript
// ?? 运算符：仅在左侧为 null 或 undefined 时使用右侧值
const value = foo ?? 'default';  // foo 为 null/undefined 时用 'default'

// 对比 || 运算符
0 || 'default'     // 'default' (0 被视为 falsy)
0 ?? 'default'     // 0 (0 不是 null/undefined)

'' || 'default'    // 'default' (空字符串被视为 falsy)
'' ?? 'default'    // '' (空字符串不是 null/undefined)
```

**注意：** `??` 不能与 `&&` 或 `||` 直接混用，需要加括号
```javascript
// ❌ 错误
a && b ?? c

// ✅ 正确
(a && b) ?? c
a && (b ?? c)
```

### 2.23 短路表达式 (Short-Circuit Expression)

```
ShortCircuitExpression[In, Yield, Await] ::
    LogicalORExpression[?In, ?Yield, ?Await]
    CoalesceExpression[?In, ?Yield, ?Await]
```

### 2.24 条件表达式 (Conditional Expression)

```
ConditionalExpression[In, Yield, Await] ::
    ShortCircuitExpression[?In, ?Yield, ?Await]
    ShortCircuitExpression[?In, ?Yield, ?Await] ? AssignmentExpression[+In, ?Yield, ?Await] : AssignmentExpression[?In, ?Yield, ?Await]
```

### 2.25 赋值表达式 (Assignment Expressions)

```
AssignmentExpression[In, Yield, Await] ::
    ConditionalExpression[?In, ?Yield, ?Await]
    [+Yield] YieldExpression[?In, ?Await]
    ArrowFunction[?In, ?Yield, ?Await]
    AsyncArrowFunction[?In, ?Yield, ?Await]
    LeftHandSideExpression[?Yield, ?Await] = AssignmentExpression[?In, ?Yield, ?Await]
    LeftHandSideExpression[?Yield, ?Await] AssignmentOperator AssignmentExpression[?In, ?Yield, ?Await]

AssignmentOperator :: one of
    *=  /=  %=  +=  -=  <<=  >>=  >>>=  &=  ^=  |=  **=
```

**ES2016 新增：** `**=` 幂赋值运算符

**赋值模式（用于解构）：**
```
AssignmentPattern[Yield, Await] ::
    ObjectAssignmentPattern[?Yield, ?Await]
    ArrayAssignmentPattern[?Yield, ?Await]

ObjectAssignmentPattern[Yield, Await] ::
    { }
    { AssignmentRestProperty[?Yield, ?Await] }
    { AssignmentPropertyList[?Yield, ?Await] }
    { AssignmentPropertyList[?Yield, ?Await] , AssignmentRestProperty[?Yield, ?Await][opt] }

ArrayAssignmentPattern[Yield, Await] ::
    [ Elision[opt] AssignmentRestElement[?Yield, ?Await][opt] ]
    [ AssignmentElementList[?Yield, ?Await] ]
    [ AssignmentElementList[?Yield, ?Await] , Elision[opt] AssignmentRestElement[?Yield, ?Await][opt] ]

AssignmentRestProperty[Yield, Await] ::
    ... DestructuringAssignmentTarget[?Yield, ?Await]

AssignmentPropertyList[Yield, Await] ::
    AssignmentProperty[?Yield, ?Await]
    AssignmentPropertyList[?Yield, ?Await] , AssignmentProperty[?Yield, ?Await]

AssignmentElementList[Yield, Await] ::
    AssignmentElisionElement[?Yield, ?Await]
    AssignmentElementList[?Yield, ?Await] , AssignmentElisionElement[?Yield, ?Await]

AssignmentElisionElement[Yield, Await] ::
    Elision[opt] AssignmentElement[?Yield, ?Await]

AssignmentProperty[Yield, Await] ::
    IdentifierReference[?Yield, ?Await] Initializer[+In, ?Yield, ?Await][opt]
    PropertyName[?Yield, ?Await] : AssignmentElement[?Yield, ?Await]

AssignmentElement[Yield, Await] ::
    DestructuringAssignmentTarget[?Yield, ?Await] Initializer[+In, ?Yield, ?Await][opt]

AssignmentRestElement[Yield, Await] ::
    ... DestructuringAssignmentTarget[?Yield, ?Await]

DestructuringAssignmentTarget[Yield, Await] ::
    LeftHandSideExpression[?Yield, ?Await]
```

### 2.26 逗号表达式 (Comma Operator)

```
Expression[In, Yield, Await] ::
    AssignmentExpression[?In, ?Yield, ?Await]
    Expression[?In, ?Yield, ?Await] , AssignmentExpression[?In, ?Yield, ?Await]
```

---

## 3. 语句 (Statements)

### 3.1 语句列表

```
Statement[Yield, Await, Return] ::
    BlockStatement[?Yield, ?Await, ?Return]
    VariableStatement[?Yield, ?Await]
    EmptyStatement
    ExpressionStatement[?Yield, ?Await]
    IfStatement[?Yield, ?Await, ?Return]
    BreakableStatement[?Yield, ?Await, ?Return]
    ContinueStatement[?Yield, ?Await]
    BreakStatement[?Yield, ?Await]
    [+Return] ReturnStatement[?Yield, ?Await]
    WithStatement[?Yield, ?Await, ?Return]
    LabelledStatement[?Yield, ?Await, ?Return]
    ThrowStatement[?Yield, ?Await]
    TryStatement[?Yield, ?Await, ?Return]
    DebuggerStatement

Declaration[Yield, Await] ::
    HoistableDeclaration[?Yield, ?Await, ~Default]
    ClassDeclaration[?Yield, ?Await, ~Default]
    LexicalDeclaration[+In, ?Yield, ?Await]

HoistableDeclaration[Yield, Await, Default] ::
    FunctionDeclaration[?Yield, ?Await, ?Default]
    GeneratorDeclaration[?Yield, ?Await, ?Default]
    AsyncFunctionDeclaration[?Yield, ?Await, ?Default]
    AsyncGeneratorDeclaration[?Yield, ?Await, ?Default]

BreakableStatement[Yield, Await, Return] ::
    IterationStatement[?Yield, ?Await, ?Return]
    SwitchStatement[?Yield, ?Await, ?Return]
```

### 3.2 块语句 (Block Statement)

```
BlockStatement[Yield, Await, Return] ::
    Block[?Yield, ?Await, ?Return]

Block[Yield, Await, Return] ::
    { StatementList[?Yield, ?Await, ?Return][opt] }

StatementList[Yield, Await, Return] ::
    StatementListItem[?Yield, ?Await, ?Return]
    StatementList[?Yield, ?Await, ?Return] StatementListItem[?Yield, ?Await, ?Return]

StatementListItem[Yield, Await, Return] ::
    Statement[?Yield, ?Await, ?Return]
    Declaration[?Yield, ?Await]
```

### 3.3 变量声明 (Variable Declarations)

#### 3.3.1 词法声明 (let/const)

```
LexicalDeclaration[In, Yield, Await] ::
    LetOrConst BindingList[?In, ?Yield, ?Await] ;

LetOrConst ::
    let
    const

BindingList[In, Yield, Await] ::
    LexicalBinding[?In, ?Yield, ?Await]
    BindingList[?In, ?Yield, ?Await] , LexicalBinding[?In, ?Yield, ?Await]

LexicalBinding[In, Yield, Await] ::
    BindingIdentifier[?Yield, ?Await] Initializer[?In, ?Yield, ?Await][opt]
    BindingPattern[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]
```

#### 3.3.2 var 声明

```
VariableStatement[Yield, Await] ::
    var VariableDeclarationList[+In, ?Yield, ?Await] ;

VariableDeclarationList[In, Yield, Await] ::
    VariableDeclaration[?In, ?Yield, ?Await]
    VariableDeclarationList[?In, ?Yield, ?Await] , VariableDeclaration[?In, ?Yield, ?Await]

VariableDeclaration[In, Yield, Await] ::
    BindingIdentifier[?Yield, ?Await] Initializer[?In, ?Yield, ?Await][opt]
    BindingPattern[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]
```

### 3.4 绑定模式 (Binding Patterns)

```
BindingPattern[Yield, Await] ::
    ObjectBindingPattern[?Yield, ?Await]
    ArrayBindingPattern[?Yield, ?Await]

ObjectBindingPattern[Yield, Await] ::
    { }
    { BindingRestProperty[?Yield, ?Await] }
    { BindingPropertyList[?Yield, ?Await] }
    { BindingPropertyList[?Yield, ?Await] , BindingRestProperty[?Yield, ?Await][opt] }

ArrayBindingPattern[Yield, Await] ::
    [ Elision[opt] BindingRestElement[?Yield, ?Await][opt] ]
    [ BindingElementList[?Yield, ?Await] ]
    [ BindingElementList[?Yield, ?Await] , Elision[opt] BindingRestElement[?Yield, ?Await][opt] ]

BindingRestProperty[Yield, Await] ::
    ... BindingIdentifier[?Yield, ?Await]

BindingPropertyList[Yield, Await] ::
    BindingProperty[?Yield, ?Await]
    BindingPropertyList[?Yield, ?Await] , BindingProperty[?Yield, ?Await]

BindingElementList[Yield, Await] ::
    BindingElisionElement[?Yield, ?Await]
    BindingElementList[?Yield, ?Await] , BindingElisionElement[?Yield, ?Await]

BindingElisionElement[Yield, Await] ::
    Elision[opt] BindingElement[?Yield, ?Await]

BindingProperty[Yield, Await] ::
    SingleNameBinding[?Yield, ?Await]
    PropertyName[?Yield, ?Await] : BindingElement[?Yield, ?Await]

BindingElement[Yield, Await] ::
    SingleNameBinding[?Yield, ?Await]
    BindingPattern[?Yield, ?Await] Initializer[+In, ?Yield, ?Await][opt]

SingleNameBinding[Yield, Await] ::
    BindingIdentifier[?Yield, ?Await] Initializer[+In, ?Yield, ?Await][opt]

BindingRestElement[Yield, Await] ::
    ... BindingIdentifier[?Yield, ?Await]
    ... BindingPattern[?Yield, ?Await]
```

**ES2018 新增：对象 rest 解构**
```javascript
const {a, ...rest} = obj;  // rest 包含除 a 以外的所有属性
```

### 3.5 空语句 (Empty Statement)

```
EmptyStatement ::
    ;
```

### 3.6 表达式语句 (Expression Statement)

```
ExpressionStatement[Yield, Await] ::
    [lookahead ∉ { {, function, async [no LineTerminator here] function, class, let [ }]
    Expression[+In, ?Yield, ?Await] ;
```

### 3.7 if 语句 (If Statement)

```
IfStatement[Yield, Await, Return] ::
    if ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return] else Statement[?Yield, ?Await, ?Return]
    if ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
```

### 3.8 迭代语句 (Iteration Statements)

```
IterationStatement[Yield, Await, Return] ::
    do Statement[?Yield, ?Await, ?Return] while ( Expression[+In, ?Yield, ?Await] ) ;
    while ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
    for ( [lookahead ≠ let [] Expression[~In, ?Yield, ?Await][opt] ; Expression[+In, ?Yield, ?Await][opt] ; Expression[+In, ?Yield, ?Await][opt] ) Statement[?Yield, ?Await, ?Return]
    for ( var VariableDeclarationList[~In, ?Yield, ?Await] ; Expression[+In, ?Yield, ?Await][opt] ; Expression[+In, ?Yield, ?Await][opt] ) Statement[?Yield, ?Await, ?Return]
    for ( LexicalDeclaration[~In, ?Yield, ?Await] Expression[+In, ?Yield, ?Await][opt] ; Expression[+In, ?Yield, ?Await][opt] ) Statement[?Yield, ?Await, ?Return]
    for ( [lookahead ≠ let [] LeftHandSideExpression[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
    for ( var ForBinding[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
    for ( ForDeclaration[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
    for ( [lookahead ≠ let] LeftHandSideExpression[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
    for ( var ForBinding[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
    for ( ForDeclaration[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
    [+Await] for await ( [lookahead ≠ let] LeftHandSideExpression[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
    [+Await] for await ( var ForBinding[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
    [+Await] for await ( ForDeclaration[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]

ForDeclaration[Yield, Await] ::
    LetOrConst ForBinding[?Yield, ?Await]

ForBinding[Yield, Await] ::
    BindingIdentifier[?Yield, ?Await]
    BindingPattern[?Yield, ?Await]
```

**ES2018 新增：for await...of 异步迭代**
```javascript
// for await...of 示例
async function processAsyncIterable(iterable) {
  for await (const item of iterable) {
    console.log(item);
  }
}
```

### 3.9 continue 语句 (Continue Statement)

```
ContinueStatement[Yield, Await] ::
    continue ;
    continue [no LineTerminator here] LabelIdentifier[?Yield, ?Await] ;
```

### 3.10 break 语句 (Break Statement)

```
BreakStatement[Yield, Await] ::
    break ;
    break [no LineTerminator here] LabelIdentifier[?Yield, ?Await] ;
```

### 3.11 return 语句 (Return Statement)

```
ReturnStatement[Yield, Await] ::
    return ;
    return [no LineTerminator here] Expression[+In, ?Yield, ?Await] ;
```

### 3.12 with 语句 (With Statement)

```
WithStatement[Yield, Await, Return] ::
    with ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
```

**注意：** 严格模式下禁止使用

### 3.13 switch 语句 (Switch Statement)

```
SwitchStatement[Yield, Await, Return] ::
    switch ( Expression[+In, ?Yield, ?Await] ) CaseBlock[?Yield, ?Await, ?Return]

CaseBlock[Yield, Await, Return] ::
    { CaseClauses[?Yield, ?Await, ?Return][opt] }
    { CaseClauses[?Yield, ?Await, ?Return][opt] DefaultClause[?Yield, ?Await, ?Return] CaseClauses[?Yield, ?Await, ?Return][opt] }

CaseClauses[Yield, Await, Return] ::
    CaseClause[?Yield, ?Await, ?Return]
    CaseClauses[?Yield, ?Await, ?Return] CaseClause[?Yield, ?Await, ?Return]

CaseClause[Yield, Await, Return] ::
    case Expression[+In, ?Yield, ?Await] : StatementList[?Yield, ?Await, ?Return][opt]

DefaultClause[Yield, Await, Return] ::
    default : StatementList[?Yield, ?Await, ?Return][opt]
```

### 3.14 标签语句 (Labelled Statement)

```
LabelledStatement[Yield, Await, Return] ::
    LabelIdentifier[?Yield, ?Await] : LabelledItem[?Yield, ?Await, ?Return]

LabelledItem[Yield, Await, Return] ::
    Statement[?Yield, ?Await, ?Return]
    FunctionDeclaration[?Yield, ?Await, ~Default]
```

### 3.15 throw 语句 (Throw Statement)

```
ThrowStatement[Yield, Await] ::
    throw [no LineTerminator here] Expression[+In, ?Yield, ?Await] ;
```

### 3.16 try 语句 (Try Statement)

```
TryStatement[Yield, Await, Return] ::
    try Block[?Yield, ?Await, ?Return] Catch[?Yield, ?Await, ?Return]
    try Block[?Yield, ?Await, ?Return] Finally[?Yield, ?Await, ?Return]
    try Block[?Yield, ?Await, ?Return] Catch[?Yield, ?Await, ?Return] Finally[?Yield, ?Await, ?Return]

Catch[Yield, Await, Return] ::
    catch ( CatchParameter[?Yield, ?Await] ) Block[?Yield, ?Await, ?Return]
    catch Block[?Yield, ?Await, ?Return]

Finally[Yield, Await, Return] ::
    finally Block[?Yield, ?Await, ?Return]

CatchParameter[Yield, Await] ::
    BindingIdentifier[?Yield, ?Await]
    BindingPattern[?Yield, ?Await]
```

**ES2019 新增：可选的 catch 绑定**
```javascript
// ES2019: catch 不需要参数
try {
  // ...
} catch {
  // 不关心错误对象时可以省略参数
}

// 传统方式
try {
  // ...
} catch (e) {
  // ...
}
```

### 3.17 debugger 语句 (Debugger Statement)

```
DebuggerStatement ::
    debugger ;
```

---

## 4. 函数和类 (Functions and Classes)

### 4.1 函数声明和表达式

```
FunctionDeclaration[Yield, Await, Default] ::
    function BindingIdentifier[?Yield, ?Await] ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
    [+Default] function ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }

FunctionExpression ::
    function BindingIdentifier[~Yield, ~Await][opt] ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }

UniqueFormalParameters[Yield, Await] ::
    FormalParameters[?Yield, ?Await]

FormalParameters[Yield, Await] ::
    [empty]
    FunctionRestParameter[?Yield, ?Await]
    FormalParameterList[?Yield, ?Await]
    FormalParameterList[?Yield, ?Await] ,
    FormalParameterList[?Yield, ?Await] , FunctionRestParameter[?Yield, ?Await]

FormalParameterList[Yield, Await] ::
    FormalParameter[?Yield, ?Await]
    FormalParameterList[?Yield, ?Await] , FormalParameter[?Yield, ?Await]

FunctionRestParameter[Yield, Await] ::
    BindingRestElement[?Yield, ?Await]

FormalParameter[Yield, Await] ::
    BindingElement[?Yield, ?Await]

FunctionBody[Yield, Await] ::
    FunctionStatementList[?Yield, ?Await]

FunctionStatementList[Yield, Await] ::
    StatementList[?Yield, ?Await, +Return][opt]
```

### 4.2 箭头函数 (Arrow Functions)

```
ArrowFunction[In, Yield, Await] ::
    ArrowParameters[?Yield, ?Await] [no LineTerminator here] => ConciseBody[?In]

ArrowParameters[Yield, Await] ::
    BindingIdentifier[?Yield, ?Await]
    CoverParenthesizedExpressionAndArrowParameterList[?Yield, ?Await]

ConciseBody[In] ::
    [lookahead ≠ { ] ExpressionBody[?In, ~Await]
    { FunctionBody[~Yield, ~Await] }

ExpressionBody[In, Await] ::
    AssignmentExpression[?In, ~Yield, ?Await]
```

**精化为箭头形参：**
```
ArrowFormalParameters[Yield, Await] ::
    ( UniqueFormalParameters[?Yield, ?Await] )
```

**示例：**
```javascript
x => x + 1
(x, y) => x + y
async () => await fetch(url)
```

### 4.3 异步箭头函数 (Async Arrow Functions)

```
AsyncArrowFunction[In, Yield, Await] ::
    async [no LineTerminator here] AsyncArrowBindingIdentifier[?Yield] [no LineTerminator here] => AsyncConciseBody[?In]
    CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await] [no LineTerminator here] => AsyncConciseBody[?In]

AsyncConciseBody[In] ::
    [lookahead ≠ { ] ExpressionBody[?In, +Await]
    { AsyncFunctionBody }

AsyncArrowBindingIdentifier[Yield] ::
    BindingIdentifier[?Yield, +Await]

CoverCallExpressionAndAsyncArrowHead ::
    MemberExpression Arguments
```

**精化为异步箭头头部：**
```
AsyncArrowHead ::
    async [no LineTerminator here] ArrowFormalParameters[~Yield, +Await]
```

### 4.4 方法定义 (Method Definitions)

```
MethodDefinition[Yield, Await] ::
    PropertyName[?Yield, ?Await] ( UniqueFormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
    GeneratorMethod[?Yield, ?Await]
    AsyncMethod[?Yield, ?Await]
    AsyncGeneratorMethod[?Yield, ?Await]
    get PropertyName[?Yield, ?Await] ( ) { FunctionBody[~Yield, ~Await] }
    set PropertyName[?Yield, ?Await] ( PropertySetParameterList ) { FunctionBody[~Yield, ~Await] }

PropertySetParameterList ::
    FormalParameter[~Yield, ~Await]
```

### 4.5 生成器函数 (Generator Functions)

```
GeneratorMethod[Yield, Await] ::
    * PropertyName[?Yield, ?Await] ( UniqueFormalParameters[+Yield, ~Await] ) { GeneratorBody }

GeneratorDeclaration[Yield, Await, Default] ::
    function * BindingIdentifier[?Yield, ?Await] ( FormalParameters[+Yield, ~Await] ) { GeneratorBody }
    [+Default] function * ( FormalParameters[+Yield, ~Await] ) { GeneratorBody }

GeneratorExpression ::
    function * BindingIdentifier[+Yield, ~Await][opt] ( FormalParameters[+Yield, ~Await] ) { GeneratorBody }

GeneratorBody ::
    FunctionBody[+Yield, ~Await]

YieldExpression[In, Await] ::
    yield
    yield [no LineTerminator here] AssignmentExpression[?In, +Yield, ?Await]
    yield [no LineTerminator here] * AssignmentExpression[?In, +Yield, ?Await]
```

### 4.6 异步生成器函数 (Async Generator Functions)

```
AsyncGeneratorMethod[Yield, Await] ::
    async [no LineTerminator here] * PropertyName[?Yield, ?Await] ( UniqueFormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }

AsyncGeneratorDeclaration[Yield, Await, Default] ::
    async [no LineTerminator here] function * BindingIdentifier[?Yield, ?Await] ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }
    [+Default] async [no LineTerminator here] function * ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }

AsyncGeneratorExpression ::
    async [no LineTerminator here] function * BindingIdentifier[+Yield, +Await][opt] ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }

AsyncGeneratorBody ::
    FunctionBody[+Yield, +Await]
```

**ES2018 新增：异步生成器**
```javascript
async function* asyncGenerator() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
}
```

### 4.7 异步函数 (Async Functions)

```
AsyncFunctionDeclaration[Yield, Await, Default] ::
    async [no LineTerminator here] function BindingIdentifier[?Yield, ?Await] ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }
    [+Default] async [no LineTerminator here] function ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }

AsyncFunctionExpression ::
    async [no LineTerminator here] function ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }
    async [no LineTerminator here] function BindingIdentifier[~Yield, +Await] ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }

AsyncMethod[Yield, Await] ::
    async [no LineTerminator here] PropertyName[?Yield, ?Await] ( UniqueFormalParameters[~Yield, +Await] ) { AsyncFunctionBody }

AsyncFunctionBody ::
    FunctionBody[~Yield, +Await]

AwaitExpression[Yield] ::
    await UnaryExpression[?Yield, +Await]
```

### 4.8 类声明和表达式 (Classes)

```
ClassDeclaration[Yield, Await, Default] ::
    class BindingIdentifier[?Yield, ?Await] ClassTail[?Yield, ?Await]
    [+Default] class ClassTail[?Yield, ?Await]

ClassExpression[Yield, Await] ::
    class BindingIdentifier[?Yield, ?Await][opt] ClassTail[?Yield, ?Await]

ClassTail[Yield, Await] ::
    ClassHeritage[?Yield, ?Await][opt] { ClassBody[?Yield, ?Await][opt] }

ClassHeritage[Yield, Await] ::
    extends LeftHandSideExpression[?Yield, ?Await]

ClassBody[Yield, Await] ::
    ClassElementList[?Yield, ?Await]

ClassElementList[Yield, Await] ::
    ClassElement[?Yield, ?Await]
    ClassElementList[?Yield, ?Await] ClassElement[?Yield, ?Await]

ClassElement[Yield, Await] ::
    MethodDefinition[?Yield, ?Await]
    static MethodDefinition[?Yield, ?Await]
    ;
```

---

## 5. 脚本和模块 (Scripts and Modules)

### 5.1 脚本 (Scripts)

```
Script ::
    ScriptBody[opt]

ScriptBody ::
    StatementList[~Yield, ~Await, ~Return]
```

### 5.2 模块 (Modules)

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
    StatementListItem[~Yield, ~Await, ~Return]
```

### 5.3 导入声明 (Import Declarations)

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
    BindingIdentifier[~Yield, ~Await]
```

**示例：**
```javascript
import defaultExport from './module.js';
import { export1, export2 } from './module.js';
import { export1 as alias1 } from './module.js';
import * as name from './module.js';
import defaultExport, { export1 } from './module.js';
import './module.js';  // 仅执行
```

### 5.4 导出声明 (Export Declarations)

```
ExportDeclaration ::
    export ExportFromClause FromClause ;
    export NamedExports ;
    export VariableStatement[~Yield, ~Await]
    export Declaration[~Yield, ~Await]
    export default HoistableDeclaration[~Yield, ~Await, +Default]
    export default ClassDeclaration[~Yield, ~Await, +Default]
    export default [lookahead ∉ { function, async [no LineTerminator here] function, class }] AssignmentExpression[+In, ~Yield, ~Await] ;

ExportFromClause ::
    *
    * as IdentifierName
    NamedExports

NamedExports ::
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
export const x = 1;
export function func() {}
export { x, y };
export { x as publicX };
export * from './module.js';
export * as ns from './module.js';  // ES2020 新增
export { x } from './module.js';
export default expression;
```

---

## 6. ES2020 新特性

### 6.1 Optional Chaining (可选链) 🆕

**语法：** `?.`

**使用场景：**
1. 属性访问：`obj?.prop`
2. 计算属性：`obj?.[expr]`
3. 方法调用：`obj?.method()`
4. 链式调用：`obj?.prop?.nested?.method?.()`

**完整语法规则：**
```
OptionalExpression[Yield, Await] ::
    MemberExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]
    CallExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]
    OptionalExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]

OptionalChain[Yield, Await] ::
    ?. Arguments[?Yield, ?Await]
    ?. [ Expression[+In, ?Yield, ?Await] ]
    ?. IdentifierName
    ?. TemplateLiteral[?Yield, ?Await, +Tagged]
    OptionalChain[?Yield, ?Await] Arguments[?Yield, ?Await]
    OptionalChain[?Yield, ?Await] [ Expression[+In, ?Yield, ?Await] ]
    OptionalChain[?Yield, ?Await] . IdentifierName
    OptionalChain[?Yield, ?Await] TemplateLiteral[?Yield, ?Await, +Tagged]
```

**代码示例：**
```javascript
// 安全访问
const street = user?.address?.street;

// 安全调用
const result = obj?.method?.();

// 计算属性
const value = obj?.['prop-name'];

// 短路行为
const x = null?.b.c;  // undefined（而不是报错）
```

### 6.2 Nullish Coalescing (空值合并运算符) 🆕

**语法：** `??`

**完整语法规则：**
```
CoalesceExpression[In, Yield, Await] ::
    CoalesceExpressionHead[?In, ?Yield, ?Await] ?? BitwiseORExpression[?In, ?Yield, ?Await]

CoalesceExpressionHead[In, Yield, Await] ::
    CoalesceExpression[?In, ?Yield, ?Await]
    BitwiseORExpression[?In, ?Yield, ?Await]

ShortCircuitExpression[In, Yield, Await] ::
    LogicalORExpression[?In, ?Yield, ?Await]
    CoalesceExpression[?In, ?Yield, ?Await]
```

**代码示例：**
```javascript
// 仅在 null/undefined 时使用默认值
const value = foo ?? 'default';

// 对比 || 运算符
0 || 100      // 100
0 ?? 100      // 0

'' || 'text'  // 'text'
'' ?? 'text'  // ''

false || true // true
false ?? true // false
```

### 6.3 BigInt (大整数) 🆕

**语法：**
```
NumericLiteral ::
    DecimalLiteral
    DecimalBigIntegerLiteral        // 新增
    NonDecimalIntegerLiteral
    NonDecimalIntegerLiteral BigIntLiteralSuffix  // 新增

DecimalBigIntegerLiteral ::
    0 BigIntLiteralSuffix
    NonZeroDigit DecimalDigits[opt] BigIntLiteralSuffix

BigIntLiteralSuffix ::
    n
```

**代码示例：**
```javascript
// BigInt 字面量
const big1 = 9007199254740991n;
const big2 = 0b1010n;  // 二进制
const big3 = 0o777n;   // 八进制
const big4 = 0xFFn;    // 十六进制

// BigInt 运算
const sum = 1n + 2n;   // 3n
const prod = 2n * 3n;  // 6n

// 不能混用 BigInt 和 Number
// 1n + 1  // ❌ TypeError
```

### 6.4 Dynamic Import (动态导入) 🆕

**语法：**
```
ImportCall[Yield, Await] ::
    import ( AssignmentExpression[+In, ?Yield, ?Await] )
```

**代码示例：**
```javascript
// 动态导入模块
const modulePath = './utils.js';
const module = await import(modulePath);

// 条件导入
if (condition) {
  const { helper } = await import('./helper.js');
}

// 懒加载
button.addEventListener('click', async () => {
  const module = await import('./heavy-module.js');
  module.doSomething();
});
```

### 6.5 import.meta 🆕

**语法：**
```
MetaProperty ::
    NewTarget
    ImportMeta

ImportMeta ::
    import . meta
```

**代码示例：**
```javascript
// 模块元数据
console.log(import.meta.url);  // 当前模块的 URL
console.log(import.meta);      // { url: '...' }
```

### 6.6 export * as ns 🆕

**ES2020 新增：命名空间重导出**

```
ExportFromClause ::
    *
    * as IdentifierName    // ES2020 新增
    NamedExports
```

**代码示例：**
```javascript
// ES2020: 导出为命名空间
export * as utils from './utils.js';

// 等价于 ES2015 的两步操作
import * as utils from './utils.js';
export { utils };
```

---

## 7. 附录：运算符优先级

从高到低排列：

| 优先级 | 运算符类型 | 运算符 | 结合性 | 版本 |
|-------|-----------|--------|--------|------|
| 21 | 分组 | `( ... )` | n/a | ES5 |
| 20 | 成员访问 | `... . ...` | 左到右 | ES5 |
|    | 计算成员访问 | `... [ ... ]` | 左到右 | ES5 |
|    | new (带参数) | `new ... ( ... )` | n/a | ES5 |
|    | 函数调用 | `... ( ... )` | 左到右 | ES5 |
|    | **可选链** | **`?.`** | **左到右** | **ES2020** 🆕 |
| 19 | new (无参数) | `new ...` | 右到左 | ES5 |
| 18 | 后缀递增/递减 | `... ++` `... --` | n/a | ES5 |
| 17 | 逻辑非 | `! ...` | 右到左 | ES5 |
|    | 按位非 | `~ ...` | 右到左 | ES5 |
|    | 一元加/减 | `+ ...` `- ...` | 右到左 | ES5 |
|    | 前缀递增/递减 | `++ ...` `-- ...` | 右到左 | ES5 |
|    | typeof | `typeof ...` | 右到左 | ES5 |
|    | void | `void ...` | 右到左 | ES5 |
|    | delete | `delete ...` | 右到左 | ES5 |
|    | await | `await ...` | 右到左 | ES2017 |
| 16 | **幂** | **`... ** ...`** | **右到左** | **ES2016** 🆕 |
| 15 | 乘法/除法/取模 | `*` `/` `%` | 左到右 | ES5 |
| 14 | 加法/减法 | `+` `-` | 左到右 | ES5 |
| 13 | 位移 | `<<` `>>` `>>>` | 左到右 | ES5 |
| 12 | 关系 | `<` `<=` `>` `>=` | 左到右 | ES5 |
|    | | `in` `instanceof` | 左到右 | ES5 |
| 11 | 相等 | `==` `!=` `===` `!==` | 左到右 | ES5 |
| 10 | 按位与 | `&` | 左到右 | ES5 |
| 9  | 按位异或 | `^` | 左到右 | ES5 |
| 8  | 按位或 | `\|` | 左到右 | ES5 |
| 7  | 逻辑与 | `&&` | 左到右 | ES5 |
| 6  | 逻辑或 | `\|\|` | 左到右 | ES5 |
| 5  | **空值合并** | **`??`** | **左到右** | **ES2020** 🆕 |
| 4  | 条件 | `... ? ... : ...` | 右到左 | ES5 |
| 3  | 赋值 | `=` `+=` `-=` `*=` `/=` `%=` | 右到左 | ES5 |
|    |       | `<<=` `>>=` `>>>=` `&=` `^=` `\|=` | 右到左 | ES5 |
|    |       | **`**=`** | 右到左 | **ES2016** 🆕 |
| 2  | yield | `yield` `yield*` | 右到左 | ES2015 |
| 1  | 逗号 | `... , ...` | 左到右 | ES5 |

---

## 8. 附录：语法符号约定

### 语法表示法说明

- `::` - 定义语法规则
- `:` - 定义语法规则（非词法）
- `[opt]` - 可选项
- `one of` - 从列表中选择一个
- `[lookahead ≠ token]` - 前瞻，下一个不是指定 token
- `[lookahead ∉ { ... }]` - 前瞻，下一个不在集合中
- `[no LineTerminator here]` - 此处不允许换行符
- `but not` - 排除
- `[empty]` - 空规则（epsilon）

### 语法参数

- `[Yield]` - 在生成器上下文中（允许 yield）
- `[Await]` - 在异步上下文中（允许 await）
- `[In]` - 允许 `in` 运算符
- `[Return]` - 在函数体中（允许 return）
- `[Default]` - 在默认导出上下文中
- `[Tagged]` - 在标签模板上下文中
- `[+Param]` - 参数为 true
- `[~Param]` - 参数为 false
- `[?Param]` - 继承当前上下文的参数值

---

## 9. ES2015 到 ES2020 的主要变化

### ES2016
- ✅ 幂运算符 `**`
- ✅ 幂赋值运算符 `**=`

### ES2017
- ✅ Async Functions（async/await）
- ✅ 对象 Rest/Spread 属性（ES2018 完成）

### ES2018
- ✅ 异步迭代（for await...of）
- ✅ 异步生成器（async function*）
- ✅ 对象 Rest 解构（`{a, ...rest}`）
- ✅ 对象 Spread 语法（`{...obj}`）
- ✅ Promise.prototype.finally
- ✅ 正则表达式改进（命名捕获组、lookbehind 等）

### ES2019
- ✅ 可选的 catch 绑定（`catch { }` 不需要参数）
- ✅ JSON.stringify 改进
- ✅ Array.prototype.{flat, flatMap}
- ✅ Object.fromEntries
- ✅ String.prototype.{trimStart, trimEnd}

### ES2020
- ✅ **Optional Chaining (`?.`)**
- ✅ **Nullish Coalescing (`??`)**
- ✅ **BigInt（大整数）**
- ✅ **Dynamic Import (`import()`)**
- ✅ **import.meta**
- ✅ **export * as ns**
- ✅ globalThis
- ✅ Promise.allSettled
- ✅ String.prototype.matchAll
- ✅ for-in 顺序标准化

---

## 参考资源

- **官方规范：** https://262.ecma-international.org/11.0/
- **MDN 文档：** https://developer.mozilla.org/en-US/docs/Web/JavaScript
- **本文档版本：** 基于 ECMA-262 11th Edition (ES2020)
- **ES6 语法参考：** [es6parserSyntax.md](./es6parserSyntax.md)

---

## 编写 ES2020 Parser 的建议

### 1. 基于 ES2015 Parser 扩展

如果已有 ES2015 (ES6) Parser，建议增量添加：
1. **ES2016：** 幂运算符 `**`
2. **ES2017：** async/await
3. **ES2018：** 对象 rest/spread、异步迭代、异步生成器
4. **ES2019：** 可选 catch 绑定
5. **ES2020：** Optional Chaining、Nullish Coalescing、BigInt、Dynamic Import

### 2. 关键实现要点

**Optional Chaining (`?.`)：**
- 需要在词法分析阶段区分 `?.` 和 `? .`
- `?. [lookahead ∉ DecimalDigit]` - 避免与三元运算符混淆
- 短路行为：`obj?.prop?.method()` 中任一环节为 null/undefined 则立即返回 undefined

**Nullish Coalescing (`??`)：**
- 优先级介于 `||` 和 `? :` 之间
- 不能与 `&&` 或 `||` 直接混用（需要括号）
- 仅检查 null/undefined（不检查其他 falsy 值）

**BigInt：**
- 词法：识别 `n` 后缀
- 类型系统：BigInt 与 Number 不兼容
- 运算：不能混合 BigInt 和 Number

**Dynamic Import：**
- `import()` 是表达式，不是语句
- 返回 Promise
- 可以在任何地方使用（不限于顶层）

### 3. 测试建议

创建测试用例覆盖：
```javascript
// Optional Chaining
obj?.prop
obj?.[expr]
obj?.method()
obj?.a?.b?.c

// Nullish Coalescing
null ?? 'default'
undefined ?? 'default'
0 ?? 'default'
'' ?? 'default'

// BigInt
123n
0b1010n
0o777n
0xFFn

// Dynamic Import
import('./module.js')
import(dynamicPath)

// import.meta
import.meta.url

// export * as
export * as ns from './mod.js'
```

---

**注意事项：**

1. **向后兼容：** ES2020 完全向后兼容 ES2015
2. **Await 参数：** 所有语法规则都需要增加 Await 参数支持
3. **可选链短路：** `?.` 遇到 null/undefined 立即返回 undefined
4. **运算符优先级：** `?.` 与 `.` 同级，`??` 低于 `||`
5. **BigInt 限制：** 不能隐式转换为 Number，不支持 Math 对象方法

---

**文档结束**

