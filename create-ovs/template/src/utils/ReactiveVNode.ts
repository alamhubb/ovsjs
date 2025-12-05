import { h, reactive, isReactive, isRef, unref } from 'vue'
import type { Component, VNode } from 'vue'

// ==================== 类型定义 ====================

export interface ReactiveVNodeApi {
  toVnode(): VNode
  state: ReactiveVNodeState
}

export interface ReactiveVNodeState {
  type: string | OvsComponent | Component
  props: Record<string, any>
  children: ReactiveVNodeApi | ReactiveVNodeApi[] | null | any
}

/**
 * OVS 组件类型
 * 接收 state，返回 ReactiveVNodeApi
 */
export type OvsComponent = (state: ReactiveVNodeState) => ReactiveVNodeApi

// ==================== 工具函数 ====================

function ensureReactiveProps<T extends object>(obj: T): T {
  return (isReactive(obj) ? obj : reactive(obj)) as T
}

function isReactiveVNodeApi(value: unknown): value is ReactiveVNodeApi {
  return !!value && typeof value === 'object' && 'toVnode' in value
}

function mapChildrenToVNodes(children: unknown): VNode | VNode[] | unknown {
  if (children == null) return undefined
  if (isRef(children)) return mapChildrenToVNodes(unref(children))
  if (Array.isArray(children)) return children.map(mapChildrenToVNodes) as VNode[]
  if (isReactiveVNodeApi(children)) return children.toVnode()
  return children
}

// ==================== 工厂函数 ====================

/**
 * 创建组件 VNode
 * 响应式依赖由 Vue 的 render 上下文自动追踪
 */
export function createComponentVNode(
  componentFn: OvsComponent | Component,
  props: Record<string, any> = {},
  children: any = null
): ReactiveVNodeApi {
  const state: ReactiveVNodeState = reactive({
    type: componentFn,
    props: ensureReactiveProps(props),
    children
  }) as ReactiveVNodeState

  return {
    state,
    toVnode(): VNode {
      // 如果是 OVS 组件函数
      if (typeof state.type === 'function') {
        const result = (state.type as OvsComponent)(state)

        // 如果返回 ReactiveVNodeApi，递归调用 toVnode
        if (isReactiveVNodeApi(result)) {
          return result.toVnode()
        }

        // 如果返回 VNode，直接使用（兼容普通 Vue 组件）
        if (result && typeof result === 'object' && 'type' in result) {
          return result as VNode
        }
      }

      // Fallback 逻辑
      return h(state.type as any, state.props, mapChildrenToVNodes(state.children) as any)
    }
  }
}

/**
 * 创建元素 VNode
 * 响应式依赖由 Vue 的 render 上下文自动追踪
 */
export function createElementVNode(
  type: string,
  props: Record<string, any> = {},
  children: any = null
): ReactiveVNodeApi {
  const state: ReactiveVNodeState = reactive({
    type,
    props: ensureReactiveProps(props),
    children
  }) as ReactiveVNodeState

  return {
    state,
    toVnode(): VNode {
      return h(state.type, state.props, mapChildrenToVNodes(state.children) as any)
    }
  }
}

export function toVnode(rvnode: ReactiveVNodeApi): VNode {
  return rvnode.toVnode()
}
