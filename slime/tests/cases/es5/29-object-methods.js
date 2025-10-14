// ES5测试 - Object方法（ES5新增）

// Object.create
var proto = {
  greet: function() {
    return 'Hello';
  }
};
var obj = Object.create(proto);

// Object.keys
var person = {name: 'Alice', age: 25};
var keys = Object.keys(person);

// Object.defineProperty
var product = {};
Object.defineProperty(product, 'price', {
  value: 100,
  writable: false,
  enumerable: true,
  configurable: false
});

// Object.defineProperties
var book = {};
Object.defineProperties(book, {
  title: {
    value: 'ES5 Guide',
    writable: true
  },
  author: {
    value: 'Unknown',
    writable: false
  }
});

// Object.getOwnPropertyDescriptor
var descriptor = Object.getOwnPropertyDescriptor(product, 'price');

// Object.getOwnPropertyNames
var propNames = Object.getOwnPropertyNames(person);

// Object.freeze
var frozen = {x: 1};
Object.freeze(frozen);

// Object.seal
var sealed = {y: 2};
Object.seal(sealed);

// Object.isExtensible
var isExt = Object.isExtensible(person);

// Object.isFrozen
var isFroz = Object.isFrozen(frozen);

// Object.isSealed
var isSealed = Object.isSealed(sealed);


