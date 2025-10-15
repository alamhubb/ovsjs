// 阶段1：只测Parser - 逻辑运算符
// 目标：验证能否正确解析逻辑运算符

// 逻辑与
var and = true && false;

// 逻辑或
var or = true || false;

// 逻辑非
var not = !true;

// ========== 以下测试用例修复了Parser框架的Or回退机制 ==========
// Bug: 括号表达式 + 逻辑运算符被错误解析
// 原因: CoverParenthesizedExpressionAndArrowParameterList被注释掉
//      + Or/Option的容错逻辑保留部分成功导致语义错误
// 修复: 启用括号表达式 + 删除错误的容错逻辑

// 括号表达式 + 逻辑AND
var complex1 = (1 < 2) && (3 > 2);

// 括号表达式 + 逻辑OR（原bug复现）
var complex2 = (1 < 2) || false;

// 括号表达式 + 复合逻辑
var complex3 = (1 < 2) && (3 > 2) || false;

// 括号表达式嵌套 + 逻辑运算
var complex4 = ((1 < 2) && true) || (false && (3 > 2));

