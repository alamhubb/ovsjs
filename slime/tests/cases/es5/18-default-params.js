// ES6新特性 - 默认参数

// 函数默认参数
function greet(name = 'Guest') {
  return `Hello, ${name}`;
}

// 箭头函数默认参数
const multiply = (a, b = 1) => a * b;

// 多个默认参数
function createUser(name = 'Anonymous', age = 0, city = 'Unknown') {
  return { name, age, city };
}

const result1 = greet();
const result2 = greet('Alice');
const result3 = multiply(5);
const result4 = multiply(5, 3);

