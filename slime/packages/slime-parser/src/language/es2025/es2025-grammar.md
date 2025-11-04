# ECMAScript® 2025 Grammar Summary

> 从官方规范手动提取：https://tc39.es/ecma262/2025/#sec-grammar-summary

---

## A.1 Lexical Grammar

### Source Character

```
SourceCharacter ::
    any Unicode code point
```

### Input Elements

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

InputElementHashbangOrRegExp ::
    WhiteSpace
    LineTerminator
    Comment
    CommonToken
    HashbangComment
    RegularExpressionLiteral
```

### White Space

```
WhiteSpace ::
    <TAB>
    <VT>
    <FF>
    <ZWNBSP>
    <USP>
```

### Line Terminators

```
LineTerminator ::
    <LF>
    <CR>
    <LS>
    <PS>

LineTerminatorSequence ::
    <LF>
    <CR> [lookahead ≠ <LF>]
    <LS>
    <PS>
    <CR><LF>
```

### Comments

```
Comment ::
    MultiLineComment
    SingleLineComment

MultiLineComment ::
    /* MultiLineCommentChars_opt */

MultiLineCommentChars ::
    MultiLineNotAsteriskChar MultiLineCommentChars_opt
    * PostAsteriskCommentChars_opt

PostAsteriskCommentChars ::
    MultiLineNotForwardSlashOrAsteriskChar MultiLineCommentChars_opt
    * PostAsteriskCommentChars_opt

MultiLineNotAsteriskChar ::
    SourceCharacter but not *

MultiLineNotForwardSlashOrAsteriskChar ::
    SourceCharacter but not one of / or *

SingleLineComment ::
    // SingleLineCommentChars_opt

SingleLineCommentChars ::
    SingleLineCommentChar SingleLineCommentChars_opt

SingleLineCommentChar ::
    SourceCharacter but not LineTerminator

HashbangComment ::
    #! SingleLineCommentChars_opt
```

### Tokens

```
CommonToken ::
    IdentifierName
    PrivateIdentifier
    Punctuator
    NumericLiteral
    StringLiteral
    Template
```

### Identifiers

```
PrivateIdentifier ::
    # IdentifierName

IdentifierName ::
    IdentifierStart
    IdentifierName IdentifierPart

IdentifierStart ::
    IdentifierStartChar
    \ UnicodeEscapeSequence

IdentifierPart ::
    IdentifierPartChar
    \ UnicodeEscapeSequence

IdentifierStartChar ::
    UnicodeIDStart
    $
    _

IdentifierPartChar ::
    UnicodeIDContinue
    $

AsciiLetter :: one of
    a b c d e f g h i j k l m n o p q r s t u v w x y z
    A B C D E F G H I J K L M N O P Q R S T U V W X Y Z

UnicodeIDStart ::
    any Unicode code point with the Unicode property "ID_Start"

UnicodeIDContinue ::
    any Unicode code point with the Unicode property "ID_Continue"

ReservedWord :: one of
    await break case catch class const continue debugger default
    delete do else enum export extends false finally for function
    if import in instanceof new null return super switch this
    throw true try typeof var void while with yield
```

### Punctuators

```
Punctuator ::
    OptionalChainingPunctuator
    OtherPunctuator

OptionalChainingPunctuator ::
    ?. [lookahead ∉ DecimalDigit]

OtherPunctuator :: one of
    { ( ) [ ] . ... ; , < > <= >= == != === !==
    + - * % ** ++ -- << >> >>> & | ^ ! ~ && || ??
    ? : = += -= *= %=  **= <<= >>= >>>= &= |= ^= &&= ||= ??= =>

DivPunctuator ::
    /
    /=

RightBracePunctuator ::
    }
```

### Null Literal

```
NullLiteral ::
    null
```

### Boolean Literal

```
BooleanLiteral ::
    true
    false
```

### Numeric Literals

```
NumericLiteralSeparator ::
    _

NumericLiteral ::
    DecimalLiteral
    DecimalBigIntegerLiteral
    NonDecimalIntegerLiteral[+Sep]
    NonDecimalIntegerLiteral[+Sep] BigIntLiteralSuffix
    LegacyOctalIntegerLiteral

DecimalBigIntegerLiteral ::
    0 BigIntLiteralSuffix
    NonZeroDigit DecimalDigits[+Sep]_opt BigIntLiteralSuffix
    NonZeroDigit NumericLiteralSeparator DecimalDigits[+Sep] BigIntLiteralSuffix

NonDecimalIntegerLiteral[Sep] ::
    BinaryIntegerLiteral[?Sep]
    OctalIntegerLiteral[?Sep]
    HexIntegerLiteral[?Sep]

BigIntLiteralSuffix ::
    n

DecimalLiteral ::
    DecimalIntegerLiteral . DecimalDigits[+Sep]_opt ExponentPart[+Sep]_opt
    . DecimalDigits[+Sep] ExponentPart[+Sep]_opt
    DecimalIntegerLiteral ExponentPart[+Sep]_opt

DecimalIntegerLiteral ::
    0
    NonZeroDigit
    NonZeroDigit NumericLiteralSeparator_opt DecimalDigits[+Sep]
    NonOctalDecimalIntegerLiteral

DecimalDigits[Sep] ::
    DecimalDigit
    DecimalDigits[?Sep] DecimalDigit
    [+Sep] DecimalDigits[+Sep] NumericLiteralSeparator DecimalDigit

DecimalDigit :: one of
    0 1 2 3 4 5 6 7 8 9

NonZeroDigit :: one of
    1 2 3 4 5 6 7 8 9

ExponentPart[Sep] ::
    ExponentIndicator SignedInteger[?Sep]

ExponentIndicator :: one of
    e E

SignedInteger[Sep] ::
    DecimalDigits[?Sep]
    + DecimalDigits[?Sep]
    - DecimalDigits[?Sep]

BinaryIntegerLiteral[Sep] ::
    0b BinaryDigits[?Sep]
    0B BinaryDigits[?Sep]

BinaryDigits[Sep] ::
    BinaryDigit
    BinaryDigits[?Sep] BinaryDigit
    [+Sep] BinaryDigits[+Sep] NumericLiteralSeparator BinaryDigit

BinaryDigit :: one of
    0 1

OctalIntegerLiteral[Sep] ::
    0o OctalDigits[?Sep]
    0O OctalDigits[?Sep]

OctalDigits[Sep] ::
    OctalDigit
    OctalDigits[?Sep] OctalDigit
    [+Sep] OctalDigits[+Sep] NumericLiteralSeparator OctalDigit

LegacyOctalIntegerLiteral ::
    0 OctalDigit
    LegacyOctalIntegerLiteral OctalDigit

NonOctalDecimalIntegerLiteral ::
    0 NonOctalDigit
    LegacyOctalLikeDecimalIntegerLiteral NonOctalDigit
    NonOctalDecimalIntegerLiteral DecimalDigit

LegacyOctalLikeDecimalIntegerLiteral ::
    0 OctalDigit
    LegacyOctalLikeDecimalIntegerLiteral OctalDigit

OctalDigit :: one of
    0 1 2 3 4 5 6 7

NonOctalDigit :: one of
    8 9

HexIntegerLiteral[Sep] ::
    0x HexDigits[?Sep]
    0X HexDigits[?Sep]

HexDigits[Sep] ::
    HexDigit
    HexDigits[?Sep] HexDigit
    [+Sep] HexDigits[+Sep] NumericLiteralSeparator HexDigit

HexDigit :: one of
    0 1 2 3 4 5 6 7 8 9 a b c d e f A B C D E F
```

### String Literals

```
StringLiteral ::
    " DoubleStringCharacters_opt "
    ' SingleStringCharacters_opt '

DoubleStringCharacters ::
    DoubleStringCharacter DoubleStringCharacters_opt

SingleStringCharacters ::
    SingleStringCharacter SingleStringCharacters_opt

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
    LegacyOctalEscapeSequence
    NonOctalDecimalEscapeSequence
    HexEscapeSequence
    UnicodeEscapeSequence

CharacterEscapeSequence ::
    SingleEscapeCharacter
    NonEscapeCharacter

SingleEscapeCharacter :: one of
    ' " \ b f n r t v

NonEscapeCharacter ::
    SourceCharacter but not one of EscapeCharacter or LineTerminator

EscapeCharacter ::
    SingleEscapeCharacter
    DecimalDigit
    x
    u

LegacyOctalEscapeSequence ::
    0 [lookahead ∈ {8, 9}]
    NonZeroOctalDigit [lookahead ∉ OctalDigit]
    ZeroToThree OctalDigit [lookahead ∉ OctalDigit]
    FourToSeven OctalDigit
    ZeroToThree OctalDigit OctalDigit

NonZeroOctalDigit ::
    OctalDigit but not 0

ZeroToThree :: one of
    0 1 2 3

FourToSeven :: one of
    4 5 6 7

NonOctalDecimalEscapeSequence :: one of
    8 9

HexEscapeSequence ::
    x HexDigit HexDigit

UnicodeEscapeSequence ::
    u Hex4Digits
    u{ CodePoint }

Hex4Digits ::
    HexDigit HexDigit HexDigit HexDigit
```

### Regular Expression Literals

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
    RegularExpressionFlags IdentifierPartChar
```

### Template Literals

```
Template ::
    NoSubstitutionTemplate
    TemplateHead

NoSubstitutionTemplate ::
    ` TemplateCharacters_opt `

TemplateHead ::
    ` TemplateCharacters_opt ${

TemplateSubstitutionTail ::
    TemplateMiddle
    TemplateTail

TemplateMiddle ::
    } TemplateCharacters_opt ${

TemplateTail ::
    } TemplateCharacters_opt `

TemplateCharacters ::
    TemplateCharacter TemplateCharacters_opt

TemplateCharacter ::
    $ [lookahead ≠ {]
    \ TemplateEscapeSequence
    \ NotEscapeSequence
    LineContinuation
    LineTerminatorSequence
    SourceCharacter but not one of ` or \ or $ or LineTerminator

TemplateEscapeSequence ::
    CharacterEscapeSequence
    0 [lookahead ∉ DecimalDigit]
    HexEscapeSequence
    UnicodeEscapeSequence

NotEscapeSequence ::
    0 DecimalDigit
    DecimalDigit but not 0
    x [lookahead ∉ HexDigit]
    x HexDigit [lookahead ∉ HexDigit]
    u [lookahead ∉ HexDigit] [lookahead ≠ {]
    u HexDigit [lookahead ∉ HexDigit]
    u HexDigit HexDigit [lookahead ∉ HexDigit]
    u HexDigit HexDigit HexDigit [lookahead ∉ HexDigit]
    u { [lookahead ∉ HexDigit]
    u { NotCodePoint [lookahead ∉ HexDigit]
    u { CodePoint [lookahead ∉ HexDigit] [lookahead ≠ }]

NotCodePoint ::
    HexDigits[~Sep] but only if the MV of HexDigits > 0x10FFFF

CodePoint ::
    HexDigits[~Sep] but only if the MV of HexDigits ≤ 0x10FFFF
```

---

## A.2 Expressions

### Identifier References

```
IdentifierReference[Yield, Await] :
    Identifier
    [~Yield] yield
    [~Await] await

BindingIdentifier[Yield, Await] :
    Identifier
    yield
    await

LabelIdentifier[Yield, Await] :
    Identifier
    [~Yield] yield
    [~Await] await

Identifier :
    IdentifierName but not ReservedWord
```

### Primary Expressions

```
PrimaryExpression[Yield, Await] :
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

CoverParenthesizedExpressionAndArrowParameterList[Yield, Await] :
    ( Expression[+In, ?Yield, ?Await] )
    ( Expression[+In, ?Yield, ?Await] , )
    ( )
    ( ... BindingIdentifier[?Yield, ?Await] )
    ( ... BindingPattern[?Yield, ?Await] )
    ( Expression[+In, ?Yield, ?Await] , ... BindingIdentifier[?Yield, ?Await] )
    ( Expression[+In, ?Yield, ?Await] , ... BindingPattern[?Yield, ?Await] )
```

**Supplemental Syntax:**

When processing `PrimaryExpression : CoverParenthesizedExpressionAndArrowParameterList`, the interpretation is refined using:

```
ParenthesizedExpression[Yield, Await] :
    ( Expression[+In, ?Yield, ?Await] )
```

### Literals

```
Literal :
    NullLiteral
    BooleanLiteral
    NumericLiteral
    StringLiteral

ArrayLiteral[Yield, Await] :
    [ Elision_opt ]
    [ ElementList[?Yield, ?Await] ]
    [ ElementList[?Yield, ?Await] , Elision_opt ]

ElementList[Yield, Await] :
    Elision_opt AssignmentExpression[+In, ?Yield, ?Await]
    Elision_opt SpreadElement[?Yield, ?Await]
    ElementList[?Yield, ?Await] , Elision_opt AssignmentExpression[+In, ?Yield, ?Await]
    ElementList[?Yield, ?Await] , Elision_opt SpreadElement[?Yield, ?Await]

Elision :
    ,
    Elision ,

SpreadElement[Yield, Await] :
    ... AssignmentExpression[+In, ?Yield, ?Await]

ObjectLiteral[Yield, Await] :
    { }
    { PropertyDefinitionList[?Yield, ?Await] }
    { PropertyDefinitionList[?Yield, ?Await] , }

PropertyDefinitionList[Yield, Await] :
    PropertyDefinition[?Yield, ?Await]
    PropertyDefinitionList[?Yield, ?Await] , PropertyDefinition[?Yield, ?Await]

PropertyDefinition[Yield, Await] :
    IdentifierReference[?Yield, ?Await]
    CoverInitializedName[?Yield, ?Await]
    PropertyName[?Yield, ?Await] : AssignmentExpression[+In, ?Yield, ?Await]
    MethodDefinition[?Yield, ?Await]
    ... AssignmentExpression[+In, ?Yield, ?Await]

PropertyName[Yield, Await] :
    LiteralPropertyName
    ComputedPropertyName[?Yield, ?Await]

LiteralPropertyName :
    IdentifierName
    StringLiteral
    NumericLiteral

ComputedPropertyName[Yield, Await] :
    [ AssignmentExpression[+In, ?Yield, ?Await] ]

CoverInitializedName[Yield, Await] :
    IdentifierReference[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]

Initializer[In, Yield, Await] :
    = AssignmentExpression[?In, ?Yield, ?Await]
```

### Template Literals

```
TemplateLiteral[Yield, Await, Tagged] :
    NoSubstitutionTemplate
    SubstitutionTemplate[?Yield, ?Await, ?Tagged]

SubstitutionTemplate[Yield, Await, Tagged] :
    TemplateHead Expression[+In, ?Yield, ?Await] TemplateSpans[?Yield, ?Await, ?Tagged]

TemplateSpans[Yield, Await, Tagged] :
    TemplateTail
    TemplateMiddleList[?Yield, ?Await, ?Tagged] TemplateTail

TemplateMiddleList[Yield, Await, Tagged] :
    TemplateMiddle Expression[+In, ?Yield, ?Await]
    TemplateMiddleList[?Yield, ?Await, ?Tagged] TemplateMiddle Expression[+In, ?Yield, ?Await]
```

### Member Expressions

```
MemberExpression[Yield, Await] :
    PrimaryExpression[?Yield, ?Await]
    MemberExpression[?Yield, ?Await] [ Expression[+In, ?Yield, ?Await] ]
    MemberExpression[?Yield, ?Await] . IdentifierName
    MemberExpression[?Yield, ?Await] TemplateLiteral[?Yield, ?Await, +Tagged]
    SuperProperty[?Yield, ?Await]
    MetaProperty
    new MemberExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
    MemberExpression[?Yield, ?Await] . PrivateIdentifier

SuperProperty[Yield, Await] :
    super [ Expression[+In, ?Yield, ?Await] ]
    super . IdentifierName

MetaProperty :
    NewTarget
    ImportMeta

NewTarget :
    new . target

ImportMeta :
    import . meta

NewExpression[Yield, Await] :
    MemberExpression[?Yield, ?Await]
    new NewExpression[?Yield, ?Await]
```

### Call Expressions

```
CallExpression[Yield, Await] :
    CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await]
    SuperCall[?Yield, ?Await]
    ImportCall[?Yield, ?Await]
    CallExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
    CallExpression[?Yield, ?Await] [ Expression[+In, ?Yield, ?Await] ]
    CallExpression[?Yield, ?Await] . IdentifierName
    CallExpression[?Yield, ?Await] TemplateLiteral[?Yield, ?Await, +Tagged]
    CallExpression[?Yield, ?Await] . PrivateIdentifier
```

**Supplemental Syntax:**

When processing `CallExpression : CoverCallExpressionAndAsyncArrowHead`, the interpretation is refined using:

```
CallMemberExpression[Yield, Await] :
    MemberExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
```

### Other Expressions

```
SuperCall[Yield, Await] :
    super Arguments[?Yield, ?Await]

ImportCall[Yield, Await] :
    import ( AssignmentExpression[+In, ?Yield, ?Await] ,_opt )
    import ( AssignmentExpression[+In, ?Yield, ?Await] , AssignmentExpression[+In, ?Yield, ?Await] ,_opt )

Arguments[Yield, Await] :
    ( )
    ( ArgumentList[?Yield, ?Await] )
    ( ArgumentList[?Yield, ?Await] , )

ArgumentList[Yield, Await] :
    AssignmentExpression[+In, ?Yield, ?Await]
    ... AssignmentExpression[+In, ?Yield, ?Await]
    ArgumentList[?Yield, ?Await] , AssignmentExpression[+In, ?Yield, ?Await]
    ArgumentList[?Yield, ?Await] , ... AssignmentExpression[+In, ?Yield, ?Await]
```

### Optional Chaining

```
OptionalExpression[Yield, Await] :
    MemberExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]
    CallExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]
    OptionalExpression[?Yield, ?Await] OptionalChain[?Yield, ?Await]

OptionalChain[Yield, Await] :
    ?. Arguments[?Yield, ?Await]
    ?. [ Expression[+In, ?Yield, ?Await] ]
    ?. IdentifierName
    ?. TemplateLiteral[?Yield, ?Await, +Tagged]
    ?. PrivateIdentifier
    OptionalChain[?Yield, ?Await] Arguments[?Yield, ?Await]
    OptionalChain[?Yield, ?Await] [ Expression[+In, ?Yield, ?Await] ]
    OptionalChain[?Yield, ?Await] . IdentifierName
    OptionalChain[?Yield, ?Await] TemplateLiteral[?Yield, ?Await, +Tagged]
    OptionalChain[?Yield, ?Await] . PrivateIdentifier

LeftHandSideExpression[Yield, Await] :
    NewExpression[?Yield, ?Await]
    CallExpression[?Yield, ?Await]
    OptionalExpression[?Yield, ?Await]
```

### Update Expressions

```
UpdateExpression[Yield, Await] :
    LeftHandSideExpression[?Yield, ?Await]
    LeftHandSideExpression[?Yield, ?Await] [no LineTerminator here] ++
    LeftHandSideExpression[?Yield, ?Await] [no LineTerminator here] --
    ++ UnaryExpression[?Yield, ?Await]
    -- UnaryExpression[?Yield, ?Await]
```

### Unary Expressions

```
UnaryExpression[Yield, Await] :
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

### Binary Expressions

```
ExponentiationExpression[Yield, Await] :
    UnaryExpression[?Yield, ?Await]
    UpdateExpression[?Yield, ?Await] ** ExponentiationExpression[?Yield, ?Await]

MultiplicativeExpression[Yield, Await] :
    ExponentiationExpression[?Yield, ?Await]
    MultiplicativeExpression[?Yield, ?Await] MultiplicativeOperator ExponentiationExpression[?Yield, ?Await]

MultiplicativeOperator : one of
    * / %

AdditiveExpression[Yield, Await] :
    MultiplicativeExpression[?Yield, ?Await]
    AdditiveExpression[?Yield, ?Await] + MultiplicativeExpression[?Yield, ?Await]
    AdditiveExpression[?Yield, ?Await] - MultiplicativeExpression[?Yield, ?Await]

ShiftExpression[Yield, Await] :
    AdditiveExpression[?Yield, ?Await]
    ShiftExpression[?Yield, ?Await] << AdditiveExpression[?Yield, ?Await]
    ShiftExpression[?Yield, ?Await] >> AdditiveExpression[?Yield, ?Await]
    ShiftExpression[?Yield, ?Await] >>> AdditiveExpression[?Yield, ?Await]

RelationalExpression[In, Yield, Await] :
    ShiftExpression[?Yield, ?Await]
    RelationalExpression[?In, ?Yield, ?Await] < ShiftExpression[?Yield, ?Await]
    RelationalExpression[?In, ?Yield, ?Await] > ShiftExpression[?Yield, ?Await]
    RelationalExpression[?In, ?Yield, ?Await] <= ShiftExpression[?Yield, ?Await]
    RelationalExpression[?In, ?Yield, ?Await] >= ShiftExpression[?Yield, ?Await]
    RelationalExpression[?In, ?Yield, ?Await] instanceof ShiftExpression[?Yield, ?Await]
    [+In] RelationalExpression[+In, ?Yield, ?Await] in ShiftExpression[?Yield, ?Await]
    [+In] PrivateIdentifier in ShiftExpression[?Yield, ?Await]

EqualityExpression[In, Yield, Await] :
    RelationalExpression[?In, ?Yield, ?Await]
    EqualityExpression[?In, ?Yield, ?Await] == RelationalExpression[?In, ?Yield, ?Await]
    EqualityExpression[?In, ?Yield, ?Await] != RelationalExpression[?In, ?Yield, ?Await]
    EqualityExpression[?In, ?Yield, ?Await] === RelationalExpression[?In, ?Yield, ?Await]
    EqualityExpression[?In, ?Yield, ?Await] !== RelationalExpression[?In, ?Yield, ?Await]

BitwiseANDExpression[In, Yield, Await] :
    EqualityExpression[?In, ?Yield, ?Await]
    BitwiseANDExpression[?In, ?Yield, ?Await] & EqualityExpression[?In, ?Yield, ?Await]

BitwiseXORExpression[In, Yield, Await] :
    BitwiseANDExpression[?In, ?Yield, ?Await]
    BitwiseXORExpression[?In, ?Yield, ?Await] ^ BitwiseANDExpression[?In, ?Yield, ?Await]

BitwiseORExpression[In, Yield, Await] :
    BitwiseXORExpression[?In, ?Yield, ?Await]
    BitwiseORExpression[?In, ?Yield, ?Await] | BitwiseXORExpression[?In, ?Yield, ?Await]

LogicalANDExpression[In, Yield, Await] :
    BitwiseORExpression[?In, ?Yield, ?Await]
    LogicalANDExpression[?In, ?Yield, ?Await] && BitwiseORExpression[?In, ?Yield, ?Await]

LogicalORExpression[In, Yield, Await] :
    LogicalANDExpression[?In, ?Yield, ?Await]
    LogicalORExpression[?In, ?Yield, ?Await] || LogicalANDExpression[?In, ?Yield, ?Await]

CoalesceExpression[In, Yield, Await] :
    CoalesceExpressionHead[?In, ?Yield, ?Await] ?? BitwiseORExpression[?In, ?Yield, ?Await]

CoalesceExpressionHead[In, Yield, Await] :
    CoalesceExpression[?In, ?Yield, ?Await]
    BitwiseORExpression[?In, ?Yield, ?Await]

ShortCircuitExpression[In, Yield, Await] :
    LogicalORExpression[?In, ?Yield, ?Await]
    CoalesceExpression[?In, ?Yield, ?Await]

ConditionalExpression[In, Yield, Await] :
    ShortCircuitExpression[?In, ?Yield, ?Await]
    ShortCircuitExpression[?In, ?Yield, ?Await] ? AssignmentExpression[+In, ?Yield, ?Await] : AssignmentExpression[?In, ?Yield, ?Await]
```

### Assignment Expressions

```
AssignmentExpression[In, Yield, Await] :
    ConditionalExpression[?In, ?Yield, ?Await]
    [+Yield] YieldExpression[?In, ?Await]
    ArrowFunction[?In, ?Yield, ?Await]
    AsyncArrowFunction[?In, ?Yield, ?Await]
    LeftHandSideExpression[?Yield, ?Await] = AssignmentExpression[?In, ?Yield, ?Await]
    LeftHandSideExpression[?Yield, ?Await] AssignmentOperator AssignmentExpression[?In, ?Yield, ?Await]
    LeftHandSideExpression[?Yield, ?Await] &&= AssignmentExpression[?In, ?Yield, ?Await]
    LeftHandSideExpression[?Yield, ?Await] ||= AssignmentExpression[?In, ?Yield, ?Await]
    LeftHandSideExpression[?Yield, ?Await] ??= AssignmentExpression[?In, ?Yield, ?Await]

AssignmentOperator : one of
    *= /= %= += -= <<= >>= >>>= &= ^= |= **=
```

**Supplemental Syntax:**

When processing `AssignmentExpression : LeftHandSideExpression = AssignmentExpression`, the interpretation of `LeftHandSideExpression` is refined using:

```
AssignmentPattern[Yield, Await] :
    ObjectAssignmentPattern[?Yield, ?Await]
    ArrayAssignmentPattern[?Yield, ?Await]

ObjectAssignmentPattern[Yield, Await] :
    { }
    { AssignmentRestProperty[?Yield, ?Await] }
    { AssignmentPropertyList[?Yield, ?Await] }
    { AssignmentPropertyList[?Yield, ?Await] , AssignmentRestProperty[?Yield, ?Await]_opt }

ArrayAssignmentPattern[Yield, Await] :
    [ Elision_opt AssignmentRestElement[?Yield, ?Await]_opt ]
    [ AssignmentElementList[?Yield, ?Await] ]
    [ AssignmentElementList[?Yield, ?Await] , Elision_opt AssignmentRestElement[?Yield, ?Await]_opt ]

AssignmentRestProperty[Yield, Await] :
    ... DestructuringAssignmentTarget[?Yield, ?Await]

AssignmentPropertyList[Yield, Await] :
    AssignmentProperty[?Yield, ?Await]
    AssignmentPropertyList[?Yield, ?Await] , AssignmentProperty[?Yield, ?Await]

AssignmentElementList[Yield, Await] :
    AssignmentElisionElement[?Yield, ?Await]
    AssignmentElementList[?Yield, ?Await] , AssignmentElisionElement[?Yield, ?Await]

AssignmentElisionElement[Yield, Await] :
    Elision_opt AssignmentElement[?Yield, ?Await]

AssignmentProperty[Yield, Await] :
    IdentifierReference[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt
    PropertyName[?Yield, ?Await] : AssignmentElement[?Yield, ?Await]

AssignmentElement[Yield, Await] :
    DestructuringAssignmentTarget[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt

AssignmentRestElement[Yield, Await] :
    ... DestructuringAssignmentTarget[?Yield, ?Await]

DestructuringAssignmentTarget[Yield, Await] :
    LeftHandSideExpression[?Yield, ?Await]
```

### Comma Expression

```
Expression[In, Yield, Await] :
    AssignmentExpression[?In, ?Yield, ?Await]
    Expression[?In, ?Yield, ?Await] , AssignmentExpression[?In, ?Yield, ?Await]
```

---

## A.3 Statements

### General

```
Statement[Yield, Await, Return] :
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

Declaration[Yield, Await] :
    HoistableDeclaration[?Yield, ?Await, ~Default]
    ClassDeclaration[?Yield, ?Await, ~Default]
    LexicalDeclaration[+In, ?Yield, ?Await]

HoistableDeclaration[Yield, Await, Default] :
    FunctionDeclaration[?Yield, ?Await, ?Default]
    GeneratorDeclaration[?Yield, ?Await, ?Default]
    AsyncFunctionDeclaration[?Yield, ?Await, ?Default]
    AsyncGeneratorDeclaration[?Yield, ?Await, ?Default]

BreakableStatement[Yield, Await, Return] :
    IterationStatement[?Yield, ?Await, ?Return]
    SwitchStatement[?Yield, ?Await, ?Return]
```

### Block

```
BlockStatement[Yield, Await, Return] :
    Block[?Yield, ?Await, ?Return]

Block[Yield, Await, Return] :
    { StatementList[?Yield, ?Await, ?Return]_opt }

StatementList[Yield, Await, Return] :
    StatementListItem[?Yield, ?Await, ?Return]
    StatementList[?Yield, ?Await, ?Return] StatementListItem[?Yield, ?Await, ?Return]

StatementListItem[Yield, Await, Return] :
    Statement[?Yield, ?Await, ?Return]
    Declaration[?Yield, ?Await]
```

### Variable Declarations

```
LexicalDeclaration[In, Yield, Await] :
    LetOrConst BindingList[?In, ?Yield, ?Await] ;

LetOrConst :
    let
    const

BindingList[In, Yield, Await] :
    LexicalBinding[?In, ?Yield, ?Await]
    BindingList[?In, ?Yield, ?Await] , LexicalBinding[?In, ?Yield, ?Await]

LexicalBinding[In, Yield, Await] :
    BindingIdentifier[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]_opt
    BindingPattern[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]

VariableStatement[Yield, Await] :
    var VariableDeclarationList[+In, ?Yield, ?Await] ;

VariableDeclarationList[In, Yield, Await] :
    VariableDeclaration[?In, ?Yield, ?Await]
    VariableDeclarationList[?In, ?Yield, ?Await] , VariableDeclaration[?In, ?Yield, ?Await]

VariableDeclaration[In, Yield, Await] :
    BindingIdentifier[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]_opt
    BindingPattern[?Yield, ?Await] Initializer[?In, ?Yield, ?Await]
```

### Binding Patterns

```
BindingPattern[Yield, Await] :
    ObjectBindingPattern[?Yield, ?Await]
    ArrayBindingPattern[?Yield, ?Await]

ObjectBindingPattern[Yield, Await] :
    { }
    { BindingRestProperty[?Yield, ?Await] }
    { BindingPropertyList[?Yield, ?Await] }
    { BindingPropertyList[?Yield, ?Await] , BindingRestProperty[?Yield, ?Await]_opt }

ArrayBindingPattern[Yield, Await] :
    [ Elision_opt BindingRestElement[?Yield, ?Await]_opt ]
    [ BindingElementList[?Yield, ?Await] ]
    [ BindingElementList[?Yield, ?Await] , Elision_opt BindingRestElement[?Yield, ?Await]_opt ]

BindingRestProperty[Yield, Await] :
    ... BindingIdentifier[?Yield, ?Await]

BindingPropertyList[Yield, Await] :
    BindingProperty[?Yield, ?Await]
    BindingPropertyList[?Yield, ?Await] , BindingProperty[?Yield, ?Await]

BindingElementList[Yield, Await] :
    BindingElisionElement[?Yield, ?Await]
    BindingElementList[?Yield, ?Await] , BindingElisionElement[?Yield, ?Await]

BindingElisionElement[Yield, Await] :
    Elision_opt BindingElement[?Yield, ?Await]

BindingProperty[Yield, Await] :
    SingleNameBinding[?Yield, ?Await]
    PropertyName[?Yield, ?Await] : BindingElement[?Yield, ?Await]

BindingElement[Yield, Await] :
    SingleNameBinding[?Yield, ?Await]
    BindingPattern[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt

SingleNameBinding[Yield, Await] :
    BindingIdentifier[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt

BindingRestElement[Yield, Await] :
    ... BindingIdentifier[?Yield, ?Await]
    ... BindingPattern[?Yield, ?Await]
```

### Simple Statements

```
EmptyStatement :
    ;

ExpressionStatement[Yield, Await] :
    [lookahead ∉ { {, function, async [no LineTerminator here] function, class, let [ }]
    Expression[+In, ?Yield, ?Await] ;
```

### If Statement

```
IfStatement[Yield, Await, Return] :
    if ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return] else Statement[?Yield, ?Await, ?Return]
    if ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return] [lookahead ≠ else]
```

### Iteration Statements

```
IterationStatement[Yield, Await, Return] :
    DoWhileStatement[?Yield, ?Await, ?Return]
    WhileStatement[?Yield, ?Await, ?Return]
    ForStatement[?Yield, ?Await, ?Return]
    ForInOfStatement[?Yield, ?Await, ?Return]

DoWhileStatement[Yield, Await, Return] :
    do Statement[?Yield, ?Await, ?Return] while ( Expression[+In, ?Yield, ?Await] ) ;

WhileStatement[Yield, Await, Return] :
    while ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]

ForStatement[Yield, Await, Return] :
    for ( [lookahead ≠ let [] Expression[~In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ) Statement[?Yield, ?Await, ?Return]
    for ( var VariableDeclarationList[~In, ?Yield, ?Await] ; Expression[+In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ) Statement[?Yield, ?Await, ?Return]
    for ( LexicalDeclaration[~In, ?Yield, ?Await] Expression[+In, ?Yield, ?Await]_opt ; Expression[+In, ?Yield, ?Await]_opt ) Statement[?Yield, ?Await, ?Return]

ForInOfStatement[Yield, Await, Return] :
    for ( [lookahead ≠ let [ ] LeftHandSideExpression[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
    for ( var ForBinding[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
    for ( ForDeclaration[?Yield, ?Await] in Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
    for ( [lookahead ∉ {let, async of}] LeftHandSideExpression[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
    for ( var ForBinding[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
    for ( ForDeclaration[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
    [+Await] for await ( [lookahead ≠ let] LeftHandSideExpression[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
    [+Await] for await ( var ForBinding[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
    [+Await] for await ( ForDeclaration[?Yield, ?Await] of AssignmentExpression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]

ForDeclaration[Yield, Await] :
    LetOrConst ForBinding[?Yield, ?Await]

ForBinding[Yield, Await] :
    BindingIdentifier[?Yield, ?Await]
    BindingPattern[?Yield, ?Await]
```

### Control Flow Statements

```
ContinueStatement[Yield, Await] :
    continue ;
    continue [no LineTerminator here] LabelIdentifier[?Yield, ?Await] ;

BreakStatement[Yield, Await] :
    break ;
    break [no LineTerminator here] LabelIdentifier[?Yield, ?Await] ;

ReturnStatement[Yield, Await] :
    return ;
    return [no LineTerminator here] Expression[+In, ?Yield, ?Await] ;
```

### With Statement

```
WithStatement[Yield, Await, Return] :
    with ( Expression[+In, ?Yield, ?Await] ) Statement[?Yield, ?Await, ?Return]
```

### Switch Statement

```
SwitchStatement[Yield, Await, Return] :
    switch ( Expression[+In, ?Yield, ?Await] ) CaseBlock[?Yield, ?Await, ?Return]

CaseBlock[Yield, Await, Return] :
    { CaseClauses[?Yield, ?Await, ?Return]_opt }
    { CaseClauses[?Yield, ?Await, ?Return]_opt DefaultClause[?Yield, ?Await, ?Return] CaseClauses[?Yield, ?Await, ?Return]_opt }

CaseClauses[Yield, Await, Return] :
    CaseClause[?Yield, ?Await, ?Return]
    CaseClauses[?Yield, ?Await, ?Return] CaseClause[?Yield, ?Await, ?Return]

CaseClause[Yield, Await, Return] :
    case Expression[+In, ?Yield, ?Await] : StatementList[?Yield, ?Await, ?Return]_opt

DefaultClause[Yield, Await, Return] :
    default : StatementList[?Yield, ?Await, ?Return]_opt
```

### Labelled Statement

```
LabelledStatement[Yield, Await, Return] :
    LabelIdentifier[?Yield, ?Await] : LabelledItem[?Yield, ?Await, ?Return]

LabelledItem[Yield, Await, Return] :
    Statement[?Yield, ?Await, ?Return]
    FunctionDeclaration[?Yield, ?Await, ~Default]
```

### Throw Statement

```
ThrowStatement[Yield, Await] :
    throw [no LineTerminator here] Expression[+In, ?Yield, ?Await] ;
```

### Try Statement

```
TryStatement[Yield, Await, Return] :
    try Block[?Yield, ?Await, ?Return] Catch[?Yield, ?Await, ?Return]
    try Block[?Yield, ?Await, ?Return] Finally[?Yield, ?Await, ?Return]
    try Block[?Yield, ?Await, ?Return] Catch[?Yield, ?Await, ?Return] Finally[?Yield, ?Await, ?Return]

Catch[Yield, Await, Return] :
    catch ( CatchParameter[?Yield, ?Await] ) Block[?Yield, ?Await, ?Return]
    catch Block[?Yield, ?Await, ?Return]

Finally[Yield, Await, Return] :
    finally Block[?Yield, ?Await, ?Return]

CatchParameter[Yield, Await] :
    BindingIdentifier[?Yield, ?Await]
    BindingPattern[?Yield, ?Await]
```

### Debugger Statement

```
DebuggerStatement :
    debugger ;
```

---

## A.4 Functions and Classes

### Function Parameters

```
UniqueFormalParameters[Yield, Await] :
    FormalParameters[?Yield, ?Await]

FormalParameters[Yield, Await] :
    [empty]
    FunctionRestParameter[?Yield, ?Await]
    FormalParameterList[?Yield, ?Await]
    FormalParameterList[?Yield, ?Await] ,
    FormalParameterList[?Yield, ?Await] , FunctionRestParameter[?Yield, ?Await]

FormalParameterList[Yield, Await] :
    FormalParameter[?Yield, ?Await]
    FormalParameterList[?Yield, ?Await] , FormalParameter[?Yield, ?Await]

FunctionRestParameter[Yield, Await] :
    BindingRestElement[?Yield, ?Await]

FormalParameter[Yield, Await] :
    BindingElement[?Yield, ?Await]
```

### Function Definitions

```
FunctionDeclaration[Yield, Await, Default] :
    function BindingIdentifier[?Yield, ?Await] ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
    [+Default] function ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }

FunctionExpression :
    function BindingIdentifier[~Yield, ~Await]_opt ( FormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }

FunctionBody[Yield, Await] :
    FunctionStatementList[?Yield, ?Await]

FunctionStatementList[Yield, Await] :
    StatementList[?Yield, ?Await, +Return]_opt
```

### Arrow Functions

```
ArrowFunction[In, Yield, Await] :
    ArrowParameters[?Yield, ?Await] [no LineTerminator here] => ConciseBody[?In]

ArrowParameters[Yield, Await] :
    BindingIdentifier[?Yield, ?Await]
    CoverParenthesizedExpressionAndArrowParameterList[?Yield, ?Await]
```

**Supplemental Syntax:**

When processing `ArrowParameters : CoverParenthesizedExpressionAndArrowParameterList`, the interpretation is refined using:

```
ArrowFormalParameters[Yield, Await] :
    ( UniqueFormalParameters[?Yield, ?Await] )
```

### Arrow Function Bodies

```
ConciseBody[In] :
    [lookahead ≠ {] ExpressionBody[?In, ~Await]
    { FunctionBody[~Yield, ~Await] }

ExpressionBody[In, Await] :
    AssignmentExpression[?In, ~Yield, ?Await]
```

### Async Arrow Functions

```
AsyncArrowFunction[In, Yield, Await] :
    async [no LineTerminator here] AsyncArrowBindingIdentifier[?Yield] [no LineTerminator here] => AsyncConciseBody[?In]
    CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await] [no LineTerminator here] => AsyncConciseBody[?In]

AsyncConciseBody[In] :
    [lookahead ≠ {] ExpressionBody[?In, +Await]
    { AsyncFunctionBody }

AsyncArrowBindingIdentifier[Yield] :
    BindingIdentifier[?Yield, +Await]

CoverCallExpressionAndAsyncArrowHead[Yield, Await] :
    MemberExpression[?Yield, ?Await] Arguments[?Yield, ?Await]
```

**Supplemental Syntax:**

When processing `AsyncArrowFunction : CoverCallExpressionAndAsyncArrowHead [no LineTerminator here] => AsyncConciseBody`, the interpretation is refined using:

```
AsyncArrowHead :
    async [no LineTerminator here] ArrowFormalParameters[~Yield, +Await]
```

### Method Definitions

```
MethodDefinition[Yield, Await] :
    ClassElementName[?Yield, ?Await] ( UniqueFormalParameters[~Yield, ~Await] ) { FunctionBody[~Yield, ~Await] }
    GeneratorMethod[?Yield, ?Await]
    AsyncMethod[?Yield, ?Await]
    AsyncGeneratorMethod[?Yield, ?Await]
    get ClassElementName[?Yield, ?Await] ( ) { FunctionBody[~Yield, ~Await] }
    set ClassElementName[?Yield, ?Await] ( PropertySetParameterList ) { FunctionBody[~Yield, ~Await] }

PropertySetParameterList :
    FormalParameter[~Yield, ~Await]
```

### Generator Functions

```
GeneratorDeclaration[Yield, Await, Default] :
    function * BindingIdentifier[?Yield, ?Await] ( FormalParameters[+Yield, ~Await] ) { GeneratorBody }
    [+Default] function * ( FormalParameters[+Yield, ~Await] ) { GeneratorBody }

GeneratorExpression :
    function * BindingIdentifier[+Yield, ~Await]_opt ( FormalParameters[+Yield, ~Await] ) { GeneratorBody }

GeneratorMethod[Yield, Await] :
    * ClassElementName[?Yield, ?Await] ( UniqueFormalParameters[+Yield, ~Await] ) { GeneratorBody }

GeneratorBody :
    FunctionBody[+Yield, ~Await]

YieldExpression[In, Await] :
    yield
    yield [no LineTerminator here] AssignmentExpression[?In, +Yield, ?Await]
    yield [no LineTerminator here] * AssignmentExpression[?In, +Yield, ?Await]
```

### Async Generator Functions

```
AsyncGeneratorDeclaration[Yield, Await, Default] :
    async [no LineTerminator here] function * BindingIdentifier[?Yield, ?Await] ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }
    [+Default] async [no LineTerminator here] function * ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }

AsyncGeneratorExpression :
    async [no LineTerminator here] function * BindingIdentifier[+Yield, +Await]_opt ( FormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }

AsyncGeneratorMethod[Yield, Await] :
    async [no LineTerminator here] * ClassElementName[?Yield, ?Await] ( UniqueFormalParameters[+Yield, +Await] ) { AsyncGeneratorBody }

AsyncGeneratorBody :
    FunctionBody[+Yield, +Await]
```

### Async Functions

```
AsyncFunctionDeclaration[Yield, Await, Default] :
    async [no LineTerminator here] function BindingIdentifier[?Yield, ?Await] ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }
    [+Default] async [no LineTerminator here] function ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }

AsyncFunctionExpression :
    async [no LineTerminator here] function BindingIdentifier[~Yield, +Await]_opt ( FormalParameters[~Yield, +Await] ) { AsyncFunctionBody }

AsyncMethod[Yield, Await] :
    async [no LineTerminator here] ClassElementName[?Yield, ?Await] ( UniqueFormalParameters[~Yield, +Await] ) { AsyncFunctionBody }

AsyncFunctionBody :
    FunctionBody[~Yield, +Await]

AwaitExpression[Yield] :
    await UnaryExpression[?Yield, +Await]
```

### Class Definitions

```
ClassDeclaration[Yield, Await, Default] :
    class BindingIdentifier[?Yield, ?Await] ClassTail[?Yield, ?Await]
    [+Default] class ClassTail[?Yield, ?Await]

ClassExpression[Yield, Await] :
    class BindingIdentifier[?Yield, ?Await]_opt ClassTail[?Yield, ?Await]

ClassTail[Yield, Await] :
    ClassHeritage[?Yield, ?Await]_opt { ClassBody[?Yield, ?Await]_opt }

ClassHeritage[Yield, Await] :
    extends LeftHandSideExpression[?Yield, ?Await]

ClassBody[Yield, Await] :
    ClassElementList[?Yield, ?Await]

ClassElementList[Yield, Await] :
    ClassElement[?Yield, ?Await]
    ClassElementList[?Yield, ?Await] ClassElement[?Yield, ?Await]

ClassElement[Yield, Await] :
    MethodDefinition[?Yield, ?Await]
    static MethodDefinition[?Yield, ?Await]
    FieldDefinition[?Yield, ?Await] ;
    static FieldDefinition[?Yield, ?Await] ;
    ClassStaticBlock
    ;

FieldDefinition[Yield, Await] :
    ClassElementName[?Yield, ?Await] Initializer[+In, ?Yield, ?Await]_opt

ClassElementName[Yield, Await] :
    PropertyName[?Yield, ?Await]
    PrivateIdentifier

ClassStaticBlock :
    static { ClassStaticBlockBody }

ClassStaticBlockBody :
    ClassStaticBlockStatementList

ClassStaticBlockStatementList :
    StatementList[~Yield, +Await, ~Return]_opt
```

---

## A.5 Scripts and Modules

### Scripts

```
Script :
    ScriptBody_opt

ScriptBody :
    StatementList[~Yield, ~Await, ~Return]
```

### Modules

```
Module :
    ModuleBody_opt

ModuleBody :
    ModuleItemList

ModuleItemList :
    ModuleItem
    ModuleItemList ModuleItem

ModuleItem :
    ImportDeclaration
    ExportDeclaration
    StatementListItem[~Yield, +Await, ~Return]
```

### Module Names

```
ModuleExportName :
    IdentifierName
    StringLiteral
```

### Imports

```
ImportDeclaration :
    import ImportClause FromClause WithClause_opt ;
    import ModuleSpecifier WithClause_opt ;

ImportClause :
    ImportedDefaultBinding
    NameSpaceImport
    NamedImports
    ImportedDefaultBinding , NameSpaceImport
    ImportedDefaultBinding , NamedImports

ImportedDefaultBinding :
    ImportedBinding

NameSpaceImport :
    * as ImportedBinding

NamedImports :
    { }
    { ImportsList }
    { ImportsList , }

FromClause :
    from ModuleSpecifier

ImportsList :
    ImportSpecifier
    ImportsList , ImportSpecifier

ImportSpecifier :
    ImportedBinding
    ModuleExportName as ImportedBinding

ModuleSpecifier :
    StringLiteral

ImportedBinding :
    BindingIdentifier[~Yield, +Await]

WithClause :
    with { }
    with { WithEntries ,_opt }

WithEntries :
    AttributeKey : StringLiteral
    AttributeKey : StringLiteral , WithEntries

AttributeKey :
    IdentifierName
    StringLiteral
```

### Exports

```
ExportDeclaration :
    export ExportFromClause FromClause WithClause_opt ;
    export NamedExports ;
    export VariableStatement[~Yield, +Await]
    export Declaration[~Yield, +Await]
    export default HoistableDeclaration[~Yield, +Await, +Default]
    export default ClassDeclaration[~Yield, +Await, +Default]
    export default [lookahead ∉ {function, async [no LineTerminator here] function, class}] AssignmentExpression[+In, ~Yield, +Await] ;

ExportFromClause :
    *
    * as ModuleExportName
    NamedExports

NamedExports :
    { }
    { ExportsList }
    { ExportsList , }

ExportsList :
    ExportSpecifier
    ExportsList , ExportSpecifier

ExportSpecifier :
    ModuleExportName
    ModuleExportName as ModuleExportName
```

---

## A.6 Number Conversions

```
StringNumericLiteral :::
    StrWhiteSpace_opt
    StrWhiteSpace_opt StrNumericLiteral StrWhiteSpace_opt

StrWhiteSpace :::
    StrWhiteSpaceChar StrWhiteSpace_opt

StrWhiteSpaceChar :::
    WhiteSpace
    LineTerminator

StrNumericLiteral :::
    StrDecimalLiteral
    NonDecimalIntegerLiteral[~Sep]

StrDecimalLiteral :::
    StrUnsignedDecimalLiteral
    + StrUnsignedDecimalLiteral
    - StrUnsignedDecimalLiteral

StrUnsignedDecimalLiteral :::
    Infinity
    DecimalDigits[~Sep] . DecimalDigits[~Sep]_opt ExponentPart[~Sep]_opt
    . DecimalDigits[~Sep] ExponentPart[~Sep]_opt
    DecimalDigits[~Sep] ExponentPart[~Sep]_opt

StringIntegerLiteral :::
    StrWhiteSpace_opt
    StrWhiteSpace_opt StrIntegerLiteral StrWhiteSpace_opt

StrIntegerLiteral :::
    SignedInteger[~Sep]
    NonDecimalIntegerLiteral[~Sep]
```

---

## A.7 Time Zone Offset String Format

```
UTCOffset :::
    ASCIISign Hour
    ASCIISign Hour HourSubcomponents[+Extended]
    ASCIISign Hour HourSubcomponents[~Extended]

ASCIISign ::: one of
    + -

Hour :::
    0 DecimalDigit
    1 DecimalDigit
    20
    21
    22
    23

HourSubcomponents[Extended] :::
    TimeSeparator[?Extended] MinuteSecond
    TimeSeparator[?Extended] MinuteSecond TimeSeparator[?Extended] MinuteSecond TemporalDecimalFraction_opt

TimeSeparator[Extended] :::
    [+Extended] :
    [~Extended] [empty]

MinuteSecond :::
    0 DecimalDigit
    1 DecimalDigit
    2 DecimalDigit
    3 DecimalDigit
    4 DecimalDigit
    5 DecimalDigit

TemporalDecimalFraction :::
    TemporalDecimalSeparator DecimalDigit
    TemporalDecimalSeparator DecimalDigit DecimalDigit
    TemporalDecimalSeparator DecimalDigit DecimalDigit DecimalDigit
    TemporalDecimalSeparator DecimalDigit DecimalDigit DecimalDigit DecimalDigit
    TemporalDecimalSeparator DecimalDigit DecimalDigit DecimalDigit DecimalDigit DecimalDigit
    TemporalDecimalSeparator DecimalDigit DecimalDigit DecimalDigit DecimalDigit DecimalDigit DecimalDigit
    TemporalDecimalSeparator DecimalDigit DecimalDigit DecimalDigit DecimalDigit DecimalDigit DecimalDigit DecimalDigit
    TemporalDecimalSeparator DecimalDigit DecimalDigit DecimalDigit DecimalDigit DecimalDigit DecimalDigit DecimalDigit DecimalDigit
    TemporalDecimalSeparator DecimalDigit DecimalDigit DecimalDigit DecimalDigit DecimalDigit DecimalDigit DecimalDigit DecimalDigit DecimalDigit

TemporalDecimalSeparator ::: one of
    . ,
```

---

## A.8 Regular Expressions

### Pattern

```
Pattern[UnicodeMode, UnicodeSetsMode, NamedCaptureGroups] ::
    Disjunction[?UnicodeMode, ?UnicodeSetsMode, ?NamedCaptureGroups]

Disjunction[UnicodeMode, UnicodeSetsMode, NamedCaptureGroups] ::
    Alternative[?UnicodeMode, ?UnicodeSetsMode, ?NamedCaptureGroups]
    Alternative[?UnicodeMode, ?UnicodeSetsMode, ?NamedCaptureGroups] | Disjunction[?UnicodeMode, ?UnicodeSetsMode, ?NamedCaptureGroups]

Alternative[UnicodeMode, UnicodeSetsMode, NamedCaptureGroups] ::
    [empty]
    Alternative[?UnicodeMode, ?UnicodeSetsMode, ?NamedCaptureGroups] Term[?UnicodeMode, ?UnicodeSetsMode, ?NamedCaptureGroups]

Term[UnicodeMode, UnicodeSetsMode, NamedCaptureGroups] ::
    Assertion[?UnicodeMode, ?UnicodeSetsMode, ?NamedCaptureGroups]
    Atom[?UnicodeMode, ?UnicodeSetsMode, ?NamedCaptureGroups]
    Atom[?UnicodeMode, ?UnicodeSetsMode, ?NamedCaptureGroups] Quantifier
```

### Assertions

```
Assertion[UnicodeMode, UnicodeSetsMode, NamedCaptureGroups] ::
    ^
    $
    \b
    \B
    (?= Disjunction[?UnicodeMode, ?UnicodeSetsMode, ?NamedCaptureGroups] )
    (?! Disjunction[?UnicodeMode, ?UnicodeSetsMode, ?NamedCaptureGroups] )
    (?<= Disjunction[?UnicodeMode, ?UnicodeSetsMode, ?NamedCaptureGroups] )
    (?<! Disjunction[?UnicodeMode, ?UnicodeSetsMode, ?NamedCaptureGroups] )
```

### Quantifiers

```
Quantifier ::
    QuantifierPrefix
    QuantifierPrefix ?

QuantifierPrefix ::
    *
    +
    ?
    { DecimalDigits[~Sep] }
    { DecimalDigits[~Sep] ,}
    { DecimalDigits[~Sep] , DecimalDigits[~Sep] }
```

### Atoms

```
SyntaxCharacter :: one of
    ^ $ \ . * + ? ( ) [ ] { } |

PatternCharacter ::
    SourceCharacter but not SyntaxCharacter

Atom[UnicodeMode, UnicodeSetsMode, NamedCaptureGroups] ::
    PatternCharacter
    .
    \ AtomEscape[?UnicodeMode, ?NamedCaptureGroups]
    CharacterClass[?UnicodeMode, ?UnicodeSetsMode]
    ( GroupSpecifier[?UnicodeMode]_opt Disjunction[?UnicodeMode, ?UnicodeSetsMode, ?NamedCaptureGroups] )
    (? RegularExpressionModifiers : Disjunction[?UnicodeMode, ?UnicodeSetsMode, ?NamedCaptureGroups] )
    (? RegularExpressionModifiers - RegularExpressionModifiers : Disjunction[?UnicodeMode, ?UnicodeSetsMode, ?NamedCaptureGroups] )

RegularExpressionModifiers ::
    [empty]
    RegularExpressionModifiers RegularExpressionModifier

RegularExpressionModifier :: one of
    i m s
```

### Atom Escapes

```
AtomEscape[UnicodeMode, NamedCaptureGroups] ::
    DecimalEscape
    CharacterClassEscape[?UnicodeMode]
    CharacterEscape[?UnicodeMode]
    [+NamedCaptureGroups] k GroupName[?UnicodeMode]

CharacterEscape[UnicodeMode] ::
    ControlEscape
    c AsciiLetter
    0 [lookahead ∉ DecimalDigit]
    HexEscapeSequence
    RegExpUnicodeEscapeSequence[?UnicodeMode]
    IdentityEscape[?UnicodeMode]

ControlEscape :: one of
    f n r t v

DecimalEscape ::
    NonZeroDigit DecimalDigits[~Sep]_opt [lookahead ∉ DecimalDigit]

CharacterClassEscape[UnicodeMode] ::
    d
    D
    s
    S
    w
    W
    [+UnicodeMode] p{ UnicodePropertyValueExpression }
    [+UnicodeMode] P{ UnicodePropertyValueExpression }

UnicodePropertyValueExpression ::
    UnicodePropertyName = UnicodePropertyValue
    LoneUnicodePropertyNameOrValue

UnicodePropertyName ::
    UnicodePropertyNameCharacters

UnicodePropertyNameCharacters ::
    UnicodePropertyNameCharacter UnicodePropertyNameCharacters_opt

UnicodePropertyValue ::
    UnicodePropertyValueCharacters

LoneUnicodePropertyNameOrValue ::
    UnicodePropertyValueCharacters

UnicodePropertyValueCharacters ::
    UnicodePropertyValueCharacter UnicodePropertyValueCharacters_opt

UnicodePropertyValueCharacter ::
    UnicodePropertyNameCharacter
    DecimalDigit

UnicodePropertyNameCharacter ::
    AsciiLetter
    _
```

### Group Names

```
GroupSpecifier[UnicodeMode] ::
    ? GroupName[?UnicodeMode]

GroupName[UnicodeMode] ::
    < RegExpIdentifierName[?UnicodeMode] >

RegExpIdentifierName[UnicodeMode] ::
    RegExpIdentifierStart[?UnicodeMode]
    RegExpIdentifierName[?UnicodeMode] RegExpIdentifierPart[?UnicodeMode]

RegExpIdentifierStart[UnicodeMode] ::
    IdentifierStartChar
    [+UnicodeMode] \ RegExpUnicodeEscapeSequence[+UnicodeMode]
    [~UnicodeMode] UnicodeLeadSurrogate UnicodeTrailSurrogate

RegExpIdentifierPart[UnicodeMode] ::
    IdentifierPartChar
    [+UnicodeMode] \ RegExpUnicodeEscapeSequence[+UnicodeMode]
    [~UnicodeMode] UnicodeLeadSurrogate UnicodeTrailSurrogate

RegExpUnicodeEscapeSequence[UnicodeMode] ::
    [+UnicodeMode] u HexLeadSurrogate \u HexTrailSurrogate
    [+UnicodeMode] u HexLeadSurrogate
    [+UnicodeMode] u HexTrailSurrogate
    [+UnicodeMode] u HexNonSurrogate
    [~UnicodeMode] u Hex4Digits
    [+UnicodeMode] u{ CodePoint }

UnicodeLeadSurrogate ::
    any Unicode code point in the inclusive interval from U+D800 to U+DBFF

UnicodeTrailSurrogate ::
    any Unicode code point in the inclusive interval from U+DC00 to U+DFFF

HexLeadSurrogate ::
    Hex4Digits but only if the MV of Hex4Digits is in the inclusive interval from 0xD800 to 0xDBFF

HexTrailSurrogate ::
    Hex4Digits but only if the MV of Hex4Digits is in the inclusive interval from 0xDC00 to 0xDFFF

HexNonSurrogate ::
    Hex4Digits but only if the MV of Hex4Digits is not in the inclusive interval from 0xD800 to 0xDFFF

IdentityEscape[UnicodeMode] ::
    [+UnicodeMode] SyntaxCharacter
    [+UnicodeMode] /
    [~UnicodeMode] SourceCharacter but not UnicodeIDContinue
```

### Character Classes

```
CharacterClass[UnicodeMode, UnicodeSetsMode] ::
    [ [lookahead ≠ ^] ClassContents[?UnicodeMode, ?UnicodeSetsMode] ]
    [^ ClassContents[?UnicodeMode, ?UnicodeSetsMode] ]

ClassContents[UnicodeMode, UnicodeSetsMode] ::
    [empty]
    [~UnicodeSetsMode] NonemptyClassRanges[?UnicodeMode]
    [+UnicodeSetsMode] ClassSetExpression

NonemptyClassRanges[UnicodeMode] ::
    ClassAtom[?UnicodeMode]
    ClassAtom[?UnicodeMode] NonemptyClassRangesNoDash[?UnicodeMode]
    ClassAtom[?UnicodeMode] - ClassAtom[?UnicodeMode] ClassContents[?UnicodeMode, ~UnicodeSetsMode]

NonemptyClassRangesNoDash[UnicodeMode] ::
    ClassAtom[?UnicodeMode]
    ClassAtomNoDash[?UnicodeMode] NonemptyClassRangesNoDash[?UnicodeMode]
    ClassAtomNoDash[?UnicodeMode] - ClassAtom[?UnicodeMode] ClassContents[?UnicodeMode, ~UnicodeSetsMode]

ClassAtom[UnicodeMode] ::
    -
    ClassAtomNoDash[?UnicodeMode]

ClassAtomNoDash[UnicodeMode] ::
    SourceCharacter but not one of \ or ] or -
    \ ClassEscape[?UnicodeMode]

ClassEscape[UnicodeMode] ::
    b
    [+UnicodeMode] -
    CharacterClassEscape[?UnicodeMode]
    CharacterEscape[?UnicodeMode]
```

### Class Set Expressions

```
ClassSetExpression ::
    ClassUnion
    ClassIntersection
    ClassSubtraction

ClassUnion ::
    ClassSetRange ClassUnion_opt
    ClassSetOperand ClassUnion_opt

ClassIntersection ::
    ClassSetOperand && [lookahead ≠ &] ClassSetOperand
    ClassIntersection && [lookahead ≠ &] ClassSetOperand

ClassSubtraction ::
    ClassSetOperand -- ClassSetOperand
    ClassSubtraction -- ClassSetOperand

ClassSetRange ::
    ClassSetCharacter - ClassSetCharacter

ClassSetOperand ::
    NestedClass
    ClassStringDisjunction
    ClassSetCharacter

NestedClass ::
    [ [lookahead ≠ ^] ClassContents[+UnicodeMode, +UnicodeSetsMode] ]
    [^ ClassContents[+UnicodeMode, +UnicodeSetsMode] ]
    \ CharacterClassEscape[+UnicodeMode]

ClassStringDisjunction ::
    \q{ ClassStringDisjunctionContents }

ClassStringDisjunctionContents ::
    ClassString
    ClassString | ClassStringDisjunctionContents

ClassString ::
    [empty]
    NonEmptyClassString

NonEmptyClassString ::
    ClassSetCharacter NonEmptyClassString_opt

ClassSetCharacter ::
    [lookahead ∉ ClassSetReservedDoublePunctuator] SourceCharacter but not ClassSetSyntaxCharacter
    \ CharacterEscape[+UnicodeMode]
    \ ClassSetReservedPunctuator
    \b

ClassSetReservedDoublePunctuator :: one of
    && !! ## $$ %% ** ++ ,, .. :: ;; << == >> ?? @@ ^^ `` ~~

ClassSetSyntaxCharacter :: one of
    ( ) [ ] { } / - \ |

ClassSetReservedPunctuator :: one of
    & - ! # % , : ; < = > @ ` ~
```

---

## 注释说明

### 符号含义

- `:` - 语法规则（Syntactic Grammar）
- `::` - 词法规则（Lexical Grammar）
- `:::` - 数字转换和时区格式等特殊规则
- `[Param]` - 参数化规则
- `[+Param]` - 参数为 true
- `[~Param]` - 参数为 false
- `[?Param]` - 参数传递（继承外层值）
- `_opt` - 可选项（Optional）
- `[empty]` - 空规则
- `but not` - 排除项
- `one of` - 枚举项
- `[lookahead ...]` - 前瞻断言
- `[no LineTerminator here]` - 不允许换行

### 常见参数

- `Yield` - 是否在 Generator 上下文中
- `Await` - 是否在 Async 上下文中
- `In` - 是否允许 `in` 运算符
- `Return` - 是否允许 `return` 语句
- `Default` - 是否是默认导出
- `Tagged` - 是否是 Tagged 模板
- `UnicodeMode` - 是否启用 Unicode 模式（`u` 标志）
- `UnicodeSetsMode` - 是否启用 Unicode Sets 模式（`v` 标志）
- `NamedCaptureGroups` - 是否支持命名捕获组
- `Sep` - 是否允许数字分隔符（`_`）

### Cover Grammar（覆盖语法）

某些产生式使用"Cover Grammar"来处理语法歧义：

1. **CoverParenthesizedExpressionAndArrowParameterList**
   - 覆盖：括号表达式 `(expr)` 和箭头函数参数 `(a, b)`
   - 精化为：`ParenthesizedExpression` 或 `ArrowFormalParameters`

2. **CoverCallExpressionAndAsyncArrowHead**
   - 覆盖：函数调用 `func(args)` 和 Async 箭头函数 `async (args) => {}`
   - 精化为：`CallMemberExpression` 或 `AsyncArrowHead`

这些规则在解析时会根据上下文进一步精化（refine）。

---

**提取完成时间：** 2025-11-04  
**规范版本：** ECMAScript® 2025  
**提取方式：** 手动提取，保持规则完整一致  
**用途：** 用于 PEG Parser 开发参考

