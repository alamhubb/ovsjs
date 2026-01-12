// ObjectScript 多继承测试文件

// 基类 A - 提供 foo 方法
class Animal {
  name = "animal"
  
  speak() {
    return "..."
  }
  
  greet() {
    return "Hello, I'm " + this.name
  }
}

// 基类 B - 提供 bar 方法
class Flyable {
  canFly = true
  
  fly() {
    return "Flying!"
  }
}

// 多继承类 C - 同时继承 A 和 B
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

// object 单例声明
object Config {
  debug = true
  version = "1.0.0"
  
  getInfo() {
    return "v" + this.version + (this.debug ? " (debug)" : "")
  }
}

// 测试代码
const bird = new Bird()
console.log(bird.speak())      // Tweet!
console.log(bird.fly())        // Flying!
console.log(bird.describe())   // Hello, I'm bird and I can Flying!
console.log(Config.getInfo())  // v1.0.0 (debug)

