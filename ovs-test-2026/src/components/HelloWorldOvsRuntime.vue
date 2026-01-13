<script lang="ts">
import {defineOvsComponent, defineReactiveExpression, $OvsHtmlTag} from 'ovsjs'
import {ref, h} from 'vue'

/**
 * 这是 HelloWorldOvs.ovs 的预期编译结果
 * 用于验证编译器输出是否正确
 */
export default defineOvsComponent(props => {
  // 第一层状态 - 在组件顶层声明
  let count1 = ref(0)

  // 第一层 div - 简单模式（内部没有变量声明）
  return $OvsHtmlTag.div({
    class: 'level-1',
    style: 'border: 2px solid red; padding: 20px; margin: 10px;'
  }, [
    // h1 - 简单模式
    $OvsHtmlTag.h1({}, [
      'Level 1: ',
      h(defineReactiveExpression(() => count1.value))
    ]),

    // button - 简单模式
    $OvsHtmlTag.button({
      onClick() {
        count1.value++
      },
      style: 'margin: 10px; padding: 8px 16px; cursor: pointer;'
    }, [
      'Click L1'
    ]),

    // 第二层 div - 有 let 声明，需要 IIFE
    (() => {
      const children = []
      let count2 = ref(0)

      // h2 - 简单模式，但在 IIFE 内部需要 push
      children.push($OvsHtmlTag.h2({}, [
        'Level 2: ',
        h(defineReactiveExpression(() => count2.value))
      ]))

      children.push($OvsHtmlTag.button({
        onClick() {
          count2.value++
        },
        style: 'margin: 10px; padding: 8px 16px; cursor: pointer;'
      }, [
        'Click L2'
      ]))

      // 第三层 div - 有 let 声明，需要 IIFE
      children.push((() => {
        const children = []
        let count3 = ref(0)

        children.push($OvsHtmlTag.h3({}, [
          'Level 3: ',
          h(defineReactiveExpression(() => count3.value))
        ]))

        children.push($OvsHtmlTag.button({
          onClick() {
            count3.value++
          },
          style: 'margin: 10px; padding: 8px 16px; cursor: pointer;'
        }, [
          'Click L3'
        ]))

        return $OvsHtmlTag.div({
          class: 'level-3',
          style: 'border: 2px solid blue; padding: 10px; margin: 10px;'
        }, children)
      })())

      return $OvsHtmlTag.div({
        class: 'level-2',
        style: 'border: 2px solid green; padding: 15px; margin: 10px;'
      }, children)
    })()
  ])
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
