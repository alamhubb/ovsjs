// 复杂class组合
class Base {
  constructor(x) {
    this.x = x;
  }
  static create() {
    return new this(10);
  }
}
class Derived extends Base {
  constructor(x, y) {
    super(x);
    this.y = y;
  }
  get sum() {
    return this.x + this.y;
  }
}
const obj = Derived.create();






