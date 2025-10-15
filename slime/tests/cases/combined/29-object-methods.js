// 阶段3：复杂特性 - 对象方法

var person = {
  name: 'Alice',
  age: 25
};

// Object.keys
var keys = Object.keys(person);

// Object.values (ES2017，可能不支持)
// var values = Object.values(person);

// Object.create
var obj = Object.create(null);
obj.prop = 'value';

// hasOwnProperty
var hasProp = person.hasOwnProperty('name');

// Object.defineProperty
Object.defineProperty(obj, 'readOnly', {
  value: 42,
  writable: false
});

