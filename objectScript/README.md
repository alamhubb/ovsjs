# ObjectScript

**ObjectScript** 是一个 JavaScript/ES2025 的超集语言，为 JavaScript 添加了**真正的多继承**支持。

## 特性

- 🎯 **多继承语法** - `class A extends B, C, D`
- 🔄 **完整的 super 支持** - 按优先级或显式指定父类
- ✅ **instanceof 兼容** - 对所有父类返回 true
- 🚀 **单继承零开销** - 单继承保持原生 `extends`
- 🛡️ **编译时检测** - 重复继承等错误在编译时发现
- 📦 **自动依赖注入** - 自动注入运行时导入

## 快速开始

### 安装

```bash
npm install object-script
```

### 基本用法

```javascript
// ObjectScript 源码
class Animal {
  name = "Animal"
  eat() { return "eating" }
}

class Flyable {
  fly() { return "flying" }
}

class Swimmable {
  swim() { return "swimming" }
}

// 多继承：鸭子可以吃、飞、游泳
class Duck extends Animal, Flyable, Swimmable {
  quack() { return "quack!" }
}

const duck = new Duck()
duck.eat()   // "eating"
duck.fly()   // "flying"
duck.swim()  // "swimming"
duck.quack() // "quack!"

// instanceof 对所有父类返回 true
duck instanceof Duck      // true
duck instanceof Animal    // true
duck instanceof Flyable   // true
duck instanceof Swimmable // true
```

## 语法详解

### 1. 多继承声明

```javascript
class Child extends Parent1, Parent2, Parent3 {
  // 子类成员
}
```

### 2. 构造函数

```javascript
class Child extends Parent1, Parent2 {
  constructor(arg1, arg2) {
    // 使用 super.ClassName(args) 调用指定父类构造函数
    super.Parent1(arg1)
    super.Parent2(arg2)
  }
}
```

### 3. super 调用（方案D：混合模式）

#### 方法调用

```javascript
class Child extends B, C {
  foo() {
    // 按优先级查找（B → C）
    super.foo()
    
    // 显式指定父类
    super.B.foo()
    super.C.foo()
  }
}
```

#### 属性访问

```javascript
class Child extends B, C {
  bar() {
    // 按优先级访问
    const val = super.name
    
    // 显式指定父类
    const bName = super.B.name
    const cName = super.C.name
  }
}
```

#### 属性赋值

```javascript
class Child extends B, C {
  baz() {
    // 按优先级赋值
    super.name = "new value"
    
    // 显式指定父类
    super.B.name = "B's value"
    super.C.name = "C's value"
  }
}
```

### 4. 优先级规则

当多个父类有同名成员时，按声明顺序确定优先级：

```javascript
class A extends B, C, D {
  // 优先级：B > C > D
  // super.foo() 会调用 B.foo()（如果 B 没有则尝试 C，再没有则 D）
}
```

## 编译输出

ObjectScript 编译为标准 JavaScript：

**源码：**
```javascript
class A extends B, C {
  foo() { return super.foo() }
}
```

**编译后：**
```javascript
import {$osRuntime} from 'object-script/runtime';

class A {
  constructor() {
    $osRuntime.initParent(this, B, []);
    $osRuntime.initParent(this, C, []);
  }
  foo() {
    return $osRuntime.superCall(this, 'foo', []);
  }
}
```

## 设计理念

### 为什么需要多继承？

JavaScript 原生只支持单继承，但很多场景需要组合多个类的功能：

- **Mixin 模式**太弱 - 无法使用 `super`，无法 `instanceof`
- **组合模式**太繁琐 - 需要手动委托每个方法
- **接口**不够 - TypeScript 接口只有类型，没有实现

ObjectScript 提供**真正的多继承**，让代码更简洁、更自然。

### 设计原则

1. **兼容性优先** - 单继承保持原生行为，零开销
2. **显式优于隐式** - 可以显式指定父类 `super.B.foo()`
3. **编译时检测** - 尽可能在编译时发现错误
4. **行为可预测** - 优先级规则简单明确（声明顺序）

### 为什么选择委托模式？

我们使用**委托模式**而非修改原型链：

```
┌─────────────┐
│  子类实例 A  │
│  ┌────────┐ │     ┌──────────────┐
│  │ 父实例 B │────▶│ B.prototype  │
│  └────────┘ │     └──────────────┘
│  ┌────────┐ │     ┌──────────────┐
│  │ 父实例 C │────▶│ C.prototype  │
│  └────────┘ │     └──────────────┘
└─────────────┘
```

**优点：**
- ✅ 每个父类实例独立，避免属性冲突
- ✅ 私有字段 `#field` 自动工作
- ✅ `instanceof` 正确工作
- ✅ 支持完整的继承链

**代价：**
- ⚠️ 菱形继承时 Base 构造函数会被调用多次
- ⚠️ 轻微的性能开销（函数委托）

## 实现架构

```
┌─────────────────────────────────────────────────────────┐
│                    ObjectScript                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   Parser    │───▶│  CST→AST    │───▶│  Generator  │ │
│  │  (Subhuti)  │    │ Transformer │    │   (Slime)   │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│         │                  │                  │        │
│         ▼                  ▼                  ▼        │
│    ObjectScript       多继承转换          JavaScript    │
│      源码 (.os)        + 检测            输出 (.js)    │
├─────────────────────────────────────────────────────────┤
│                     Runtime                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │  $osRuntime: initParent, isInstanceOf,          │   │
│  │              superCall, superGet, superSet...   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 编译流程

1. **解析** - Subhuti 解析器将源码解析为 CST
2. **转换** - 检测多继承语法，转换为委托模式
3. **生成** - Slime 生成器输出标准 JavaScript

### 运行时函数

| 函数 | 说明 |
|------|------|
| `initParent(instance, Parent, args)` | 初始化父类实例并建立委托 |
| `isInstanceOf(instance, Class)` | 多继承 instanceof 检查 |
| `superCall(instance, method, args)` | 按优先级调用父类方法 |
| `superCallOn(instance, Parent, method, args)` | 调用指定父类方法 |
| `superGet(instance, prop)` | 按优先级访问父类属性 |
| `superGetOn(instance, Parent, prop)` | 访问指定父类属性 |
| `superSet(instance, prop, value)` | 按优先级设置父类属性 |
| `superSetOn(instance, Parent, prop, value)` | 设置指定父类属性 |
| `getParentClasses(instance)` | 获取所有父类列表 |
| `getParentInstance(instance, Parent)` | 获取指定父类的委托实例 |

## 支持的特性

| 特性 | 状态 | 说明 |
|------|------|------|
| 多继承声明 | ✅ | `class A extends B, C` |
| 构造函数 | ✅ | `super.B(args)` |
| 方法继承 | ✅ | 自动委托 |
| 属性继承 | ✅ | 实例属性、静态属性 |
| 方法重写 | ✅ | 子类覆盖父类 |
| 多态 | ✅ | 父类调用子类重写方法 |
| instanceof | ✅ | 对所有父类返回 true |
| 继承链 | ✅ | 支持父类的父类 |
| super 调用 | ✅ | 方法、属性访问、赋值 |
| 私有字段 | ✅ | 通过父类方法访问 |
| getter/setter | ✅ | 正确代理 |
| Symbol 属性 | ✅ | 支持 Symbol 键 |
| 静态成员 | ✅ | 复制到子类 |
| 单继承优化 | ✅ | 保持原生 extends |
| 重复继承检测 | ✅ | 编译时报错 |

## 已知限制

### 1. 菱形继承

```javascript
class Base { constructor() { console.log("Base") } }
class B extends Base { }
class C extends Base { }
class A extends B, C { }  // Base 构造函数会被调用 2 次
```

这是委托模式的固有特性。如果 Base 构造函数有副作用，需要注意。

### 2. 原型链

```javascript
Object.getPrototypeOf(a)  // 只返回 A.prototype，不反映 B、C
```

JavaScript 本身不支持多原型链。可以使用辅助方法：

```javascript
$osRuntime.getParentClasses(a)  // [B, C]
```

### 3. 性能

委托模式有轻微开销：
- 每个父类创建一个实例
- 方法调用多一层函数委托

对于大多数应用场景，这个开销可以忽略。

## 与其他方案对比

| 方案 | super 支持 | instanceof | 私有字段 | 复杂度 |
|------|-----------|------------|----------|--------|
| **ObjectScript** | ✅ 完整 | ✅ | ✅ | 低 |
| Mixin | ❌ | ❌ | ❌ | 中 |
| 组合模式 | ❌ | ❌ | ❌ | 高 |
| Proxy | 部分 | ❌ | ❌ | 高 |

## API 参考

### 运行时 API

```javascript
import { $osRuntime } from 'object-script/runtime'

// 获取实例的所有父类
const parents = $osRuntime.getParentClasses(instance)
// 返回: [Parent1, Parent2, ...]

// 获取指定父类的委托实例
const parentInstance = $osRuntime.getParentInstance(instance, Parent1)

// 检查 instanceof（支持多继承）
const isInstance = $osRuntime.isInstanceOf(instance, SomeClass)
```

## 示例

### 游戏角色系统

```javascript
class Character {
  hp = 100
  takeDamage(amount) { this.hp -= amount }
}

class Warrior {
  attack() { return "sword slash" }
}

class Mage {
  cast(spell) { return `casting ${spell}` }
}

// 战斗法师：同时拥有战士和法师能力
class BattleMage extends Character, Warrior, Mage {
  constructor() {
    super.Character()
    super.Warrior()
    super.Mage()
  }

  specialMove() {
    return this.attack() + " + " + this.cast("fireball")
  }
}

const hero = new BattleMage()
hero.attack()       // "sword slash"
hero.cast("heal")   // "casting heal"
hero.specialMove()  // "sword slash + casting fireball"
hero.takeDamage(20) // hp = 80
```

### UI 组件

```javascript
class Draggable {
  onDragStart() { /* ... */ }
  onDragEnd() { /* ... */ }
}

class Resizable {
  onResize() { /* ... */ }
}

class Clickable {
  onClick() { /* ... */ }
}

// 可拖拽、可调整大小、可点击的窗口
class Window extends Draggable, Resizable, Clickable {
  render() { /* ... */ }
}
```

## 开发

### 运行测试

```bash
cd objectScript
npx tsx src/testObjectScript.ts
```

### 项目结构

```
objectScript/
├── src/
│   ├── parser/           # ObjectScript 解析器
│   ├── factory/          # CST → AST 转换器
│   ├── runtime/          # 运行时支持
│   │   └── osRuntime.ts  # $osRuntime 实现
│   └── testObjectScript.ts
├── package.json
└── README.md
```

## License

MIT

