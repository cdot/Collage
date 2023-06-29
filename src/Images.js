/*Copyright (C) 2023 Crawford Currie https://github.com/cdot
  License MIT. See README.md at the root of this distribution for full copyright
  and license information.*/
import { promises as Fs } from "fs";
import { Image } from "./Image.js";

class Images extends Array {

  /**
   * Promise to scan the given path recursively to find all images.
   * Supported extensions are .png, .jpg, .jpeg, .gif, .webp (case
   * independent)
   * @param {String} path directory path
   * @param {boolean?} norecurse don't recurse into subdirectories
   * @return {Promise} Promise that resolves when scanning is complete
   * @private
   */
  get_images(path, norecurse) {
    return Fs.opendir(path)
    .then(async dir => { // dir is an AsyncIterable
      const promises = [];
      for await (const f of dir) {
        if (f.isFile() && /^[^.].*\.(png|jpe?g|gif|webp)$/i.test(f.name)) {
          const im = new Image(`${path}/${f.name}`);
          this.push(im);
          promises.push(im.init());
        } else if (!norecurse && f.isDirectory() && !/^\./.test(f.name)) {
          promises.push(this.get_images(`${path}/${f.name}`));
        }
      }
      return Promise.all(promises);
    });
  }

  /**
   * Copy images to the destination directory, rescaling images that
   * are larger than the target widthXheight as we go.
   * @param {String} destdir destination directory
   * @param {Object.<w:int,h:int>} max max width and height of an image
   * @return {Promise} Promise that resolves when all images have been moved
   */
  scale_and_move(destdir, bounds) {
    return Promise.all(this.map(
      img => img.scale_and_move(destdir, bounds)));
  }

  /**
   * Sort the images by reducing area in place.
   */
  sort_by_area() {
    this.sort((im1, im2) => {
      if (im1.area < im2.area) return 1;
      if (im1.area > im2.area) return -1;
      return 0;
    });
  }

  /**
   * Shuffle the images randomly in place.
   */
  shuffle() {
    for (let i = this.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this[i], this[j]] = [this[j], this[i]];
    }
  }

  /**
   * Find the width of the narrowest image
   */
  get narrowest_width() {
    let min = Number.MAX_SAFE_INTEGER;
    for (const i of this) {
      if (i.w < min)
        min = i.w;
    }
    return min;
  }

  /**
   * Find the height of the shortest image
   */
  get shortest_height() {
    let min = Number.MAX_SAFE_INTEGER;
    for (const i of this) {
      if (i.h < min)
        min = i.h;
    }
    return min;
  }
}

export { Images }
