/*Copyright (C) 2023 Crawford Currie https://github.com/cdot
  License MIT. See README.md at the root of this distribution for full copyright
  and license information.*/

class Dimensions {
  constructor(w, h) {
    if (w instanceof Dimensions) {
      this.w = w.w;
      this.h = w.h;
    } else if (typeof w === "number") {
      if (typeof h !== "number")
        throw new Error("Bad params ${w}x${h}");
      this.w = w;
      this.h = h;
    } else {
      this.w = this.h = 0;
    }
  }
  /**
   * Generate a string representation for debugging
   * @return {String} a string describing the rect
   */
  toString() {
    return this.geometry;
  }

  /**
   * Get an ImageMagick geometry string for the dimension
   * @return {string} "WxH" where W and H are integers
   */
  get geometry() {
    return `${Math.floor(this.w)}x${Math.floor(this.h)}`;
  }

  /**
   * Get the area
   * @return {number} the area w * h
   */
  get area() {
    const res = Math.abs(this.w) * Math.abs(this.h);
    return (this.w < 0 || this.h < 0) ? -res : res;
  }

  /**
   * Get the aspect ratio of the rectangle (width/height)
   * @return {number} the aspect ratio
   */
  get aspect_ratio() {
    if (this.h === 0)
      throw new Error(`Can't get aspect ratio of zero-height Rect ${this}`);
    return this.w / this.h;
  }

  /**
   * Compute the Dimensions that will fit this into that while preserving
   * the aspect ratio of this.
   * @param {Dimensions} that limiting dimensions
   * @return {Dimensions} the largest dimensions with the same aspect
   * ratio as this that fits in that.
   */
  fit_into(that) {
    if (that === this)
      return this;

    if (that.w === this.w && that.h === this.h)
      return this;

    const scale = (this.aspect_ratio >= that.aspect_ratio)
          ? that.w / this.w
          : that.h / this.h;
    return new Dimensions(this.w * scale, this.h * scale);
  }
}

export { Dimensions }
