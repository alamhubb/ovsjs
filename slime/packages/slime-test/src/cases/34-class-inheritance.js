// 类继承
class Animal {
  constructor(name) {
    this.name = name
  }
  
  speak() {
    return "Sound"
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name)
    this.breed = breed
  }
  
  speak() {
    return "Woof"
  }
}

