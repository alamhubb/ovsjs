# Parse Visualizer 缩进样式实际效果展示

测试代码：`let a = 1`

---

## 1️⃣ 树形线条样式（默认 `--indent=tree`）

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
            │           └─ ConditionalExpression
            │              └─ ShortCircuitExpression
            │                 └─ LogicalORExpression
            │                    └─ LogicalANDExpression
            │                       └─ BitwiseORExpression
            │                          └─ PrimaryExpression
            │                             └─ Literal
            │                                └─ NumericLiteral: "1" ✅
            └─ EmptySemicolon
```

**特点：** ✅ 美观、清晰、层级关系一目了然

---

## 2️⃣ 单空格样式（`--indent=1`）

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
         ConditionalExpression
          ShortCircuitExpression
           LogicalORExpression
            LogicalANDExpression
             BitwiseORExpression
              PrimaryExpression
               Literal
                NumericLiteral: "1" ✅
     EmptySemicolon
```

**特点：** ✅ 极简、紧凑、节省空间

---

## 3️⃣ 双空格样式（`--indent=2`）

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
                  ConditionalExpression
                    ShortCircuitExpression
                      LogicalORExpression
                        LogicalANDExpression
                          BitwiseORExpression
                            PrimaryExpression
                              Literal
                                NumericLiteral: "1" ✅
          EmptySemicolon
```

**特点：** ✅ 平衡、适中、日常推荐

---

## 4️⃣ 四空格样式（`--indent=4`）

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
                                    ConditionalExpression
                                        ShortCircuitExpression
                                            LogicalORExpression
                                                LogicalANDExpression
                                                    BitwiseORExpression
                                                        PrimaryExpression
                                                            Literal
                                                                NumericLiteral: "1" ✅
                    EmptySemicolon
```

**特点：** ✅ 层级非常明显、适合演示

---

## 复杂示例：`const x = {async: 37}`

### 树形样式（简洁模式）

```
Program
└─ VariableDeclaration
   ├─ ConstTok: "const" ✅
   ├─ VariableDeclarator
   │  ├─ BindingIdentifier
   │  │  └─ Identifier: "x" ✅
   │  └─ Initializer
   │     ├─ Eq: "=" ✅
   │     └─ AssignmentExpression
   │        └─ ObjectLiteral
   │           ├─ LBrace: "{" ✅
   │           ├─ PropertyDefinition
   │           │  ├─ PropertyName
   │           │  │  └─ LiteralPropertyName
   │           │  │     └─ AsyncTok: "async" ✅  👈 关键字作为属性名
   │           │  ├─ Colon: ":" ✅
   │           │  └─ AssignmentExpression
   │           │     └─ Literal
   │           │        └─ NumericLiteral: "37" ✅
   │           └─ RBrace: "}" ✅
   └─ EmptySemicolon
```

### 双空格样式（简洁模式）

```
Program
  VariableDeclaration
    ConstTok: "const" ✅
    VariableDeclarator
      BindingIdentifier
        Identifier: "x" ✅
      Initializer
        Eq: "=" ✅
        AssignmentExpression
          ObjectLiteral
            LBrace: "{" ✅
            PropertyDefinition
              PropertyName
                LiteralPropertyName
                  AsyncTok: "async" ✅  👈 关键字作为属性名
              Colon: ":" ✅
              AssignmentExpression
                Literal
                  NumericLiteral: "37" ✅
            RBrace: "}" ✅
    EmptySemicolon
```

---

## 🎯 使用建议

| 场景 | 推荐样式 | 命令 |
|------|----------|------|
| **日常调试** | 双空格 | `--indent=2` |
| **快速查看** | 单空格 | `--indent=1` |
| **文档/演示** | 树形线条 | `--indent=tree` |
| **演讲/PPT** | 四空格 | `--indent=4` |

---

## 📝 完整命令示例

```bash
# 日常调试（推荐）⭐
npx tsx parse-visualizer.ts "your code" --indent=2

# 快速查看
npx tsx parse-visualizer.ts "your code" --indent=1 --mode=simple

# 美观展示
npx tsx parse-visualizer.ts "your code" --indent=tree

# 高亮特定规则
npx tsx parse-visualizer.ts "const x = {async: 37}" --indent=2 --highlight=PropertyDefinition,AsyncTok
```

选择最适合你的样式！🚀

