import { promises as Fs } from "fs";
import Gm from "gm";
import { Rect } from "./Rect.js";
import Tmp from "tmp-promise";

/**
 * Holder for an image. Holds references to the source path to the image
 * and it's original size.
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
    /**
     * Scaling to apply to the image
     * @member {Number}
     */
    this.scale = 1;
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
   * Determine the scaling required to fit the whole of the image
   * within the given bounds. The scaling is applied to the image,
   * and the scale factor that was applied recorded in `scale`.
   * @param {Rect} bounds limiting rect
   * @return {Number} scale factor (1 if the image already fits)
   */
  scale_to_fit(bounds) {
    let scale_x = 1, scale_y = 1;
    if (this.w > bounds.w)
      scale_x = bounds.w / this.w;
    if (this.h > bounds.h)
      scale_y = bounds.h / this.h;
    this.scale = Math.min(scale_x, scale_y);
    if (this.scale !== 1) {
      this.w *= this.scale;
      this.h *= this.scale;
    }
    return this.scale;
  }

  /**
   * Make a scaled copy of the image if `scale` is not 1.
   * The copy is created as a temporary file that must be destroyed when
   * the process exits. The Image object is modified to reflect the new
   * location and scaling of the image.
   * @return {Promise} Promise resolves when image has been copied
   */
  scale_in_place() {
    if (this.scale === 1)
      return Promise.resolve(this);
    return Tmp.tmpName({postfix: ".png"})
    .then(tmp => new Promise((resolve, reject) => {
      Gm(this.path)
      .geometry(`${this.w}x${this.h}`)
      .write(tmp, e => {
        if (e)
          reject(e);
        else {
          this.scale = 1;
          this.path = tmp;
          resolve(this);
        }
      });
    }));
	}
}

export { Image };
