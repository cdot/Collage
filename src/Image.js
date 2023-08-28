/*Copyright (C) 2023 Crawford Currie https://github.com/cdot
  License MIT. See README.md at the root of this distribution for full copyright
  and license information.*/
import { promises as Fs } from "fs";
import Gm from "gm";
import { Dimensions } from "./Dimensions.js";
import { Rect } from "./Rect.js";
import Tmp from "tmp-promise";

/**
 * Holder for an image. Holds references to the source path to the image
 * and any scaling that has been applied. 
 */
class Image extends Rect {

  /**
   * The constructor does not determine the size of the image, that has to be
   * done using the init() method. e.g.
   * ```
   * new Image("blah.png").init().then(image => ...)
   * ```
   */
  constructor(file) {
    super(0, 0);

    /**
     * File path of the image.
     * @member {String}
     */
    this.path = file;
  }

  /**
   * Promise to determine the image size
   * @return {Promise} resolves to the Image when the image size is known
   */
  init() {
    if (this.sz)
      return Promise.resolve();
    return new Promise(
      resolve => {
        Gm(this.path)
        .size((err, val) => {
          if (err) throw new Error(err);
          this.w = val.width; this.h = val.height;
          resolve(this);
        });
      });
  }

  /**
   * Generate a string representation for dubugging
   * @return {String} a string describing the image
   */
  toString() {
    return `<Im "${this.basename}" ${this.geometry}>`;
  }

  /**
   * Get the basename of the image (the path with all / components removed)
   * @return {String} the basename of the image file
   */
  get basename() {
    const bits = this.path.split(/\/+/);
    return bits[bits.length - 1];
  }

  /**
   * Promise to delete the image from disc
   * @return {Promise} a promise that resolves when the image is deleted
   */
  delete() {
    return Fs.unlink(this.path);
  }

  /**
   * Promise that resolves to an image that will fit in the given
   * dimensions. If a scaled copy is needed, it is created as a temporary
   * file that will be destroyed when the process exits.
   * @param {Dimensions} size bounds required for the image
   * @return {Promise} Promise resolves to this or the copy Image
   */
  scaled(size) {
    const dim = this.fit_into(size);

    return Tmp.tmpName({ postfix: ".png" })
    .then(tmpname => new Promise((resolve, reject) => {
      Gm(this.path)
      .geometry(dim.geometry)
//      .drawText(0, dim.h / 2, `${this.basename} ${this.geometry}`) // DEBUG
      .write(tmpname, e => {
        if (e)
          reject(e);
        else {
          const copy = new Image(tmpname);
          copy.w = dim.w; copy.h = dim.h;
          resolve(copy);
        }
      });
    }));
	}
}

export { Image };
