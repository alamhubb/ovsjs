# OVS - Object View Script

> **OVS** - A pure JavaScript declarative UI, a Vue DSL that lets you write Vue with a more concise, elegant, and flexible syntax, inspired by Kotlin-HTML, SwiftUI, and SolidJS.

[![Documentation](https://img.shields.io/badge/docs-deepwiki-blue)](https://deepwiki.com/alamhubb/ovsjs/)
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
div({ class: 'container' }) {
  h1 { 'Hello OVS!' }
  button({ onClick: handleClick }) { 'Click Me' }
}
```

**Features:**
- ✅ **Pure JavaScript Superset** - All JS syntax works
- ✅ **No JSX Required** - Native brace syntax
- ✅ **Full IDE Support** - Code completion, type checking, go to definition
- ✅ **Vue 3 Runtime** - Compiles to efficient Vue render functions

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

Search for **"Ovs Language"** in VSCode Extensions Marketplace and install it.

### 3. Start Writing

Create a `.ovs` file:

```javascript
// src/components/Hello.ovs
import { ref } from 'vue'

const count = ref(0)

div({ class: 'hello' }) {
  h1 { 'Hello OVS!' }
  p { `Count: ${count.value}` }
  button({ onClick: () => count.value++ }) { '+1' }
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

### Passing Props

Use `tagName(propsObject) { content }` to pass props:

```javascript
div({ class: 'container', id: 'app' }) {
  a({ href: 'https://example.com', target: '_blank' }) {
    'Click here'
  }
}

// Event handling
button({ onClick: () => console.log('clicked') }) {
  'Click Me'
}
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

---

## Advanced Usage

### Component Definition

Use the `view` keyword to define reusable components:

```javascript
// Define component
view Card(state) {
  div({ class: 'card' }) {
    h2 { state.props.title }
    p { state.props.content }
    state.children  // Render children
  }
}

// Use component
Card({ title: 'Hello', content: 'World' }) {
  span { 'Extra content' }
}
```

> **Note**: `view` is a soft keyword (contextual keyword), only has special meaning at component declaration position.
> You can still use `view` as a variable name elsewhere: `const view = someValue`

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
  button({ onClick: () => count.value++ }) { 'Add' }
}
```

---

## Complete Example

```javascript
// HelloWorld.ovs
import { ref } from 'vue'

const msg = "You did it!"
const count = ref(0)

div({ class: 'greetings', onClick: () => count.value = 0 }) {
  h1({ class: 'green' }) { msg }

  #{
    // Pure logic code, won't render
    console.log('Component rendered')
  }

  h2 { `Clicked ${count.value} times` }

  h3 {
    "Built with "
    a({ href: 'https://vuejs.org/', target: '_blank' }) { 'Vue 3' }
    ' + '
    a({ href: 'https://github.com/aspect-apps/ovsjs', target: '_blank' }) { 'OVS' }
  }

  button({ onClick: () => count.value++ }) { 'Click Me' }
}
```

---

# Design Philosophy & Principles

## Design Philosophy

### 1. JavaScript Superset, Minimal Intrusion

OVS only adds three syntax extensions:
- `tag {}` / `tag() {}` - Element declaration
- `view Name() {}` - Component declaration (`view` is a soft keyword, can be used as variable name)
- `#{}` - Non-rendering block

Everything else is standard JavaScript, minimal learning curve.

### 2. Declarative UI, No JSX Required

No need to learn JSX syntax, native braces `{}` are more natural for JavaScript:

```javascript
// JSX approach
<div className="container">
  <h1>{title}</h1>
</div>

// OVS approach
div({ class: 'container' }) {
  h1 { title }
}
```

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
├── vite-plugin-ovs/        # Vite plugin
├── slime/                  # JS/TS parser
└── subhuti/                # Parser framework
```

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

