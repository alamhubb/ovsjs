import {h, reactive, isReactive, isRef, unref, defineComponent, markRaw} from 'vue'
import type {Component, VNode, DefineComponent} from 'vue'

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
    if (!value || typeof value !== 'object') return false
    const v = value as any
    return 'render' in v || 'setup' in v || v.__isOvsComponent === true
}

export function mapChildrenToVNodes(children: unknown): any {
    if (children == null) return undefined
    if (isRef(children)) return mapChildrenToVNodes(unref(children))
    if (Array.isArray(children)) return children.map(mapChildrenToVNodes)
    if (isDefineComponent(children)) return h(children as Component)
    return children
}

// ==================== 核心函数 ====================

/**
 * 定义 OVS 组件
 */
export function defineOvsComponent(
    factory: (props: Record<string, any>) => any
) {
    const component = defineComponent((props) => {
        const result = factory(props)
        if (isDefineComponent(result)) {
            return () => h(result)
        }
        if (typeof result === 'function') {
            return result
        }
        return () => result
    })
    ;(component as any).__isOvsComponent = true
    return markRaw(component)  // 标记为原始对象，防止被 reactive 包装
}

// ==================== 工厂函数 ====================

/**
 * 创建组件 VNode
 */
export function createComponentVNode(
    componentFn: OvsComponent | Component,
    props: Record<string, any> = {},
    children: any = null
) {
    const component = defineComponent((componentProps) => {
        const state: ReactiveVNodeState = reactive({
            type: componentFn,
            props: {...ensureReactiveProps(props), ...componentProps},
            children
        }) as ReactiveVNodeState

        return () => {
            if (typeof state.type === 'function') {
                const result = (state.type as OvsComponent)(state)
                return h(result as Component)
            }
            return h(state.type as Component, state.props, mapChildrenToVNodes(state.children))
        }
    })
    ;(component as any).__isOvsComponent = true
    return markRaw(component)  // 标记为原始对象，防止被 reactive 包装
}

/**
 * 创建元素 VNode
 */
export function createElementVNode(
    type: string,
    props: Record<string, any> = {},
    children: any = null
) {
    const component = defineComponent((componentProps) => {
        const state: ReactiveVNodeState = reactive({
            type,
            props: {...ensureReactiveProps(props), ...componentProps},
            children
        }) as ReactiveVNodeState

        return () => h(state.type, state.props, mapChildrenToVNodes(state.children))
    })
    ;(component as any).__isOvsComponent = true
    return markRaw(component)  // 标记为原始对象，防止被 reactive 包装
}

