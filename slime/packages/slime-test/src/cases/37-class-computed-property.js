// 计算属性名
const methodName = "greet"
const propName = "name"

class Person {
  constructor() {
    this[propName] = "Unknown"
  }
  
  [methodName]() {
    return "Hello"
  }
}

