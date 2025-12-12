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
    if (!value) return false
    // 支持对象（Vue 组件）和函数（OVS 可调用组件）
    if (typeof value !== 'object' && typeof value !== 'function') return false
    const v = value as any
    return 'render' in v || 'setup' in v || v.__isOvsComponent === true
}

export function mapChildrenToVNodes(children: unknown): any {
    if (children == null) return undefined
    if (isRef(children)) return mapChildrenToVNodes(unref(children))
    if (Array.isArray(children)) return children.map(mapChildrenToVNodes)
    
    // 如果已经是 VNode，直接返回
    if (typeof children === 'object' && (children as any).__v_isVNode) {
        return children
    }
    
    if (isDefineComponent(children)) {
        // 如果是可调用的 OVS 组件，使用其内部的 Vue 组件
        const comp = (children as any).__vueComponent || children
        return h(comp as Component)
    }
    return children
}

// ==================== 核心函数 ====================

/**
 * 定义 OVS 组件
 * 
 * OVS 简化了 Vue 的概念，将 props、attrs、slots 统一为 props：
 * - props.xxx     - 所有属性（包括 Vue 的 props 和 attrs）
 * - props.children - 子内容（Vue 的 slots.default）
 * - props.onXxx   - 事件回调
 * 
 * 返回的组件既可以：
 * 1. 在 Vue 模板中作为组件使用：<MyComponent />
 * 2. 在 OVS 中作为函数调用：MyComponent({prop: value}, [children])
 */
export function defineOvsComponent(
    factory: (props: Record<string, any>) => any
) {
    const component = defineComponent((props, { slots, attrs }) => {
        // 合并 props + attrs + children，统一为 OVS 的 props
        const unifiedProps = {
            ...attrs,       // 未声明的属性（class、style、data-* 等）
            ...props,       // 声明的属性
            get children() {
                return slots.default ? slots.default() : undefined
            }
        }
        const result = factory(unifiedProps)
        if (isDefineComponent(result)) {
            return () => h(result)
        }
        if (typeof result === 'function') {
            return result
        }
        return () => result
    })
    ;(component as any).__isOvsComponent = true
    
    // 用 markRaw 标记组件，防止被 reactive 包装（在这里标记一次，后续使用都不需要再标记）
    const rawComponent = markRaw(component)
    
    // 创建一个可调用的函数
    // 关键：区分两种调用方式：
    // 1. OVS 调用：CountDisplay({count: 1}, []) - 第二个参数是数组
    // 2. Vue 模板调用：<CountDisplay /> - Vue 会传入 props 对象，没有第二个参数
    function callable(props?: Record<string, any>, children?: any) {
        // 如果第二个参数是数组，说明是 OVS 调用方式
        // 返回一个组件对象，用于 children.push()
        if (Array.isArray(children)) {
            return createComponentVNodeNew(rawComponent, props, children)
        }
        // 否则是 Vue 模板调用，返回 VNode
        // Vue 会把这个函数当作函数组件来调用
        return h(rawComponent, props)
    }
    
    // 函数的只读属性，不能被覆盖
    const readOnlyProps = new Set(['name', 'length', 'prototype', 'caller', 'arguments'])
    
    // 复制 Vue 组件的所有属性到函数上
    // 这样 Vue 可以识别它是一个组件（有 setup/render 等属性）
    Object.keys(component).forEach(key => {
        if (!readOnlyProps.has(key)) {
            (callable as any)[key] = (component as any)[key]
        }
    })
    
    // 复制 Vue 组件的原型属性（setup, render 等可能在原型上）
    const proto = Object.getPrototypeOf(component)
    if (proto && proto !== Object.prototype) {
        Object.getOwnPropertyNames(proto).forEach(key => {
            if (key !== 'constructor' && !readOnlyProps.has(key)) {
                try {
                    (callable as any)[key] = (component as any)[key]
                } catch (e) {
                    // 忽略只读属性
                }
            }
        })
    }
    
    // 标记为 OVS 组件
    ;(callable as any).__isOvsComponent = true
    ;(callable as any).__vueComponent = component
    
    // 关键：设置 setup 属性，让 Vue 能识别这是一个组件
    // Vue 检查组件时会查看 setup 或 render 属性
    if ((component as any).setup) {
        ;(callable as any).setup = (component as any).setup
    }
    if ((component as any).render) {
        ;(callable as any).render = (component as any).render
    }
    
    return markRaw(callable as any)
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
 * 创建组件 VNode
 *
 * 方式 3 优化：直接返回 h() 创建的 VNode，不再创建包装组件
 * 这样更简洁，性能更好（少一层组件嵌套）
 *
 * 注意：调用方应该传入已经用 markRaw 标记的组件
 */
export function createComponentVNodeNew(
    componentFn: OvsComponent | Component,
    props: Record<string, any> = {},
    children: any = null
) {
    // 将 children 转换为函数形式的 slot，避免 Vue 警告
    const mappedChildren = mapChildrenToVNodes(children)
    const slots = mappedChildren != null ? { default: () => mappedChildren } : undefined

    // 直接返回 VNode，不再创建包装组件
    return h(componentFn as Component, props, slots)
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

