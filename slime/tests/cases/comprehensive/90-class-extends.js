// 继承
class Animal {
  constructor(name) {
    this.name = name;
  }
}
class Dog extends Animal {
  bark() {
    return 'Woof';
  }
}
const dog = new Dog('Rex');






