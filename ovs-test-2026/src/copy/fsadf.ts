import { $OvsHtmlTag, defineOvsComponent, defineReactiveExpression } from "/@fs/D:/project/parserall/ovsjs/ovs/ovs-runtime/src/index.ts";
import { ref, Fragment, h } from "/node_modules/.vite/deps/vue.js?v=5c91c757";
export default defineOvsComponent(props => {
    let count1 = ref(0);
    return $OvsHtmlTag.div({ class: "level-1", style: "border: 2px solid red; padding: 20px; margin: 10px;" }, [
        defineOvsComponent(() => {
            const children = [];
            const temp$$attrs$$qf59v13e = {};
            children.push(h(defineReactiveExpression(() => "Level 1: ")));
            {
                children.push(h(defineReactiveExpression(() => count1)));
            } return $OvsHtmlTag.h1({}, children);
        })({}, []),
        $OvsHtmlTag.button({
            onClick() {
                count1.value++;
            }, style: "margin: 10px; padding: 8px 16px; cursor: pointer;"
        }, [
            h(defineReactiveExpression(() => "Click L1"))
        ]),
        defineOvsComponent(() => {
            const children = [];
            const temp$$attrs$$fu09utbq = {};
            let count2 = ref(0);
            children.push(defineOvsComponent(() => {
                const children = [];
                const temp$$attrs$$5tcmzl5l = {};
                children.push(h(defineReactiveExpression(() => "Level 2: ")));
                {
                    children.push(h(defineReactiveExpression(() => count2)));
                } return $OvsHtmlTag.h2({}, children);
            })({}, []));
            children.push($OvsHtmlTag.button({
                onClick() {
                    count2.value++;
                }, style: "margin: 10px; padding: 8px 16px; cursor: pointer;"
            }, [
                h(defineReactiveExpression(() => "Click L2"))
            ]));
            children.push(defineOvsComponent(() => {
                const children = [];
                const temp$$attrs$$nhios30p = {};
                let count3 = ref(0);
                children.push(defineOvsComponent(() => {
                    const children = [];
                    const temp$$attrs$$3nu0syc5 = {};
                    children.push(h(defineReactiveExpression(() => "Level 3: ")));
                    {
                        children.push(h(defineReactiveExpression(() => count3)));
                    } return $OvsHtmlTag.h3({}, children);
                })({}, []));
                children.push($OvsHtmlTag.button({
                    onClick() {
                        count3.value++;
                    }, style: "margin: 10px; padding: 8px 16px; cursor: pointer;"
                }, [
                    h(defineReactiveExpression(() => "Click L3"))
                ]));
                return $OvsHtmlTag.div({ class: "level-3", style: "border: 2px solid blue; padding: 10px; margin: 10px;" }, children);
            })({}, []));
            return $OvsHtmlTag.div({ class: "level-2", style: "border: 2px solid green; padding: 15px; margin: 10px;" }, children);
        })({}, [])
    ]);
});
