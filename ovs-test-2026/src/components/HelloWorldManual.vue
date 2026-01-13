<script lang="ts">
import { defineOvsComponent, $OvsHtmlTag } from 'ovsjs'
import { ref } from 'vue'

export default defineOvsComponent(() => {
  // 第1层状态
  const count1 = ref(0)
  
  // 第1层 VNode
  const vnode = $OvsHtmlTag.div({ 
    class: 'level-1',
    style: 'border: 2px solid red; padding: 20px; margin: 10px;'
  }, [
    $OvsHtmlTag.h1({}, ['Level 1: ', count1.value]),
    $OvsHtmlTag.button({ 
      onClick() { count1.value++ },
      style: 'margin: 10px; padding: 8px 16px; cursor: pointer;'
    }, ['Click L1']),
    
    // 第2层组件（嵌套在第1层中）
    defineOvsComponent(() => {
      // 第2层状态
      const count2 = ref(0)
      
      // 第2层 VNode
      const vnode = $OvsHtmlTag.div({ 
        class: 'level-2',
        style: 'border: 2px solid green; padding: 15px; margin: 10px;'
      }, [
        $OvsHtmlTag.h2({}, ['Level 2: ', count2.value]),
        $OvsHtmlTag.button({ 
          onClick() { count2.value++ },
          style: 'margin: 10px; padding: 8px 16px; cursor: pointer;'
        }, ['Click L2']),
        
        // 第3层组件（嵌套在第2层中）
        defineOvsComponent(() => {
          // 第3层状态
          const count3 = ref(0)
          
          // 第3层 VNode
          const vnode = $OvsHtmlTag.div({ 
            class: 'level-3',
            style: 'border: 2px solid blue; padding: 10px; margin: 10px;'
          }, [
            $OvsHtmlTag.h3({}, ['Level 3: ', count3.value]),
            $OvsHtmlTag.button({ 
              onClick() { count3.value++ },
              style: 'margin: 10px; padding: 8px 16px; cursor: pointer;'
            }, ['Click L3'])
          ])
          
          return () => vnode
        })({}, [])  // 第3层组件调用
      ])
      
      return () => vnode
    })({}, [])  // 第2层组件调用
  ])
  
  // 第1层 render
  return () => vnode
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
