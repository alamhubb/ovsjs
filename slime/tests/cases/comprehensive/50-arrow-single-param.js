// 单参数箭头函数（无括号）
const double = x => x * 2;
const triple = n => n * 3;
const negate = value => -value;
const toString = num => String(num);
const isPositive = x => x > 0;

// 链式调用
const numbers = [1, 2, 3, 4, 5];
const result = numbers
  .map(x => x * 2)
  .filter(n => n > 5)
  .reduce((acc, val) => acc + val, 0);






