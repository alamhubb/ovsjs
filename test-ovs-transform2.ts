import { vitePluginOvsTransform } from './ovs/ovs-compiler/src/index.ts';

const code = `export class OvsButton {
    constructor() {
    }
    
    initData() {
        if (this.initialized === undefined) {
            this.count = 0
            this.initialized = true
        }
    }
    
    handleClick() {
        this.count++
    }
    
    render() {
        this.initData()
        
        const baseStyle = css {
            displayInlineFlex,
            alignItemsCenter,
            justifyContentCenter,
            paddingTop_8px,
            paddingBottom_8px,
            paddingLeft_16px,
            paddingRight_16px,
            borderRadius_4px,
            cursorPointer,
            fontWeight500,
            backgroundColor_409eff,
            colorWhite,
            borderNone
        }
        
        return button(class = baseStyle, onClick = () => this.handleClick()) {
            \`OVS Button: \${this.count}\`
        }
    }
}`;

console.log('=== OVS Transform Output ===');
const result = vitePluginOvsTransform(code);
console.log(result.code);

// 模拟 wrapOvsClassComponents
function wrapOvsClassComponents(code: string): string {
    const classExportRegex = /export\\s+class\\s+(\\w+)\\s*\\{/g
    const matches = [...code.matchAll(classExportRegex)]
    
    if (matches.length === 0) {
        return code
    }

    const hasVueImport = /import\\s*\\{[^}]*defineComponent[^}]*\\}\\s*from\\s*['"]vue['"]/.test(code)
    
    let result = code
    const classNames: string[] = []
    
    for (const match of matches) {
        const className = match[1]
        classNames.push(className)
        result = result.replace(
            new RegExp(\`export\\\\s+class\\\\s+\${className}\\\\s*\\\\{\`),
            \`class _OvsClass_\${className} {\`
        )
    }
    
    if (!hasVueImport) {
        result = \`import { defineComponent, reactive, h } from 'vue';\\n\` + result
    }
    
    for (const className of classNames) {
        const wrapperCode = \`
export const \${className} = defineComponent({
    name: '\${className}',
    setup(props, { slots }) {
        const instance = reactive(new _OvsClass_\${className}());
        return () => {
            const result = instance.render();
            return result;
        };
    }
});
\`
        result += wrapperCode
    }
    
    return result
}

console.log('\\n=== After wrapOvsClassComponents ===');
console.log(wrapOvsClassComponents(result.code));
