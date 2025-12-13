# cssts-types

> TypeScript type definitions for CssTs atomic styles

## 概述

这个包提供 CssTs 原子类的 TypeScript 类型定义，支持：
- IDE 代码补全
- 类型检查
- `css {}` 语法中的全局变量声明

## 文件结构

```
cssts-types/
├── index.d.ts          # 入口文件（聚合导出）
├── CsstsAtoms.d.ts     # 原子类接口定义（自动生成）
├── global.d.ts         # 全局变量声明（自动生成）
├── runtime.d.ts        # 运行时工具类型
├── dist/
│   └── properties.json # CSS 属性配置
└── src/
    ├── generator/      # 生成器源代码
    └── tests/          # 测试文件
```

## 自动生成

类型定义由 `src/generator/csstree-generator.ts` 从 css-tree 自动生成：

```bash
npm run generate
```

生成的文件：
- `CsstsAtoms.d.ts` - 所有原子类的接口定义
- `global.d.ts` - 全局变量声明

## 命名规范

| TS 变量名 | CSS 类名 | CSS 规则 |
|-----------|----------|----------|
| `displayFlex` | `display_flex` | `display: flex` |
| `height32px` | `height_32px` | `height: 32px` |
| `colorWhite` | `color_white` | `color: white` |

特殊字符处理：
- 小数点: `p` 代替（`1.25` → `1p25`）
- 百分号: `pct` 代替（`50%` → `50pct`）
- 负数: `n` 前缀（`-1` → `n1`）

## 使用

```typescript
// 在 tsconfig.json 中添加
{
  "compilerOptions": {
    "types": ["cssts-types/global"]
  }
}

// 然后在 css {} 中直接使用
const style = css {
  displayFlex,
  alignItemsCenter,
  height32px
}
```

## License

MIT
