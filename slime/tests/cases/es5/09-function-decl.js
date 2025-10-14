// 阶段1：只测Parser - 函数声明
// 目标：验证能否正确解析函数声明和调用

// 简单函数
function add(a, b) {
  return a + b;
}

// 函数表达式
var multiply = function(a, b) {
  return a * b;
};

// 函数调用
var result1 = add(1, 2);
var result2 = multiply(3, 4);

// 嵌套函数
function outer(x) {
  function inner(y) {
    return x + y;
  }
  return inner(10);
}

