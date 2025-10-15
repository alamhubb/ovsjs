// 阶段1：基础语法 - 对象和数组

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

// 数组字面量
var numbers = [1, 2, 3, 4, 5];
var mixed = [1, 'two', true, null];

// 嵌套数组
var matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
];

// 数组访问
var first = numbers[0];
var last = numbers[numbers.length - 1];

