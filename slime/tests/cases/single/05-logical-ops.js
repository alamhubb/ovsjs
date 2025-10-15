// 阶段1：只测Parser - 逻辑运算符
// 目标：验证能否正确解析逻辑运算符

// 逻辑与
var and = true && false;

// 逻辑或
var or = true || false;

// 逻辑非
var not = !true;

// 括号表达式 + 逻辑运算（测试括号表达式支持）
var complex1 = (1 < 2) && (3 > 2);
var complex2 = (1 < 2) || false;
var complex3 = (1 < 2) && (3 > 2) || false;

