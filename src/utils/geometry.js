export class BoundingBox {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  area() {
    return this.width * this.height;
  }

  toRectangle() {
    return { left: this.x, top: this.y, width: this.width, height: this.height };
  }
}
