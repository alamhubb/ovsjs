// 箭头函数 + Rest
const sum = (...args) => args.reduce((a, b) => a + b, 0)
const first = (x, ...rest) => x
const all = (...items) => items

