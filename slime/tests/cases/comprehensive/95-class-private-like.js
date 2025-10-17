// 私有属性模式
class Counter {
  constructor() {
    this._count = 0;
  }
  increment() {
    this._count++;
  }
  getCount() {
    return this._count;
  }
}
const counter = new Counter();
counter.increment();






