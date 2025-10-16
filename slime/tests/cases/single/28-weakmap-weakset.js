// WeakMap/WeakSet测试

// WeakMap基础
const weakMap = new WeakMap();

const obj1 = { id: 1 };
const obj2 = { id: 2 };

// WeakMap只能用对象作为key
weakMap.set(obj1, 'data for obj1');
weakMap.set(obj2, 'data for obj2');

// WeakMap操作
const hasObj1 = weakMap.has(obj1);
const dataObj1 = weakMap.get(obj1);
weakMap.delete(obj2);

// WeakMap用于私有数据
const privateData = new WeakMap();

class Person {
  constructor(name) {
    privateData.set(this, { name });
  }
  
  getName() {
    return privateData.get(this).name;
  }
}

const person = new Person('Alice');
const name = person.getName();

// WeakSet基础
const weakSet = new WeakSet();

const obj3 = { value: 1 };
const obj4 = { value: 2 };

// WeakSet只能存储对象
weakSet.add(obj3);
weakSet.add(obj4);

// WeakSet操作
const hasObj3 = weakSet.has(obj3);
weakSet.delete(obj4);

// WeakSet用于标记对象
const processedObjects = new WeakSet();

function processObject(obj) {
  if (!processedObjects.has(obj)) {
    // 处理对象
    processedObjects.add(obj);
  }
}

const item = { data: 'test' };
processObject(item);
const isProcessed = processedObjects.has(item);






