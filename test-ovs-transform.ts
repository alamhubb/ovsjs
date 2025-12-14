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

console.log('Input code:');
console.log(code);
console.log('\n--- Transform ---\n');

try {
  const result = vitePluginOvsTransform(code);
  console.log('Output code:');
  console.log(result.code);
} catch (e: any) {
  console.log('Transform error:', e.message);
}
