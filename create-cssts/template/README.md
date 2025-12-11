# CssTs Demo

This project demonstrates **CssTs** - a compile-time CSS class management system with TypeScript support.

## Features

- 🎨 **Type-safe CSS classes** - Full IntelliSense support
- 🔧 **Compile-time processing** - No runtime overhead
- 📦 **Atomic CSS** - Compose styles from small, reusable units
- 🚀 **Tree-shakeable** - Only include used styles

## Project Structure

```
src/
├── cssts/
│   └── CssCls.ts        # Generated CSS class mappings
├── styles/
│   ├── main.css         # Actual CSS styles
│   └── styles.cssts     # CssTs declarations
├── App.vue              # Demo component
└── main.ts              # Entry point
```

## CssTs Syntax

### Atomic Styles

```typescript
// Declare atomic styles (auto-converted to kebab-case)
css colorRed      // → 'color-red'
css fontBold      // → 'font-bold'
css bgBlue        // → 'bg-blue'
```

### Composed Styles

```typescript
// Compose multiple styles
css buttonBase = { padding, rounded, fontMedium }
css primaryButton = { buttonBase, bgBlue, colorWhite }
```

### Usage in Vue

```vue
<script setup lang="ts">
import { CssCls, cls } from './cssts/CssCls'
</script>

<template>
  <button :class="cls(CssCls.primaryButton)">
    Click me
  </button>
</template>
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
