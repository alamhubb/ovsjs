/**
 * ObjectScript 编译后的 JavaScript 代码
 *
 * 源文件: source.os
 *
 * 转换规则:
 *   object Name { ... }
 *   →  class $$OsClassName_uuid { ... }
 *   →  const Name = new $$OsClassName_uuid()
 *   →  $osRuntime.setObjectClass(Name, $$OsClassName_uuid)
 *
 *   object Child extends Parent { ... }
 *   →  class $$OsClassChild_uuid extends $osRuntime.getObjectClass(Parent) { ... }
 */

import { $osRuntime } from 'object-script/runtime';

// ============================================
// 示例 1: 基本 object 声明
// ============================================
// 源码: object AppConfig { ... }
// ↓↓↓ 编译后 ↓↓↓
class $$OsClassAppConfig_a1b2c3_0 {
  name = "MyApp";
  version = "1.0.0";

  getInfo() {
    return this.name + ' v' + this.version;
  }
}
const AppConfig = new $$OsClassAppConfig_a1b2c3_0();
$osRuntime.setObjectClass(AppConfig, $$OsClassAppConfig_a1b2c3_0);

// ============================================
// 示例 2: object 继承 class
// ============================================
class BaseLogger {
  prefix = "[LOG]";

  log(message) {
    console.log(this.prefix + " " + message);
  }
}

// 源码: object Logger extends BaseLogger { ... }
// ↓↓↓ 编译后 ↓↓↓
// getObjectClass(BaseLogger) 检测到 BaseLogger 是 class，直接返回它
class $$OsClassLogger_d4e5f6_1 extends $osRuntime.getObjectClass(BaseLogger) {
  prefix = "[APP]";

  info(message) {
    this.log("INFO: " + message);
  }

  error(message) {
    this.log("ERROR: " + message);
  }
}
const Logger = new $$OsClassLogger_d4e5f6_1();
$osRuntime.setObjectClass(Logger, $$OsClassLogger_d4e5f6_1);

// ============================================
// 示例 3: object 继承 object （新功能！）
// ============================================
// 源码: object BaseConfig { ... }
class $$OsClassBaseConfig_g7h8i9_2 {
  debug = false;
  env = "production";
}
const BaseConfig = new $$OsClassBaseConfig_g7h8i9_2();
$osRuntime.setObjectClass(BaseConfig, $$OsClassBaseConfig_g7h8i9_2);

// 源码: object DevConfig extends BaseConfig { ... }
// ↓↓↓ 编译后 ↓↓↓
// getObjectClass(BaseConfig) 检测到 BaseConfig 是 object 实例，
// 返回其保存的类 $$OsClassBaseConfig_g7h8i9_2
class $$OsClassDevConfig_j0k1l2_3 extends $osRuntime.getObjectClass(BaseConfig) {
  debug = true;
  env = "development";
  apiUrl = "http://localhost:3000";
}
const DevConfig = new $$OsClassDevConfig_j0k1l2_3();
$osRuntime.setObjectClass(DevConfig, $$OsClassDevConfig_j0k1l2_3);

// 源码: object ProdConfig extends BaseConfig { ... }
class $$OsClassProdConfig_m3n4o5_4 extends $osRuntime.getObjectClass(BaseConfig) {
  apiUrl = "https://api.example.com";
}
const ProdConfig = new $$OsClassProdConfig_m3n4o5_4();
$osRuntime.setObjectClass(ProdConfig, $$OsClassProdConfig_m3n4o5_4);

// ============================================
// 示例 4: 软关键字特性 - object 可作为变量名
// ============================================
// 源码保持不变（object 在这里是普通标识符）
const object = { type: "plain object" };
let object2 = 123;

// ============================================
// 使用示例
// ============================================
console.log(AppConfig.name);        // "MyApp"
console.log(AppConfig.getInfo());   // "MyApp v1.0.0"

Logger.info("Application started"); // "[APP] INFO: Application started"
Logger.error("Something wrong");    // "[APP] ERROR: Something wrong"

console.log(DevConfig.debug);       // true
console.log(DevConfig.env);         // "development"
console.log(ProdConfig.debug);      // false (继承自 BaseConfig)
console.log(ProdConfig.apiUrl);     // "https://api.example.com"

console.log(object.type);           // "plain object"

