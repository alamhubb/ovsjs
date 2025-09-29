import OvsAPI from "@/ovs/OvsAPI.ts";

const hello = {
    render() {
        const header = OvsAPI.createVNode('div', 123, {slotName: 'header'})
        const root = OvsAPI.createVNode('div', [header], {header: header})
        return OvsAPI.createVNode('div', [header, 456], {header: header})
    }
}

const root = hello.render()

console.log(root)
