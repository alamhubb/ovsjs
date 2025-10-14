# ECMAScript 6 (ES2015) 语法规范

> 基于 ECMA-262 6th Edition (June 2015)  
> 原文链接：https://262.ecma-international.org/6.0/index.html

---

## ES6 概述

ECMAScript 2015（ES6）是JavaScript语言的重大更新，引入了大量新特性，使JavaScript更加强大和易用。

---

## 1. 词法约定的扩展

### 1.1 新增保留字

**ES6新增的关键字：**
```
class     extends   super
const     let
import    export
yield     async     await
```

**严格模式下的保留字（ES5已有，ES6保留）：**
```
implements  interface  package
private     protected  public
static
```

---

## 2. 变量声明

### 2.1 let 声明（块级作用域）

```javascript
// let声明的变量有块级作用域
{
  let x = 1;
  console.log(x);  // 1
}
console.log(x);  // ReferenceError

// 不允许重复声明
let a = 1;
let a = 2;  // SyntaxError

// 暂时性死区（TDZ）
console.log(b);  // ReferenceError
let b = 1;
```

### 2.2 const 声明（常量）

```javascript
// const声明后不可重新赋值
const PI = 3.14159;
PI = 3.14;  // TypeError

// 必须初始化
const X;  // SyntaxError

// 块级作用域
{
  const Y = 1;
}
console.log(Y);  // ReferenceError

// 对象属性可以修改
const obj = {name: 'test'};
obj.name = 'changed';  // ✅ 可以
obj = {};  // ❌ TypeError
```

---

## 3. 箭头函数（Arrow Functions）

### 3.1 基本语法

```javascript
// 单参数，单表达式
const double = x => x * 2;

// 多参数
const add = (a, b) => a + b;

// 无参数
const greet = () => 'Hello';

// 多语句（需要花括号）
const complex = (x, y) => {
  const result = x + y;
  return result * 2;
};

// 返回对象字面量（需要括号）
const makeObj = (x, y) => ({x: x, y: y});
```

### 3.2 特性

**不绑定this：**
```javascript
function Person() {
  this.age = 0;
  
  setInterval(() => {
    this.age++;  // this指向Person实例
  }, 1000);
}
```

**不能用作构造函数：**
```javascript
const Foo = () => {};
new Foo();  // TypeError
```

**没有arguments对象：**
```javascript
const func = () => {
  console.log(arguments);  // ReferenceError
};
```

---

## 4. 类（Class）

### 4.1 类声明

```javascript
class Rectangle {
  // 构造函数
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  
  // 方法
  getArea() {
    return this.width * this.height;
  }
  
  // getter
  get area() {
    return this.width * this.height;
  }
  
  // setter
  set width(value) {
    if (value <= 0) {
      throw new Error('Width must be positive');
    }
    this._width = value;
  }
  
  // 静态方法
  static create(width, height) {
    return new Rectangle(width, height);
  }
}
```

### 4.2 类表达式

```javascript
// 匿名类表达式
const Rectangle = class {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
};

// 命名类表达式
const Rectangle = class Rect {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
};
```

### 4.3 继承（extends）

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    console.log(`${this.name} makes a sound`);
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);  // 调用父类构造函数
    this.breed = breed;
  }
  
  speak() {
    super.speak();  // 调用父类方法
    console.log(`${this.name} barks`);
  }
}
```

### 4.4 super 关键字

```javascript
class Parent {
  constructor(x) {
    this.x = x;
  }
  
  method() {
    return this.x;
  }
}

class Child extends Parent {
  constructor(x, y) {
    super(x);  // 调用父类构造函数（必须在使用this之前）
    this.y = y;
  }
  
  method() {
    return super.method() + this.y;  // 调用父类方法
  }
}
```

### 4.5 静态方法和属性

```javascript
class MathHelper {
  // 静态方法
  static add(a, b) {
    return a + b;
  }
  
  // 静态属性（ES6用getter模拟）
  static get PI() {
    return 3.14159;
  }
}

// 调用
MathHelper.add(1, 2);  // 3
MathHelper.PI;  // 3.14159
```

---

## 5. 模板字面量（Template Literals）

### 5.1 基本语法

```javascript
// 反引号包裹
const str = `Hello World`;

// 多行字符串
const multiline = `
  Line 1
  Line 2
  Line 3
`;

// 字符串插值
const name = 'Alice';
const age = 25;
const message = `My name is ${name}, I am ${age} years old`;

// 表达式插值
const price = 10;
const quantity = 3;
const total = `Total: ${price * quantity}`;
```

### 5.2 标签模板

```javascript
function tag(strings, ...values) {
  console.log(strings);  // ["Hello ", " world ", "!"]
  console.log(values);   // ["beautiful", "today"]
}

const adj1 = 'beautiful';
const adj2 = 'today';
tag`Hello ${adj1} world ${adj2}!`;
```

---

## 6. 解构赋值（Destructuring）

### 6.1 数组解构

```javascript
// 基本解构
const [a, b, c] = [1, 2, 3];

// 跳过元素
const [first, , third] = [1, 2, 3];

// 剩余元素
const [head, ...tail] = [1, 2, 3, 4];
// head = 1, tail = [2, 3, 4]

// 默认值
const [x = 0, y = 0] = [1];
// x = 1, y = 0

// 交换变量
let a = 1, b = 2;
[a, b] = [b, a];
```

### 6.2 对象解构

```javascript
// 基本解构
const {name, age} = {name: 'Alice', age: 25};

// 重命名
const {name: userName, age: userAge} = {name: 'Alice', age: 25};

// 默认值
const {x = 0, y = 0} = {x: 1};
// x = 1, y = 0

// 嵌套解构
const {user: {name, address: {city}}} = {
  user: {
    name: 'Alice',
    address: {city: 'Beijing'}
  }
};

// 函数参数解构
function greet({name, age}) {
  console.log(`${name} is ${age} years old`);
}
greet({name: 'Alice', age: 25});
```

---

## 7. 函数扩展

### 7.1 默认参数

```javascript
function greet(name = 'Guest', greeting = 'Hello') {
  return `${greeting}, ${name}!`;
}

greet();  // "Hello, Guest!"
greet('Alice');  // "Hello, Alice!"
greet('Alice', 'Hi');  // "Hi, Alice!"

// 默认值可以是表达式
function append(value, array = []) {
  array.push(value);
  return array;
}
```

### 7.2 剩余参数（Rest Parameters）

```javascript
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3, 4);  // 10

// 剩余参数必须是最后一个参数
function func(a, b, ...rest) {
  console.log(rest);  // [3, 4, 5]
}
func(1, 2, 3, 4, 5);
```

### 7.3 扩展运算符（Spread Operator）

```javascript
// 数组展开
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5, 6];  // [1, 2, 3, 4, 5, 6]

// 函数调用
function sum(a, b, c) {
  return a + b + c;
}
const numbers = [1, 2, 3];
sum(...numbers);  // 6

// 数组复制
const original = [1, 2, 3];
const copy = [...original];

// 对象展开（ES2018，但常与ES6一起使用）
const obj1 = {a: 1, b: 2};
const obj2 = {...obj1, c: 3};  // {a: 1, b: 2, c: 3}
```

---

## 8. 对象字面量增强

### 8.1 属性简写

```javascript
const name = 'Alice';
const age = 25;

// ES5写法
const person = {
  name: name,
  age: age
};

// ES6简写
const person = {name, age};
```

### 8.2 方法简写

```javascript
// ES5写法
const obj = {
  method: function() {
    return 'Hello';
  }
};

// ES6简写
const obj = {
  method() {
    return 'Hello';
  }
};
```

### 8.3 计算属性名

```javascript
const propName = 'dynamicProp';

const obj = {
  [propName]: 'value',
  ['prop' + '2']: 'value2',
  [Symbol.iterator]: function* () {
    yield 1;
    yield 2;
  }
};
```

---

## 9. 模块（Modules）

### 9.1 导出（Export）

```javascript
// 命名导出
export const PI = 3.14159;
export function add(a, b) {
  return a + b;
}
export class Calculator {
  // ...
}

// 批量导出
const PI = 3.14159;
function add(a, b) { return a + b; }
export {PI, add};

// 重命名导出
export {PI as pi, add as sum};

// 默认导出
export default class Calculator {
  // ...
}

// 或
export default function() {
  // ...
}
```

### 9.2 导入（Import）

```javascript
// 命名导入
import {PI, add} from './math.js';

// 重命名导入
import {PI as pi, add as sum} from './math.js';

// 导入默认导出
import Calculator from './calculator.js';

// 混合导入
import Calculator, {PI, add} from './math.js';

// 导入所有
import * as Math from './math.js';
Math.PI;
Math.add(1, 2);

// 仅执行模块（副作用）
import './polyfill.js';
```

---

## 10. 迭代器和生成器

### 10.1 迭代器（Iterator）

```javascript
// 自定义迭代器
const myIterable = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        if (i < 3) {
          return {value: i++, done: false};
        }
        return {done: true};
      }
    };
  }
};

for (const value of myIterable) {
  console.log(value);  // 0, 1, 2
}
```

### 10.2 生成器（Generator）

```javascript
// 生成器函数
function* numberGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = numberGenerator();
gen.next();  // {value: 1, done: false}
gen.next();  // {value: 2, done: false}
gen.next();  // {value: 3, done: false}
gen.next();  // {done: true}

// 生成器方法
const obj = {
  *generator() {
    yield 'a';
    yield 'b';
  }
};

// yield*委托
function* delegate() {
  yield* [1, 2, 3];
  yield* 'abc';
}
```

---

## 11. Promise

### 11.1 基本用法

```javascript
// 创建Promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Success!');
    // 或 reject(new Error('Failed!'));
  }, 1000);
});

// 使用Promise
promise
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => console.log('Done'));
```

### 11.2 Promise方法

```javascript
// Promise.all - 所有都成功
Promise.all([promise1, promise2, promise3])
  .then(results => console.log(results));

// Promise.race - 第一个完成的
Promise.race([promise1, promise2])
  .then(result => console.log(result));

// Promise.resolve
Promise.resolve(42);

// Promise.reject
Promise.reject(new Error('Failed'));
```

---

## 12. 新增数据结构

### 12.1 Map

```javascript
// 创建Map
const map = new Map();

// 设置值
map.set('key1', 'value1');
map.set('key2', 'value2');
map.set({id: 1}, 'object as key');

// 获取值
map.get('key1');  // 'value1'

// 检查键
map.has('key1');  // true

// 删除
map.delete('key1');

// 大小
map.size;  // 2

// 清空
map.clear();

// 迭代
for (const [key, value] of map) {
  console.log(key, value);
}
```

### 12.2 Set

```javascript
// 创建Set
const set = new Set([1, 2, 3, 3, 4]);

// 自动去重
console.log(set);  // Set {1, 2, 3, 4}

// 添加
set.add(5);

// 删除
set.delete(1);

// 检查
set.has(2);  // true

// 大小
set.size;  // 3

// 清空
set.clear();

// 迭代
for (const value of set) {
  console.log(value);
}
```

### 12.3 WeakMap 和 WeakSet

```javascript
// WeakMap - 弱引用的键（只能是对象）
const wm = new WeakMap();
let obj = {};
wm.set(obj, 'value');
obj = null;  // 对象可被垃圾回收

// WeakSet - 弱引用的值（只能是对象）
const ws = new WeakSet();
let obj2 = {};
ws.add(obj2);
obj2 = null;  // 对象可被垃圾回收
```

---

## 13. Symbol

### 13.1 基本用法

```javascript
// 创建唯一的Symbol
const sym1 = Symbol();
const sym2 = Symbol('description');

// 每个Symbol都是唯一的
Symbol() === Symbol();  // false

// 作为对象属性
const obj = {
  [Symbol('id')]: 123,
  normalProp: 'value'
};

// Symbol属性不会出现在for...in中
for (const key in obj) {
  console.log(key);  // 只输出 'normalProp'
}

// 获取Symbol属性
Object.getOwnPropertySymbols(obj);
```

### 13.2 内置Symbol

```javascript
// Symbol.iterator - 迭代器
const arr = [1, 2, 3];
const iterator = arr[Symbol.iterator]();

// Symbol.toStringTag - 自定义toString
class MyClass {
  get [Symbol.toStringTag]() {
    return 'MyClass';
  }
}
Object.prototype.toString.call(new MyClass());  // "[object MyClass]"

// Symbol.hasInstance - 自定义instanceof
class MyArray {
  static [Symbol.hasInstance](instance) {
    return Array.isArray(instance);
  }
}
[] instanceof MyArray;  // true
```

---

## 14. Proxy 和 Reflect

### 14.1 Proxy

```javascript
// 创建代理
const target = {name: 'Alice'};
const handler = {
  get(target, prop) {
    console.log(`Getting ${prop}`);
    return target[prop];
  },
  set(target, prop, value) {
    console.log(`Setting ${prop} to ${value}`);
    target[prop] = value;
    return true;
  }
};

const proxy = new Proxy(target, handler);
proxy.name;  // "Getting name", "Alice"
proxy.age = 25;  // "Setting age to 25"
```

### 14.2 Reflect

```javascript
// Reflect提供元编程操作
const obj = {x: 1, y: 2};

Reflect.get(obj, 'x');  // 1
Reflect.set(obj, 'z', 3);
Reflect.has(obj, 'x');  // true
Reflect.deleteProperty(obj, 'x');

// 与Proxy配合
const handler = {
  get(target, prop) {
    return Reflect.get(target, prop);  // 默认行为
  }
};
```

---

## 15. 增强的对象功能

### 15.1 Object新方法

```javascript
// Object.assign - 对象合并
const target = {a: 1};
const source1 = {b: 2};
const source2 = {c: 3};
Object.assign(target, source1, source2);
// target = {a: 1, b: 2, c: 3}

// Object.is - 严格相等判断
Object.is(NaN, NaN);  // true
Object.is(+0, -0);  // false

// Object.setPrototypeOf
const proto = {greet() { return 'Hello'; }};
const obj = {name: 'Alice'};
Object.setPrototypeOf(obj, proto);
obj.greet();  // 'Hello'
```

---

## 16. 数组扩展

### 16.1 Array新方法

```javascript
// Array.from - 类数组转数组
const arrayLike = {0: 'a', 1: 'b', length: 2};
Array.from(arrayLike);  // ['a', 'b']
Array.from('hello');  // ['h', 'e', 'l', 'l', 'o']

// Array.of - 创建数组
Array.of(1, 2, 3);  // [1, 2, 3]

// find / findIndex
[1, 2, 3, 4].find(x => x > 2);  // 3
[1, 2, 3, 4].findIndex(x => x > 2);  // 2

// fill
[1, 2, 3, 4].fill(0, 1, 3);  // [1, 0, 0, 4]

// copyWithin
[1, 2, 3, 4, 5].copyWithin(0, 3);  // [4, 5, 3, 4, 5]

// entries / keys / values
const arr = ['a', 'b', 'c'];
for (const [index, value] of arr.entries()) {
  console.log(index, value);
}
```

---

## 17. 字符串扩展

### 17.1 String新方法

```javascript
// startsWith / endsWith / includes
'Hello'.startsWith('He');  // true
'Hello'.endsWith('lo');  // true
'Hello'.includes('ell');  // true

// repeat
'abc'.repeat(3);  // 'abcabcabc'

// padStart / padEnd
'5'.padStart(3, '0');  // '005'
'5'.padEnd(3, '0');  // '500'

// 码点相关
String.fromCodePoint(0x1F600);  // 😀
'😀'.codePointAt(0);  // 128512
```

---

## 18. Number和Math扩展

### 18.1 Number新属性和方法

```javascript
// Number.EPSILON - 最小精度
Number.EPSILON;  // 2.220446049250313e-16

// Number.isFinite / isNaN（不会类型转换）
Number.isFinite('15');  // false（全局isFinite会转换）
Number.isNaN('NaN');  // false

// Number.parseInt / parseFloat
Number.parseInt('10', 10);
Number.parseFloat('3.14');

// Number.isInteger
Number.isInteger(25);  // true
Number.isInteger(25.0);  // true
Number.isInteger(25.1);  // false

// Number.isSafeInteger
Number.isSafeInteger(Math.pow(2, 53));  // false
```

### 18.2 Math新方法

```javascript
// Math.trunc - 去除小数部分
Math.trunc(4.9);  // 4
Math.trunc(-4.9);  // -4

// Math.sign - 判断正负
Math.sign(5);  // 1
Math.sign(-5);  // -1
Math.sign(0);  // 0

// Math.cbrt - 立方根
Math.cbrt(8);  // 2

// Math.hypot - 欧几里得距离
Math.hypot(3, 4);  // 5
```

---

## 19. 正则表达式扩展

### 19.1 u 修饰符（Unicode）

```javascript
// 正确处理Unicode字符
/\u{1F600}/u.test('😀');  // true

// 点号匹配任意字符
/^.$/.test('😀');  // false（没有u）
/^.$/u.test('😀');  // true（有u）
```

### 19.2 y 修饰符（粘连）

```javascript
const str = 'aaa_aa_a';
const reg = /a+/y;

reg.lastIndex = 0;
reg.exec(str);  // ['aaa']
reg.lastIndex;  // 3

reg.exec(str);  // null（因为位置3是_，不匹配）
```

### 19.3 flags 属性

```javascript
const reg = /abc/gi;
reg.flags;  // 'gi'
```

---

## 20. for...of 循环

```javascript
// 遍历数组
for (const value of [1, 2, 3]) {
  console.log(value);  // 1, 2, 3
}

// 遍历字符串
for (const char of 'hello') {
  console.log(char);  // h, e, l, l, o
}

// 遍历Map
const map = new Map([['a', 1], ['b', 2]]);
for (const [key, value] of map) {
  console.log(key, value);
}

// 遍历Set
const set = new Set([1, 2, 3]);
for (const value of set) {
  console.log(value);
}

// 可迭代对象都能用for...of
```

---

## 21. 二进制和八进制字面量

```javascript
// 二进制字面量（0b前缀）
const binary = 0b1010;  // 10

// 八进制字面量（0o前缀）
const octal = 0o755;  // 493

// ES5的八进制（0前缀）在严格模式下不再支持
```

---

## 22. Class定义详解（14.5节）

### 22.1 完整语法

```javascript
class ClassName [extends BaseClass] {
  // 静态属性（通过getter）
  static get staticProp() {
    return 'static value';
  }
  
  // 静态方法
  static staticMethod() {
    return 'static method';
  }
  
  // 构造函数（可选）
  constructor(params) {
    // 初始化实例属性
    this.property = value;
  }
  
  // 原型方法
  method() {
    return 'prototype method';
  }
  
  // getter
  get computedProp() {
    return this._value;
  }
  
  // setter
  set computedProp(value) {
    this._value = value;
  }
  
  // 生成器方法
  *generator() {
    yield 1;
    yield 2;
  }
  
  // 计算属性名
  [Symbol.iterator]() {
    // ...
  }
}
```

### 22.2 Class语法特性

**类声明不会提升：**
```javascript
const p = new Person();  // ReferenceError
class Person {}
```

**类体自动处于严格模式：**
```javascript
class C {
  method() {
    'use strict';  // 不需要，已经是严格模式
  }
}
```

**constructor规则：**
```javascript
class A {
  // constructor可选，默认为空
}

class B extends A {
  constructor() {
    super();  // 继承时必须调用super()
    // 必须在使用this之前调用super()
  }
}
```

**静态方法中的this：**
```javascript
class C {
  static method() {
    return this;  // this指向类本身，不是实例
  }
}
C.method() === C;  // true
```

### 22.3 Class vs 构造函数

**ES5构造函数：**
```javascript
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
}

Rectangle.prototype.getArea = function() {
  return this.width * this.height;
};

Rectangle.create = function(w, h) {
  return new Rectangle(w, h);
};
```

**ES6 Class：**
```javascript
class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  
  getArea() {
    return this.width * this.height;
  }
  
  static create(w, h) {
    return new Rectangle(w, h);
  }
}
```

**本质：**
- Class是语法糖，底层仍然基于原型
- 但提供了更清晰的语法和更严格的检查

---

## 23. 尾调用优化（Tail Call Optimization）

```javascript
// 尾调用
function f(x) {
  return g(x);  // 尾调用：g是最后一步操作
}

// 非尾调用
function f(x) {
  return g(x) + 1;  // 不是尾调用：还有+1操作
}

// 尾递归优化
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return factorial(n - 1, n * acc);  // 尾递归
}
```

---

## 24. ES6新增的其他特性

### 24.1 块级函数

```javascript
// ES6允许在块级作用域中声明函数
{
  function f() {
    return 'block function';
  }
  f();  // 'block function'
}
f();  // ReferenceError（块外不可见）
```

### 24.2 函数name属性

```javascript
function foo() {}
foo.name;  // 'foo'

const bar = function() {};
bar.name;  // 'bar'

const baz = function qux() {};
baz.name;  // 'qux'

const obj = {
  method() {}
};
obj.method.name;  // 'method'
```

---

## ES6与ES5的主要区别

| 特性 | ES5 | ES6 |
|-----|-----|-----|
| **变量声明** | var | let, const（块级作用域） |
| **函数** | function | 箭头函数、默认参数、剩余参数 |
| **类** | 构造函数+原型 | class, extends, super |
| **模块** | CommonJS/AMD | import/export |
| **字符串** | 拼接 | 模板字面量 |
| **解构** | 不支持 | 数组/对象解构 |
| **Promise** | 不支持 | 原生支持 |
| **迭代** | for, forEach | for...of, Iterator, Generator |
| **数据结构** | Object, Array | Map, Set, WeakMap, WeakSet, Symbol |
| **对象** | 基本字面量 | 简写、计算属性、方法简写 |

---

## 重要的语法规范章节

- **13.2** - 块级声明（let, const）
- **14.1** - 函数定义（默认参数、剩余参数）
- **14.2** - 箭头函数
- **14.5** - Class定义
- **15.2** - 模板字面量
- **15.19** - Promise对象
- **23.1** - Map对象
- **23.2** - Set对象
- **19.4** - Symbol对象
- **26.2** - 生成器函数

---

## 完整规范链接

**HTML版本：** https://262.ecma-international.org/6.0/  
**Class定义章节：** https://262.ecma-international.org/6.0/index.html#sec-class-definitions

---

*文档生成时间：2025-10-14*  
*基于 ECMA-262 6th Edition (June 2015)*

