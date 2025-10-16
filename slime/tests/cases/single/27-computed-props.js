// 计算属性名测试

// 基础计算属性
const key = 'dynamicKey';
const obj1 = {
  [key]: 'value',
  ['computed' + 'Key']: 'computed value'
};

// 表达式作为属性名
const prefix = 'user';
const obj2 = {
  [prefix + 'Name']: 'Alice',
  [prefix + 'Age']: 25,
  [`${prefix}Email`]: 'alice@example.com'
};

// Symbol作为计算属性
const sym = Symbol('id');
const obj3 = {
  [sym]: 123,
  [Symbol.iterator]: function* () {
    yield 1;
  }
};

// 方法中的计算属性名
const methodName = 'calculate';
const obj4 = {
  [methodName]() {
    return 42;
  },
  [methodName + 'Sum'](a, b) {
    return a + b;
  }
};

// Getter/Setter with computed names
const propName = 'value';
const obj5 = {
  _val: 0,
  get [propName]() {
    return this._val;
  },
  set [propName](v) {
    this._val = v;
  }
};

// Class中的计算属性
class DynamicClass {
  [key] = 'class property';
  
  [methodName]() {
    return 'dynamic method';
  }
}

// 使用
const val1 = obj1[key];
const val2 = obj2[prefix + 'Name'];
const result = obj4.calculate();






