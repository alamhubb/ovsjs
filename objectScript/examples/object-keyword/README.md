# object 关键字示例

## 文件说明

| 文件 | 说明 |
|------|------|
| `source.os` | ObjectScript 源码 |
| `compiled.js` | 编译后的 JavaScript 代码 |

## 转换规则

### 基本 object 声明

```
源码:
object AppConfig {
  name = "MyApp"
  getInfo() { return this.name }
}

编译后:
import { $osRuntime } from 'object-script/runtime';

class $$OsClassAppConfig_uuid {
  name = "MyApp";
  getInfo() { return this.name; }
}
const AppConfig = new $$OsClassAppConfig_uuid();
$osRuntime.setObjectClass(AppConfig, $$OsClassAppConfig_uuid);
```

### object 继承 object（新功能！）

```
源码:
object BaseConfig { debug = false }
object DevConfig extends BaseConfig { debug = true }

编译后:
// BaseConfig 保存其类引用
$osRuntime.setObjectClass(BaseConfig, $$OsClassBaseConfig_xxx);

// DevConfig 继承时通过 getObjectClass 获取 BaseConfig 的类
class $$OsClassDevConfig_xxx extends $osRuntime.getObjectClass(BaseConfig) {
  debug = true;
}
```

`getObjectClass(target)` 函数：
- 如果 target 是 object 实例，返回其保存的类
- 如果 target 是 class，直接返回

## 运行编译后的代码

```bash
node compiled.js
```

## 软关键字说明

`object` 是软关键字（上下文关键字），意味着：

1. 在声明语句开头时，它是关键字：`object MyConfig { }`
2. 在其他位置，它可以作为普通变量名：`const object = {}`

这与 JavaScript 中的 `get`、`set`、`of` 等软关键字行为一致。
