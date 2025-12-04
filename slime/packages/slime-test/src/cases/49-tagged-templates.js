// Tagged模板字符串
function tag(strings, ...values) {
  return strings[0] + values[0] + strings[1]
}

const name = "Alice"
const age = 25
const result = tag`Name: ${name}, Age: ${age}`

function html(strings, ...values) {
  return strings.reduce((acc, str, i) => {
    return acc + str + (values[i] || '')
  }, '')
}

