/*Copyright (C) 2023 Crawford Currie https://github.com/cdot
  License MIT. See README.md at the root of this distribution for full copyright
  and license information.*/

import { Dimensions } from "./Dimensions.js";
import { Rect } from "./Rect.js";

const CASES = [ "TL", "TR", "BL", "BR" ];

/**
 * A Space is a subdivision of a Layout.
 */
class Space extends Rect {

  static next_space = 0;

  /**
   * @param {Layout} layout the layout the space is in.
   * Construct using (x, y, w, h) or (Rect) or (x, y, Rect)
   */
  constructor(layout, x, y, w, h, id) {
    super(x, y, w, h);

    /**
     * Layout this space belongs to
     * @member {Layout}
     */
    this.layout = layout;

    /**
     * Dimensions locked to this space
     * @member {Dimensions?}
     */
    this.lock = undefined;

    /**
     * Spaces in this layout to destroy if this space is locked.
     * @member {Space[]}
     */
    this.overlaps = [];

    /**
     * ID for debugging
     * @member {number}
     */
    this.id = id || Space.next_space++;
  }

  /**
   * Add a space that must be destroyed when this space has an image
   * placed in it.
   * @param {Space} space the space that it overlaps
   * @private
   */
  add_overlap(space) {
    this.overlaps.push(space);
  }

  /**
   * Remove a single overlap from the overlap list. Does NOT remove
   * this space from the overlap's overlap list.
   * @param {Space} space the space to remove
   * @return {boolean} true if the overlaps was removed;
   * @private
   */
  remove_overlap(space) {
    const i = this.overlaps.indexOf(space);
    if (i >= 0) {
      this.overlaps.splice(i, 1);
      return true;
    }
    return false;
  }

  /**
   * Remove all overlaps from the overlap list, removing this space
   * from each overlap's overlap list (if it's there)
   */
  unlink_overlaps() {
    for (const overlap of this.overlaps)
      overlap.remove_overlap(this);
    this.overlaps = [];
  }

  /**
   * Generate a string representation for debugging
   * @return {String} a string describing the image
   */
  toString() {
    const im = this.lock ? ` ${this.lock}` : "";
    const overlap = (!this.overlaps || this.overlaps.length === 0) ? "" :
          "/"+this.overlaps.map(k => k.id).join(",")+"/";
    return `[Space ${this.id} ${this.x},${this.y}:${this.geometry}${im}${overlap}]`;
  }

  /**
   * Determine how well that fits into the this. There's some flex;
   * slightly oversized images are acceptable. The origin of that is
   * ignored.
   * @param {Dimensions} that the rect to fit
   * @return {Dimensions} Dimensions of the unused area, or undefined
   * if the image doesn't fit in the space
   */
  fits(that) {
    const rem = new Dimensions(this.w - that.w, this.h - that.h);
    if (rem.w < -this.layout.minr.w || rem.h < -this.layout.minr.h)
      // Doesn't fit
      return undefined;
    return rem;
  }

  /**
   * Place an image in the top left corner of the space and create spaces
   * for the rest of the area.
   * '''
   * +-------+----+   +-------+----+  +--------+---+
   * | image | XL |   | image | XS |  | image | XS |
   * +-------+    |   +-------+----+  +-------+----+
   * | YS    |    |   | YL         |  | YS    | C  |
   * +-------+----+   +------------+  +-------+----+
   * '''
   * @param {Image} image the image to place
   * @param {Dimensions} rem the remaining width and height after the image
   * is placed
   * @return {Object} object containing created Spaces in XL, YL, XS
   * YS, C.
   * @private
   */
  split_TL(image, rem) {
    let res = {};

    if (rem.w >= this.layout.minr.w) {
      res.XL = new Space(
        this.layout, this.x + image.w, this.y, rem.w, this.h);

      if (rem.h >= this.layout.minr.h) {
        res.XS = new Space(
          this.layout, this.x + image.w, this.y, rem.w, image.h);

        res.YS = new Space(
          this.layout, this.x, this.y + image.h, image.w, rem.h);

        res.C = new Space(
          this.layout, this.x + image.w, this.y + image.h, rem);
      }
    }

    if (rem.h >= this.layout.minr.h)
      res.YL = new Space(
        this.layout, this.x, this.y + image.h, this.w, rem.h);

    return res;
  }

  /**
   * Place an image in the top right corner of the space and create spaces
   * for the rest of the area.
   * '''
   * +----+-------+   +----+-------+  +----+-------+
   * | XL | image |   | XS | image |  | XS | image |
   * |    +-------+   +----+-------+  +----+-------+
   * |    | YS    |   | YL         |  | C  | YS    |
   * +----+-------+   +------------+  +----+-------+
   * '''
   * @param {Image} image the image to place
   * @param {Dimensions} rem the remaining width and height after the image
   * is placed
   * @return {Object} object containing created Spaces in XL, YL, XS
   * YS, C.
   * @private
   */
  split_TR(image, rem) {
    const res = {};

    if (rem.w >= this.layout.minr.w) {
      res.XL = new Space(
        this.layout, this.x, this.y, rem.w, this.h);

      if (rem.h >= this.layout.minr.h) {
        res.XS = new Space(
          this.layout, this.x, this.y, rem.w, image.h);

        res.YS = new Space(
          this.layout, this.x + rem.w, this.y + image.h, image.w, rem.h);

        res.C = new Space(
          this.layout, this.x, this.y + image.h, rem);
      }
    }

    if (rem.h >= this.layout.minr.h)
      res.YL = new Space(
        this.layout, this.x, this.y + image.h, this.w, rem.h);

    this.x += rem.w;

    return res;
  }

  /**
   * Place an image in the bottom left corner of the space and create spaces
   * for the rest of the area.
   * '''
   * +-------+----+   +------------+  +-------+----+
   * | YS    | XL |   | YL         |  | YS    | C  |
   * +-------+    |   +-------+----+  +-------+----+
   * | image |    |   | image | XS |  | image | XS |
   * +-------+----+   +------------+  +-------+----+
   * '''
   * @param {Image} image the image to place
   * @param {Dimensions} rem the remaining width and height after the image
   * is placed
   * @return {Object} object containing created Spaces in XL, YL, XS
   * YS, C.
   * @private
   */
  split_BL(image, rem) {
    const res = {};

    if (rem.w >= this.layout.minr.w) {
      res.XL = new Space(
        this.layout, this.x + image.w, this.y, rem.w, this.h);

      if (rem.h >= this.layout.minr.h) {
        res.XS = new Space(
          this.layout, this.x + image.w, this.y + rem.h, rem.w, image.h);

        res.YS = new Space(
          this.layout, this.x, this.y, image.w, rem.h);

        res.C = new Space(
          this.layout, this.x + image.w, this.y, rem);
      }
    }

    if (rem.h >= this.layout.minr.h)
      res.YL = new Space(
        this.layout, this.x, this.y, this.w, rem.h);

    this.y += rem.h;

    return res;
  }

  /**
   * Place an image in the bottom right corner of the space and create
   * spaces for the rest of the area.
   * '''
   * +-----+-------+   +------------+  +----+-------+
   * |  XL | YS    |   | YL         |  | C  | YS    |
   * |     +-------+   +----+-------+  +----+-------+
   * |     | image |   | XS | image |  | XS | image |
   * +-----+-------+   +------------+  +----+-------+
   * '''
   * @param {Image} image the image to place
   * @param {Dimensions} rem the remaining width and height after the image
   * is placed
   * @return {Object} object containing created Spaces in XL, YL, XS
   * YS, C.
   * @private
   */
  split_BR(image, rem) {
    const res = {};

    if (rem.w >= this.layout.minr.w) {
      res.XL = new Space(
        this.layout, this.x, this.y, rem.w, this.h);

      if (rem.h >= this.layout.minr.h) {
        res.XS = new Space(
          this.layout, this.x, this.y + rem.h, rem.w, image.h);

        res.C = new Space(
          this.layout, this.x, this.y, rem);
      }
    }

    if (rem.h >= this.layout.minr.h) {
      res.YL = new Space(
        this.layout, this.x, this.y, this.w, rem.h);

      if (rem.w >= this.layout.minr.w)
        res.YS = new Space(
          this.layout, this.x + rem.w, this.y, image.w, rem.h);
    }
    this.x += rem.w;
    this.y += rem.h;

    return res;
  }

  /**
   * Place an area into the space. The area must fit. The area will
   * be attached to the space in one of the corners and the Space will
   * be be repositioned and resized to wrap the area. Any extra space
   * will be used to create new spaces from the unused areas.
   * @param {Dimensions} that the area to place
   * @param {String?} where optional indicator of how to split the space.
   * Must be one of "TL", "TR", "BL" or "BR" to indicate the desired corner.
   */
  split(that, where) {
    const rem = this.fits(that);
    if (!rem)
      throw new Error(`${that} doesn't fit in ${this}`);

    console.debug(`place ${that} into ${this}`);

    // Kill linked overlapping spaces
    const murder = [];
    for (const deadspace of this.overlaps) {
      if (!deadspace.lock)
        murder.push(deadspace);
    }
    this.overlaps = [];

    for (const victim of murder)
      this.layout.remove_space(victim);

    // Split down the space to retain excess. This is done by creating
    // overlapping spaces in the two dimensions and recording the
    // overlaps so when a Space so created has an image subsequently
    // placed in it, the overlaps can be removed.
    if (!where)
      where = CASES[Math.floor(CASES.length * Math.random())];
    console.debug(`\tsplit ${where}`);
    let res;
    switch (where) {
    case "TL": res = this.split_TL(that, rem); break;
    case "TR": res = this.split_TR(that, rem); break;
    case "BL": res = this.split_BL(that, rem); break;
    case "BR": res = this.split_BR(that, rem); break;
    }

    if (res.XL) {
      this.w = that.w;
      if (res.YL)
        res.XL.add_overlap(res.YL);
      if (res.XS)
        res.XL.add_overlap(res.XS);
      if (res.C)
        res.XL.add_overlap(res.C);
    }

    if (res.YL) {
      this.h = that.h;
      if (res.XL)
        res.YL.add_overlap(res.XL);
      if (res.YS)
        res.YL.add_overlap(res.YS);
      if (res.C)
        res.YL.add_overlap(res.C);
    }

    if (res.XS) {
      if (res.XL)
        res.XS.add_overlap(res.XL);
    }

    if (res.YS) {
      if (res.YL)
        res.YS.add_overlap(res.YL);
    }

    if (res.C) {
      if (res.XL)
        res.C.add_overlap(res.XL);
      if (res.YL)
        res.C.add_overlap(res.YL);
    }

    if (res.XL) {
      res.XL.id += `${where}XL`;
      this.layout.add_space(res.XL);
    }
    if (res.YL) {
      res.YL.id = `${where}YL`;
      this.layout.add_space(res.YL);
    }
    if (res.XS) {
      res.XS.id += `${where}XS`;
      this.layout.add_space(res.XS);
    }
    if (res.YS) {
      res.YS.id = `${where}YS`;
      this.layout.add_space(res.YS);
    }
    if (res.C) {
      res.C.id += `${where}C`;
      this.layout.add_space(res.C);
    }
  }
}

export { Space };
