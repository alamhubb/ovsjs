// 标签模板（基础语法）
function tag(strings, ...values) {
  return strings[0] + values[0] + strings[1];
}

const name = "Alice";
const result = tag`Hello ${name}!`;

// 简单标签函数
function upper(strings, ...values) {
  return values[0].toUpperCase();
}

const greeting = upper`name: ${name}`;






