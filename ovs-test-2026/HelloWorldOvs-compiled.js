// 编译自: d:\project\parserall\ovsjs\ovs-test-2026\src\components\HelloWorldOvs.ovs
// 编译时间: 2026/1/14 00:45:03

import {$OvsHtmlTag,defineOvsComponent,defineReactiveExpression} from "ovsjs";
import {ref,Fragment,h} from 'vue';
export default defineOvsComponent(props => {
  let count1 = ref(0);
  return $OvsHtmlTag.div({},[
    $OvsHtmlTag.h1({},[
      defineReactiveExpression(() => "Level 1: "),
      defineReactiveExpression(() => count1.value)
    ]),
    $OvsHtmlTag.button({onClick(){
      count1.value++;
    },},[
      defineReactiveExpression(() => "Click L1")
    ]),
    defineReactiveExpression(() => {
      const children = [];
      if (count1.value % 2 === 0){
        children.push($OvsHtmlTag.div({},[
          defineReactiveExpression(() => "偶数！")
        ]));
      }      return children;
    }),
    defineOvsComponent(() => {
      const children = [];
      const temp$$attrs$$i0d08dwf = {};
      let count2 = ref(0);
      children.push($OvsHtmlTag.h2({},[
        defineReactiveExpression(() => "Level 2: "),
        defineReactiveExpression(() => count2.value)
      ]));
      children.push($OvsHtmlTag.button({onClick(){
        count2.value++;
      },},[
        defineReactiveExpression(() => "Click L2")
      ]));
      children.push(defineOvsComponent(() => {
        const children = [];
        const temp$$attrs$$prqj1p93 = {};
        let count3 = ref(0);
        children.push($OvsHtmlTag.h3({},[
          defineReactiveExpression(() => "Level 3: "),
          defineReactiveExpression(() => count3.value)
        ]));
        children.push($OvsHtmlTag.button({onClick(){
          count3.value++;
        },},[
          defineReactiveExpression(() => "Click L3")
        ]));
        return $OvsHtmlTag.div({},children);
      })({},[]));
      return $OvsHtmlTag.div({},children);
    })({},[])
  ]);
});
