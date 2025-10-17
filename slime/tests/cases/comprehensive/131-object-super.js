// super调用
const parent = {
  greet() {
    return 'Hello';
  }
};
const child = {
  __proto__: parent,
  greet() {
    return super.greet() + ' World';
  }
};





