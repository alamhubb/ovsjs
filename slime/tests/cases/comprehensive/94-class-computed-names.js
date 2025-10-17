// 计算属性名
const methodName = 'greet';
class Person {
  [methodName]() {
    return 'Hello';
  }
}
const p = new Person();






