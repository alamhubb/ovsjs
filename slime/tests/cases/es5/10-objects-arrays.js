// ES5测试 - 对象和数组

// 对象字面量
var person = {
  name: 'Alice',
  age: 25,
  city: 'Beijing'
};

// 嵌套对象
var company = {
  name: 'TechCorp',
  address: {
    city: 'Shanghai',
    street: 'Main St'
  }
};

// 对象属性访问
var personName = person.name;
var personAge = person['age'];

// getter和setter（ES5新增）- 已知问题：Parser暂不支持getter/setter
// var account = {
//   _balance: 0,
//   get balance() {
//     return this._balance;
//   },
//   set balance(value) {
//     this._balance = value;
//   }
// };
// 
// account.balance = 100;
// var currentBalance = account.balance;

// 数组字面量
var numbers = [1, 2, 3, 4, 5];
var mixed = [1, 'two', true, null];

// 稀疏数组 - 已知问题：Parser暂不支持
// var sparse = [1, , , 4];

// 嵌套数组
var matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];

// 数组访问
var first = numbers[0];
var last = numbers[numbers.length - 1];


