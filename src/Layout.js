import Gm from "gm";
import { Rect } from "./Rect.js";
import { Space } from "./Space.js";

/**
 * A Layout is a complete background. A layout contains a list of
 * spaces. Each space may be an empty space, or an image space.
 * Empty spaces can overlap each other, image spaces cannot.
 */
class Layout extends Rect {

  static next_layout = 0;

  /**
   * @param {Rect} bounds size of layout
   * @param {Rect} minr minimum rectangle size
   */
  constructor(bounds, minr) {
    super(bounds);
    this.name = "layout" + Layout.next_layout++;
    this.minr = minr;
    // Initialise a single empty Space that covers the entire layout
    this.spaces = [ new Space(this, bounds) ];
  }

  /**
   * Generate a string representation for dubugging
   * @return {String} a string describing the image
   */
  toString() {
    return `{Layout ${this.name} `
    + this.spaces.map(sp => sp.toString()).join(" ") + "}";
  }

  /**
   * Add a space to this layout. It may overlap other spaces until it has
   * an image associated with it.
   * @param {Space} space space to add
   */
  add_space(space, id) {
    console.debug(`Add ${id} ${space.toString()} to ${this.name}`);
    this.spaces.push(space);
  }

  /**
   * Remove a space from this layout. This only happens when a space that
   * overlaps it is used.
   * @param {Space} space space to remove
   */
  remove_space(space) {
    console.debug(`\tRemove ${space.toString()} from ${this.name}`);
    space.unlink_kills();
    const i = this.spaces.indexOf(space);
    if (i < 0)
      throw new Error("Tried to kill non-existant space");
    this.spaces.splice(i, 1);
  }

  /**
   * Where possible, collapse empty spaces into adjacent spaces. Then
   * remove any remaining empty spaces.
   * @return the number of spaces remaining after cleaning
   */
  simplify() {
    console.debug(`Clean out space from ${this.name}...`);
    let cleaned = true;
    while (cleaned) {
      cleaned = false;
      // Extend spaces into adjacent empty spaces that share an edge
      for (let i = 0; i < this.spaces.length; i++) {
        const spi = this.spaces[i];
        for (let j = 0; j < this.spaces.length; j++) {
          const spj = this.spaces[j];
          // Don't delete image spaces
          if (i === j || spj.image) continue;
          switch (spi.aligns(spj)) {
          case "LEFT":
            break;
          case "RIGHT":
            console.debug(`\tMerge right to ${spi}`);
            spi.w += spj.w;
            this.remove_space(spj);
            cleaned = true;
            break;
          case "TOP":
            break;
          case "BOTTOM":
            console.debug(`\tMerge bottom to ${spi}`);
            spi.h += spj.h;
            this.remove_space(spj);
            cleaned = true;
            break;
          default:
          }
        }
      }

      // Collapse contained spaces.
      for (let i = 0; i < this.spaces.length; i++) {
        const spi = this.spaces[i];
        if (spi.image) continue;
        for (let j = 0; j < this.spaces.length; ) {
          const spj = this.spaces[j];
          if (i != j && !spj.image && spi.contains(spj)) {
            console.debug("\tOverlap ${spi}");
            this.remove_space(spj);
            cleaned = true;
            break;
          } else
            j++;
        }
      }
    }
    const before = this.spaces.length;
    this.spaces = this.spaces.filter(sp => {
      if (!sp.image) console.debug(`Filtering ${sp}\n`);
      return sp.image;
    });
    if (this.spaces.length !== before)
      console.debug(`Filtered ${before - this.spaces.length} empty spaces`);
    return this.spaces.length;
  }

  /**
   * Create an image built from the occupied spaces in the layout.
   * @param {String} destdir destination directory for layouts
   * @return {Promise} Promise that resolves when the image has been
   * composed.
   */
  construct_image(destdir) {
    const comf = `${destdir}/${this.name}.png`;

    // Create an initial blank image for the layout
    let promise = new Promise((resolve, reject) => {
      Gm(this.w, this.h, "#ddff99f3")
      .drawText(0, 0, this.name)
      .write(comf, e => {
        if (e)
          reject(e);
        else
          resolve();
      });
    });

    // Composite the individual spaces
    for (const space of this.spaces) {
      if (!space.image) continue;
      promise = promise
      .then(() => console.debug(`Compositing ${comf} from ${this}`))
      .then(() => space.image.scale_in_place())
      .then(() => new Promise(async (resolve, reject) => {
        //console.debug(`\tadd ${space.image.basename} at ${space.centred}`);
        Gm(comf)
        .composite(space.image.path)
        .geometry(space.centred)
        .write(comf, e => {
          if (e)
            reject(e);
          else
            resolve();
        });
      }));
    }

    return promise;
  }
}

export { Layout };
