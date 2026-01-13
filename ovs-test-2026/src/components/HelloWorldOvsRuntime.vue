<script lang="ts">
import { defineOvsComponent, $OvsHtmlTag } from 'ovsjs'
import { defineComponent, h, ref, type VNodeChild } from 'vue'
const defineReactiveComponent = (getter: () => VNodeChild) => h(defineComponent(() => getter))


export default defineOvsComponent(() => {
    console.log('[OVS Root] setup 开始')

    // 使用 IIFE 创建嵌套层级（同 Vue h 函数版本）
    const content = $OvsHtmlTag.div({}, [
        (() => {
            console.log('[OVS L1] IIFE 开始')
            const count1 = ref(0)

            return $OvsHtmlTag.div({
                class: 'level-1',
                style: 'border: 2px solid red; padding: 20px; margin: 10px;'
            }, [
                $OvsHtmlTag.h1({}, [
                    'Level 1: ',
                    h(defineReactiveComponent(() => count1.value))
                ]),
                $OvsHtmlTag.button({
                    onClick: () => {
                        console.log('[OVS L1] 点击前:', count1.value)
                        count1.value++
                        console.log('[OVS L1] 点击后:', count1.value)
                    },
                    style: 'margin: 10px; padding: 8px 16px; cursor: pointer;'
                }, ['Click L1']),

                // 第2层 IIFE
                (() => {
                    console.log('[OVS L2] IIFE 开始')
                    const count2 = ref(0)

                    return $OvsHtmlTag.div({
                        class: 'level-2',
                        style: 'border: 2px solid green; padding: 15px; margin: 10px;'
                    }, [
                        $OvsHtmlTag.h2({}, [
                            'Level 2: ',
                            h(defineReactiveComponent(() => count2.value))
                        ]),
                        $OvsHtmlTag.button({
                            onClick: () => {
                                console.log('[OVS L2] 点击前:', count2.value)
                                count2.value++
                                console.log('[OVS L2] 点击后:', count2.value)
                            },
                            style: 'margin: 10px; padding: 8px 16px; cursor: pointer;'
                        }, ['Click L2']),

                        // 第3层 IIFE
                        (() => {
                            console.log('[OVS L3] IIFE 开始')
                            const count3 = ref(0)

                            return $OvsHtmlTag.div({
                                class: 'level-3',
                                style: 'border: 2px solid blue; padding: 10px; margin: 10px;'
                            }, [
                                $OvsHtmlTag.h3({}, [
                                    'Level 3: ',
                                    h(defineReactiveComponent(() => count3.value))
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
        })()
    ])

    console.log('[OVS Root] setup 结束')

    return content
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
