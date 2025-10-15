// ES6新特性 - 箭头函数

// 单参数箭头函数
const double = x => x * 2;

// 多参数箭头函数
const add = (a, b) => a + b;

// 无参数箭头函数
const greet = () => 'Hello';

// 多语句箭头函数
const complex = (x, y) => {
  const sum = x + y;
  return sum * 2;
};

// 测试调用
const result1 = double(5);
const result2 = add(3, 4);
const result3 = greet();
const result4 = complex(2, 3);

// 箭头函数嵌套
const outer = x => y => x + y;
const curried = outer(10);

// 箭头函数作为参数
const nums = [1, 2, 3];
const doubled = nums.map(n => n * 2);

