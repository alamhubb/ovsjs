// 阶段1：基础语法 - 比较运算符

// 小于/大于
var less = 1 < 2;
var greater = 3 > 2;

// 小于等于/大于等于
var lessEq = 1 <= 1;
var greaterEq = 2 >= 2;

// 相等/不相等
var equal = 1 == 1;
var notEqual = 1 != 2;

// 严格相等/不相等
var strictEqual = 1 === 1;
var strictNotEqual = 1 !== '1';

// 复合比较（括号表达式）
var comp1 = (1 < 2) && (3 > 2);
var comp2 = (x >= 0) || (y <= 10);

// 嵌套比较
var comp3 = ((a < b) && (b < c)) || (d === e);

