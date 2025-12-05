/**
 * OVS 运行时
 * 
 * 提供 OVS 组件定义和 HTML 元素
 * 
 * @example
 * ```typescript
 * import { defineOvsComponent, $OvsHtmlTag } from 'ovsjs'
 * 
 * const App = defineOvsComponent((props) => {
 *   return $OvsHtmlTag.div({ class: 'container' }, [
 *     $OvsHtmlTag.h1({}, 'Hello OVS!')
 *   ])
 * })
 * ```
 */

// 核心函数
export {
    defineOvsComponent,
    createComponentVNode,
    createElementVNode,
    mapChildrenToVNodes,
    type ReactiveVNodeState,
    type OvsComponent
} from './core'

// HTML 元素命名空间
export { $OvsHtmlTag } from './elements'

