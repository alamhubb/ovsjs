// Getter和Setter
class Rectangle {
  constructor(width, height) {
    this.width = width
    this.height = height
  }
  
  get area() {
    return this.width * this.height
  }
  
  set dimensions(value) {
    this.width = value.width
    this.height = value.height
  }
}

