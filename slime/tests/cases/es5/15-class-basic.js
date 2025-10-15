// ES6新特性 - 基础类

class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  greet() {
    return `Hello, I'm ${this.name}`;
  }
  
  getAge() {
    return this.age;
  }
}

const alice = new Person('Alice', 25);
const greeting = alice.greet();

