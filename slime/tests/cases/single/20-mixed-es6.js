// ES6新特性混合使用

class Calculator {
  constructor(name = 'Default') {
    this.name = name;
  }
  
  add = (a, b) => a + b;
  
  multiply(...numbers) {
    return numbers.reduce((acc, n) => acc * n, 1);
  }
  
  getInfo() {
    const { name } = this;
    return `Calculator: ${name}`;
  }
}

const calc = new Calculator('MyCalc');
const sum = calc.add(10, 20);
const product = calc.multiply(2, 3, 4);
const info = calc.getInfo();

