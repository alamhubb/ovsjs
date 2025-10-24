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

export function createReactiveVNode(
  type: ReactiveVNodeType,
  props: Record<string, any> = {},
  children: any = null
): ReactiveVNodeApi {
  const normalizedChildren = Array.isArray(children)
    ? ((isReactive(children) ? children : reactive(children)) as any[])
    : children

  const state: ReactiveVNodeState = reactive({
    type,
    props: ensureReactiveProps(props),
    children: normalizedChildren
  }) as ReactiveVNodeState

  let stopEffect: (() => void) | null = null
  let mountedContainer: Element | null = null

  const api: ReactiveVNodeApi = {
    toVnode(): VNode {
      // 智能组件处理：如果 type 是函数，先调用它
      if (typeof state.type === 'function') {
        try {
          // 类型断言为通用函数，避免 Vue Component 类型冲突
          const componentFn = state.type as any
          
          // 调用组件函数，传入 props 和 child（注意：参数名是 child 不是 children）
          const result = componentFn(state)
          
          // 如果返回 ReactiveVNodeApi，递归调用 toVnode
          if (isReactiveVNodeApi(result)) {
            return result.toVnode()
          }
          
          // 如果返回 VNode，直接使用（兼容普通 Vue 组件）
          if (result && typeof result === 'object' && 'type' in result) {
            return result as VNode
          }
          
          // 其他情况，fallback 到原有逻辑
        } catch (e) {
          // 如果调用失败，fallback 到 Vue 的 h() 函数处理
          console.warn('Component function call failed, falling back to Vue h():', e)
        }
      }
      
      // 原有逻辑：普通 HTML 元素或 Vue 内置组件
      const vnodeChildren = mapChildrenToVNodes(state.children)
      return h(state.type as any, state.props, vnodeChildren as any)
    },

    mount(container: Element): void {
      mountedContainer = container
      if (stopEffect) stopEffect()
      stopEffect = watchEffect(() => {
        render(api.toVnode(), container)
      })
    },

    unmount(): void {
      if (stopEffect) {
        stopEffect()
        stopEffect = null
      }
      if (mountedContainer) {
        render(null, mountedContainer)
        mountedContainer = null
      }
    },

    get state(): ReactiveVNodeState {
      return state
    }
  }

  return api
}

export function toVnode(rvnode: ReactiveVNodeApi): VNode {
  return rvnode.toVnode()
}
