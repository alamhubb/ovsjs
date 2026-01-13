// 编译自: D:\project\parserall\ovsjs\ovs-test-2026\src\components\HelloWorldOvs.ovs
// 编译时间: 2026/1/13 23:45:30

import {$OvsHtmlTag,defineOvsComponent,defineReactiveExpression} from "ovsjs";
import {ref,Fragment,h} from 'vue';
export default defineOvsComponent(props => {
    let count1 = ref(0);
    return $OvsHtmlTag.div({class:"level-1",style:"border: 2px solid red; padding: 20px; margin: 10px;"},[
        $OvsHtmlTag.h1({},[
            defineReactiveExpression(() => "Level 1: "),
            defineReactiveExpression(() => count1.value)
        ]),
        $OvsHtmlTag.button({onClick(){
                count1.value++;
            },style:"margin: 10px; padding: 8px 16px; cursor: pointer;"},[
            defineReactiveExpression(() => "Click L1")
        ]),
        defineReactiveExpression(() => {
            const children = [];
            if (count1.value % 2 === 0){
                children.push($OvsHtmlTag.div({style:"background: red; padding: 10px; color: white;"},[
                    defineReactiveExpression(() => "偶数！")
                ]));
            }      return children;
        }),
        defineOvsComponent(() => {
            const children = [];
            const temp$$attrs$$6vyh4jih = {};
            let count2 = ref(0);
            children.push($OvsHtmlTag.h2({},[
                defineReactiveExpression(() => "Level 2: "),
                defineReactiveExpression(() => count2.value)
            ]));
            children.push($OvsHtmlTag.button({onClick(){
                    count2.value++;
                },style:"margin: 10px; padding: 8px 16px; cursor: pointer;"},[
                defineReactiveExpression(() => "Click L2")
            ]));
            children.push(defineOvsComponent(() => {
                const children = [];
                const temp$$attrs$$dzjm9ivp = {};
                let count3 = ref(0);
                children.push($OvsHtmlTag.h3({},[
                    defineReactiveExpression(() => "Level 3: "),
                    defineReactiveExpression(() => count3.value)
                ]));
                children.push($OvsHtmlTag.button({onClick(){
                        count3.value++;
                    },style:"margin: 10px; padding: 8px 16px; cursor: pointer;"},[
                    defineReactiveExpression(() => "Click L3")
                ]));
                return $OvsHtmlTag.div({class:"level-3",style:"border: 2px solid blue; padding: 10px; margin: 10px;"},children);
            })({},[]));
            return $OvsHtmlTag.div({class:"level-2",style:"border: 2px solid green; padding: 15px; margin: 10px;"},children);
        })({},[])
    ]);
});
