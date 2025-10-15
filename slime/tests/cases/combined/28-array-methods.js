// 阶段3：复杂特性 - 数组方法

var numbers = [1, 2, 3, 4, 5];

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

