// Map/Set测试

// Map基础操作
const map = new Map();
map.set('key1', 'value1');
map.set('key2', 'value2');
map.set(123, 'numeric key');

const obj = { a: 1 };
map.set(obj, 'object key');

// Map获取和检查
const value1 = map.get('key1');
const hasKey = map.has('key2');
const size = map.size;

// Map遍历
map.forEach((value, key) => {
  console.log(key, value);
});

// Map初始化
const map2 = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3]
]);

// Set基础操作
const mySet = new Set();  // 改：避免set关键字冲突
mySet.add(1);
mySet.add(2);
mySet.add(3);
mySet.add(2); // 重复，会被忽略

// Set检查
const hasValue = mySet.has(2);
const setSize = mySet.size;

// Set遍历
mySet.forEach(value => {
  console.log(value);
});

// Set初始化
const set2 = new Set([1, 2, 3, 4, 5]);

// Set去重
const arr = [1, 2, 2, 3, 3, 4];
const uniqueSet = new Set(arr);
const uniqueArr = Array.from(uniqueSet);






