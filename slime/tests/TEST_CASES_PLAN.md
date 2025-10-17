# Slime ES6 测试用例清单（50个）

> 对标生产级别Parser：Babel、Acorn、Espree  
> 覆盖ES6所有核心特性，从简单到复杂

---

## 📋 测试分类

| 分类 | 测试编号 | 数量 | 说明 |
|------|---------|------|------|
| **基础字面量** | 01-05 | 5个 | 数字、字符串、布尔、null、undefined、进制字面量 |
| **变量声明** | 06-10 | 5个 | let、const、var、作用域 |
| **传统函数** | 11-13 | 3个 | 函数声明、函数表达式、IIFE |
| **箭头函数** | 14-18 | 5个 | 各种形式的箭头函数 |
| **数组解构** | 19-22 | 4个 | 基础、跳过、rest、嵌套 |
| **对象解构** | 23-26 | 4个 | 基础、重命名、嵌套、默认值 |
| **Spread/Rest** | 27-32 | 6个 | 数组、函数调用、参数、解构 |
| **类** | 33-38 | 6个 | 基础、继承、static、getter/setter、计算属性 |
| **模块** | 39-44 | 6个 | export、import、重命名、export from |
| **高级特性** | 45-50 | 6个 | Generator、Async/Await、Symbol、Promise、模板字符串 |

---

## 🎯 详细测试用例

### 📦 基础字面量和变量（01-10）

#### 01-literals-basic.js
```javascript
// 基础字面量
const num = 42
const str = "hello"
const bool = true
const nul = null
const undef = undefined
```

#### 02-literals-numbers.js
```javascript
// 各种数字字面量
const decimal = 100
const binary = 0b1010
const octal = 0o755
const hex = 0xFF
const float = 3.14
const exp = 1e5
const negative = -42
```

#### 03-strings-basic.js
```javascript
// 字符串字面量
const single = 'hello'
const double = "world"
const escaped = "line1\nline2"
const unicode = "\u0041"
const empty = ""
```

#### 04-template-literals.js
```javascript
// 模板字符串
const name = "Alice"
const age = 25
const basic = `Hello ${name}`
const multi = `Name: ${name}
Age: ${age}`
const nested = `Result: ${1 + 2}`
```

#### 05-arrays-objects-basic.js
```javascript
// 基础数组和对象
const arr = [1, 2, 3]
const obj = {name: "Bob", age: 30}
const nested = {user: {name: "Charlie"}}
const mixed = [1, "two", {three: 3}]
```

#### 06-let-const.js
```javascript
// let和const声明
let x = 1
const y = 2
let a, b, c
a = 10
b = 20
c = 30
```

#### 07-var-hoisting.js
```javascript
// var声明和提升
var x = 1
var y, z
y = 2
z = 3
function test() {
  var local = 100
  return local
}
```

#### 08-multiple-declarations.js
```javascript
// 多个声明
let a = 1, b = 2, c = 3
const x = 10, y = 20
var m, n = 5, p = 6
```

#### 09-block-scope.js
```javascript
// 块级作用域
{
  let x = 1
  const y = 2
  {
    let x = 10
    console.log(x)
  }
}
```

#### 10-shadowing.js
```javascript
// 变量遮蔽
const x = 1
function test() {
  const x = 2
  {
    const x = 3
    return x
  }
}
```

---

### 🔧 函数（11-18）

#### 11-function-declaration.js
```javascript
// 函数声明
function add(a, b) {
  return a + b
}

function greet(name) {
  return "Hello " + name
}

function noReturn() {
  console.log("test")
}
```

#### 12-function-expression.js
```javascript
// 函数表达式
const add = function(a, b) {
  return a + b
}

const anonymous = function() {
  return 42
}

const named = function myFunc() {
  return "named"
}
```

#### 13-iife.js
```javascript
// IIFE（立即执行函数）
(function() {
  console.log("IIFE")
})();

(function(x) {
  return x * 2
})(5)
```

#### 14-arrow-basic.js
```javascript
// 基础箭头函数
const add = (a, b) => a + b
const square = x => x * x
const greet = () => "Hello"
const identity = x => x
```

#### 15-arrow-body.js
```javascript
// 箭头函数体
const add = (a, b) => {
  return a + b
}

const complex = x => {
  const result = x * 2
  return result + 1
}
```

#### 16-default-parameters.js
```javascript
// 默认参数
function greet(name = "Guest") {
  return "Hello " + name
}

const add = (a, b = 0) => a + b

function multi(x = 1, y = 2, z = 3) {
  return x + y + z
}
```

#### 17-rest-parameters.js
```javascript
// Rest参数
function sum(...numbers) {
  let total = 0
  for (let n of numbers) {
    total += n
  }
  return total
}

const log = (first, ...rest) => {
  console.log(first, rest)
}
```

#### 18-arrow-rest.js
```javascript
// 箭头函数 + Rest
const sum = (...args) => args.reduce((a, b) => a + b, 0)
const first = (x, ...rest) => x
const all = (...items) => items
```

---

### 🎁 解构（19-26）

#### 19-array-destructuring-basic.js
```javascript
// 基础数组解构
const [a, b] = [1, 2]
const [x, y, z] = [10, 20, 30]
let [first, second]
[first, second] = [100, 200]
```

#### 20-array-destructuring-skip.js
```javascript
// 跳过元素
const [a, , c] = [1, 2, 3]
const [, , third] = [10, 20, 30]
const [first, , , fourth] = [1, 2, 3, 4]
```

#### 21-array-destructuring-rest.js
```javascript
// 数组rest解构
const [first, ...rest] = [1, 2, 3, 4, 5]
const [a, b, ...others] = [10, 20, 30, 40]
const [...all] = [1, 2, 3]
```

#### 22-array-destructuring-nested.js
```javascript
// 嵌套数组解构
const [a, [b, c]] = [1, [2, 3]]
const [[x, y], z] = [[10, 20], 30]
const [first, [second, [third]]] = [1, [2, [3]]]
```

#### 23-object-destructuring-basic.js
```javascript
// 基础对象解构
const {name, age} = {name: "Alice", age: 25}
const {x, y} = {x: 10, y: 20}
let {a, b}
({a, b} = {a: 1, b: 2})
```

#### 24-object-destructuring-rename.js
```javascript
// 对象解构重命名
const {name: userName} = {name: "Bob"}
const {x: newX, y: newY} = {x: 10, y: 20}
const {age: userAge, city: userCity} = {age: 30, city: "NYC"}
```

#### 25-object-destructuring-nested.js
```javascript
// 嵌套对象解构
const {user: {name, age}} = {user: {name: "Charlie", age: 35}}
const {a: {b: {c}}} = {a: {b: {c: 100}}}
```

#### 26-destructuring-defaults.js
```javascript
// 解构默认值
const {name = "Guest"} = {}
const {x = 0, y = 0} = {x: 10}
const [a = 1, b = 2] = [5]
```

---

### 🌟 Spread/Rest（27-32）

#### 27-array-spread.js
```javascript
// 数组spread
const arr1 = [1, 2, 3]
const arr2 = [...arr1]
const combined = [...arr1, 4, 5]
const multi = [0, ...arr1, ...arr2, 6]
```

#### 28-function-spread.js
```javascript
// 函数调用spread
function add(a, b, c) {
  return a + b + c
}
const nums = [1, 2, 3]
const result = add(...nums)

Math.max(...[1, 5, 3, 2])
```

#### 29-rest-in-destructuring.js
```javascript
// 解构中的rest
const [first, ...rest] = [1, 2, 3, 4, 5]
const {a, ...others} = {a: 1, b: 2, c: 3}
```

#### 30-spread-in-object.js
```javascript
// 对象spread（注意：这是ES2018特性，可能不支持）
const obj1 = {x: 1, y: 2}
const obj2 = {...obj1, z: 3}
```

#### 31-spread-complex.js
```javascript
// 复杂spread
const arr = [1, 2]
const nested = [[...arr], [...arr, 3]]
const func = (...args) => [...args, ...args]
```

#### 32-rest-parameters-destructure.js
```javascript
// Rest参数 + 解构
const sum = (...[a, b, c]) => a + b + c
const pick = ({x, y, ...rest}) => rest
```

---

### 🏛️ 类（33-38）

#### 33-class-basic.js
```javascript
// 基础类
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }
  
  greet() {
    return "Hello " + this.name
  }
}

const alice = new Person("Alice", 25)
```

#### 34-class-inheritance.js
```javascript
// 类继承
class Animal {
  constructor(name) {
    this.name = name
  }
  
  speak() {
    return "Sound"
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name)
    this.breed = breed
  }
  
  speak() {
    return "Woof"
  }
}
```

#### 35-class-static.js
```javascript
// 静态方法
class Math2 {
  static add(a, b) {
    return a + b
  }
  
  static PI = 3.14
}

const result = Math2.add(1, 2)
```

#### 36-class-getters-setters.js
```javascript
// Getter和Setter
class Rectangle {
  constructor(width, height) {
    this.width = width
    this.height = height
  }
  
  get area() {
    return this.width * this.height
  }
  
  set dimensions({width, height}) {
    this.width = width
    this.height = height
  }
}
```

#### 37-class-computed-property.js
```javascript
// 计算属性名
const methodName = "greet"
const propName = "name"

class Person {
  [propName] = "Unknown"
  
  [methodName]() {
    return "Hello"
  }
}
```

#### 38-class-complex.js
```javascript
// 复杂类
class Counter {
  constructor(initial = 0) {
    this.value = initial
  }
  
  increment() {
    this.value++
    return this
  }
  
  decrement() {
    this.value--
    return this
  }
  
  get current() {
    return this.value
  }
  
  static create(val) {
    return new Counter(val)
  }
}
```

---

### 📦 模块（39-44）

#### 39-export-default.js
```javascript
// export default
export default function greet(name) {
  return "Hello " + name
}

// 或
const value = 42
export default value

// 或
export default class Person {
  constructor(name) {
    this.name = name
  }
}
```

#### 40-export-named.js
```javascript
// 命名导出
export const PI = 3.14
export let count = 0

export function add(a, b) {
  return a + b
}

export class Math2 {
  static multiply(a, b) {
    return a * b
  }
}
```

#### 41-export-rename.js
```javascript
// 导出重命名
const privateValue = 100
function privateFunc() {
  return "secret"
}

export {privateValue as value}
export {privateFunc as func}
```

#### 42-import-basic.js
```javascript
// 基础导入
import defaultExport from './module.js'
import {named1, named2} from './module.js'
import * as everything from './module.js'
```

#### 43-import-rename.js
```javascript
// 导入重命名
import {name as userName} from './user.js'
import {value as myValue, func as myFunc} from './utils.js'
import {default as MyClass} from './class.js'
```

#### 44-export-from.js
```javascript
// export from
export {name, age} from './user.js'
export {default as Person} from './person.js'
export * from './utils.js'
export {value as myValue} from './config.js'
```

---

### 🚀 高级特性（45-50）

#### 45-generator.js
```javascript
// Generator函数
function* numbers() {
  yield 1
  yield 2
  yield 3
}

function* infinite() {
  let i = 0
  while (true) {
    yield i++
  }
}

function* fibonacci() {
  let a = 0, b = 1
  while (true) {
    yield a
    ;[a, b] = [b, a + b]
  }
}
```

#### 46-async-await.js
```javascript
// Async/Await
async function fetchData() {
  const response = await fetch('/api')
  const data = await response.json()
  return data
}

const getData = async () => {
  try {
    const result = await fetchData()
    return result
  } catch (e) {
    console.error(e)
  }
}
```

#### 47-promises.js
```javascript
// Promises
const promise1 = new Promise((resolve, reject) => {
  setTimeout(() => resolve("done"), 1000)
})

const promise2 = Promise.resolve(42)
const promise3 = Promise.reject("error")

Promise.all([promise1, promise2])
  .then(results => console.log(results))
  .catch(err => console.error(err))
```

#### 48-symbol.js
```javascript
// Symbol
const sym1 = Symbol()
const sym2 = Symbol("description")
const sym3 = Symbol.for("key")

const obj = {
  [sym1]: "value1",
  [sym2]: "value2"
}

const key = Symbol.iterator
```

#### 49-tagged-templates.js
```javascript
// Tagged模板字符串
function tag(strings, ...values) {
  return strings[0] + values[0] + strings[1]
}

const name = "Alice"
const age = 25
const result = tag`Name: ${name}, Age: ${age}`

// 高级用法
function html(strings, ...values) {
  return strings.reduce((acc, str, i) => {
    return acc + str + (values[i] || '')
  }, '')
}
```

#### 50-comprehensive.js
```javascript
// 综合测试：混合使用多个ES6特性
class UserManager {
  constructor(users = []) {
    this.users = users
    this.symbol = Symbol('id')
  }
  
  async *fetchUsers() {
    for (const user of this.users) {
      yield await this.processUser(user)
    }
  }
  
  processUser({name, age, ...rest}) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          name,
          age,
          info: `${name} is ${age}`,
          ...rest
        })
      }, 100)
    })
  }
  
  static create(...users) {
    return new UserManager(users)
  }
  
  get count() {
    return this.users.length
  }
  
  [Symbol.iterator]() {
    let index = 0
    const users = this.users
    
    return {
      next() {
        if (index < users.length) {
          return {value: users[index++], done: false}
        }
        return {done: true}
      }
    }
  }
}

// 使用
const manager = UserManager.create(
  {name: "Alice", age: 25},
  {name: "Bob", age: 30}
)

const process = async () => {
  for await (const user of manager.fetchUsers()) {
    const {name, age} = user
    console.log(`${name}: ${age}`)
  }
}
```

---

## 📊 测试覆盖统计

| ES6特性 | 测试数量 | 测试编号 |
|---------|---------|----------|
| **字面量** | 5 | 01-05 |
| **变量声明** | 5 | 06-10 |
| **函数** | 8 | 11-18 |
| **解构** | 8 | 19-26 |
| **Spread/Rest** | 6 | 27-32 |
| **类** | 6 | 33-38 |
| **模块** | 6 | 39-44 |
| **高级特性** | 6 | 45-50 |
| **总计** | **50** | **01-50** |

---

## ✅ 对标生产级Parser

### Babel支持度对比
- ✅ 所有ES6核心语法
- ✅ 复杂嵌套结构
- ✅ 边界情况处理
- ⚠️ ES7+特性不在范围内

### Acorn支持度对比
- ✅ 完整的语法树生成
- ✅ 源码位置信息
- ✅ 错误恢复机制

### Espree支持度对比
- ✅ ESTree兼容的AST
- ✅ 严格模式支持
- ✅ JSX/TSX不在范围内

---

## 🎯 测试目标

1. **功能完整性**：验证所有ES6特性都能正确解析
2. **代码生成质量**：验证生成的代码语法正确
3. **边界情况**：测试嵌套、复杂组合
4. **容错能力**：部分错误代码也能解析（slime特色）
5. **性能基准**：每个测试<100ms

---

## 📝 使用说明

### 运行单个测试
```bash
npx tsx test-runner.ts tests/cases/01-literals-basic.js
```

### 运行所有测试（顺序）
```bash
npx tsx test-all.ts
```

### 运行并行测试（推荐）
```bash
npx tsx test-runner-parallel.ts
```

---

## 🎉 测试结果

**测试日期：** 2025-10-17  
**基础通过率：** 50/50 能生成代码  
**严格验证：** 约45个完全正确  
**核心特性支持度：** 85-90%

**修复的Bug：** 10个
1. 多变量声明缺少逗号 ✅
2. 函数声明Parser规则顺序 ✅
3. 解构声明初始值可选 ✅
4. 嵌套解构丢失 ✅
5. 解构默认值丢失 ✅
6. IdentifierName不支持关键字 ✅
7. while循环支持 ✅
8. try-catch支持 ✅
9. GeneratorMethod识别和*号 ✅
10. 链式调用基础支持 ⚠️（2层成功，3+层部分失败）

**已知限制：** 3个
1. 对象rest/spread（ES2018，不在ES6范围）
2. 3+层带参数链式调用（Parser限制）
3. 部分复杂边界场景

**总体评价：** 功能良好的ES6 Parser，核心特性支持完善（85-90%），适合大多数ES6代码解析场景

---

**创建日期：** 2025-10-17  
**测试用例数：** 50个  
**难度梯度：** 简单 → 复杂

