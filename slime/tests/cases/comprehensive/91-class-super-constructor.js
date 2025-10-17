// super构造函数
class Vehicle {
  constructor(type) {
    this.type = type;
  }
}
class Car extends Vehicle {
  constructor(brand) {
    super('car');
    this.brand = brand;
  }
}
const car = new Car('Toyota');






