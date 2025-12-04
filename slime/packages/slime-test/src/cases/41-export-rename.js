// 导出重命名
const privateValue = 100
function privateFunc() {
  return "secret"
}

export {privateValue as value}
export {privateFunc as func}

