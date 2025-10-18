# ReactiveVNode 响应式 VNode 封装库

基于 Vue 3 的 `h` 函数和响应式系统（`reactive`、`ref`、`watchEffect`）封装的响应式 VNode 库，提供了一套声明式、响应式的 DOM 渲染方案。

## 设计理念

- **完全响应式**: `type`、`props`、`children` 三个参数全部支持响应式
- **自动依赖追踪**: 使用 Vue 的 `watchEffect` 自动追踪所有响应式依赖，数据变化自动重渲染
- **递归渲染**: 子节点可以是 ReactiveVNodeApi 对象，自动递归调用 `toVnode()` 转换
- **灵活类型支持**: 支持基础类型、ref、computed、ReactiveVNodeApi、混合数组等多种 children 类型
- **独立渲染**: 提供 `mount/unmount` 方法，可脱离 Vue `createApp` 独立使用

## 核心 API

### `createReactiveVNode(type, props, children)`

创建一个响应式 VNode 包装器。

**参数:**
- `type: string | Component` - 标签名（如 'div'）或 Vue 组件
- `props: Record<string, any>` - 属性对象，会自动包装为响应式（如果不是）
- `children: any` - 子节点，支持以下类型：
  - 基础类型: `string`、`number`、`boolean`
  - 响应式数据: `ref(value)`、`computed(() => value)`
  - ReactiveVNodeApi 对象
  - 以上类型的数组（数组会自动包装为 `reactive` 数组，支持 `push/splice` 等操作）

**返回:** `ReactiveVNodeApi` 对象

### ReactiveVNodeApi 接口

```typescript
interface ReactiveVNodeApi {
  // 转换为 Vue VNode（内部递归处理所有子节点）
  toVnode(): VNode
  
  // 挂载到 DOM 容器（使用 watchEffect 自动追踪响应式依赖）
  mount(container: Element): void
  
  // 卸载并清理副作用
  unmount(): void
  
  // 获取响应式状态（可修改 state.type、state.props、state.children 触发更新）
  get state(): ReactiveVNodeState
}
```

### `toVnode(rvnode)`

辅助函数，等同于 `rvnode.toVnode()`。

**参数:**
- `rvnode: ReactiveVNodeApi` - 响应式 VNode 对象

**返回:** `VNode`

## 响应式更新机制

### 1. 通过 `state` 直接修改

```typescript
const rv = createReactiveVNode('div', { class: 'box' }, 'text')

// 修改 props（会触发重渲染）
rv.state.props.class = 'box-active'
rv.state.props.style = { color: 'red' }

// 修改 children（会触发重渲染）
rv.state.children = 'new text'

// 修改 type（会触发重渲染）
rv.state.type = 'section'
```

### 2. 通过外部响应式对象

```typescript
import { reactive, ref } from 'vue'

// 方式 A: 传入 reactive 对象
const props = reactive({ class: 'box', id: 'a' })
const rv = createReactiveVNode('div', props, null)

props.class = 'box-2'  // 触发更新
rv.state.props.id = 'b'  // 触发更新

// 方式 B: 传入 ref/computed 作为 children
const count = ref(0)
const rv2 = createReactiveVNode('div', {}, count)

count.value++  // 触发更新
```

### 3. 数组 children 的响应式操作

```typescript
const child1 = createReactiveVNode('span', {}, 'A')
const child2 = createReactiveVNode('span', {}, 'B')
const rv = createReactiveVNode('div', {}, [child1, child2])

// push/splice 等数组操作会触发更新（数组已是 reactive）
(rv.state.children as any[]).push(createReactiveVNode('span', {}, 'C'))
(rv.state.children as any[]).splice(0, 1)

// 或者整体替换
rv.state.children = [child2, createReactiveVNode('em', {}, 'D')]
```

## 使用方式

### 方式 1: 独立使用（脱离 Vue createApp）

```typescript
// main.ts
import { createReactiveVNode } from '@/utils/ReactiveVNode'

const root = createReactiveVNode('div', { id: 'app' }, 'Hello World')
root.mount(document.querySelector('#app')!)
```

### 方式 2: 与 Vue createApp 集成

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App'

createApp({
  setup() {
    return () => App.toVnode()
  }
}).mount('#app')
```

其中 `App` 是一个 ReactiveVNodeApi 对象：

```typescript
// App.ts
import { createReactiveVNode } from '@/utils/ReactiveVNode'

export default createReactiveVNode('div', { class: 'app' }, [
  // ... children
])
```

## 完整示例

### 基础示例

```typescript
import { createReactiveVNode } from '@/utils/ReactiveVNode'
import { reactive, ref, computed } from 'vue'

// 1. 静态内容
const static1 = createReactiveVNode('div', { class: 'static' }, 123)

// 2. 响应式 props
const props = reactive({ class: 'box', title: 'Hello' })
const rv1 = createReactiveVNode('div', props, 'content')
props.class = 'box-active'  // 触发更新

// 3. 响应式 children（ref）
const count = ref(0)
const rv2 = createReactiveVNode('div', {}, count)
setInterval(() => count.value++, 1000)  // 每秒自动更新

// 4. 响应式 children（computed）
const message = ref('hello')
const rv3 = createReactiveVNode('div', {}, computed(() => `Message: ${message.value}`))

// 5. 嵌套 ReactiveVNode
const child = createReactiveVNode('span', { style: { color: 'red' } }, 'child')
const parent = createReactiveVNode('div', {}, [child])

// 6. 数组操作
const list = createReactiveVNode('ul', {}, [
  createReactiveVNode('li', {}, 'item 1'),
  createReactiveVNode('li', {}, 'item 2')
])
// 动态添加
;(list.state.children as any[]).push(createReactiveVNode('li', {}, 'item 3'))
```

### 组件化示例

```typescript
import { createReactiveVNode, type ReactiveVNodeApi } from '@/utils/ReactiveVNode'
import { reactive, computed } from 'vue'

// 定义组件函数：接收响应式 props，返回 ReactiveVNodeApi
function Card(props: { title: any; description?: any }): ReactiveVNodeApi {
  const titleRv = createReactiveVNode('h3', { class: 'card-title' }, 
    computed(() => props.title)  // 使用 computed 包装动态值
  )
  const descRv = createReactiveVNode('p', { class: 'card-desc' }, 
    computed(() => props.description || 'No description')
  )
  return createReactiveVNode('div', { class: 'card' }, [titleRv, descRv])
}

// 使用组件
const cardProps = reactive({ 
  title: 'Card Title', 
  description: 'Card Description' 
})
const card = Card(cardProps)

// 动态更新
setInterval(() => {
  cardProps.title = `Card ${Date.now()}`
}, 1000)

// 导出根节点
export default createReactiveVNode('div', { class: 'app' }, [card])
```

### 列表渲染示例

```typescript
import { createReactiveVNode } from '@/utils/ReactiveVNode'
import { reactive, computed } from 'vue'

interface Todo {
  id: number
  text: string
  done: boolean
}

const state = reactive({
  todos: [
    { id: 1, text: 'Learn Vue', done: true },
    { id: 2, text: 'Learn ReactiveVNode', done: false }
  ] as Todo[]
})

// TodoItem 组件
function TodoItem(todo: Todo): ReactiveVNodeApi {
  return createReactiveVNode('li', {}, [
    createReactiveVNode('input', { 
      type: 'checkbox', 
      checked: computed(() => todo.done),
      onChange: () => { todo.done = !todo.done }
    }, null),
    createReactiveVNode('span', {
      style: computed(() => ({ 
        textDecoration: todo.done ? 'line-through' : 'none' 
      }))
    }, computed(() => todo.text))
  ])
}

// TodoList 组件
const todoList = createReactiveVNode('ul', {}, 
  computed(() => state.todos.map(todo => TodoItem(todo)))
)

// 添加新 todo
function addTodo(text: string) {
  state.todos.push({
    id: Date.now(),
    text,
    done: false
  })
}

export default createReactiveVNode('div', { class: 'todo-app' }, [
  createReactiveVNode('h1', {}, 'Todo List'),
  todoList,
  createReactiveVNode('button', {
    onClick: () => addTodo('New Task')
  }, 'Add Todo')
])
```

## 注意事项

### 1. 动态值必须用 computed/ref 包装

❌ **错误示例**（不会响应式更新）:
```typescript
const props = reactive({ title: 'Hello' })
function Card(props: any) {
  return createReactiveVNode('h3', {}, props.title)  // ❌ 立即求值，固化为 'Hello'
}
const card = Card(props)
props.title = 'World'  // 不会更新
```

✅ **正确示例**:
```typescript
const props = reactive({ title: 'Hello' })
function Card(props: any) {
  return createReactiveVNode('h3', {}, computed(() => props.title))  // ✅ 延迟求值
}
const card = Card(props)
props.title = 'World'  // 会触发更新
```

### 2. 数组 children 操作

如果需要外部持有的数组引用与内部状态保持一致，提前用 `reactive` 包装：

```typescript
import { reactive } from 'vue'

const children = reactive([
  createReactiveVNode('span', {}, 'A')
])

const rv = createReactiveVNode('div', {}, children)
children.push(createReactiveVNode('span', {}, 'B'))  // ✅ 会触发更新
```

### 3. mount 与 createApp 的选择

- **使用 `mount`**: 脱离 Vue 生态，适合轻量级场景
- **使用 `createApp` 集成**: 需要 Vue 插件（router、pinia 等）时使用

### 4. 性能优化

- 大列表渲染时，使用 `computed` 包装映射逻辑，避免每次都重新创建 VNode
- 静态内容不需要 `computed/ref` 包装，直接传入基础类型即可

## 类型定义

```typescript
export type ReactiveVNodeType = string | Component

export interface ReactiveVNodeApi {
  toVnode(): VNode
  mount(container: Element): void
  unmount(): void
  get state(): ReactiveVNodeState
}

export interface ReactiveVNodeState {
  type: ReactiveVNodeType
  props: Record<string, any>
  children: ReactiveVNodeApi | ReactiveVNodeApi[] | null | any
}

export function createReactiveVNode(
  type: ReactiveVNodeType,
  props?: Record<string, any>,
  children?: any
): ReactiveVNodeApi

export function toVnode(rvnode: ReactiveVNodeApi): VNode
```

## 实现原理

1. **响应式包装**: `props` 和数组 `children` 自动用 `reactive` 包装
2. **递归转换**: `toVnode()` 内部递归处理子节点，遇到 ReactiveVNodeApi 调用其 `toVnode()`
3. **ref 解包**: 渲染时使用 `isRef/unref` 自动解包 ref 和 computed
4. **依赖追踪**: `mount` 内部使用 `watchEffect(() => render(api.toVnode(), container))` 建立依赖追踪
5. **自动更新**: 任何响应式依赖变化都会触发 `watchEffect` 重新执行 `render`

## FAQ

**Q: 为什么修改外部变量后没有更新？**

A: 确保传入的是响应式数据（`reactive/ref/computed`），或者通过 `rvnode.state.*` 修改。普通变量赋值无法被 Vue 追踪。

**Q: 可以混用 JSX 吗？**

A: 不建议。本库基于 Vue 的 `h` 函数和响应式系统，JSX 编译后也是 `h` 调用，但混用会导致响应式追踪混乱。

**Q: 性能如何？**

A: 依赖 Vue 的响应式系统，性能与 Vue 组件相当。大规模列表建议使用虚拟滚动等优化手段。

**Q: 可以在生产环境使用吗？**

A: 本库是对 Vue 3 响应式 API 的薄封装，稳定性取决于 Vue 版本。建议充分测试后使用。

## 总结

ReactiveVNode 提供了一种新的声明式 UI 构建方式，结合 Vue 的响应式系统，让 DOM 渲染变得简单且高效。适合：

- 不想写模板，偏好纯 JS/TS 构建 UI
- 需要高度动态的组件结构
- 轻量级场景，不需要完整 Vue 组件系统
- 学习 Vue 响应式原理的实践项目

欢迎反馈和贡献！🎉

