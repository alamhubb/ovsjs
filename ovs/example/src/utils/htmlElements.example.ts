/**
 * HTML 元素辅助函数使用示例
 * 
 * 展示如何使用 htmlElements 提供的类型安全标签函数
 */

import { div, p, span, h1, h2, button, input, form, ul, li } from './htmlElements'
import { createReactiveVNode } from './ReactiveVNode'

// ==================== 基础使用 ====================

// ✅ 有智能提示的写法
const basicView = div({ class: 'container' }, [
  h1({}, 'Hello World'),
  p({}, 'This is a paragraph'),
  span({ style: { color: 'red' } }, 'Colored text')
])

// ❌ 无智能提示的写法（对比）
const basicViewOld = createReactiveVNode('div', { class: 'container' }, [
  createReactiveVNode('h1', {}, 'Hello World'),
  createReactiveVNode('p', {}, 'This is a paragraph'),
  createReactiveVNode('span', { style: { color: 'red' } }, 'Colored text')
])

// ==================== 表单示例 ====================

const formView = form({ onSubmit: (e: Event) => e.preventDefault() }, [
  div({ class: 'form-group' }, [
    label({ for: 'name' }, 'Name:'),
    input({ type: 'text', id: 'name', placeholder: 'Enter your name' })
  ]),
  div({ class: 'form-group' }, [
    label({ for: 'email' }, 'Email:'),
    input({ type: 'email', id: 'email', placeholder: 'Enter your email' })
  ]),
  button({ type: 'submit' }, 'Submit')
])

// ==================== 列表示例 ====================

const items = ['Apple', 'Banana', 'Cherry']

const listView = ul({ class: 'todo-list' }, [
  ...items.map(item => li({ key: item }, item))
])

// ==================== 嵌套示例 ====================

const nestedView = div({ class: 'card' }, [
  div({ class: 'card-header' }, [
    h2({}, 'Card Title')
  ]),
  div({ class: 'card-body' }, [
    p({}, 'Card content goes here'),
    span({ class: 'badge' }, 'New')
  ]),
  div({ class: 'card-footer' }, [
    button({}, 'Action')
  ])
])

// ==================== 响应式示例 ====================

import { ref } from 'vue'

const count = ref(0)

const reactiveView = div({ class: 'counter' }, [
  h1({}, count), // 响应式数据会自动更新
  button({ onClick: () => count.value++ }, 'Increment'),
  button({ onClick: () => count.value-- }, 'Decrement')
])

// ==================== 导出示例 ====================

export const exampleView = div({ class: 'app' }, [
  basicView,
  formView,
  listView,
  nestedView,
  reactiveView
])



















