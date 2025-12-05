import { h, reactive, isReactive, isRef, unref, defineComponent } from 'vue'
import type { Component, VNode, DefineComponent } from 'vue'

// ==================== 类型定义 ====================

export interface ReactiveVNodeState {
  type: string | OvsComponent | Component
  props: Record<string, any>
  children: any
}

/**
 * OVS 组件类型
 * 接收 state，返回 Vue 组件
 */
export type OvsComponent = (state: ReactiveVNodeState) => DefineComponent<any, any, any>

// ==================== 工具函数 ====================

function ensureReactiveProps<T extends object>(obj: T): T {
  return (isReactive(obj) ? obj : reactive(obj)) as T
}

function isDefineComponent(value: unknown): boolean {
  return !!value && typeof value === 'object' && 'render' in value
}

function mapChildrenToVNodes(children: unknown): any {
  if (children == null) return undefined
  if (isRef(children)) return mapChildrenToVNodes(unref(children))
  if (Array.isArray(children)) return children.map(mapChildrenToVNodes)
  // 如果是 defineComponent 返回的组件，渲染它
  if (isDefineComponent(children)) return h(children as Component)
  return children
}

// ==================== 核心函数 ====================

/**
 * 定义 OVS 组件
 * factory 返回 render 函数 () => VNode
 */
export function defineOvsComponent(
  factory: (props: Record<string, any>) => (() => VNode)
) {
  return defineComponent((props) => {
    return factory(props)
  })
}

// ==================== 工厂函数 ====================

/**
 * 创建组件 VNode
 * 内部使用 defineOvsComponent
 */
export function createComponentVNode(
  componentFn: OvsComponent | Component,
  props: Record<string, any> = {},
  children: any = null
) {
  return defineOvsComponent((componentProps) => {
    const state: ReactiveVNodeState = reactive({
      type: componentFn,
      props: { ...ensureReactiveProps(props), ...componentProps },
      children
    }) as ReactiveVNodeState

    return () => {
      // 如果是 OVS 组件函数
      if (typeof state.type === 'function') {
        const result = (state.type as OvsComponent)(state)

        // 如果返回组件定义，渲染它
        if (isDefineComponent(result)) {
          return h(result as Component, state.props, mapChildrenToVNodes(state.children))
        }

        // 如果返回 VNode，直接使用
        if (result && typeof result === 'object' && 'type' in result) {
          return result as VNode
        }
      }

      // Fallback 逻辑
      return h(state.type as any, state.props, mapChildrenToVNodes(state.children))
    }
  })
}

/**
 * 创建元素 VNode
 * 内部使用 defineOvsComponent
 */
export function createElementVNode(
  type: string,
  props: Record<string, any> = {},
  children: any = null
) {
  return defineOvsComponent((componentProps) => {
    const state: ReactiveVNodeState = reactive({
      type,
      props: { ...ensureReactiveProps(props), ...componentProps },
      children
    }) as ReactiveVNodeState

    return () => h(state.type, state.props, mapChildrenToVNodes(state.children))
  })
}
