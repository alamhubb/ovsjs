// ES6新特性 - 增强对象字面量

const name = 'Alice';
const age = 25;

// 属性简写
const person = { name, age };

// 方法简写
const obj = {
  greet() {
    return 'Hello';
  },
  
  add(a, b) {
    return a + b;
  }
};

// 计算属性名
const key = 'dynamic';
const computed = {
  [key]: 'value',
  ['computed_' + key]: 'another'
};

