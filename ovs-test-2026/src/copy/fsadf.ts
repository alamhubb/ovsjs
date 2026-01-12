import {$OvsHtmlTag,defineOvsComponent} from "/node_modules/.vite/deps/ovsjs.js?v=33692da7";
import {ref} from "/node_modules/.vite/deps/vue.js?v=33692da7";

export default defineOvsComponent(props => {
    const CountDisplay = defineOvsComponent(props => {
        return () => $OvsHtmlTag.div({class:'count-display'},[
            $OvsHtmlTag.span({},['Current count: ']),
            $OvsHtmlTag.strong({style:'color: #42b883; font-size: 24px;'},[props.count])
        ]);
    });
    return (function(){
        const children = [];
        const temp$$attrs$$n4lhntgp = {};
        children.push($OvsHtmlTag.h3({},[
            "You've successfully created a project with ",
            $OvsHtmlTag.a({href:'https://vite.dev/',target:'_blank',rel:'noopener'},['Vite']),
            ' + ',
            $OvsHtmlTag.a({href:'https://vuejs.org/',target:'_blank',rel:'noopener'},['Vue 3']),
            ' + ',
            $OvsHtmlTag.a({href:'https://github.com/alamhubb/ovsjs',target:'_blank',rel:'noopener'},['OVS']),
            '.'
        ]));
        const msg = "You did it!";
        let count = ref(0);
        const timer = setInterval(() => {
            count.value = count.value + 1;
        },1000);
        children.push($OvsHtmlTag.h1({class:'green'},[msg]));
        const countView = $OvsHtmlTag.span({},[count]);
        children.push(CountDisplay({count:countView},[]));
        children.push($OvsHtmlTag.p({style:'color: #888; font-size: 12px;'},['(Click anywhere to reset)']));
        return $OvsHtmlTag.div({class:'greetings',onClick(){
                count.value = 0;
            }},children);
    })();
});
