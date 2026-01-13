<script lang="ts">
// 编译自: D:\project\parserall\ovsjs\ovs-test-2026\src\components\HelloWorldOvs.ovs
// 编译时间: 2026/1/13 22:25:43

import { $OvsHtmlTag, defineOvsComponent, defineReactiveExpression } from "ovsjs";
import { ref, Fragment, h } from 'vue';
export default defineOvsComponent(props => {
    let count1 = ref(0);
    return defineOvsComponent(() => {
        const children = [];
        const temp$$attrs$$soeq63b6 = {};
        children.push(defineOvsComponent(() => {
            const children = [];
            const temp$$attrs$$jvo59kfy = {};
            children.push(defineReactiveExpression(() => {
                const children = [];
                children.push(defineReactiveExpression(() => "Level 1: "));
                return children;
            }));
            children.push(defineReactiveExpression(() => {
                const children = [];
                children.push(defineReactiveExpression(() => count1.value));
                return children;
            }));
            return $OvsHtmlTag.h1({}, children);
        })({}, []));
        children.push(defineOvsComponent(() => {
            const children = [];
            const temp$$attrs$$ox90j2ml = {};
            children.push(defineReactiveExpression(() => {
                const children = [];
                children.push(defineReactiveExpression(() => "Click L1"));
                return children;
            }));
            return $OvsHtmlTag.button({
                onClick() {
                    count1.value++;
                }, style: "margin: 10px; padding: 8px 16px; cursor: pointer;"
            }, children);
        })({}, []));
        children.push(defineReactiveExpression(() => {
            const children = [];
            if (count1.value % 2 === 0) {
                children.push(defineOvsComponent(() => {
                    const children = [];
                    const temp$$attrs$$yfoamhps = {};
                    children.push(defineReactiveExpression(() => {
                        const children = [];
                        children.push(defineReactiveExpression(() => "偶数！"));
                        return children;
                    }));
                    return $OvsHtmlTag.div({ style: "background: red; padding: 10px; color: white;" }, children);
                })({}, []));
            } return children;
        }));
        children.push(defineOvsComponent(() => {
            const children = [];
            const temp$$attrs$$hoq9yx78 = {};
            let count2 = ref(0);
            children.push(defineOvsComponent(() => {
                const children = [];
                const temp$$attrs$$1aq4eeqz = {};
                children.push(defineReactiveExpression(() => {
                    const children = [];
                    children.push(defineReactiveExpression(() => "Level 2: "));
                    return children;
                }));
                children.push(defineReactiveExpression(() => {
                    const children = [];
                    {
                        children.push(defineReactiveExpression(() => {
                            const children = [];
                            children.push(defineReactiveExpression(() => count2.value));
                            return children;
                        }));
                    } return children;
                }));
                return $OvsHtmlTag.h2({}, children);
            })({}, []));
            children.push(defineOvsComponent(() => {
                const children = [];
                const temp$$attrs$$8ol2z0dw = {};
                children.push(defineReactiveExpression(() => {
                    const children = [];
                    children.push(defineReactiveExpression(() => "Click L2"));
                    return children;
                }));
                return $OvsHtmlTag.button({
                    onClick() {
                        count2.value++;
                    }, style: "margin: 10px; padding: 8px 16px; cursor: pointer;"
                }, children);
            })({}, []));
            children.push(defineOvsComponent(() => {
                const children = [];
                const temp$$attrs$$2gzv47zn = {};
                let count3 = ref(0);
                children.push(defineOvsComponent(() => {
                    const children = [];
                    const temp$$attrs$$un4f9agm = {};
                    children.push(defineReactiveExpression(() => {
                        const children = [];
                        children.push(defineReactiveExpression(() => "Level 3: "));
                        return children;
                    }));
                    children.push(defineReactiveExpression(() => {
                        const children = [];
                        {
                            children.push(defineReactiveExpression(() => {
                                const children = [];
                                children.push(defineReactiveExpression(() => count3.value));
                                return children;
                            }));
                        } return children;
                    }));
                    return $OvsHtmlTag.h3({}, children);
                })({}, []));
                children.push(defineOvsComponent(() => {
                    const children = [];
                    const temp$$attrs$$5nkvjxmx = {};
                    children.push(defineReactiveExpression(() => {
                        const children = [];
                        children.push(defineReactiveExpression(() => "Click L3"));
                        return children;
                    }));
                    return $OvsHtmlTag.button({
                        onClick() {
                            count3.value++;
                        }, style: "margin: 10px; padding: 8px 16px; cursor: pointer;"
                    }, children);
                })({}, []));
                return $OvsHtmlTag.div({ class: "level-3", style: "border: 2px solid blue; padding: 10px; margin: 10px;" }, children);
            })({}, []));
            return $OvsHtmlTag.div({ class: "level-2", style: "border: 2px solid green; padding: 15px; margin: 10px;" }, children);
        })({}, []));
        return $OvsHtmlTag.div({ class: "level-1", style: "border: 2px solid red; padding: 20px; margin: 10px;" }, children);
    })({}, []);
});
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
