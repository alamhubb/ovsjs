class Bird extends Animal, Flyable {
  name = "bird"
  
  speak() {
    return "Tweet!"
  }
  
  // 使用 super 调用父类方法
  describe() {
    return super.greet() + " and I can " + super.fly()
  }
}