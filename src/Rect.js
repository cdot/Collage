/*Copyright (C) 2023 Crawford Currie https://github.com/cdot
  License MIT. See README.md at the root of this distribution for full copyright
  and license information.*/

import { Dimensions } from "./Dimensions.js";

/**
 * Rectangle. This is a Dimensions with an origin (x, y) that gives
 * the top-left corner.
 */
class Rect extends Dimensions {

  /**
   * Construct using (w, h) or (x, y, w, h) or (x, y, Dimension)
   * or (Rect) or (Dimension)
   */
  constructor(x, y, w, h) {
    super();
    if (x instanceof Rect) {
      if (typeof y !== "undefined" || typeof w !== "undefined"
          || typeof h !== "undefined")
        throw new Error("Bad params +${x}+${y} ${w}x${h}");
      this.x = x.x;
      this.y = x.y;
      this.w = x.w;
      this.h = x.h;
    } else if (x instanceof Dimensions) {
      if (typeof y !== "undefined" || typeof w !== "undefined"
          || typeof h !== "undefined")
        throw new Error("Bad params +${x}+${y} ${w}x${h}");
      this.x = this.y = 0;
      this.w = x.w;
      this.h = x.h;
    } else if (w instanceof Dimensions) {
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
   * Get an ImageMagick geometry string for the rect
   * @return {string} "WxH+X+Y" where W, H, X and Y are integers. If
   * X and Y are both zero, the + clause is omitted
   */
  get geometry() {
    return super.geometry +
    ((this.x > 0 || this.y > 0) ? `+${Math.floor(this.x)}+${Math.floor(this.y)}` : "");
  }

  /**
   * Check if this contains the point.
   * @param {number} x coordinate
   * @param {number} y coordinate
   * @return {Boolean} true if it is contained
   */
  contains_point(x, y) {
    return (this.x <= x && x < this.x + this.w
            && this.y <= y && y < this.y + this.w);
  }

  /**
   * Check if this wholly contains (or is identical to) that.
   * @param {Rect} that that rect
   * @return {Boolean}
   */
  contains(that) {
    if (!(that instanceof Rect))
      throw new Error("Can only contains a Rect in a Rect");
    return this.x <= that.x && that.x < this.x + this.w
    && this.y <= that.y && that.y < this.y + this.h
    && that.x + that.w <= this.x + this.w
    && that.y + that.h <= this.y + this.h;
  }

  /**
   * Check if an edge of this aligns exactly with an edge of that. This
   * is used to determine if two rects with coincident edges can be merged.
   * @param {Rect} that that rect
   * @return {String?} "LEFT", "RIGHT", "TOP", "BOTTOM" or undefined if they
   * don't align.
   */
  mergeable(that) {
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

  /**
   * Calculate the offset that will centre that in this. Only the
   * width and height of that are used, the origin is ignored.
   * @param {Rect} that
   * @return {String} An ImageMagick geometry string giving the required
   * offset "+X+Y" where X and Y are integers
   */
  centre_offset(that) {
    if (!(that instanceof Rect))
      throw new Error("Can only centre a Rect in a Rect");
    const offx = this.x + (this.w - that.w) / 2;
    const offy = this.y + (this.h - that.h) / 2;
    return `+${Math.floor(offx)}+${Math.floor(offy)}`;
  }
}

export { Rect };
