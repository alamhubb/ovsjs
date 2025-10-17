// Destructuring parameters
function greet({name, age}) {
  return name + age;
}
const result = greet({name: 'Alice', age: 25});

function sum([a, b]) {
  return a + b;
}
const total = sum([1, 2]);
