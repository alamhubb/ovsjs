// Spread/Rest混合
const arr1 = [1, 2]
const arr2 = [3, 4]
const combined = [...arr1, ...arr2]

function test(...args) {
  const [first, ...rest] = args
  return [...rest, first]
}

