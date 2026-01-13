import { h, defineComponent, markRaw } from 'vue'
import type { Component, VNode, VNodeChild } from 'vue'

// ==================== 类型定义 ====================

/**
 * OVS 组件的 Props 类型
 */
export type OvsProps = Record<string, any> & {
    children?: any
}

/**
 * OVS 组件的渲染函数类型
 */
export type OvsRenderFunction = () => VNodeChild

/**
 * OVS 组件的 Factory 类型
 * 接收 props，返回 VNode
 */
export type OvsComponentFactory = (props: OvsProps) => VNodeChild

// ==================== 工具函数 ====================

function isDefineComponent(value: unknown): boolean {
    if (!value) return false
    if (typeof value !== 'object' && typeof value !== 'function') return false
    const v = value as any
    return 'render' in v || 'setup' in v || v.__isOvsComponent === true
}

/**
 * 统一 Props 处理
 */
function unifyProps(
    props: Record<string, any>,
    attrs: Record<string, any>,
    slots: any
): OvsProps {
    return {
        ...attrs,
        ...props,
        get children() {
            return slots.default ? slots.default() : undefined
        }
    }
}

/**
 * 复制组件属性到 Callable 函数
 */
function copyComponentProperties(callable: Function, component: Component) {
    const readOnlyProps = new Set(['name', 'length', 'prototype', 'caller', 'arguments'])

    Object.keys(component).forEach(key => {
        if (!readOnlyProps.has(key)) {
            (callable as any)[key] = (component as any)[key]
        }
    })

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

    ; (callable as any).__isOvsComponent = true
        ; (callable as any).__vueComponent = component

    if ((component as any).setup) {
        ; (callable as any).setup = (component as any).setup
    }
    if ((component as any).render) {
        ; (callable as any).render = (component as any).render
    }
}

/**
 * 将 children 转换为 VNode 数组
 */
function mapChildrenToVNodes(children: unknown): any {
    if (children == null) return undefined
    if (Array.isArray(children)) return children.map(mapChildrenToVNodes)

    if (typeof children === 'object' && (children as any).__v_isVNode) {
        return children
    }

    if (isDefineComponent(children)) {
        const comp = (children as any).__vueComponent || children
        return h(comp as Component)
    }
    return children
}

/**
 * 创建组件 VNode
 */
function createComponentVNodeNew(
    componentFn: Component,
    props: Record<string, any> = {},
    children: any = null
) {
    const mappedChildren = mapChildrenToVNodes(children)
    const slots = mappedChildren != null ? { default: () => mappedChildren } : undefined
    return h(componentFn as Component, props, slots)
}

/**
 * 创建 Callable 函数
 */
function createCallable(rawComponent: Component): any {
    function callable(props?: Record<string, any>, context?: any) {
        // OVS 调用：Comp({}, [])
        if (Array.isArray(context)) {
            return createComponentVNodeNew(rawComponent, props, context)
        }
        // Vue 调用
        if (context && context.slots) {
            return h(rawComponent, props, context.slots)
        }
        return h(rawComponent, props, context)
    }

    return callable
}

// ==================== 主函数 ====================

/**
 * 定义 OVS 组件
 * 
 * @param factory - 组件工厂函数，接收 props，返回渲染函数
 * @returns 可调用的 OVS 组件
 * 
 * @example
 * @example
 * ```typescript
 * const MyComponent = defineOvsComponent((props) => {
 *   const count = ref(0)
 *   const content = $OvsHtmlTag.div({}, [count.value])
 *   return content  // 直接返回 VNode，自动包装
 * })
 * ```
 */
export function defineOvsComponent(factory: OvsComponentFactory) {
    const component = defineComponent((props, { slots, attrs }) => {
        const unifiedProps = unifyProps(props, attrs, slots)

        // factory 在 setup 中执行（只执行一次），返回 VNode
        const vnode = factory(unifiedProps)

        // 自动包装为渲染函数
        return () => vnode
    })

        ; (component as any).__isOvsComponent = true

    const rawComponent = markRaw(component)
    const callable = createCallable(rawComponent)

    copyComponentProperties(callable, component)

    return markRaw(callable as any)
}
