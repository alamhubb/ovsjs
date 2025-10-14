# ECMAScript 5.1 语法规范

> 基于 ECMA-262 5.1 Edition (June 2011)  
> 原文链接：https://262.ecma-international.org/5.1/index.html

---

## 1. 范围 (Scope)

本标准定义了 ECMAScript 语言规范。

## 2. 符合性 (Conformance)

符合 ECMAScript 实现必须满足本标准中的所有要求。

## 3. 规范性引用 (Normative References)

- IEEE 754-2008: 浮点运算标准
- Unicode 3.0: Unicode 标准
- ISO 8601:2004: 日期和时间格式

---

## 4. 概述 (Overview)

### 4.1 Web脚本

ECMAScript 是一种面向 Web 的脚本语言。

### 4.2 语言概览

#### 4.2.1 对象 (Objects)

ECMAScript 是基于对象的：基本语言和宿主设施都由对象提供，ECMAScript 程序是一组可通信的对象。

#### 4.2.2 严格模式 (Strict Variant)

ECMAScript 严格模式提供了增强的错误检查和程序安全性。

### 4.3 术语和定义

#### 核心类型
- **type** (类型)：本规范第8章定义的值的集合
- **primitive value** (原始值)：Undefined、Null、Boolean、Number、String 类型之一的成员
- **object** (对象)：Object类型的成员
- **constructor** (构造器)：创建和初始化对象的函数对象
- **prototype** (原型)：为其他对象提供共享属性的对象

#### 内置对象
- **native object** (原生对象)：ECMAScript 实现中完全由本规范定义其语义的对象
- **built-in object** (内置对象)：由 ECMAScript 实现提供的对象
- **host object** (宿主对象)：由宿主环境提供的对象

#### 值类型
- **undefined value** (未定义值)：原始值，用于变量未赋值
- **null value** (空值)：原始值，表示对象值的有意缺失
- **Boolean value** (布尔值)：true 或 false
- **String value** (字符串值)：零个或多个16位无符号整数值的有限有序序列
- **Number value** (数值)：原始值，对应双精度64位二进制格式IEEE 754值
- **Infinity** (无穷大)：正无穷大数值
- **NaN** (非数字)：IEEE 754 "Not-a-Number" 值

#### 函数和属性
- **function** (函数)：Object 类型的成员，可以作为子程序调用
- **built-in function** (内置函数)：作为函数的内置对象
- **property** (属性)：将键（字符串或Symbol）与值关联的部分
- **method** (方法)：作为属性值的函数
- **own property** (自有属性)：对象直接包含的属性
- **inherited property** (继承属性)：对象的原型的属性

---

## 5. 符号约定 (Notational Conventions)

### 5.1 语法和词法文法

#### 5.1.1 上下文无关文法
#### 5.1.2 词法和正则表达式文法
#### 5.1.3 数字字符串文法
#### 5.1.4 语法文法
#### 5.1.5 JSON文法
#### 5.1.6 文法符号

### 5.2 算法约定

---

## 6. 源文本 (Source Text)

ECMAScript 源文本使用 Unicode 字符编码。

---

## 7. 词法约定 (Lexical Conventions)

### 7.1 Unicode格式控制字符

### 7.2 空白字符 (White Space)
- Tab (`\t`)
- Vertical Tab (`\v`)
- Form Feed (`\f`)
- Space
- No-break space
- 其他 Unicode "空格分隔符"

### 7.3 行终止符 (Line Terminators)
- Line Feed (`\n`)
- Carriage Return (`\r`)
- Line Separator
- Paragraph Separator

### 7.4 注释 (Comments)
```javascript
// 单行注释

/* 
 * 多行注释
 */
```

### 7.5 Token

### 7.6 标识符名称和标识符

#### 7.6.1 保留字 (Reserved Words)

**关键字：**
```
break      case       catch      continue   debugger
default    delete     do         else       finally
for        function   if         in         instanceof
new        return     switch     this       throw
try        typeof     var        void       while
with
```

**未来保留字：**
```
class      const      enum       export     extends
import     super
```

**严格模式下的未来保留字：**
```
implements interface  let        package    private
protected  public     static     yield
```

### 7.7 标点符号 (Punctuators)
```
{  }  (  )  [  ]
.  ;  ,
<  >  <=  >=
==  !=  ===  !==
+  -  *  %  ++  --
<<  >>  >>>
&  |  ^
!  ~
&&  ||
?  :
=  +=  -=  *=  %=
<<=  >>=  >>>=
&=  |=  ^=
```

### 7.8 字面量 (Literals)

#### 7.8.1 Null字面量
```javascript
null
```

#### 7.8.2 布尔字面量
```javascript
true
false
```

#### 7.8.3 数字字面量
```javascript
42          // 十进制
0x2A        // 十六进制
3.14159     // 浮点数
6.02e23     // 科学计数法
```

#### 7.8.4 字符串字面量
```javascript
"double quotes"
'single quotes'
"escape \n characters"
```

#### 7.8.5 正则表达式字面量
```javascript
/pattern/flags
```

### 7.9 自动分号插入 (Automatic Semicolon Insertion)

---

## 8. 类型 (Types)

### 8.1 Undefined 类型
唯一值：`undefined`

### 8.2 Null 类型
唯一值：`null`

### 8.3 Boolean 类型
值：`true` 和 `false`

### 8.4 String 类型
所有有限的零个或多个16位无符号整数值的有序序列。

### 8.5 Number 类型
双精度64位二进制格式 IEEE 754 值。

### 8.6 Object 类型

#### 8.6.1 属性特性 (Property Attributes)
- `[[Value]]` - 属性的值
- `[[Writable]]` - 是否可修改
- `[[Enumerable]]` - 是否可枚举
- `[[Configurable]]` - 是否可配置

#### 8.6.2 对象内部属性和方法
- `[[Prototype]]` - 原型
- `[[Class]]` - 类名字符串
- `[[Extensible]]` - 是否可扩展
- `[[Get]]` - getter
- `[[Put]]` - setter
- `[[HasProperty]]`
- `[[Delete]]`
- 等等...

---

## 9. 类型转换 (Type Conversion)

### 9.1 ToPrimitive
### 9.2 ToBoolean
转换规则：
- `undefined` → `false`
- `null` → `false`
- `Boolean` → 原值
- `Number` → `+0`, `-0`, `NaN` → `false`，其他 → `true`
- `String` → 空字符串 → `false`，其他 → `true`
- `Object` → `true`

### 9.3 ToNumber
### 9.4 ToInteger
### 9.5 ToInt32
### 9.6 ToUint32
### 9.7 ToUint16
### 9.8 ToString
### 9.9 ToObject

---

## 10. 执行环境 (Execution Contexts)

### 10.1 执行环境的类型
- 全局代码
- eval代码
- 函数代码

### 10.2 词法环境 (Lexical Environments)

#### 10.2.1 环境记录
- **声明式环境记录**：变量声明、函数声明
- **对象环境记录**：with语句、全局对象

### 10.3 执行环境栈

### 10.4 建立执行环境

### 10.5 声明绑定实例化

### 10.6 Arguments对象

---

## 11. 表达式 (Expressions)

### 11.1 主要表达式 (Primary Expressions)
```javascript
this
Identifier
Literal
ArrayLiteral
ObjectLiteral
( Expression )
```

### 11.2 左侧表达式 (Left-Hand-Side Expressions)

#### 11.2.1 属性访问
```javascript
object.property
object["property"]
```

#### 11.2.2 new运算符
```javascript
new Constructor()
```

#### 11.2.3 函数调用
```javascript
function()
```

#### 11.2.4 参数列表

### 11.3 后缀表达式 (Postfix Expressions)
```javascript
expr++
expr--
```

### 11.4 一元运算符 (Unary Operators)
```javascript
delete expr
void expr
typeof expr
++expr
--expr
+expr
-expr
~expr
!expr
```

### 11.5 乘法运算符 (Multiplicative Operators)
```javascript
*  /  %
```

### 11.6 加法运算符 (Additive Operators)
```javascript
+  -
```

### 11.7 位移运算符 (Bitwise Shift Operators)
```javascript
<<  >>  >>>
```

### 11.8 关系运算符 (Relational Operators)
```javascript
<  >  <=  >=
instanceof
in
```

### 11.9 相等运算符 (Equality Operators)
```javascript
==  !=  ===  !==
```

### 11.10 二进制位运算符 (Binary Bitwise Operators)
```javascript
&  ^  |
```

### 11.11 二进制逻辑运算符 (Binary Logical Operators)
```javascript
&&  ||
```

### 11.12 条件运算符 (Conditional Operator)
```javascript
condition ? trueExpr : falseExpr
```

### 11.13 赋值运算符 (Assignment Operators)
```javascript
=  *=  /=  %=  +=  -=
<<=  >>=  >>>=
&=  ^=  |=
```

### 11.14 逗号运算符 (Comma Operator)
```javascript
expr1, expr2, expr3
```

---

## 12. 语句 (Statements)

### 12.1 块语句 (Block)
```javascript
{
  StatementList
}
```

### 12.2 变量语句 (Variable Statement)
```javascript
var identifier;
var identifier = value;
var id1, id2, id3;
```

### 12.3 空语句 (Empty Statement)
```javascript
;
```

### 12.4 表达式语句 (Expression Statement)
```javascript
expression;
```

### 12.5 if 语句
```javascript
if (condition) statement
if (condition) statement1 else statement2
```

### 12.6 迭代语句 (Iteration Statements)

#### 12.6.1 do-while 语句
```javascript
do statement while (condition);
```

#### 12.6.2 while 语句
```javascript
while (condition) statement
```

#### 12.6.3 for 语句
```javascript
for (init; condition; increment) statement
```

#### 12.6.4 for-in 语句
```javascript
for (variable in object) statement
```

### 12.7 continue 语句
```javascript
continue;
continue label;
```

### 12.8 break 语句
```javascript
break;
break label;
```

### 12.9 return 语句
```javascript
return;
return expression;
```

### 12.10 with 语句
```javascript
with (object) statement
```

### 12.11 switch 语句
```javascript
switch (expression) {
  case value1:
    statements
    break;
  case value2:
    statements
    break;
  default:
    statements
}
```

### 12.12 标签语句 (Labelled Statements)
```javascript
label: statement
```

### 12.13 throw 语句
```javascript
throw expression;
```

### 12.14 try 语句
```javascript
try {
  statements
} catch (exception) {
  statements
} finally {
  statements
}
```

### 12.15 debugger 语句
```javascript
debugger;
```

---

## 13. 函数定义 (Function Definition)

### 13.1 函数声明
```javascript
function name(param1, param2, ...) {
  statements
}
```

### 13.2 函数表达式
```javascript
var func = function(param1, param2, ...) {
  statements
};

var func = function name(params) {
  statements
};
```

---

## 14. 程序 (Program)

### 14.1 程序结构
一个 ECMAScript 程序由一个或多个源文本单元组成。

---

## 15. 标准内置对象 (Standard Built-in Objects)

### 15.1 全局对象 (The Global Object)

#### 15.1.1 全局对象的值属性
- `NaN`
- `Infinity`
- `undefined`

#### 15.1.2 全局对象的函数属性
- `eval(x)`
- `parseInt(string, radix)`
- `parseFloat(string)`
- `isNaN(number)`
- `isFinite(number)`

#### 15.1.3 URI处理函数
- `decodeURI(encodedURI)`
- `decodeURIComponent(encodedURIComponent)`
- `encodeURI(uri)`
- `encodeURIComponent(uriComponent)`

#### 15.1.4 全局对象的构造器属性
- `Object`
- `Function`
- `Array`
- `String`
- `Boolean`
- `Number`
- `Date`
- `RegExp`
- `Error`
- `EvalError`
- `RangeError`
- `ReferenceError`
- `SyntaxError`
- `TypeError`
- `URIError`

#### 15.1.5 全局对象的其他属性
- `Math`
- `JSON`

### 15.2 Object 对象

#### 15.2.3 Object 构造器的属性
- `Object.prototype`
- `Object.getPrototypeOf(O)`
- `Object.getOwnPropertyDescriptor(O, P)`
- `Object.getOwnPropertyNames(O)`
- `Object.create(O [, Properties])`
- `Object.defineProperty(O, P, Attributes)`
- `Object.defineProperties(O, Properties)`
- `Object.seal(O)`
- `Object.freeze(O)`
- `Object.preventExtensions(O)`
- `Object.isSealed(O)`
- `Object.isFrozen(O)`
- `Object.isExtensible(O)`
- `Object.keys(O)`

#### 15.2.4 Object.prototype 的属性
- `Object.prototype.constructor`
- `Object.prototype.toString()`
- `Object.prototype.toLocaleString()`
- `Object.prototype.valueOf()`
- `Object.prototype.hasOwnProperty(V)`
- `Object.prototype.isPrototypeOf(V)`
- `Object.prototype.propertyIsEnumerable(V)`

### 15.3 Function 对象

#### 15.3.4 Function.prototype 的属性
- `Function.prototype.toString()`
- `Function.prototype.apply(thisArg, argArray)`
- `Function.prototype.call(thisArg [, arg1 [, arg2, …]])`
- `Function.prototype.bind(thisArg [, arg1 [, arg2, …]])`

### 15.4 Array 对象

#### 15.4.3 Array 构造器的属性
- `Array.prototype`
- `Array.isArray(arg)`

#### 15.4.4 Array.prototype 的属性
- `Array.prototype.constructor`
- `Array.prototype.toString()`
- `Array.prototype.toLocaleString()`
- `Array.prototype.concat([item1 [, item2 [, …]]])`
- `Array.prototype.join(separator)`
- `Array.prototype.pop()`
- `Array.prototype.push([item1 [, item2 [, …]]])`
- `Array.prototype.reverse()`
- `Array.prototype.shift()`
- `Array.prototype.slice(start, end)`
- `Array.prototype.sort(comparefn)`
- `Array.prototype.splice(start, deleteCount [, item1 [, item2 [, …]]])`
- `Array.prototype.unshift([item1 [, item2 [, …]]])`
- `Array.prototype.indexOf(searchElement [, fromIndex])`
- `Array.prototype.lastIndexOf(searchElement [, fromIndex])`
- `Array.prototype.every(callbackfn [, thisArg])`
- `Array.prototype.some(callbackfn [, thisArg])`
- `Array.prototype.forEach(callbackfn [, thisArg])`
- `Array.prototype.map(callbackfn [, thisArg])`
- `Array.prototype.filter(callbackfn [, thisArg])`
- `Array.prototype.reduce(callbackfn [, initialValue])`
- `Array.prototype.reduceRight(callbackfn [, initialValue])`

### 15.5 String 对象

#### 15.5.4 String.prototype 的属性
- `String.prototype.toString()`
- `String.prototype.valueOf()`
- `String.prototype.charAt(pos)`
- `String.prototype.charCodeAt(pos)`
- `String.prototype.concat([string1 [, string2 [, …]]])`
- `String.prototype.indexOf(searchString, position)`
- `String.prototype.lastIndexOf(searchString, position)`
- `String.prototype.localeCompare(that)`
- `String.prototype.match(regexp)`
- `String.prototype.replace(searchValue, replaceValue)`
- `String.prototype.search(regexp)`
- `String.prototype.slice(start, end)`
- `String.prototype.split(separator, limit)`
- `String.prototype.substring(start, end)`
- `String.prototype.toLowerCase()`
- `String.prototype.toLocaleLowerCase()`
- `String.prototype.toUpperCase()`
- `String.prototype.toLocaleUpperCase()`
- `String.prototype.trim()`

### 15.6 Boolean 对象

### 15.7 Number 对象

#### 15.7.3 Number 构造器的属性
- `Number.MAX_VALUE`
- `Number.MIN_VALUE`
- `Number.NaN`
- `Number.NEGATIVE_INFINITY`
- `Number.POSITIVE_INFINITY`

#### 15.7.4 Number.prototype 的属性
- `Number.prototype.toString([radix])`
- `Number.prototype.toLocaleString()`
- `Number.prototype.valueOf()`
- `Number.prototype.toFixed(fractionDigits)`
- `Number.prototype.toExponential(fractionDigits)`
- `Number.prototype.toPrecision(precision)`

### 15.8 Math 对象

#### 15.8.1 Math 对象的值属性
- `Math.E` - 自然对数的底 (约2.718)
- `Math.LN10` - 10的自然对数 (约2.302)
- `Math.LN2` - 2的自然对数 (约0.693)
- `Math.LOG2E` - E的以2为底的对数 (约1.442)
- `Math.LOG10E` - E的常用对数 (约0.434)
- `Math.PI` - 圆周率π (约3.14159)
- `Math.SQRT1_2` - 1/2的平方根 (约0.707)
- `Math.SQRT2` - 2的平方根 (约1.414)

#### 15.8.2 Math 对象的函数属性
- `Math.abs(x)`
- `Math.acos(x)`
- `Math.asin(x)`
- `Math.atan(x)`
- `Math.atan2(y, x)`
- `Math.ceil(x)`
- `Math.cos(x)`
- `Math.exp(x)`
- `Math.floor(x)`
- `Math.log(x)`
- `Math.max([value1 [, value2 [, …]]])`
- `Math.min([value1 [, value2 [, …]]])`
- `Math.pow(x, y)`
- `Math.random()`
- `Math.round(x)`
- `Math.sin(x)`
- `Math.sqrt(x)`
- `Math.tan(x)`

### 15.9 Date 对象

#### 15.9.4 Date 构造器的属性
- `Date.prototype`
- `Date.parse(string)`
- `Date.UTC(year, month [, date [, hours [, minutes [, seconds [, ms]]]]])`
- `Date.now()`

#### 15.9.5 Date.prototype 的属性
- `Date.prototype.toString()`
- `Date.prototype.toDateString()`
- `Date.prototype.toTimeString()`
- `Date.prototype.toLocaleString()`
- `Date.prototype.toLocaleDateString()`
- `Date.prototype.toLocaleTimeString()`
- `Date.prototype.valueOf()`
- `Date.prototype.getTime()`
- `Date.prototype.getFullYear()`
- `Date.prototype.getUTCFullYear()`
- `Date.prototype.getMonth()`
- `Date.prototype.getUTCMonth()`
- `Date.prototype.getDate()`
- `Date.prototype.getUTCDate()`
- `Date.prototype.getDay()`
- `Date.prototype.getUTCDay()`
- `Date.prototype.getHours()`
- `Date.prototype.getUTCHours()`
- `Date.prototype.getMinutes()`
- `Date.prototype.getUTCMinutes()`
- `Date.prototype.getSeconds()`
- `Date.prototype.getUTCSeconds()`
- `Date.prototype.getMilliseconds()`
- `Date.prototype.getUTCMilliseconds()`
- `Date.prototype.getTimezoneOffset()`
- `Date.prototype.setTime(time)`
- `Date.prototype.setMilliseconds(ms)`
- `Date.prototype.setUTCMilliseconds(ms)`
- `Date.prototype.setSeconds(sec [, ms])`
- `Date.prototype.setUTCSeconds(sec [, ms])`
- `Date.prototype.setMinutes(min [, sec [, ms]])`
- `Date.prototype.setUTCMinutes(min [, sec [, ms]])`
- `Date.prototype.setHours(hour [, min [, sec [, ms]]])`
- `Date.prototype.setUTCHours(hour [, min [, sec [, ms]]])`
- `Date.prototype.setDate(date)`
- `Date.prototype.setUTCDate(date)`
- `Date.prototype.setMonth(month [, date])`
- `Date.prototype.setUTCMonth(month [, date])`
- `Date.prototype.setFullYear(year [, month [, date]])`
- `Date.prototype.setUTCFullYear(year [, month [, date]])`
- `Date.prototype.toUTCString()`
- `Date.prototype.toISOString()`
- `Date.prototype.toJSON(key)`

### 15.10 RegExp 对象（正则表达式）

#### 15.10.2 模式语法
- **字符类**：`.`, `\d`, `\D`, `\w`, `\W`, `\s`, `\S`
- **量词**：`*`, `+`, `?`, `{n}`, `{n,}`, `{n,m}`
- **断言**：`^`, `$`, `\b`, `\B`
- **分组**：`()`, `(?:)`, `(?=)`, `(?!)`

#### 15.10.6 RegExp.prototype 的属性
- `RegExp.prototype.exec(string)`
- `RegExp.prototype.test(string)`
- `RegExp.prototype.toString()`

### 15.11 Error 对象

#### 错误类型
- `Error`
- `EvalError`
- `RangeError`
- `ReferenceError`
- `SyntaxError`
- `TypeError`
- `URIError`

### 15.12 JSON 对象

#### 15.12.2 JSON.parse
```javascript
JSON.parse(text [, reviver])
```

#### 15.12.3 JSON.stringify
```javascript
JSON.stringify(value [, replacer [, space]])
```

---

## 附录 A：文法总结 (Grammar Summary)

### A.1 词法文法
### A.2 数字字符串文法
### A.3 表达式
### A.4 语句
### A.5 函数和程序
### A.6 通用表达式
### A.7 正则表达式
### A.8 JSON

---

## 附录 B：与ECMAScript 3的兼容性

### B.1 额外语法
### B.2 额外属性
- `escape(string)`
- `unescape(string)`
- `String.prototype.substr(start, length)`

---

## 附录 C：严格模式的限制和例外

### C.1 严格模式的限制
- 禁止使用 `with` 语句
- 禁止删除变量、函数、参数
- 禁止重复的参数名
- 禁止八进制字面量
- `eval` 和 `arguments` 不能作为标识符
- `arguments` 对象不反映参数变化
- 禁止 `arguments.caller` 和 `arguments.callee`
- `this` 在非方法调用中不会被强制转换为对象

---

## 附录 D：与ECMAScript 3的修正和澄清

主要技术性修正包括：
- 正则表达式的改进
- 数组方法的标准化
- JSON支持
- 严格模式的引入
- Object方法的增强 (Object.create, Object.defineProperty等)
- Function.prototype.bind的添加
- Array方法的增强 (forEach, map, filter, reduce等)
- Date.prototype.toISOString的添加
- String.prototype.trim的添加

---

## 参考文献 (Bibliography)

1. IEEE Std 754-2008: IEEE浮点运算标准
2. Unicode Standard, Version 3.0
3. Unicode Technical Report #15: Unicode规范化形式
4. ISO 8601:2004: 日期和时间格式
5. RFC 1738: 统一资源定位符(URL)
6. RFC 2396: 统一资源标识符(URI): 通用语法
7. RFC 3629: UTF-8编码
8. RFC 4627: JSON媒体类型

---

## 关键特性总结

### ES5 新增特性
1. **严格模式** (`"use strict"`)
2. **Object方法增强**
   - `Object.create()`
   - `Object.defineProperty()`
   - `Object.keys()`
   - `Object.freeze()`
   - `Object.seal()`
3. **Array方法增强**
   - `forEach()`, `map()`, `filter()`, `reduce()`, `reduceRight()`
   - `every()`, `some()`
   - `indexOf()`, `lastIndexOf()`
4. **Function.prototype.bind()**
5. **String.prototype.trim()**
6. **Date.now()**
7. **Date.prototype.toISOString()**
8. **JSON对象**
   - `JSON.parse()`
   - `JSON.stringify()`
9. **属性描述符**
   - getter/setter支持
   - 属性特性控制 (writable, enumerable, configurable)

### 重要概念
- **原型链** (Prototype Chain)
- **作用域链** (Scope Chain)
- **闭包** (Closures)
- **this 绑定规则**
- **提升** (Hoisting)
- **类型强制转换** (Type Coercion)

---

## Es5Parser 实现限制

### ⚠️ 不支持自动分号插入（ASI）

**限制说明：**
本Parser实现**不支持**ES5规范第7.9节定义的自动分号插入（Automatic Semicolon Insertion）特性。

**要求：**
所有语句必须显式使用分号结尾。

**不支持的写法：**
```javascript
// ❌ 以下代码无法解析（缺少分号）
var a = 1
var b = 2
return 123

function test() {
  console.log("hello")
}
```

**必须使用的写法：**
```javascript
// ✅ 必须显式添加分号
var a = 1;
var b = 2;
return 123;

function test() {
  console.log("hello");
}
```

**原因：**
- ASI实现复杂，需要错误恢复机制和上下文判断
- 简化Parser实现，降低维护成本
- 显式分号更明确，符合现代最佳实践

**适用场景：**
- ✅ TypeScript/现代JavaScript项目（通常配置显式分号）
- ✅ 代码生成工具的输出（可控制格式）
- ✅ 编译器前端（输入代码可规范化）
- ❌ 解析任意ES5代码（可能省略分号）

**建议：**
如果需要解析省略分号的代码，建议：
1. 使用预处理工具添加分号（如Prettier）
2. 或使用完整的ES5 Parser（如Babel、Acorn）
3. 或扩展本Parser实现ASI支持（预计5-10小时工作量）

---

### ✅ 完整实现的ES5特性

**表达式（100%）：**
- 所有运算符（一元、二元、条件、赋值、逗号）
- 属性访问（点、括号）
- 函数调用、new运算符
- 对象字面量（含getter/setter）
- 数组字面量

**语句（100%）：**
- 所有控制流语句（if, switch, for, while, do-while, for-in）
- 异常处理（try/catch/finally, throw）
- 变量声明（var）
- 函数声明和表达式
- 其他语句（return, break, continue, with, debugger等）

**特殊特性：**
- ✅ getter/setter 属性（ES5新增）
- ✅ 函数表达式（匿名/命名）
- ✅ 标签语句
- ✅ 正则表达式字面量

---

## 完整规范链接

**HTML版本：** https://262.ecma-international.org/5.1/index.html  
**PDF版本：** https://ecma-international.org/wp-content/uploads/ECMA-262_5.1_edition_june_2011.pdf

---

*文档生成时间：2025-10-14*  
*基于 ECMA-262 5.1 Edition (June 2011)*

