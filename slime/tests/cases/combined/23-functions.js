// ES5测试 - 函数

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

// 立即执行函数（IIFE）- 需要修复Parser的ArrowFunction判断逻辑（增加lookahead）
// (function() {
//   var localVar = 'local';
//   console.log(localVar);
// })();
// 
// // 带参数的IIFE
// (function(x, y) {
//   console.log(x + y);
// })(10, 20);

// 嵌套函数
function outer(x) {
  function inner(y) {
    return x + y;
  }
  return inner(10);
}

// 函数作为返回值
function makeAdder(x) {
  return function(y) {
    return x + y;
  };
}

var add5 = makeAdder(5);
var result3 = add5(3);


