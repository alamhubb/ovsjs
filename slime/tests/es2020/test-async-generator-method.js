// 测试所有类型的方法定义
class AllMethodTypes {
    // 1. 普通方法
    normalMethod() {
        return 1
    }

    // 2. Async方法 (ES2017)
    async asyncMethod() {
        return await Promise.resolve(2)
    }

    // 3. Generator方法 (ES6)
    *generatorMethod() {
        yield 3
    }

    // 4. Async Generator方法 (ES2018)
    async *asyncGeneratorMethod() {
        yield 4
    }

    // 5. Getter
    get value() {
        return 5
    }

    // 6. Setter
    set value(v) {
        this._value = v
    }

    // 7. 计算属性名 + async generator
    async *['computedAsyncGen']() {
        yield 7
    }
}

