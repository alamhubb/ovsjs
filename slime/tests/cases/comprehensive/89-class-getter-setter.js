// getter/setter
class Circle {
  constructor(radius) {
    this._radius = radius;
  }
  get radius() {
    return this._radius;
  }
  set radius(value) {
    this._radius = value;
  }
  get area() {
    return this._radius * this._radius * 3.14;
  }
}
const c = new Circle(5);
const r = c.radius;
c.radius = 10;






