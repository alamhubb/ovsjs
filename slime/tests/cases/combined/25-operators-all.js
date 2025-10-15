// ES5测试 - 运算符

// 算术运算符
var a = 10;
var b = 3;
var sum = a + b;
var diff = a - b;
var prod = a * b;
var quot = a / b;
var remainder = a % b;

// 自增自减
var c = 5;
c++;
++c;
c--;
--c;

// 位运算符
var bitAnd = 5 & 3;
var bitOr = 5 | 3;
var bitXor = 5 ^ 3;
var bitNot = ~5;
var leftShift = 5 << 1;
var rightShift = 5 >> 1;
var unsignedRightShift = -5 >>> 1;

// 赋值运算符（测试修复后的AbsAssignmentOperator）
var x = 10;
x += 5;
x -= 3;
x *= 2;
x /= 2;
x %= 3;
x <<= 1;
x >>= 1;
x >>>= 1;
x &= 7;
x |= 3;
x ^= 1;

// 条件运算符（三元运算符）- 需要添加ConditionalExpression支持
// var max = a > b ? a : b;
// var min = a < b ? a : b;

// typeof运算符
var t1 = typeof 123;
var t2 = typeof 'string';
var t3 = typeof true;
var t4 = typeof undefined;
var t5 = typeof {};

// instanceof运算符 - 需要修复空数组支持
// var arr = [];
// var isArray = arr instanceof Array;

// in运算符
var obj = {key: 'value'};
var hasKey = 'key' in obj;

// delete运算符
delete obj.key;

// void运算符
var v = void 0;


