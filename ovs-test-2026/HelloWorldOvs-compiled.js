// 编译自: d:\project\parserall\ovsjs\ovs-test-2026\src\components\HelloWorldOvs.ovs
// 编译时间: 2026/1/14 01:35:52

import {$OvsHtmlTag,defineOvsComponent,defineReactiveExpression} from "ovsjs";
import {ref} from 'vue';
export default defineOvsComponent(props => {
  let count1 = ref(0);
  return $OvsHtmlTag.div({class:"level-1",style:"border: 2px solid red; padding: 20px; margin: 10px;"},[
    $OvsHtmlTag.h1({},[
      "Level 1: ",
      defineReactiveExpression(() => count1.value)
    ]),
    $OvsHtmlTag.button({onClick(){
      count1.value++;
    },style:"margin: 10px; padding: 8px 16px; cursor: pointer;"},["Click L1"]),
    defineReactiveExpression(() => {
      const children = [];
      if (count1.value % 2 === 0){
        children.push($OvsHtmlTag.div({style:"background: red; padding: 10px; color: white;"},["偶数！"]));
      }      return children;
    }),
    defineOvsComponent(() => {
      const children = [];
      const temp$$attrs$$qwwbyf06 = {};
      let count2 = ref(0);
      children.push($OvsHtmlTag.h2({},[
        "Level 2: ",
        defineReactiveExpression(() => count2.value)
      ]));
      children.push($OvsHtmlTag.button({onClick(){
        count2.value++;
      },style:"margin: 10px; padding: 8px 16px; cursor: pointer;"},["Click L2"]));
      return $OvsHtmlTag.div({class:"level-2",style:"border: 2px solid green; padding: 15px; margin: 10px;"},children);
    })({},[]),
    defineReactiveExpression(() => [1,2,3].map(item => $OvsHtmlTag.div({},[
      defineReactiveExpression(() => item)
    ]))),
    defineReactiveExpression(() => {
      const children = [];
      for (let i = 0;i < 3;i++){
        children.push($OvsHtmlTag.div({style:"background: #eee; margin: 5px; padding: 5px;"},[
          "Item ",
          defineReactiveExpression(() => i)
        ]));
      }      return children;
    })
  ]);
});
