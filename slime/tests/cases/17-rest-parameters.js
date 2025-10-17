// Rest参数
function sum(...numbers) {
  let total = 0
  for (let n of numbers) {
    total += n
  }
  return total
}

const log = (first, ...rest) => {
  console.log(first, rest)
}

