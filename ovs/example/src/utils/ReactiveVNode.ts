import { h, reactive, isReactive, watchEffect, render, isRef, unref } from 'vue'
import type { Component, VNode } from 'vue'

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

// ==================== 组件类型定义 ====================

/**
 * 函数组件类型
 * 接收 state，返回 ReactiveVNodeApi
 */
export type OvsFunctionComponent = (state: ReactiveVNodeState) => ReactiveVNodeApi

/**
 * HTML 元素类型
 * HTML 标签的字符串名称
 */
export type HtmlElementType = string

function ensureReactiveProps<T extends object>(obj: T): T {
  return (isReactive(obj) ? obj : reactive(obj)) as T
}

function isReactiveVNodeApi(value: unknown): value is ReactiveVNodeApi {
  return !!value && typeof value === 'object' && 'toVnode' in (value as any) && typeof (value as any).toVnode === 'function'
}

function mapChildrenToVNodes(children: unknown): VNode | VNode[] | unknown {
  if (children == null) return undefined as unknown as VNode
  if (isRef(children)) {
    return mapChildrenToVNodes(unref(children))
  }
  if (Array.isArray(children)) {
    return children.map((c) => mapChildrenToVNodes(c)) as VNode[]
  }
  if (isReactiveVNodeApi(children)) {
    return children.toVnode()
  }
  // primitive or VNode-like children pass through
  return children
}

// ==================== ReactiveVNode 核心类 ====================

/**
 * 响应式 VNode 核心类
 * 处理状态、渲染、挂载卸载等通用逻辑
 */
class ReactiveVNode implements ReactiveVNodeApi {
  state: ReactiveVNodeState
  private stopEffect: (() => void) | null = null
  private mountedContainer: Element | null = null

  constructor(state: ReactiveVNodeState) {
    this.state = state
  }

  toVnode(): VNode {
    // 如果 type 是函数，说明是组件
    if (typeof this.state.type === 'function') {
      const result = (this.state.type as OvsFunctionComponent)(this.state)
      
      // 如果返回 ReactiveVNodeApi，递归调用 toVnode
      if (isReactiveVNodeApi(result)) {
        return result.toVnode()
      }
      
      // 如果返回 VNode，直接使用（兼容普通 Vue 组件）
      if (result && typeof result === 'object' && 'type' in result) {
        return result as VNode
      }
    }
    
    // Fallback 逻辑（组件或元素都可能执行到这里）
    const vnodeChildren = mapChildrenToVNodes(this.state.children)
    return h(this.state.type as any, this.state.props, vnodeChildren as any)
  }

  mount(container: Element): void {
    this.mountedContainer = container
    if (this.stopEffect) this.stopEffect()
    this.stopEffect = watchEffect(() => {
      render(this.toVnode(), container)
    })
  }

  unmount(): void {
    if (this.stopEffect) {
      this.stopEffect()
      this.stopEffect = null
    }
    if (this.mountedContainer) {
      render(null, this.mountedContainer)
      this.mountedContainer = null
    }
  }
}

// ==================== 工厂函数 ====================

export function createComponentVNode(
  componentFn: OvsFunctionComponent,
  props: Record<string, any> = {},
  children: any = null
): ReactiveVNodeApi {
  const state: ReactiveVNodeState = reactive({
    type: componentFn,
    props: ensureReactiveProps(props),
    children: children
  }) as ReactiveVNodeState

  return new ReactiveVNode(state)
}

export function createElementVNode(
  type: ReactiveVNodeType,
  props: Record<string, any> = {},
  children: any = null
): ReactiveVNodeApi {
  const state: ReactiveVNodeState = reactive({
    type,
    props: ensureReactiveProps(props),
    children: children
  }) as ReactiveVNodeState

  return new ReactiveVNode(state)
}

export function toVnode(rvnode: ReactiveVNodeApi): VNode {
  return rvnode.toVnode()
}
