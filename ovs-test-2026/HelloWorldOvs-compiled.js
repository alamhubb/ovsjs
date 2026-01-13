// 编译自: d:\project\parserall\ovsjs\ovs-test-2026\src\components\HelloWorldOvs.ovs
// 编译时间: 2026/1/14 00:35:47

import {$OvsHtmlTag,defineOvsComponent,defineReactiveExpression} from "ovsjs";
import {ref,Fragment,h} from 'vue';
export default defineOvsComponent(props => {
  return $OvsHtmlTag.div({},[
    $OvsHtmlTag.h1({},[]),
    $OvsHtmlTag.button({onClick(){
          },},[]),
    $OvsHtmlTag.div({},[
      $OvsHtmlTag.h2({},[]),
      $OvsHtmlTag.button({onClick(){
              },},[]),
      $OvsHtmlTag.div({},[
        $OvsHtmlTag.h3({},[]),
        $OvsHtmlTag.button({onClick(){
                  },},[])
      ])
    ])
  ]);
});
