# Future Extension: Composable Parser Plugin System

## Problem

Current architecture uses class inheritance:

```
SubhutiParser → SlimeParser → OvsParser
```

**Limitation**: Single inheritance cannot freely combine multiple parser extensions (e.g., OVS + JSX).

## Solution: Plugin Array with Inheritance

Keep the class inheritance structure, but add a plugin traversal mechanism at runtime.

### Core Idea

1. Each plugin extends `SlimeParser` and overrides rules with `super.xxx()` fallback
2. Parser accepts an array of plugin classes
3. When executing a rule, traverse plugins in order until one succeeds

```
plugins: [OvsParser, JsxParser]

ExecuteRule('PrimaryExpression'):
  ├─ OvsParser.PrimaryExpression
  │   └─ Try OvsRenderFunction → success? return
  │   └─ Fallback to super.PrimaryExpression
  │
  └─ JsxParser.PrimaryExpression (if OvsParser fails entirely)
      └─ Try JSXElement → success? return
      └─ Fallback to super.PrimaryExpression
```

## Implementation

### 1. Types (add to SubhutiParser.ts)

```typescript
export type ParserConstructor<T extends SubhutiParser = SubhutiParser> = 
  new (sourceCode: string, options?: SubhutiParserOptions) => T
```

### 2. Composable Parser Factory

```typescript
// subhuti/src/createComposableParser.ts

import SubhutiParser from './SubhutiParser'
import type { SubhutiCst } from './struct/SubhutiCst'

export type ParserConstructor = new (sourceCode: string, ...args: any[]) => SubhutiParser

export interface ComposableParser {
  parse(startRule: string, ...args: any[]): SubhutiCst | undefined
  executeRule(ruleName: string, ...args: any[]): SubhutiCst | undefined
}

export function createComposableParser(
  sourceCode: string,
  plugins: ParserConstructor[]
): ComposableParser {
  
  // Create all plugin instances
  const instances = plugins.map(Plugin => new Plugin(sourceCode))
  
  // Use first plugin as primary (for state management)
  const primary = instances[0]
  
  return {
    parse(startRule: string, ...args: any[]): SubhutiCst | undefined {
      return this.executeRule(startRule, ...args)
    },
    
    executeRule(ruleName: string, ...args: any[]): SubhutiCst | undefined {
      for (const instance of instances) {
        if (typeof (instance as any)[ruleName] !== 'function') {
          continue
        }
        
        const saved = primary.saveState()
        
        // Sync state to current plugin instance
        instance.codeIndex = primary.codeIndex
        instance.parseSuccess = true
        
        const result = (instance as any)[ruleName](...args)
        
        // Sync state back to primary
        primary.codeIndex = instance.codeIndex
        primary.parseSuccess = instance.parseSuccess
        primary.curCst = instance.curCst
        
        if (primary.parseSuccess) {
          return result
        }
        
        primary.restoreState(saved)
      }
      
      primary.parseSuccess = false
      return undefined
    }
  }
}
```

### 3. Plugin Definition Pattern

Each plugin extends the base parser and overrides rules:

```typescript
// OvsParser - already exists, no changes needed
class OvsParser extends SlimeParser {
  
  PrimaryExpression(params = {}) {
    return this.Or([
      { alt: () => this.OvsRenderFunction(params) },
      { alt: () => super.PrimaryExpression(params) }  // Fallback
    ])
  }
  
  OvsRenderFunction(params = {}) {
    // OVS specific syntax
  }
}

// JsxParser - hypothetical extension
class JsxParser extends SlimeParser {
  
  PrimaryExpression(params = {}) {
    return this.Or([
      { alt: () => this.JSXElement() },
      { alt: () => super.PrimaryExpression(params) }  // Fallback
    ])
  }
  
  JSXElement() {
    // JSX specific syntax
  }
}
```

### 4. Usage

```typescript
import { createComposableParser } from 'subhuti'
import { OvsParser } from 'ovs-compiler'
import { JsxParser } from 'jsx-parser'

// Single plugin (same as before)
const parser1 = new OvsParser(sourceCode)
const cst1 = parser1.Script()

// Multiple plugins combined
const parser2 = createComposableParser(sourceCode, [OvsParser, JsxParser])
const cst2 = parser2.parse('Script')

// Order matters: first plugin has higher priority
const parser3 = createComposableParser(sourceCode, [JsxParser, OvsParser])
```

## What Changes

| File | Change |
|------|--------|
| SubhutiParser.ts | Add `ParserConstructor` type export |
| createComposableParser.ts | New file (~50 lines) |
| SlimeParser.ts | No changes |
| OvsParser.ts | No changes |

## Advantages

- ✅ Minimal code changes
- ✅ Backward compatible (existing code still works)
- ✅ Free plugin combination
- ✅ Plugin order = priority
- ✅ Full TypeScript type hints preserved
- ✅ Uses native class inheritance (familiar pattern)

## Future Considerations

1. **Shared TokenConsumer**: May need to unify token definitions across plugins
2. **State Synchronization**: Current design syncs basic state; may need more fields
3. **Performance**: Plugin traversal adds overhead; consider caching for hot paths

