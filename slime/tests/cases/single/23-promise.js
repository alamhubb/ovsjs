// Promise完整测试

// 基础Promise
const promise1 = new Promise((resolve, reject) => {
  resolve('success');
});

const promise2 = new Promise((resolve, reject) => {
  reject('error');
});

// Promise.resolve/reject
const resolved = Promise.resolve(42);
const rejected = Promise.reject('failed');

// Promise.all
const allPromises = Promise.all([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]);

// Promise.race
const racePromises = Promise.race([
  Promise.resolve('first'),
  Promise.resolve('second')
]);

// Promise.allSettled
const settledPromises = Promise.allSettled([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]);

// Promise链式调用
const chained = Promise.resolve(10)
  .then(x => x * 2)
  .then(x => x + 5)
  .catch(err => console.log(err))
  .finally(() => console.log('done'));

// 使用
promise1.then(result => {
  console.log(result);
});






