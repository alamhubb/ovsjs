// 复杂spread
const arr = [1, 2]
const nested = [[...arr], [...arr, 3]]
const func = (...args) => [...args, ...args]

