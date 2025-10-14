// 阶段1：只测Parser - 比较运算符
// 目标：验证能否正确解析比较运算符

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

