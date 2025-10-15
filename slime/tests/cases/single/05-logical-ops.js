// 阶段1：只测Parser - 逻辑运算符
// 目标：验证能否正确解析逻辑运算符

// 逻辑与
var and = true && false;

// 逻辑或
var or = true || false;

// 逻辑非
var not = !true;

// 复合逻辑（需要修复Parser框架的Or回退机制）
// var complex = (1 < 2) && (3 > 2) || false;

