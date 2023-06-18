import { Rect } from "./Rect.js";

/**
 * A Space is a subdivision of a Layout.
 */
class Space extends Rect {

  static count = 0;

  /**
   * @param {Layout} layout the layout the space is in.
   * Construct using (x, y, w, h) or (Rect) or (x, y, Rect)
   */
  constructor(layout, x, y, w, h) {
    super(x, y, w, h);
    /**
     * Layout this space belongs to
     * @member {Layout}
     */
    this.layout = layout;
    /**
     *  Image locked to this space
     * @member {Image?}
    this.image = undefined;
    /**
     * Spaces in this layout to destroy if this space is locked.
     * @member {Space[]}
     */
    this.kills = [];

    this.id = Space.count++;
  }

  /**
   * Add a space that must be destroyed when this space has an image placed
   * in it.
   * @param {Space} space the space to kill
   */
  add_kill(space) {
    this.kills.push(space);
  }

  /**
   * Remove a single kill from the kill list. Does NOT remove this space
   * from the kill's kill list.
   * @param {Space} space the space to remove
   */
  remove_kill(space) {
    const i = this.kills.indexOf(space);
    if (i >= 0) {
      this.kills.splice(i, 1);
    }
  }

  /**
   * Remove all kills from the kill list, removing this space from
   * each kill's kill list (if it's there)
   */
  unlink_kills() {
    for (const kill of this.kills)
      kill.remove_kill(this);
    this.kills = [];
  }

  /**
   * Generate a string representation for dubugging
   * @return {String} a string describing the image
   */
  toString() {
    const im = this.image ? ` ${this.image}` : "";
    const kill = this.kills.length === 0 ? "" :
          "/"+this.kills.map(k => k.id).join(",")+"/";
    return `[Space ${this.id} ${this.geometry}${im}${kill}]`;
  }

  /**
   * Determine if the image fits into the available space. There's some flex;
   * slightly oversized images are acceptable.
   * @param {Image} image the image to fit
   * @return {Rect} Rect defining unused area, or undefined if the image
   * doesn't fit in the space
   */
  image_fits(image) {
    const rem_x = this.w - image.w;
    const rem_y = this.h - image.h;
    if (rem_x < -this.layout.minr.w || rem_y < -this.layout.minr.h)
      // Doesn't fit
      return undefined;
    return new Rect(0, 0, rem_x, rem_y);
  }

  /**
   * Get the offset of the image that will centre it in the space
   * @return {String} "+X+Y"
   */
  get centred() {
    const offx = this.x + (this.w - this.image.w) / 2;
    const offy = this.y + (this.h - this.image.h) / 2;
    return `+${offx}+${offy}`;
  }

  /**
   * Place an image into the space. The image must fit. The Space
   * will be resized to the image and any extra space will be used
   * to create new spaces to the right and below. The new spaces may
   * overlap each other but will not overlap the image.
   * @param {Image} image the image to place
   */
  place_image(image) {
    const rem = this.image_fits(image);

    if (!rem)
      throw new Error("Image doesn't fit");

    console.debug(`place ${image} into ${this.layout.name} ${this}`);

    // Kill the linked overlapping spaces, if they are there
    const murder = [];
    for (const deadspace of this.kills) {
      if (!deadspace.image)
        murder.push(deadspace);
    }
    this.kills = [];

    for (const victim of murder)
        this.layout.remove_space(victim);

    // Split down the space to retain excess. This is done by creating
    // overlapping spaces in the two dimensions and recording the overlaps
    // so when a spec if subsequently used, the overlaps can be removed.
    let corner, tall;

    //                 rem.w
    //       +-------+------+   +-------+-------+  +-------+--------+
    //       | image | tall |   | image | short |  | image | short  |
    //       +-------+      |   +-------+-------+  +-------+--------+
    // rem.h | thin  |      |   | fat           |  | thin  | corner |
    //       +-------+------+   +---------------+  +-------+--------+
    if (rem.w >= this.layout.minr.w) {
      tall = new Space(
        this.layout, this.x + image.w, this.y, rem.w, this.h);
      this.layout.add_space(tall, "XL");

      if (rem.h > this.layout.minr.h) {
        const short = new Space(
          this.layout, this.x + image.w, this.y, rem.w, image.h);
        this.layout.add_space(short, "XS");

        tall.add_kill(short);
        short.add_kill(tall);

        corner = new Space(
          this.layout, this.x + image.w, this.y + image.h, rem);
        this.layout.add_space(corner, "C");

        tall.add_kill(corner);
        corner.add_kill(tall);
      }
    }

    if (rem.h > this.layout.minr.h) {
      const fat = new Space(
        this.layout, this.x, this.y + image.h, this.w, rem.h);
      this.layout.add_space(fat, "YL");

      if (rem.w > this.layout.minr.w) {
        const thin = new Space(
          this.layout, this.x, this.y + image.h, image.w, rem.h);
        this.layout.add_space(thin, "YS");

        fat.add_kill(thin);
        thin.add_kill(fat);
      }

      if (corner) {
        fat.add_kill(corner);
        corner.add_kill(fat);
      }

      if (tall) {
        tall.add_kill(fat);
        fat.add_kill(tall);
      }
    }

    // Note that we don't remove this space from the layout, we just mark it
    // as occupied
    this.image = image;
    console.debug(`Resize ${this} ${image.w}x${image.h}`);
    this.w = image.w;
    this.h = image.h;
  }
}

export { Space };
