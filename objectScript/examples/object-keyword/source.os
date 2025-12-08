/**
 * ObjectScript object 关键字示例
 *
 * object 是一个软关键字，用于声明单例对象
 * 编译后会生成一个临时类和一个 const 实例
 */

// ============================================
// 示例 1: 基本 object 声明
// ============================================
object AppConfig {
  name = "MyApp"
  version = "1.0.0"

  getInfo() {
    return this.name + ' v' + this.version
  }
}

// ============================================
// 示例 2: object 继承 class
// ============================================
class BaseLogger {
  prefix = "[LOG]"

  log(message) {
    console.log(this.prefix + " " + message)
  }
}

object Logger extends BaseLogger {
  prefix = "[APP]"

  info(message) {
    this.log("INFO: " + message)
  }

  error(message) {
    this.log("ERROR: " + message)
  }
}

// ============================================
// 示例 3: object 继承 object （新功能！）
// ============================================
object BaseConfig {
  debug = false
  env = "production"
}

object DevConfig extends BaseConfig {
  debug = true
  env = "development"
  apiUrl = "http://localhost:3000"
}

object ProdConfig extends BaseConfig {
  apiUrl = "https://api.example.com"
}

// ============================================
// 示例 4: 软关键字特性 - object 可作为变量名
// ============================================
const object = { type: "plain object" }
let object2 = 123

// ============================================
// 使用示例
// ============================================
console.log(AppConfig.name)        // "MyApp"
console.log(AppConfig.getInfo())   // "MyApp v1.0.0"

Logger.info("Application started")  // "[APP] INFO: Application started"
Logger.error("Something wrong")     // "[APP] ERROR: Something wrong"

console.log(DevConfig.debug)       // true
console.log(DevConfig.env)         // "development"
console.log(ProdConfig.debug)      // false (继承自 BaseConfig)
console.log(ProdConfig.apiUrl)     // "https://api.example.com"

console.log(object.type)           // "plain object"

