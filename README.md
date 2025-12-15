# OVS - Object View Script

> **OVS** - A pure JavaScript declarative UI, a Vue DSL that lets you write Vue with a more concise, elegant, and flexible syntax, inspired by Kotlin-HTML, SwiftUI, and SolidJS.

[![Documentation](https://img.shields.io/badge/docs-deepwiki-blue)](https://deepwiki.com/alamhubb/ovsjs/)
[![VSCode Extension](https://img.shields.io/badge/VSCode-Extension-007ACC?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=alamhubb.ovs-language)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

**English** | [中文](README_zh.md)

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#basic-syntax">Basic Syntax</a> •
  <a href="#advanced-usage">Advanced Usage</a> •
  <a href="#design-philosophy">Design Philosophy</a> •
  <a href="#compilation-principles">Compilation Principles</a>
</p>

---

## Introduction

OVS is a declarative UI syntax extension that lets you write Vue components in a more concise way:

```javascript
// OVS syntax
div(class = 'container') {
  h1 { 'Hello OVS!' }
  button(onClick() { handleClick() }) { 'Click Me' }
}
```

**Features:**
- ✅ **Pure JavaScript Superset** - All JS syntax works
- ✅ **Zero Template Directives** - No `v-if`, `v-for`, just native `if/for`
- ✅ **No JSX Required** - Native brace syntax, no `className`, no `{}`  wrapping
- ✅ **Full IDE Support** - Code completion, type checking, go to definition
- ✅ **Vue 3 Runtime** - Compiles to efficient Vue render functions

---

## Why OVS?

OVS solves the flexibility problem of Vue templates while being more elegant than JSX.

### Vue Template vs JSX vs OVS

**Conditional Rendering:**

```javascript
// ❌ Vue Template - Custom directives, limited flexibility
<template>
  <div v-if="isLoggedIn">Welcome, {{ username }}</div>
  <div v-else>Please login</div>
</template>

// ❌ JSX - Ternary expressions, hard to read when nested
{isLoggedIn ? <div>Welcome, {username}</div> : <div>Please login</div>}

// ✅ OVS - Native JavaScript, clean and intuitive
if (isLoggedIn) {
  div { `Welcome, ${username}` }
} else {
  div { 'Please login' }
}
```

**List Rendering:**

```javascript
// ❌ Vue Template - v-for directive, special :key syntax
<template>
  <ul>
    <li v-for="item in items" :key="item.id">{{ item.name }}</li>
  </ul>
</template>

// ❌ JSX - .map() callback, requires return and key prop
<ul>
  {items.map(item => <li key={item.id}>{item.name}</li>)}
</ul>

// ✅ OVS - Native for...of, straightforward
ul {
  for (const item of items) {
    li { item.name }
  }
}
```

**Complex Logic:**

```javascript
// ❌ Vue Template - Need computed properties or methods for complex logic
// ❌ JSX - Inline logic becomes messy with && and ternary chains

// ✅ OVS - Just write JavaScript!
div {
  const total = items.reduce((sum, item) => sum + item.price, 0)

  if (total > 100) {
    span(class = 'discount') { 'Free shipping!' }
  }

  for (const item of items) {
    if (item.inStock) {
      ProductCard(product = item) { }
    }
  }
}
```

### Key Advantages

| Feature | Vue Template | JSX | OVS |
|---------|-------------|-----|-----|
| Control Flow | `v-if`, `v-for` directives | `&&`, `? :`, `.map()` | Native `if`, `for` |
| Class Attribute | `class` | `className` | `class` |
| Expression Syntax | `{{ }}` | `{ }` | Direct reference |
| Learning Curve | Template syntax | JSX rules | Just JavaScript |
| Flexibility | Limited | High | High |
| Readability | Good for simple | Complex nesting | Clean & intuitive |

---

## Quick Start

### 1. Create Project

```bash
npm create ovs@latest my-app
cd my-app
npm install
npm run dev
```

### 2. Install VSCode Extension

Install **[Ovs Language](https://marketplace.visualstudio.com/items?itemName=alamhubb.ovs-language)** from VSCode Extensions Marketplace.

### 3. Start Writing

Create a `.ovs` file:

```javascript
// src/components/Hello.ovs
import { ref } from 'vue'

const count = ref(0)

div(class = 'hello') {
  h1 { 'Hello OVS!' }
  p { `Count: ${count.value}` }
  button(onClick() { count.value++ }) { '+1' }
}
```

---

## Basic Syntax

### Element Declaration

Use `tagName { content }` to declare elements:

```javascript
div { 'Hello World' }

// Nested elements
div {
  h1 { 'Title' }
  p { 'Content' }
}
```

### Passing Props (OvsArguments)

Use `tagName(prop = value) { content }` to pass props:

```javascript
div(class = 'container', id = 'app') {
  a(href = 'https://example.com', target = '_blank') {
    'Click here'
  }
}

// Event handling - method shorthand
button(onClick() { console.log('clicked') }) {
  'Click Me'
}

// Shorthand property (like ES6 object shorthand)
const disabled = true
button(disabled) { 'Submit' }

// Spread props
const props = { class: 'btn', id: 'submit' }
button(...props) { 'Submit' }
```

### Text and Expressions

Write strings or JavaScript expressions directly:

```javascript
div {
  'Static text'           // Static text
  `Dynamic: ${value}`     // Template string
  someVariable            // Variable
  computedValue()         // Function call
}
```

### Conditional Rendering

Use standard JavaScript conditional statements:

```javascript
div {
  if (isLoggedIn) {
    span { `Welcome, ${username}` }
  } else {
    button { 'Login' }
  }
}
```

### List Rendering

Use `for...of` loops:

```javascript
ul {
  for (const item of items) {
    li { item.name }
  }
}
```

### Component Definition

Use the `view` soft keyword to define reusable components:

```javascript
// Define component
view Card(props) {
  div(class = 'card') {
    h2 { props.title }
    p { props.content }
    props.children  // Render children
  }
}

// Use component
Card(title = 'Hello', content = 'World') {
  span { 'Extra content' }
}
```

> **Note**: `view` is a soft keyword (contextual keyword), only has special meaning at component declaration position.
> You can still use `view` as a variable name elsewhere: `const view = someValue`

---

## Advanced Usage

### Non-Rendering Block `#{}`

Code inside `#{}` won't be rendered to DOM, used for pure logic:

```javascript
div {
  #{
    // Pure JS logic here, won't render
    const data = processData(rawData)
    console.log('Processing...')
  }

  // This will render
  span { data.result }
}
```

### Reactive Data

Works with Vue's `ref` and `reactive`:

```javascript
import { ref, reactive } from 'vue'

const count = ref(0)
const user = reactive({ name: 'Alice', age: 25 })

div {
  p { `Count: ${count.value}` }
  p { `Name: ${user.name}` }
  button(onClick() { count.value++ }) { 'Add' }
}
```

---

## Complete Example

```javascript
// HelloWorld.ovs
import { ref } from 'vue'

// Define a sub-component
view CountDisplay(props) {
  div(class = 'count-display') {
    span { 'Current count: ' }
    strong(style = 'color: #42b883; font-size: 24px;') { props.count }
  }
}

// Main view
div(class = 'greetings', onClick() { count.value = 0 }) {
  const msg = "You did it!"
  let count = ref(0)

  // Timer to increment count
  const timer = setInterval(() => {
    count.value = count.value + 1
  }, 1000)

  h1(class = 'green') { msg }

  h3 {
    "Built with "
    a(href = 'https://vuejs.org/', target = '_blank') { 'Vue 3' }
    ' + '
    a(href = 'https://github.com/alamhubb/ovsjs', target = '_blank') { 'OVS' }
  }

  // Inline element assignment
  const countView = span { count }

  // Use component with props
  CountDisplay(count = countView) { }

  p(style = 'color: #888; font-size: 12px;') { '(Click anywhere to reset)' }
}
```

---

# Design Philosophy & Principles

## Design Philosophy

### 1. JavaScript Superset, Minimal Intrusion

OVS only adds three syntax extensions:
- `tag {}` / `tag(props) {}` - Element declaration with OvsArguments
- `view Name(props) {}` - Component declaration (`view` is a soft keyword)
- `#{}` - Non-rendering block

Everything else is standard JavaScript, minimal learning curve.

### 2. OvsArguments - Cleaner Props Syntax

OVS uses a special props syntax that's cleaner than object literals:

```javascript
// OvsArguments syntax (OVS)
div(class = 'container', id = 'app', onClick() { handle() }) {
  'content'
}

// Compiles to:
$OvsHtmlTag.div({ class: 'container', id: 'app', onClick() { handle() } }, ['content'])
```

**OvsArguments features:**
- `prop = value` - Property assignment (uses `=` instead of `:`)
- `method() {}` - Method shorthand
- `shorthand` - Shorthand property (like ES6)
- `...spread` - Spread operator

### 3. Full Type Support

OVS compiler generates precise Source Maps, enabling IDE to:
- Accurately locate original `.ovs` file positions
- Provide complete TypeScript type checking
- Support go-to-definition, rename, and other refactoring features

---

## Core Tech Stack

| Component | Description |
|-----------|-------------|
| **[Subhuti](./subhuti/)** | Parser generator framework, define grammar rules with decorators |
| **[Slime](./slime/)** | JavaScript/TypeScript fault-tolerant parser |
| **[Volar](https://volarjs.dev/)** | Language Server framework, provides IDE support |
| **[Vue 3](https://vuejs.org/)** | Runtime framework |

### Project Structure

```
test-volar/
├── ovs/                    # OVS compiler + runtime
│   ├── ovs-compiler/       # Compiler (Parser + AST transform)
│   └── ovs-runtime/        # Runtime ($OvsHtmlTag + defineOvsComponent)
├── ovs-language/           # VSCode extension
├── create-ovs/             # Project scaffolding
├── vite-plugin-ovs/        # Vite plugin (integrates cssts)
├── cssts/                  # CssTs core (css {} syntax compiler)
├── cssts-types/            # CssTs type definitions
├── cssts-theme-element/    # Element Plus theme atoms
├── cssts-ui/               # Element Plus fork (CssTs implementation)
├── vite-plugin-cssts/      # CssTs Vite plugin
├── slime/                  # JS/TS parser
└── subhuti/                # Parser framework
```

---

## CssTs-UI - Element Plus with CssTs

`cssts-ui/` is a fork of [Element Plus](https://github.com/element-plus/element-plus), demonstrating how to rewrite a component library using CssTs atomic classes.

### Directory Structure

```
cssts-ui/
├── packages/
│   ├── components/         # Original Element Plus components (Vue SFC + SCSS)
│   ├── cssts-components/   # CssTs rewritten components (OVS + css {})
│   └── theme-chalk/        # Original SCSS theme
```

### Comparison: Original vs CssTs

**Original Element Plus (Vue SFC + SCSS):**
- Components in `packages/components/`
- Styles in `packages/theme-chalk/`
- Uses BEM naming convention
- Requires SCSS compilation

**CssTs Version (OVS + css {}):**
- Components in `packages/cssts-components/`
- Styles defined inline with `css {}` syntax
- Type-safe atomic classes
- No external CSS files needed

---

## CssTs - CSS-in-TypeScript

OVS integrates CssTs for type-safe atomic CSS styling:

```javascript
// Define styles with css {} syntax
const buttonStyle = css {
  displayInlineFlex,
  justifyContentCenter,
  alignItemsCenter,
  height32px,
  paddingLeft15px,
  paddingRight15px,
  fontSize14px,
  borderRadius4px,
  cursorPointer
}

// Use in OVS
button(class = buttonStyle) { 'Click Me' }
```

### $$ Pseudo-class Syntax

Use `$$` (double dollar sign) to declare pseudo-class styles:

```javascript
// Variable name format: {baseName}$${pseudo1}$${pseudo2}...
const btn$$hover$$active = css { cursorPointer, displayFlex }

// Generated CSS:
// .cursor_pointer { cursor: pointer; }
// .btn:hover { opacity: 0.9; }      ← from pseudoUtils config
// .btn:active { opacity: 0.6; }     ← from pseudoUtils config
```

### Naming Convention

CssTs uses `property_value` format for CSS class names:

| TS Variable | CSS Class | CSS Rule |
|-------------|-----------|----------|
| `displayFlex` | `.display_flex` | `display: flex` |
| `height32px` | `.height_32px` | `height: 32px` |
| `justifyContentCenter` | `.justify-content_center` | `justify-content: center` |

**Important: Numbers must include units!**
```typescript
// ✅ Correct
height32px, fontSize14px, paddingLeft15px

// ❌ Wrong (missing units)
height32, fontSize14, paddingLeft15
```

### OVS + CssTs Integration

`vite-plugin-ovs` integrates `vite-plugin-cssts` internally:

```typescript
// vite.config.ts
import ovs from 'vite-plugin-ovs'

export default defineConfig({
  plugins: [
    ovs({
      cssts: {
        pseudoUtils: {
          hover: { opacity: '0.9' },
          active: { opacity: '0.6' }
        }
      }
    })
  ]
})
```

**How it works:**
1. `vite-plugin-ovs` creates a shared `Set<string>` for style collection
2. Both `.cssts` and `.ovs` files write collected atoms to this shared Set
3. `virtual:cssts.css` generates CSS from all collected styles
4. `virtual:csstsAtom` generates atom object mappings

```
.ovs file ──► ovs-compiler ──► usedAtoms ──┐
                                           ├──► sharedStyles ──► CSS
.cssts file ─► cssts-compiler ─► usedAtoms ┘
```

For detailed documentation, see:
- [cssts/ARCHITECTURE.md](../cssts/ARCHITECTURE.md) - Architecture design
- [cssts/cssts/README.md](../cssts/cssts/README.md) - Core compiler
- [vite-plugin-cssts](../cssts/vite-plugin-cssts/) - Vite plugin

---

## 📄 License

MIT License

---

## 🤝 Contributing

Issues and Pull Requests are welcome!

---

## 🔗 Links

- **Documentation**: [deepwiki.com/alamhubb/ovsjs](https://deepwiki.com/alamhubb/ovsjs/)
- **Topics**: `vue-kotlin` `vue-dsl` `declarative-vue` `declarative-ui-syntax-in-vue` `vue-swiftui` `vue-flutter` `vue-solidjs` `vue-dsl-in-pure-javascript` `declarative-dsl-vue`

---

**OVS** - _Declarative UI for the Web, Concise & Elegant_ ✨
