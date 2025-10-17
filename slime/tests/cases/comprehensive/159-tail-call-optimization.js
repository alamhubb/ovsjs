// Tail call optimization syntax
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return factorial(n - 1, n * acc);
}
const result = factorial(5);


