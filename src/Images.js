import { promises as Fs } from "fs";
import { Image } from "./Image.js";

class Images extends Array {

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
   * Promise to scan the given path recursively to find all images.
   * @param {String} path directory path
   * @return {Promise} Promise that resolves when scanning is complete
   * @private
   */
  get_images(path) {
    return Fs.opendir(path)
    .then(async dir => { // dir is an AsyncIterable
      const promises = [];
      for await (const f of dir) {
        if (f.isFile() && /^[^.].*\.(png|jpe?g|gif|webp)$/.test(f.name)) {
          const im = new Image(`${path}/${f.name}`);
          this.push(im);
          promises.push(im.init());
        } else if (f.isDirectory() && !/^\./.test(f.name)) {
          promises.push(this.get_images(`${path}/${f.name}`));
        }
      }
      return Promise.all(promises);
    });
  }

  /**
   * Sort the images by reducing area.
   */
  sort_by_area() {
    this.sort((im1, im2) => {
      if (im1.area < im2.area) return 1;
      if (im1.area > im2.area) return -1;
      return 0;
    });
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
