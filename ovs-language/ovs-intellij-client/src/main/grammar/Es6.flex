package com.alamhubb.ovs.testovs.lexer;

import com.intellij.lexer.FlexLexer;
import com.intellij.psi.tree.IElementType;
import static com.alamhubb.ovs.testovs.lexer.Es6TokenTypes.*;

/**
 * ES6 (ECMAScript 2015) Lexer
 * 基于 ECMA-262 6th Edition 标准
 * 
 * 参考:
 * - https://262.ecma-international.org/6.0/index.html
 * - slime-parser/src/language/es2025/SlimeTokenType.ts
 * - slime-parser/src/language/es5/Es5Tokens.ts
 */

%%

%public
%class _Es6Lexer
%implements FlexLexer
%unicode
%function advance
%type IElementType
%eof{  return;
%eof}

// ========== 词法规则定义 ==========

// ==================== 关键字 ====================

// ES5 关键字
KEYWORD_ES5 = "var" | "break" | "do" | "instanceof" | "typeof"
            | "case" | "else" | "new" | "catch" | "finally"
            | "return" | "void" | "continue" | "for" | "switch"
            | "while" | "debugger" | "function" | "this" | "with"
            | "default" | "if" | "throw" | "delete" | "in" | "try"

// ES6 新增关键字
KEYWORD_ES6 = "let" | "const" | "class" | "extends" | "super"
            | "import" | "export" | "from" | "as" | "of" | "static"
            | "yield" | "async" | "await" | "target"

// 字面量关键字
KEYWORD_LITERAL = "null" | "true" | "false"

// 上下文关键字（在特定上下文中是关键字）
KEYWORD_CONTEXTUAL = "get" | "set"

// 所有关键字
KEYWORD = {KEYWORD_ES5} | {KEYWORD_ES6} | {KEYWORD_LITERAL} | {KEYWORD_CONTEXTUAL}

// ==================== 标识符 ====================

// 标识符（允许 $ 和 _ 开头）
IDENTIFIER = [A-Za-z_$][A-Za-z0-9_$]*

// ==================== 字面量 ====================

// 数字字面量（支持所有 ES6 格式）
// 十六进制: 0x123, 0X123
// 八进制: 0o777, 0O777
// 二进制: 0b101, 0B101
// 十进制: 123, 123.45, 1.23e10, 1.23e-10
NUMERIC_HEX = 0[xX][0-9a-fA-F]+
NUMERIC_OCTAL = 0[oO][0-7]+
NUMERIC_BINARY = 0[bB][01]+
NUMERIC_DECIMAL = [0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?
NUMERIC_LITERAL = -?({NUMERIC_HEX} | {NUMERIC_OCTAL} | {NUMERIC_BINARY} | {NUMERIC_DECIMAL})

// 字符串字面量（单引号、双引号）
// 支持转义字符: \', \", \\, \n, \r, \t等
STRING_DOUBLE = \"([^\\\"\r\n]|\\.)*\"
STRING_SINGLE = '([^\\'\r\n]|\\.)*'
STRING_LITERAL = {STRING_DOUBLE} | {STRING_SINGLE}

// 模板字符串（Template Literals）
// NoSubstitutionTemplate: `hello` (无变量插值)
// TemplateHead: `hello ${  (开始，后面跟表达式)
// TemplateMiddle: } world ${  (中间部分)
// TemplateTail: } end`  (结束部分)
// 
// 注意：JFlex 不支持负向前瞻 (?!...)，因此使用简化版本
// 简化的模板字符串匹配（不处理 ${...} 嵌套）
TEMPLATE_NO_SUBSTITUTION = `([^`\\]|\\.)*`
TEMPLATE_HEAD = `([^`\\]|\\.)*\$\{
TEMPLATE_MIDDLE = \}([^`\\]|\\.)*\$\{
TEMPLATE_TAIL = \}([^`\\]|\\.)*`

// 正则表达式字面量
// /pattern/flags
// 支持字符类 [...], 转义字符 \., 量词 *, +, ?, {n,m}
REGEX_BODY = ([^\/\\\r\n\[]|\\.|\[([^\]\\\r\n]|\\.)*\])+
REGEX_FLAGS = [gimsuvy]*
REGEX_LITERAL = \/{REGEX_BODY}\/{REGEX_FLAGS}

// ==================== 注释 ====================

// 单行注释: //... (匹配到行尾)
LINE_COMMENT = \/\/[^\r\n]*

// 多行注释: /* ... */ (非贪婪匹配)
BLOCK_COMMENT = \/\*([^*]|\*+[^*/])*\*+\/

// ==================== 空白符 ====================

// 空白字符（空格、制表符、换行等）
WHITE_SPACE = [ \t\n\r\f]+

%%

// ========== 匹配规则 ==========

// ==================== 关键字（优先级最高）====================

"var"        { return VAR; }
"break"      { return BREAK; }
"do"         { return DO; }
"instanceof" { return INSTANCEOF; }
"typeof"     { return TYPEOF; }
"case"       { return CASE; }
"else"       { return ELSE; }
"new"        { return NEW; }
"catch"      { return CATCH; }
"finally"    { return FINALLY; }
"return"     { return RETURN; }
"void"       { return VOID; }
"continue"   { return CONTINUE; }
"for"        { return FOR; }
"switch"     { return SWITCH; }
"while"      { return WHILE; }
"debugger"   { return DEBUGGER; }
"function"   { return FUNCTION; }
"this"       { return THIS; }
"with"       { return WITH; }
"default"    { return DEFAULT; }
"if"         { return IF; }
"throw"      { return THROW; }
"delete"     { return DELETE; }
"in"         { return IN; }
"try"        { return TRY; }

// ES6 新增关键字
"let"        { return LET; }
"const"      { return CONST; }
"class"      { return CLASS; }
"extends"    { return EXTENDS; }
"super"      { return SUPER; }
"import"     { return IMPORT; }
"export"     { return EXPORT; }
"from"       { return FROM; }
"as"         { return AS; }
"of"         { return OF; }
"static"     { return STATIC; }
"yield"      { return YIELD; }
"async"      { return ASYNC; }
"await"      { return AWAIT; }
"target"     { return TARGET; }

// 字面量关键字
"null"       { return NULL; }
"true"       { return TRUE; }
"false"      { return FALSE; }

// 上下文关键字
"get"        { return GET; }
"set"        { return SET; }

// ==================== 字面量 ====================

{NUMERIC_LITERAL}              { return NUMERIC_LITERAL; }
{STRING_LITERAL}               { return STRING_LITERAL; }
{TEMPLATE_NO_SUBSTITUTION}     { return TEMPLATE_NO_SUBSTITUTION; }
{TEMPLATE_HEAD}                { return TEMPLATE_HEAD; }
{TEMPLATE_MIDDLE}              { return TEMPLATE_MIDDLE; }
{TEMPLATE_TAIL}                { return TEMPLATE_TAIL; }
{REGEX_LITERAL}                { return REGEX_LITERAL; }

// ==================== 标识符 ====================

{IDENTIFIER}                   { return IDENTIFIER; }

// ==================== 运算符和符号 ====================

// 三字符运算符（必须在双字符之前）
">>="        { return MORE_MORE_EQ; }
"<<="        { return LESS_LESS_EQ; }
">>>="       { return MORE_MORE_MORE_EQ; }
">>>"        { return MORE_MORE_MORE; }
"==="        { return EQ_EQ_EQ; }
"!=="        { return NOT_EQ_EQ; }
"..."        { return ELLIPSIS; }

// 双字符运算符（必须在单字符之前）
"=>"         { return ARROW; }
"++"         { return PLUS_PLUS; }
"--"         { return MINUS_MINUS; }
"+="         { return PLUS_EQ; }
"-="         { return MINUS_EQ; }
"*="         { return ASTERISK_EQ; }
"/="         { return SLASH_EQ; }
"%="         { return PERCENT_EQ; }
"&="         { return AMPERSAND_EQ; }
"|="         { return VERTICAL_BAR_EQ; }
"^="         { return CIRCUMFLEX_EQ; }
"=="         { return EQ_EQ; }
"!="         { return NOT_EQ; }
"<="         { return LESS_EQ; }
">="         { return MORE_EQ; }
"<<"         { return LESS_LESS; }
">>"         { return MORE_MORE; }
"&&"         { return AMPERSAND_AMPERSAND; }
"||"         { return VERTICAL_BAR_VERTICAL_BAR; }

// 单字符运算符和符号
"{"          { return LBRACE; }
"}"          { return RBRACE; }
"("          { return LPAREN; }
")"          { return RPAREN; }
"["          { return LBRACKET; }
"]"          { return RBRACKET; }
"."          { return DOT; }
";"          { return SEMICOLON; }
","          { return COMMA; }
":"          { return COLON; }
"?"          { return QUESTION; }
"+"          { return PLUS; }
"-"          { return MINUS; }
"*"          { return ASTERISK; }
"/"          { return SLASH; }
"%"          { return PERCENT; }
"="          { return EQ; }
"<"          { return LESS; }
">"          { return MORE; }
"!"          { return EXCLAMATION; }
"&"          { return AMPERSAND; }
"|"          { return VERTICAL_BAR; }
"^"          { return CIRCUMFLEX; }
"~"          { return TILDE; }

// ==================== 注释和空白 ====================

{LINE_COMMENT}                 { return LINE_COMMENT; }
{BLOCK_COMMENT}                { return BLOCK_COMMENT; }
{WHITE_SPACE}                  { return WHITE_SPACE; }

// ==================== 错误处理 ====================

.                              { return BAD_CHARACTER; }

