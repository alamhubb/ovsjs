// v3：增加命名函数表达式

// 函数声明
function add(a, b) {
  return a + b;
}

// 函数表达式（匿名）
var multiply = function(a, b) {
  return a * b;
};

// 函数表达式（命名）
var factorial = function fact(n) {
  if (n <= 1) {
    return 1;
  }
  return n * fact(n - 1);
};

// 函数调用
var result1 = add(1, 2);
var result2 = multiply(3, 4);

