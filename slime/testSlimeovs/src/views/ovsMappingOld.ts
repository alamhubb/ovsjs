import {h, VNode} from "vue";

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
        if (appendNode.name){
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
        if (appendNode.name){
            this[appendNode.name] = appendNode
        }
        this.children.splice(childIndex, 0, appendNode)
    },
}

function createVNode(tagName: string, children) {
    let vueChildren = null
    if (Array.isArray(children)) {
        vueChildren = children
    } else {
        vueChildren = [children]
    }
    let ho = h(tagName, vueChildren)
    ho = Object.assign({}, vNodeExtend, ho)
    return ho
}


const hello = {
    render() {
        const rootChild = []
        const root = createVNode('div', rootChild)
        const header = createVNode('div', 123)
        header['name'] = 'header'
        root['header'] = header

        rootChild.push(root.header)
        rootChild.push(h('div', 2223))
        return root
    }
}


const root = hello.render()

root.header.add(createVNode('div', 777))

console.log(root.children)
