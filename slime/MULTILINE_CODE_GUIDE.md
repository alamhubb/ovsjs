# 多行代码测试指南

## 🎯 问题

如何在 `test-single-cst.ts` 中测试包含模板字符串的多行代码？

```javascript
class Employee {
    getInfo() {
        return `${this.name} (ID: ${this.id}): $${this.salary}`
    }
}
```

## ✅ 三种方案对比

### 方案1：从文件读取（🏆 最推荐）

**步骤：**
1. 创建测试文件 `test-code-employee.js`
2. 直接写正常的 JavaScript 代码
3. 运行测试：`npx tsx test-single-cst.ts test-code-employee.js`

**优点：**
- ✅ 零转义 - 代码完全自然
- ✅ 编辑器语法高亮
- ✅ 可复用测试文件
- ✅ 易于维护

**示例：**
```bash
# 创建测试文件
cat > test-code-employee.js << 'EOF'
class Employee {
    getInfo() {
        return `${this.name} (ID: ${this.id}): $${this.salary}`
    }
}
EOF

# 运行测试
npx tsx test-single-cst.ts test-code-employee.js
```

### 方案2：普通字符串（⭐ 简单场景推荐）

**代码：**
```typescript
const code = 'class Employee {\n' +
    '    getInfo() {\n' +
    '        return `${this.name} (ID: ${this.id}): $${this.salary}`\n' +
    '    }\n' +
    '}'
```

**优点：**
- ✅ 不需要转义 `${}`
- ✅ 适合临时测试

**缺点：**
- ❌ 手动添加 `\n` 换行符
- ❌ 拼接字符串麻烦

### 方案3：模板字符串完全转义（不推荐）

**代码：**
```typescript
const code = `class Employee {
    getInfo() {
        return \\\`\${this.name} (ID: \${this.id}): $\${this.salary}\\\`
    }
}`
```

**优点：**
- ✅ 保留格式

**缺点：**
- ❌ 需要转义 `\`` → `\\\``
- ❌ 需要转义 `${` → `\${`
- ❌ 繁琐易错

### ❌ 错误方案：String.raw（陷阱！）

**代码：**
```typescript
const code = String.raw`
class Employee {
    getInfo() {
        return \`${this.name} (ID: ${this.id}): $${this.salary}\`
    }
}`
```

**为什么错误：**
- ❌ `String.raw` 只保留反斜杠，**不保留 `${}`**
- ❌ `${this.name}` 依然会被求值！
- ❌ 结果：`return \`undefined (ID: undefined): $undefined\``

**正确理解 String.raw：**
```javascript
String.raw`\n`     // → "\\n" (两个字符，不是换行)
String.raw`${x}`   // → x的值（依然求值！）
String.raw`\${x}`  // → "${x}" (字面文本)
```

## 📊 方案对比表

| 方案 | 零转义 | 语法高亮 | 可复用 | 适用场景 |
|------|--------|----------|--------|----------|
| 🏆 从文件读取 | ✅ | ✅ | ✅ | 多行代码、重复测试 |
| ⭐ 普通字符串 | ✅ | ❌ | ❌ | 单行代码、临时测试 |
| ⚠️  完全转义 | ❌ | ❌ | ❌ | 不推荐 |
| ❌ String.raw | ❌ | ❌ | ❌ | 错误方案 |

## 🚀 推荐使用方式

### 场景1：快速测试单行代码
```bash
npx tsx test-single-cst.ts "let a = 1"
```

### 场景2：测试多行代码（临时）
```bash
# 创建临时文件
echo 'class Test { method() {} }' > temp-test.js

# 测试
npx tsx test-single-cst.ts temp-test.js

# 清理
rm temp-test.js
```

### 场景3：测试复杂代码（重复使用）
```bash
# 1. 创建测试文件（只需一次）
cat > test-cases/my-test.js << 'EOF'
class Employee {
    constructor(id, name, salary) {
        this.id = id
        this.name = name
        this.salary = salary
    }
    
    getInfo() {
        return `${this.name} (ID: ${this.id}): $${this.salary}`
    }
}
EOF

# 2. 重复测试（无需修改）
npx tsx test-single-cst.ts test-cases/my-test.js
```

### 场景4：无参数运行（默认测试）
```bash
# 会自动加载 test-code-employee.js
npx tsx test-single-cst.ts
```

## 💡 核心原则

1. **永远不要嵌套模板字符串** - 会导致求值问题
2. **优先从文件读取** - 零转义，最自然
3. **避免 String.raw** - 对 `${}` 无效
4. **简单代码用命令行** - 快速方便

## 🎓 关键理解

### JavaScript 模板字符串规则

```javascript
// 规则1：反引号创建模板字符串
`Hello`  // 模板字符串

// 规则2：${} 会立即求值
const name = 'Alice'
`Hello ${name}`  // → "Hello Alice"

// 规则3：转义保留字面文本
`\``      // → "`"
`\${x}`   // → "${x}"
`\\`      // → "\"

// 规则4：String.raw 只保留反斜杠
String.raw`\n`     // → "\\n"
String.raw`${x}`   // → x的值（依然求值！）
String.raw`\${x}`  // → "${x}"
```

### 为什么 String.raw 不能解决问题

```javascript
// ❌ 错误理解
String.raw`return \`${this.name}\``
// 期望：return `${this.name}`
// 实际：return `undefined` （${this.name} 被求值了）

// ✅ 正确写法（但很麻烦）
String.raw`return \`\${this.name}\``
// 结果：return `${this.name}`
// 但是既然要转义 \${，不如直接用普通字符串

// ⭐ 更简单的方案
'return `${this.name}`'
// 结果：return `${this.name}`
// 零转义！
```

## 📚 延伸阅读

- [MDN: Template literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
- [MDN: String.raw](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw)

## 🎉 总结

**一句话：包含模板字符串的多行代码，从文件读取最简单！** 🏆

