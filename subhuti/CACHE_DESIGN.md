# Packrat 缓存设计说明

## ✅ 最终设计：统一缓存类

### 核心理念

**单一实现 + 配置参数 > 多个实现类**

```typescript
// ✅ 最优：统一类 + 配置
new PackratCache({ maxSize: 10000 })    // LRU
new PackratCache({ maxSize: Infinity })  // Unlimited

// ❌ 冗余：多个类
new LRUCache(10000)
new UnlimitedCache()
```

---

## 📊 设计对比

### 方案A：多个类（已弃用）

```
文件结构：
├── IPackratCache.ts     (接口，40 行)
├── LRUCache.ts          (LRU 实现，145 行)
└── UnlimitedCache.ts    (Unlimited 实现，91 行)

总计：276 行，3 个文件
```

**问题：**
- ❌ 文件冗余（3 个文件）
- ❌ 代码重复（两个类 80% 相同）
- ❌ 用户需要记住两个类名
- ❌ 接口抽象过度（99% 用户不需要自定义）

### 方案B：统一类（✅ 最终方案）

```
文件结构：
└── PackratCache.ts      (统一实现，180 行)

总计：180 行，1 个文件
```

**优势：**
- ✅ 单一文件（简洁）
- ✅ 无代码重复
- ✅ 配置化（更灵活）
- ✅ 默认最优（LRU 10000）

---

## 🎯 使用方式

### 99% 场景：零配置

```typescript
// ✅ 不需要任何配置
const parser = new MyParser(tokens)
// 内部自动使用：LRU(10000)
```

### 1% 场景：自定义配置

```typescript
// 大文件
new MyParser(tokens, undefined, { maxSize: 50000 })

// 超大文件
new MyParser(tokens, undefined, { maxSize: 100000 })

// 无限缓存（小文件 + 内存充足）
new MyParser(tokens, undefined, { maxSize: Infinity })
```

---

## 📈 行业对比

| 框架 | 设计方式 | 文件数 | 评价 |
|-----|---------|-------|------|
| **Subhuti** | 统一类 + 配置 | 1 | ✅ 最优 |
| PEG.js | 单一实现 | 1 | ✅ 简洁 |
| Chevrotain | 无 Packrat | 0 | - |
| ANTLR | 无 Packrat | 0 | - |

---

## 🏆 最终结论

**统一类 + 配置参数 = 最佳实践**

理由：
1. ✅ 代码量最少（180 行 vs 276 行，减少 35%）
2. ✅ 用户最简单（配置参数 vs 类选择）
3. ✅ 维护最容易（单一文件）
4. ✅ 扩展最灵活（配置可扩展）

参考：
- Node.js `crypto.createHash()` - 单一方法 + 算法参数
- Web `fetch(url, options)` - 单一方法 + 配置对象
- TypeScript `tsc --options` - 单一命令 + 配置参数

