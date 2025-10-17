// 多参数箭头函数
const add = (a, b) => a + b;
const subtract = (x, y) => x - y;
const sum3 = (a, b, c) => a + b + c;
const sum4 = (a, b, c, d) => a + b + c + d;

// 默认参数
const greet = (name = "Guest", age = 18) => `${name} is ${age}`;
const multiply = (x = 1, y = 1, z = 1) => x * y * z;

// 使用
const result1 = add(1, 2);
const result2 = sum3(1, 2, 3);
const greeting = greet("Alice", 25);
const product = multiply(2, 3, 4);






