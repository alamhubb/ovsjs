import {h, type VNode} from "vue";

const vNodeExtend = {
    children: [],
    add(appendNode: VNode, vNode: string | number | VNode) {
        let childIndex
        if (vNode ?? true) {
            childIndex = this.children.length - 1
        } else if (Number.isInteger(vNode)) {
            childIndex = vNode
        } else if (typeof vNode === 'string') {
            childIndex = this.children.findIndex(item => item.name === vNode)
        } else {
            childIndex = this.children.findIndex(item => item === vNode)
        }
        if (childIndex < 0) {
            throw new Error('不存在节点')
        }
        if (appendNode.name) {
            this[appendNode.name] = appendNode
        }
        this.children.splice(childIndex + 1, 0, appendNode)
    },
    insert(appendNode: VNode, vNode: string | VNode) {
        let childIndex
        if (typeof vNode === 'string') {
            childIndex = this.children.findIndex(item => item.name === vNode)
        } else {
            childIndex = this.children.findIndex(item => item.name === vNode.name)
        }
        if (childIndex < 0) {
            throw new Error('不存在节点')
        }
        if (appendNode.name) {
            this[appendNode.name] = appendNode
        }
        this.children.splice(childIndex, 0, appendNode)
    },
}

export default class OvsAPI {
    static createVNode(tagName: string, children, props?) {
        console.log('chufale')
        console.log(tagName)
        let vueChildren = null
        if (Array.isArray(children)) {
            vueChildren = children
        } else {
            vueChildren = [children]
        }
        let ho = h(tagName, vueChildren)
        ho = Object.assign({}, vNodeExtend, ho)
        console.log(ho)
        return ho
    }
}
