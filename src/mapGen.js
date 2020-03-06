export class Map {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export class Cell {
  constructor(points, center, isInfinite) {
    this.points = points;
    this.center = center;
    this.isInfinite = isInfinite;
  }
}
