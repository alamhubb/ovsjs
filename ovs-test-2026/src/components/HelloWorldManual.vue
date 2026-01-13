<script lang="ts">
import { defineComponent, h, ref, markRaw } from 'vue'

// 响应式文本组件
const reactiveText = (getter: () => string) => h(defineComponent(() => getter))

export default defineComponent({
  name: 'HelloWorldManual',
  setup() {
    console.log('[Root] setup 开始')

    // 使用 IIFE 创建嵌套层级
    const content = h('div', [
      (() => {
        console.log('[L1] IIFE 开始')
        const count1 = ref(0)

        return h('div', {
          class: 'level-1',
          style: 'border: 2px solid red; padding: 20px; margin: 10px;'
        }, [
          h('h1', ['Level 1: ', reactiveText(() => String(count1.value))]),
          h('button', {
            onClick: () => {
              console.log('[L1] 点击前:', count1.value)
              count1.value++
              console.log('[L1] 点击后:', count1.value)
            },
            style: 'margin: 10px; padding: 8px 16px; cursor: pointer;'
          }, 'Click L1'),

          // 第2层 IIFE
          (() => {
            console.log('[L2] IIFE 开始')
            const count2 = ref(0)

            return h('div', {
              class: 'level-2',
              style: 'border: 2px solid green; padding: 15px; margin: 10px;'
            }, [
              h('h2', ['Level 2: ', reactiveText(() => String(count2.value))]),
              h('button', {
                onClick: () => {
                  console.log('[L2] 点击前:', count2.value)
                  count2.value++
                  console.log('[L2] 点击后:', count2.value)
                },
                style: 'margin: 10px; padding: 8px 16px; cursor: pointer;'
              }, 'Click L2'),

              // 第3层 IIFE
              (() => {
                console.log('[L3] IIFE 开始')
                const count3 = ref(0)

                return h('div', {
                  class: 'level-3',
                  style: 'border: 2px solid blue; padding: 10px; margin: 10px;'
                }, [
                  h('h3', ['Level 3: ', reactiveText(() => String(count3.value))]),
                  h('button', {
                    onClick: () => {
                      console.log('[L3] 点击前:', count3.value)
                      count3.value++
                      console.log('[L3] 点击后:', count3.value)
                    },
                    style: 'margin: 10px; padding: 8px 16px; cursor: pointer;'
                  }, 'Click L3')
                ])
              })()
            ])
          })()
        ])
      })()
    ])

    console.log('[Root] setup 结束')

    return () => {
      console.log('[Root] render 执行')
      return content
    }
  }
})
</script>

<style scoped>
.level-1 {
  font-family: Arial, sans-serif;
}

.level-2 {
  background-color: #f0f0f0;
}

.level-3 {
  background-color: #e0e0e0;
}
</style>
