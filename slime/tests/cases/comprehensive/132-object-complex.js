// 复杂对象字面量
const method = 'greet';
const obj = {
  name: 'Alice',
  [method]() {
    return 'Hello';
  },
  get value() {
    return this.name;
  }
};





