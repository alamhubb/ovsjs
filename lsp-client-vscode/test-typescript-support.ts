// 这个文件用来测试 VS Code 内置的 TypeScript 支持
// 即使扩展配置错误，这些功能仍然工作

interface TestInterface {
    name: string;
    age: number;
}

class TestClass {
    private property: string;
    
    constructor(public name: string) {
        this.property = "test";
    }
    
    public method(param: TestInterface): string {
        // 这里应该有智能提示
        return param.name + this.property;
    }
}

// 测试类型检查
const instance = new TestClass("hello");
const result = instance.method({ name: "world", age: 25 });

// 测试错误检测（这应该被 VS Code 检测到）
const wrongType: string = 123; // 类型错误
const undefinedVar = someUndefinedVariable; // 未定义变量

export { TestClass, TestInterface };



