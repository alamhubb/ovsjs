// rest参数
function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}
const result = sum(1, 2, 3, 4, 5);




