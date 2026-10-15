/*Copyright (C) 2023 Crawford Currie https://github.com/cdot
  License MIT. See README.md at the root of this distribution for full copyright
  and license information.*/
import { promises as Fs } from "fs";
import Tmp from "tmp-promise";

import { Dimensions } from "./Dimensions.js";
import { Rect } from "./Rect.js";
import { FF } from "./FF.js";

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
    return FF.probe(this.path)
    .then(info => {
      this.w = info.streams[0].width; this.h = info.streams[0].height;
      return this;
    });
  }

  /**
   * Generate a string representation for debugging
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
   * dimensions. The image is scaled if necessary and written to a temporary
   * file that will be destroyed when the process exits.
   * @param {Dimensions} size bounds required for the image
   * @return {Promise} Promise resolves to the scaled image Image
   */
  scaled(size) {
    const dim = this.fit_into(size);
    // aspect ratio is preserved, so if either w or h is the same as
    // the space there's nothing to do
    if (dim.h === size.lock.h || dim.w === size.lock.w) {
      //console.debug("No scaling");
      return this;
    }
    // Otherwise we have to scale the image
    return Tmp.tmpName({ postfix: ".png" })
    .then(tmpname => new Promise((resolve, reject) => {
      //console.debug("Scaling", dim.geometry);
      FF.mpeg([
        "-i", this.path,
        "-vf", `scale=${dim.geometry}`,
        tmpname
      ])
      .then(() => {
        const copy = new Image(tmpname);
        copy.w = dim.w; copy.h = dim.h;
        resolve(copy);
      });
    }));
	}
}

export { Image };
