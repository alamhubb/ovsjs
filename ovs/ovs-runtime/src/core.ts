import { h, isRef, unref } from 'vue'
import type { Component } from 'vue'

// 导出 defineOvsComponent
export { defineOvsComponent } from './defineOvsComponent'

// ==================== 工具函数 ====================

function isDefineComponent(value: unknown): boolean {
    if (!value) return false
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
        const comp = (children as any).__vueComponent || children
        return h(comp as Component)
    }
    return children
}

// ==================== 工厂函数 ====================

/**
 * 创建组件 VNode
 */
export function createComponentVNodeNew(
    componentFn: Component,
    props: Record<string, any> = {},
    children: any = null
) {
    const mappedChildren = mapChildrenToVNodes(children)
    const slots = mappedChildren != null ? { default: () => mappedChildren } : undefined
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
    return h(type, props, mapChildrenToVNodes(children))
}
