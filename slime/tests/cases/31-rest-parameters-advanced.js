// 高级Rest参数
function combine(first, second, ...rest) {
  return [first, second, ...rest]
}

const spread = (...items) => {
  return [...items, ...items]
}

