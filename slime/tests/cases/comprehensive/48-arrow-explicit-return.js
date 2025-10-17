// 箭头函数显式返回
const calculate = (a, b) => {
  const sum = a + b;
  const product = a * b;
  return sum + product;
};

const process = (value) => {
  if (value > 10) {
    return value * 2;
  }
  return value + 10;
};

const multiLine = (x) => {
  const temp = x * 2;
  return temp + 1;
};

// 使用
const result1 = calculate(3, 4);
const result2 = process(15);
const result3 = multiLine(5);






