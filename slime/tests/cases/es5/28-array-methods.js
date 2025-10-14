// ES5测试 - 数组方法（ES5新增）

var numbers = [1, 2, 3, 4, 5];

// forEach
numbers.forEach(function(n) {
  console.log(n);
});

// map
var doubled = numbers.map(function(n) {
  return n * 2;
});

// filter
var evens = numbers.filter(function(n) {
  return n % 2 === 0;
});

// reduce
var sum = numbers.reduce(function(acc, n) {
  return acc + n;
}, 0);

// some
var hasLarge = numbers.some(function(n) {
  return n > 3;
});

// every
var allPositive = numbers.every(function(n) {
  return n > 0;
});

// indexOf
var index = numbers.indexOf(3);

// lastIndexOf
var arr = [1, 2, 3, 2, 1];
var lastIndex = arr.lastIndexOf(2);


