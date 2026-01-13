<script lang="ts">
import { defineOvsComponent, defineReactiveExpression } from 'ovsjs'
import { $OvsHtmlTag } from 'ovsjs'
import { h, ref } from 'vue'



export default defineOvsComponent(() => {
    // 第一层状态提取
    console.log('[OVS L1] setup')
    const count1 = ref(0)

    // 返回 VNode
    return $OvsHtmlTag.div({
        class: 'level-1',
        style: 'border: 2px solid red; padding: 20px; margin: 10px;'
    }, [
        $OvsHtmlTag.h1({}, [
            'Level 1: ',
            h(defineReactiveExpression(() => count1.value))
        ]),
        $OvsHtmlTag.button({
            onClick: () => {
                console.log('[OVS L1] 点击前:', count1.value)
                count1.value++
                console.log('[OVS L1] 点击后:', count1.value)
            },
            style: 'margin: 10px; padding: 8px 16px; cursor: pointer;'
        }, ['Click L1']),

        // 第2层：保持 IIFE（在第1层内部）
        (() => {
            console.log('[OVS L2] IIFE 开始')
            const count2 = ref(0)

            return $OvsHtmlTag.div({
                class: 'level-2',
                style: 'border: 2px solid green; padding: 15px; margin: 10px;'
            }, [
                $OvsHtmlTag.h2({}, [
                    'Level 2: ',
                    h(defineReactiveExpression(() => count2.value))
                ]),
                $OvsHtmlTag.button({
                    onClick: () => {
                        console.log('[OVS L2] 点击前:', count2.value)
                        count2.value++
                        console.log('[OVS L2] 点击后:', count2.value)
                    },
                    style: 'margin: 10px; padding: 8px 16px; cursor: pointer;'
                }, ['Click L2']),

                // 第3层：保持 IIFE（在第2层内部）
                (() => {
                    console.log('[OVS L3] IIFE 开始')
                    const count3 = ref(0)

                    return $OvsHtmlTag.div({
                        class: 'level-3',
                        style: 'border: 2px solid blue; padding: 10px; margin: 10px;'
                    }, [
                        $OvsHtmlTag.h3({}, [
                            'Level 3: ',
                            h(defineReactiveExpression(() => count3.value))
                        ]),
                        $OvsHtmlTag.button({
                            onClick: () => {
                                console.log('[OVS L3] 点击前:', count3.value)
                                count3.value++
                                console.log('[OVS L3] 点击后:', count3.value)
                            },
                            style: 'margin: 10px; padding: 8px 16px; cursor: pointer;'
                        }, ['Click L3'])
                    ])
                })()
            ])
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
