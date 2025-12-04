// 基础类
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }
  
  greet() {
    return "Hello " + this.name
  }
}

const alice = new Person("Alice", 25)

