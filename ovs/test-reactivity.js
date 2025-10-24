import {ref, h} from "vue";

const hello = {
  props: ['attrs'],
  setup({ attrs }) {
    console.log('子组件 setup 执行，attrs.title =', attrs.title)
    let count = ref(0)
    return () => {
      console.log('子组件 render 执行，attrs.title =', attrs.title)
      return [
        h('div', {style: 'border: 1px solid blue; padding: 10px;'}, [
          h('p', {}, '子组件收到的 title:'),
          attrs.title  // 如果是 VNode，直接渲染
        ])
      ]
    }
  }
}

export default {
  setup() {
    const count = ref(14);

    setInterval(() => {
      count.value += 1;
      console.log('========== 父组件 count 更新为:', count.value, '==========');
    }, 1000);

    return () => {
      console.log('父组件 render 执行，count =', count.value)
      
      // 测试1：传 VNode
      const hv1 = h('span', {style: 'color: red; font-weight: bold;'}, 
                    `VNode方式: ${count.value + 1}`)
      const helloVNode1 = h(hello, {attrs: {title: hv1}});

      // 测试2：传数据（对比）
      const helloVNode2 = h(hello, {attrs: {title: count.value + 1}});

      return h('div', {style: 'padding: 20px;'}, [
        h('h2', {}, `父组件 count: ${count.value}`),
        h('hr'),
        h('h3', {}, '方式1：传 VNode（会更新）'),
        helloVNode1,
        h('hr'),
        h('h3', {}, '方式2：传数据（推荐）'),
        helloVNode2
      ])
    }
  }
}


