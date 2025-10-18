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
