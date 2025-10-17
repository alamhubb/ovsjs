// Mixin模式
const Flyable = {
  fly() {
    return 'flying';
  }
};
class Bird {
  constructor() {
    Object.assign(this, Flyable);
  }
}
const bird = new Bird();






