// ES6新特性 - 展开和剩余运算符

// 数组展开
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5];

// 对象展开
const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 };

// 剩余参数
function sum(...numbers) {
  let total = 0;
  for (let i = 0; i < numbers.length; i++) {
    total += numbers[i];
  }
  return total;
}

const result = sum(1, 2, 3, 4, 5);

