# OVS Language Support

> **OVS** - A pure JavaScript declarative UI, a Vue DSL that lets you write Vue with a more concise, elegant, and flexible syntax.

[![GitHub](https://img.shields.io/badge/GitHub-ovsjs-blue?logo=github)](https://github.com/alamhubb/ovsjs)
[![Documentation](https://img.shields.io/badge/docs-deepwiki-blue)](https://deepwiki.com/alamhubb/ovsjs/)

## Features

- ✅ **Syntax Highlighting** - Full syntax highlighting for `.ovs` files
- ✅ **IntelliSense** - Code completion, hover information
- ✅ **Go to Definition** - Navigate to symbol definitions
- ✅ **Error Diagnostics** - Real-time syntax error reporting
- ✅ **TypeScript Support** - Full type checking integration

## What is OVS?

OVS solves the flexibility problem of Vue templates while being more elegant than JSX.

```javascript
// OVS - Native JavaScript control flow, clean and intuitive
div({ class: 'container' }) {
  h1 { 'Hello OVS!' }
  
  if (isLoggedIn) {
    span { `Welcome, ${username}` }
  }
  
  for (const item of items) {
    li { item.name }
  }
  
  button({ onClick: handleClick }) { 'Click Me' }
}
```

### Why OVS?

| Feature | Vue Template | JSX | OVS |
|---------|-------------|-----|-----|
| Control Flow | `v-if`, `v-for` directives | `&&`, `? :`, `.map()` | Native `if`, `for` |
| Class Attribute | `class` | `className` | `class` |
| Expression Syntax | `{{ }}` | `{ }` | Direct reference |
| Learning Curve | Template syntax | JSX rules | Just JavaScript |

### Key Advantages

- **Zero Template Directives** - No `v-if`, `v-for`, just native `if/for`
- **No JSX Required** - Native brace syntax, no `className`, no `{}` wrapping
- **Pure JavaScript** - All JS syntax works naturally
- **Vue 3 Compatible** - Compiles to efficient Vue render functions

## App Quick Start

This section is for users creating an OVS app. Language tooling development is
managed separately through Qin in the next section.

### 1. Create App

```bash
npm create ovs@latest my-app
cd my-app
qin install
qin dev
```

## Toolchain Development

OVS language tooling is managed by `qin.config.js`. Use Qin as the project
entrypoint for build, test, and language-server runs:

```bash
cd ovsjs/ovs-language
..\..\qin\qin.bat language build
..\..\qin\qin.bat language test
..\..\qin\qin.bat language server --dry-run
```

The Volar server runs on Node/TypeScript because editor LSP tooling requires
that ecosystem. OVS syntax authority still comes from the generated Qin parser
package declared in `qin.config.js`; do not add a separate parser or fallback
path in the editor package.

### 2. Write OVS

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

### 3. Define Components

Use the `view` soft keyword:

```javascript
view Card(state) {
  div({ class: 'card' }) {
    h2 { state.props.title }
    p { state.props.content }
    state.children
  }
}

// Use component
Card({ title: 'Hello', content: 'World' }) {
  span { 'Extra content' }
}
```

## Syntax Overview

### Element Declaration

```javascript
div { 'Hello World' }

div({ class: 'container', id: 'app' }) {
  h1 { 'Title' }
  p { 'Content' }
}
```

### Conditional & List Rendering

```javascript
div {
  // Native JavaScript - no special syntax!
  if (show) {
    span { 'Visible' }
  }
  
  for (const item of items) {
    li { item.name }
  }
}
```

### Non-Rendering Block

```javascript
div {
  #{
    // Pure JS logic, won't render
    const data = processData(rawData)
    console.log('Processing...')
  }
  
  span { data.result }
}
```

## Links

- [GitHub Repository](https://github.com/alamhubb/ovsjs)
- [Documentation](https://deepwiki.com/alamhubb/ovsjs/)
- [npm: create-ovs](https://www.npmjs.com/package/create-ovs)

## License

MIT

