// rest和spread组合
function wrap(...args) {
  return [...args, 'end'];
}
const result = wrap(1, 2, 3);




