// super方法调用
class Parent {
  greet() {
    return 'Hello';
  }
}
class Child extends Parent {
  greet() {
    return super.greet() + ' World';
  }
}
const child = new Child();
const msg = child.greet();






