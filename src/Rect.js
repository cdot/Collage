/*Copyright (C) 2023 Crawford Currie https://github.com/cdot
  License MIT. See README.md at the root of this distribution for full copyright
  and license information.*/

/**
 * Rectangle
 */
class Rect {

  /**
   * Construct using (w, h) or (x, y, w, h) or (x, y, Rect) or (Rect)
   */
  constructor(x, y, w, h) {
    if (x instanceof Rect) {
      if (typeof y !== "undefined" || typeof w !== "undefined"
          || typeof h !== "undefined")
        throw new Error("Bad params +${x}+${y} ${w}x${h}");
      this.x = x.x;
      this.y = x.y;
      this.w = x.w;
      this.h = x.h;
    } else if (w instanceof Rect) {
      if (typeof x !== "number" || typeof y !== "number"
          || typeof h !== "undefined")
        throw new Error("Bad params +${x}+${y} ${w}x${h}");
      this.x = x;
      this.y = y;
      this.w = w.w;
      this.h = w.h;
    } else if (typeof w === "undefined") {
      if (typeof x !== "number" || typeof y !== "number"
          || typeof h !== "undefined")
        throw new Error("Bad params +${x}+${y} ${w}x${h}");
      this.x = this.y = 0;
      this.w = x; this.h = y;
    } else {
      if (typeof x !== "number" || typeof y !== "number"
          || typeof w !== "number" || typeof h !== "number")
        throw new Error("Bad params +${x}+${y} ${w}x${h}");
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
    }
  }

  /**
   * Get a geometry string for the rect
   */
  get geometry() {
    return `${this.w}x${this.h}` +
    ((this.x > 0 || this.y > 0) ? `+${this.x}+${this.y}` : "");
  }

  /**
   * Get the area of the rectangle
   */
  get area() {
    return this.w * this.h;
  }

  /**
   * Get the aspect ratio of the rectangle (height/width)
   */
  get aspect_ratio() {
    if (this.w === 0)
      throw new Error(`Can't get aspect ratio of ${this}`);
    return this.h / this.w;
  }

  /**
   * Check if this rect contains that rect
   * @param {Rect} that that rect
   * @return {Boolean}
   */
  contains(that) {
    return !(this.x > that.x + that.w
        || this.x + this.w <= that.x
        || this.y > that.y + that.w
        || this.y + this.w <= that.x);
  }

  /**
   * Check if an edge of this rect aligns with an edge of that rect.
   * Returns LEFT if that is to the left of this
   * @param {Rect} that that rect
   * @return {String?} LEFT, RIGHT, TOP, BOTTOM or undefined if they
   * don't align.
   */
  aligns(that) {
    if (that.y === this.y && that.h === this.h) {
      // Left or right
      if (this.x === that.x + that.w) return "LEFT";
      if (this.x + this.w === that.x) return "RIGHT";
    } else if (that.x === this.x && that.w === this.w) {
      // Top or bottom
      if (this.y === that.y + that.h) return "TOP";
      if (this.y + this.h == that.y) return "BOTTOM";
    }
    return undefined;
  }
}

export { Rect };
