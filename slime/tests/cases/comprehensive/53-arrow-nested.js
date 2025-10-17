// 嵌套箭头函数
const add = x => y => x + y;
const multiply = a => b => a * b;
const greet = name => greeting => `${greeting}, ${name}!`;

// 柯里化
const addFive = add(5);
const multiplyByTwo = multiply(2);
const sayHello = greet("Alice");

// 使用
const result1 = addFive(10);        // 15
const result2 = multiplyByTwo(7);   // 14
const greeting = sayHello("Hello"); // "Hello, Alice!"

// 复杂嵌套
const complex = a => b => c => a + b + c;
const step1 = complex(1);
const step2 = step1(2);
const final = step2(3);






