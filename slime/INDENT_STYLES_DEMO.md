# 缩进样式演示

## 支持的缩进样式

parse-visualizer.ts 和 test-single-cst.ts 支持多种缩进样式，通过 `--indent` 参数配置。

---

## 1. 树形线条样式（默认）

```bash
npx tsx test-single-cst.ts "let a = 1" --visualize
# 或明确指定
npx tsx test-single-cst.ts "let a = 1" --visualize --indent=tree
```

**效果：**
```
Program
└─ ModuleItemList
   └─ StatementListItem
      └─ Declaration
         └─ VariableDeclaration
            ├─ VariableLetOrConst
            │  └─ LetTok: "let" ✅
            ├─ VariableDeclarationList
            │  └─ VariableDeclarator
            │     ├─ BindingIdentifier
            │     │  └─ Identifier: "a" ✅
            │     └─ Initializer
            │        ├─ Eq: "=" ✅
            │        └─ AssignmentExpression
                       ...
```

**特点：**
- ✅ 美观，易读
- ✅ 清晰显示层级关系
- ✅ 使用 `│  `, `├─`, `└─` 字符
- ✅ 适合：复杂结构、演示、文档

---

## 2. 单空格样式

```bash
npx tsx test-single-cst.ts "let a = 1" --visualize --indent=1
```

**效果：**
```
Program
 ModuleItemList
  StatementListItem
   Declaration
    VariableDeclaration
     VariableLetOrConst
      LetTok: "let" ✅
     VariableDeclarationList
      VariableDeclarator
       BindingIdentifier
        Identifier: "a" ✅
       Initializer
        Eq: "=" ✅
        AssignmentExpression
         ...
```

**特点：**
- ✅ 极简风格
- ✅ 节省空间
- ✅ 每层只增加1个空格
- ✅ 适合：简单结构、快速查看、终端宽度有限

---

## 3. 双空格样式

```bash
npx tsx test-single-cst.ts "let a = 1" --visualize --indent=2
```

**效果：**
```
Program
  ModuleItemList
    StatementListItem
      Declaration
        VariableDeclaration
          VariableLetOrConst
            LetTok: "let" ✅
          VariableDeclarationList
            VariableDeclarator
              BindingIdentifier
                Identifier: "a" ✅
              Initializer
                Eq: "=" ✅
                AssignmentExpression
                  ...
```

**特点：**
- ✅ 平衡美观和空间
- ✅ 层级清晰
- ✅ 每层增加2个空格
- ✅ 适合：日常调试、中等复杂度结构

---

## 4. 四空格样式

```bash
npx tsx test-single-cst.ts "let a = 1" --visualize --indent=4
```

**效果：**
```
Program
    ModuleItemList
        StatementListItem
            Declaration
                VariableDeclaration
                    VariableLetOrConst
                        LetTok: "let" ✅
                    VariableDeclarationList
                        VariableDeclarator
                            BindingIdentifier
                                Identifier: "a" ✅
                            Initializer
                                Eq: "=" ✅
                                AssignmentExpression
                                    ...
```

**特点：**
- ✅ 层级非常明显
- ❌ 占用较多横向空间
- ✅ 每层增加4个空格
- ✅ 适合：演示、PPT、大屏幕

---

## 5. 自定义样式

你还可以使用自定义字符串作为缩进：

```bash
# 使用 Tab 字符
npx tsx test-single-cst.ts "let a = 1" --visualize --indent="\\t"

# 使用点号
npx tsx test-single-cst.ts "let a = 1" --visualize --indent="·"

# 使用任意字符串
npx tsx test-single-cst.ts "let a = 1" --visualize --indent="---"
```

---

## 样式对比总结

| 样式 | 参数 | 每层缩进 | 适用场景 |
|------|------|----------|----------|
| **树形线条** | `--indent=tree` 或不指定 | `│  ` + 连接符 | 默认推荐、复杂结构 |
| **单空格** | `--indent=1` | 1个空格 | 极简、空间有限 |
| **双空格** | `--indent=2` | 2个空格 | 日常调试、平衡美观 |
| **四空格** | `--indent=4` | 4个空格 | 演示、层级明显 |
| **自定义** | `--indent="xxx"` | 自定义字符 | 特殊需求 |

---

## 使用建议

### 日常调试
```bash
npx tsx test-single-cst.ts "your code" --visualize --indent=2
```

### 文档/演示
```bash
npx tsx test-single-cst.ts "your code" --visualize --indent=tree
```

### 快速查看
```bash
npx tsx test-single-cst.ts "your code" --visualize --indent=1 --mode=simple
```

### 组合使用
```bash
# 简洁模式 + 2空格 + 高亮
npx tsx test-single-cst.ts "obj.async" --visualize --mode=simple --indent=2 --highlight=PropertyDefinition,AsyncTok
```

---

## 完整示例

对比同一段代码的不同缩进样式：

```bash
# 测试代码
CODE="const x = {async: 37}"

# 树形样式
npx tsx test-single-cst.ts "$CODE" --visualize --indent=tree

# 2空格样式
npx tsx test-single-cst.ts "$CODE" --visualize --indent=2

# 1空格样式（最紧凑）
npx tsx test-single-cst.ts "$CODE" --visualize --indent=1
```

选择最适合你需求的样式！🎨



