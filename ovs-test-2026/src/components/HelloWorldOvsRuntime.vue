<script lang="ts">
import { $OvsHtmlTag, defineOvsComponent, defineReactiveExpression } from "ovsjs";
import { ref, Fragment, h } from 'vue';
export default defineOvsComponent(props => {
    let count1 = ref(0);
    return defineOvsComponent(() => {
        const children = [];
        const temp$$attrs$$gbq3zo0n = {};
        children.push(defineOvsComponent(() => {
            const children = [];
            const temp$$attrs$$zh68s9a8 = {};
            children.push(h(defineReactiveExpression(() => {
                const children = [];
                children.push(h(defineReactiveExpression(() => "Level 1: ")));
                return children;
            })));
            children.push(h(defineReactiveExpression(() => {
                const children = [];
                children.push(h(defineReactiveExpression(() => count1.value)));
                return children;
            })));
            return $OvsHtmlTag.h1({}, children);
        })({}, []));
        children.push(defineOvsComponent(() => {
            const children = [];
            const temp$$attrs$$dpjxf8q5 = {};
            children.push(h(defineReactiveExpression(() => {
                const children = [];
                children.push(h(defineReactiveExpression(() => "Click L1")));
                return children;
            })));
            return $OvsHtmlTag.button({
                onClick() {
                    count1.value++;
                }, style: "margin: 10px; padding: 8px 16px; cursor: pointer;"
            }, children);
        })({}, []));
        children.push(h(defineReactiveExpression(() => {
            const children = [];
            if (count1.value % 2 === 0) {
                children.push(defineOvsComponent(() => {
                    const children = [];
                    const temp$$attrs$$u4v6fsa9 = {};
                    children.push(h(defineReactiveExpression(() => {
                        const children = [];
                        children.push(h(defineReactiveExpression(() => "偶数！")));
                        return children;
                    })));
                    return $OvsHtmlTag.div({ style: "background: red; padding: 10px; color: white;" }, children);
                })({}, []));
            } return children;
        })));
        children.push(defineOvsComponent(() => {
            const children = [];
            const temp$$attrs$$lofo0pbp = {};
            let count2 = ref(0);
            children.push(defineOvsComponent(() => {
                const children = [];
                const temp$$attrs$$wpo3rf99 = {};
                children.push(h(defineReactiveExpression(() => {
                    const children = [];
                    children.push(h(defineReactiveExpression(() => "Level 2: ")));
                    return children;
                })));
                children.push(h(defineReactiveExpression(() => {
                    const children = [];
                    {
                        children.push(h(defineReactiveExpression(() => {
                            const children = [];
                            children.push(h(defineReactiveExpression(() => count2.value)));
                            return children;
                        })));
                    } return children;
                })));
                return $OvsHtmlTag.h2({}, children);
            })({}, []));
            children.push(defineOvsComponent(() => {
                const children = [];
                const temp$$attrs$$3x31icbu = {};
                children.push(h(defineReactiveExpression(() => {
                    const children = [];
                    children.push(h(defineReactiveExpression(() => "Click L2")));
                    return children;
                })));
                return $OvsHtmlTag.button({
                    onClick() {
                        count2.value++;
                    }, style: "margin: 10px; padding: 8px 16px; cursor: pointer;"
                }, children);
            })({}, []));
            children.push(defineOvsComponent(() => {
                const children = [];
                const temp$$attrs$$n3jzz5jb = {};
                let count3 = ref(0);
                children.push(defineOvsComponent(() => {
                    const children = [];
                    const temp$$attrs$$cn79k7ob = {};
                    children.push(h(defineReactiveExpression(() => {
                        const children = [];
                        children.push(h(defineReactiveExpression(() => "Level 3: ")));
                        return children;
                    })));
                    children.push(h(defineReactiveExpression(() => {
                        const children = [];
                        {
                            children.push(h(defineReactiveExpression(() => {
                                const children = [];
                                children.push(h(defineReactiveExpression(() => count3.value)));
                                return children;
                            })));
                        } return children;
                    })));
                    return $OvsHtmlTag.h3({}, children);
                })({}, []));
                children.push(defineOvsComponent(() => {
                    const children = [];
                    const temp$$attrs$$t4ow53i6 = {};
                    children.push(h(defineReactiveExpression(() => {
                        const children = [];
                        children.push(h(defineReactiveExpression(() => "Click L3")));
                        return children;
                    })));
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
