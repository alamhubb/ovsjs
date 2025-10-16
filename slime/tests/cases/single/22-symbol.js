// Symbol类型测试

// 基础Symbol
const sym1 = Symbol();
const sym2 = Symbol('description');

// Symbol.for
const globalSym = Symbol.for('app.id');
const sameGlobalSym = Symbol.for('app.id');

// Symbol作为对象属性
const mySymbol = Symbol('myKey');
const obj = {
  [mySymbol]: 'value',
  regularKey: 'regular'
};

// Symbol.iterator
const iterableObj = {
  [Symbol.iterator]: function* () {
    yield 1;
    yield 2;
    yield 3;
  }
};

// 使用Symbol
const value = obj[mySymbol];
const hasSymbol = mySymbol in obj;






